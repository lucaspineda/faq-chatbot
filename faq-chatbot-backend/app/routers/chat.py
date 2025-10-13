from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user

router = APIRouter()


from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.utils.auth import get_current_user
from app.services.openai_service import generate_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
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
    Send a chat message and get streaming response from OpenAI
    """
    async def event_generator():
        """Generate Server-Sent Events for streaming"""
        try:
            # TODO: Later, retrieve context from Pinecone RAG
            context = ""
            
            async for chunk in generate_chat_response(
                message=chat_message.message,
                context=context
            ):
                # Send as Server-Sent Events format, can work on using the same format useChat accepts later
                yield f"data: {chunk}\n\n"
            
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

