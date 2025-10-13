from openai import AsyncOpenAI
import os
from typing import AsyncGenerator

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
    context: str = "",
    model: str = "gpt-4o-mini",
    temperature: float = 0.7
) -> AsyncGenerator[str, None]:
    client = get_openai_client()
    
    system_prompt = """You are a helpful AI assistant specializing in fintech FAQs. 
You provide accurate, concise, and friendly answers to questions about financial technology, 
banking, payments, and related topics."""

    if context:
        system_prompt += f"\n\nRelevant context from knowledge base:\n{context}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message}
    ]

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
