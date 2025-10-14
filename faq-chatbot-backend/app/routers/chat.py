from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
from app.utils.auth import get_current_user
from app.services.openai_service import generate_chat_response, generate_chat_title
from app.services.knowledge_base import KnowledgeBaseService
from app.config.chat import FAQ_SEARCH_TOP_K, FAQ_SEARCH_MIN_SCORE

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []


class TitleRequest(BaseModel):
    message: str


@router.get("/test")
async def test_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Test endpoint to verify authentication
    """
    return {
        "message": "Authentication successful!",
        "user": current_user
    }


@router.post("/message")
async def send_message(
    chat_message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a chat message and get streaming response from OpenAI.
    Automatically searches knowledge base and includes relevant FAQs as context.
    """
    async def event_generator():
        """Generate Server-Sent Events for streaming"""
        try:
            context = ""
            accumulated_response = ""
            
            try:
                kb_service = KnowledgeBaseService()
                faq_results = await kb_service.search_faqs(
                    query=chat_message.message,
                    top_k=FAQ_SEARCH_TOP_K,
                    min_score=FAQ_SEARCH_MIN_SCORE
                )
                
                if faq_results:
                    context = kb_service.format_context_for_chat(faq_results)
            except Exception as e:
                print(f"Warning: Failed to search knowledge base: {str(e)}")
            
            # First, stream chunks as they come
            async for chunk in generate_chat_response(
                message=chat_message.message,
                history=chat_message.history,
                context=context
            ):
                accumulated_response += chunk
                # Send chunks without modification for smooth streaming
                safe_chunk = chunk.replace("\n", "<|newline|>")
                yield f"data: {safe_chunk}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/generate-title")
async def generate_title(
    request: TitleRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        title = await generate_chat_title(request.message)
        return {"title": title}
    except Exception as e:
        print(f"Error generating title: {str(e)}")
        return {"title": "New Chat"}

