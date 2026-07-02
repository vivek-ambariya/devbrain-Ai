import json
import time
import httpx
import logging
from typing import Generator
from django.conf import settings

logger = logging.getLogger(__name__)

class GeminiAIServiceException(Exception):
    """Base exception for Gemini AI service errors."""
    pass

class GeminiAPIKeyMissingException(GeminiAIServiceException):
    """Raised when the Gemini API key is not configured."""
    pass

class GeminiRateLimitException(GeminiAIServiceException):
    """Raised when Gemini API rate limits are hit."""
    pass


class GeminiAIService:
    def __init__(self, api_key: str = None, api_url: str = None, model: str = None):
        self.api_key = api_key or getattr(settings, 'GEMINI_API_KEY', '')
        self.api_url = api_url or getattr(settings, 'GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models')
        self.model = model or getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')

    def _get_api_url(self) -> str:
        if not self.api_key:
            raise GeminiAPIKeyMissingException(
                "Gemini API Key is missing. Please configure GEMINI_API_KEY in your .env file."
            )
        # Using streamGenerateContent with alt=sse for standard SSE text/event-stream format
        return f"{self.api_url}/{self.model}:streamGenerateContent?alt=sse&key={self.api_key}"

    def _format_messages(self, messages: list[dict]) -> dict:
        """
        Converts generic message structure to Gemini API format.
        System prompts are extracted and placed into the systemInstruction block.
        """
        system_instruction = None
        gemini_contents = []

        for msg in messages:
            role = msg['role']
            content = msg['content']

            if role == 'system':
                system_instruction = {
                    "parts": [{"text": content}]
                }
            else:
                gemini_role = "user" if role == 'user' else 'model'
                gemini_contents.append({
                    "role": gemini_role,
                    "parts": [{"text": content}]
                })

        payload = {
            "contents": gemini_contents
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction

        return payload

    def generate_chat_response_stream(
        self, 
        messages: list[dict], 
        max_retries: int = 3, 
        initial_backoff: float = 1.0
    ) -> Generator[str, None, None]:
        """
        Sends the converted message history to the Gemini API and yields text chunks as they arrive.
        Implements exponential backoff retry logic for handling rate limits (429) and transient connection failures.
        """
        url = self._get_api_url()
        payload = self._format_messages(messages)
        headers = {
            'Content-Type': 'application/json',
        }

        retries = 0
        backoff = initial_backoff

        while True:
            try:
                start_time = time.time()
                with httpx.Client(timeout=120.0) as client:
                    with client.stream('POST', url, headers=headers, json=payload) as resp:
                        if resp.status_code == 429:
                            raise GeminiRateLimitException("Google Gemini API rate limit error (429).")
                        resp.raise_for_status()

                        # Stream parser (standard SSE)
                        for line in resp.iter_lines():
                            if not line or not line.startswith('data: '):
                                continue
                            data = line[6:]
                            try:
                                payload_data = json.loads(data)
                                candidates = payload_data.get('candidates', [])
                                if candidates:
                                    content = candidates[0].get('content', {})
                                    parts = content.get('parts', [])
                                    if parts:
                                        token = parts[0].get('text', '')
                                        if token:
                                            yield token
                            except (json.JSONDecodeError, KeyError, IndexError) as e:
                                logger.warning(f"Error parsing Gemini SSE chunk: {e}")
                                continue
                        
                        latency = time.time() - start_time
                        logger.info(f"Gemini API request completed in {latency:.2f} seconds.")
                        break

            except (GeminiRateLimitException, httpx.HTTPError) as exc:
                retries += 1
                if retries > max_retries:
                    logger.error(f"Gemini API request failed after {max_retries} retries: {exc}")
                    raise GeminiAIServiceException(f"Failed to communicate with Gemini API: {exc}") from exc
                
                wait_time = backoff * (2 ** (retries - 1))
                logger.warning(f"Gemini API request error: {exc}. Retrying in {wait_time:.1f}s...")
                time.sleep(wait_time)
