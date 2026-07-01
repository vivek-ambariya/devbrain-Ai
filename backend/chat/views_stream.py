import json
from typing import Generator

import httpx
from django.conf import settings

from projects.services.embeddings import query_project_context


def _build_system_prompt(context_chunks: list[dict]) -> str:
    if not context_chunks:
        return (
            'You are DevBrain AI, an enterprise engineering assistant. '
            'Answer clearly about software architecture and code. '
            'No indexed code was found for this project yet.'
        )
    context = '\n\n'.join(
        f"File: {c['path']}\n{c['text'][:800]}" for c in context_chunks
    )
    return (
        'You are DevBrain AI, an enterprise engineering assistant. '
        'Use the following indexed codebase context to answer. '
        'Cite file paths when relevant. Use markdown.\n\n'
        f'--- CONTEXT ---\n{context}\n--- END CONTEXT ---'
    )


def _stream_ollama(messages: list[dict]) -> Generator[str, None, None]:
    with httpx.Client(timeout=120.0) as client:
        with client.stream(
            'POST',
            f'{settings.OLLAMA_BASE_URL}/api/chat',
            json={'model': settings.OLLAMA_MODEL, 'messages': messages, 'stream': True},
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line:
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue
                token = payload.get('message', {}).get('content', '')
                if token:
                    yield token
                if payload.get('done'):
                    break


def _stream_grok(messages: list[dict]) -> Generator[str, None, None]:
    if not settings.GROK_API_KEY:
        return
    headers = {
        'Authorization': f'Bearer {settings.GROK_API_KEY}',
        'Content-Type': 'application/json',
    }
    body = {
        'model': settings.GROK_MODEL,
        'messages': messages,
        'stream': True,
    }
    with httpx.Client(timeout=120.0) as client:
        with client.stream('POST', settings.GROK_API_URL, headers=headers, json=body) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line or not line.startswith('data: '):
                    continue
                data = line[6:]
                if data == '[DONE]':
                    break
                try:
                    payload = json.loads(data)
                    delta = payload['choices'][0].get('delta', {})
                    token = delta.get('content', '')
                    if token:
                        yield token
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


def generate_response_stream(project_id: int, user_message: str, history: list[dict]) -> Generator[str, None, None]:
    context = query_project_context(project_id, user_message)
    system = _build_system_prompt(context)
    messages = [{'role': 'system', 'content': system}]
    messages.extend(history[-6:])
    messages.append({'role': 'user', 'content': user_message})

    try:
        yield from _stream_ollama(messages)
        return
    except Exception:
        pass

    try:
        yielded = False
        for token in _stream_grok(messages):
            yielded = True
            yield token
        if yielded:
            return
    except Exception:
        pass

    fallback = (
        f'## Analysis: {user_message}\n\n'
        '*(Ollama/Grok unavailable — showing RAG context summary)*\n\n'
    )
    if context:
        fallback += '### Relevant files\n'
        for c in context:
            fallback += f"- `{c['path']}`\n"
        fallback += f"\n### Snippet\n```\n{context[0]['text'][:500]}\n```\n"
    else:
        fallback += 'Upload and index a project ZIP to enable codebase-aware answers.'
    for word in fallback.split(' '):
        yield word + ' '
