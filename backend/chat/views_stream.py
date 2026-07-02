import logging
from typing import Generator
from django.conf import settings
from projects.services.embeddings import query_project_context
from chat.services.ai import GeminiAIService, GeminiAIServiceException

logger = logging.getLogger(__name__)


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


def generate_response_stream(project_id: int, user_message: str, history: list[dict]) -> Generator[str, None, None]:
    context = query_project_context(project_id, user_message)
    system = _build_system_prompt(context)
    messages = [{'role': 'system', 'content': system}]
    messages.extend(history[-6:])
    messages.append({'role': 'user', 'content': user_message})

    try:
        service = GeminiAIService()
        yield from service.generate_chat_response_stream(messages)
    except GeminiAIServiceException as exc:
        logger.error(f"Gemini AIService error: {exc}")
        # Send a formatted markdown error message to the user
        error_msg = (
            f"❌ **Gemini API Communication Error**\n\n"
            f"_{str(exc)}_\n\n"
            "Please check that your `GEMINI_API_KEY` is correctly configured in your `backend/.env` file."
        )
        yield error_msg
    except Exception as exc:
        logger.error(f"Unexpected error in chat stream generation: {exc}")
        fallback = (
            f"## Analysis: {user_message}\n\n"
            f"*(Gemini API is currently unavailable)*\n\n"
        )
        if context:
            fallback += "### Relevant codebase context files:\n"
            for c in context:
                fallback += f"- `{c['path']}`\n"
            fallback += f"\n### Key Code Snippet:\n```\n{context[0]['text'][:500]}\n```\n"
        else:
            fallback += "Please enter a valid GEMINI_API_KEY in your backend `.env` file to enable codebase-aware AI chat."
            
        yield fallback
