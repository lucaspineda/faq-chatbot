from openai import AsyncOpenAI
import os
import logging
from typing import AsyncGenerator, List, Dict
from app.config.chat import HISTORY_MESSAGE_LIMIT

logger = logging.getLogger(__name__)

client = None


def get_openai_client() -> AsyncOpenAI:
    """
    Get or create OpenAI client instance.
    Lazy initialization to ensure env vars are loaded.
    """
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        client = AsyncOpenAI(api_key=api_key)
    return client


async def generate_chat_response(
    message: str,
    history: List[Dict[str, str]] = None,
    context: str = "",
    model: str = "gpt-4o",
    temperature: float = 0
) -> AsyncGenerator[str, None]:
    """
    Generate streaming chat response with conversation history for context.
    
    Args:
        message: Current user message
        history: List of previous messages [{"role": "user|assistant", "content": "..."}]
        context: Additional context (e.g., from RAG)
        model: OpenAI model to use
        temperature: Response randomness (0-1)
    """
    client = get_openai_client()
    
    system_prompt = """You are a helpful AI assistant specializing in fintech FAQs. 
You provide accurate, concise, and friendly answers to questions about financial technology, 
banking, payments, and related topics.

CRITICAL: You MUST use actual newline characters in your response. Use \n\n (two newlines) for spacing between sections, paragraphs, and markdown elements.

Format your responses using Markdown with proper line breaks:
- Use ## for section headers with \n\n before and after
- Use **bold** for emphasis
- Use - or * for bullet lists with \n before each item
- Use 1. 2. 3. for numbered lists with \n before each item
- Use `code` for technical terms
- Add \n\n (two newlines) between paragraphs
- Add \n\n (two newlines) between sections
- Add \n\n after closing code blocks ```
- Keep paragraphs under 90 words

Example structure:
## Header

Paragraph text here.

Another paragraph here.

- List item one
- List item two

Structure your answers clearly with proper \n\n spacing between all sections."""

    if context:
        system_prompt += f"\n\nRelevant context from knowledge base:\n{context}"

    messages = [{"role": "system", "content": system_prompt}]
    
    if history:
        messages.extend(history[-HISTORY_MESSAGE_LIMIT:])
    
    messages.append({"role": "user", "content": message})

    try:
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield delta.content

    except Exception as e:
        yield f"Error generating response: {str(e)}"
