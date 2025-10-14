from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from app.services.knowledge_base import KnowledgeBaseService
from app.models.faq import (
    FAQ,
    FAQUploadRequest,
    FAQSearchRequest,
    FAQSearchResponse
)
from typing import Dict

router = APIRouter(prefix="/faqs", tags=["faqs"])


@router.post("/upload")
async def upload_faqs(
    request: FAQUploadRequest,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """
    Upload multiple FAQs to the knowledge base.
    Generates embeddings and stores in Pinecone.
    """
    try:
        kb_service = KnowledgeBaseService()
        response = await kb_service.add_faqs_batch(request.faqs)
        
        return {
            "message": f"Successfully uploaded {len(request.faqs)} FAQs",
            "upserted_count": response.get("upserted_count", len(request.faqs)),
            "faqs_processed": len(request.faqs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload FAQs: {str(e)}")


@router.post("/search")
async def search_faqs(
    request: FAQSearchRequest,
    current_user: dict = Depends(get_current_user)
) -> FAQSearchResponse:
    """
    Search for relevant FAQs using semantic search.
    """
    try:
        kb_service = KnowledgeBaseService()
        results = await kb_service.search_faqs(
            query=request.query,
            top_k=request.top_k,
            category=request.category,
            min_score=request.min_score
        )
        
        return FAQSearchResponse(
            results=results,
            query=request.query,
            total_results=len(results)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search FAQs: {str(e)}")


@router.delete("/{faq_id}")
async def delete_faq(
    faq_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """
    Delete a specific FAQ from the knowledge base.
    """
    try:
        kb_service = KnowledgeBaseService()
        response = kb_service.delete_faq(faq_id)
        
        return {
            "message": f"Successfully deleted FAQ {faq_id}",
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete FAQ: {str(e)}")


@router.delete("/")
async def delete_all_faqs(
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """
    Delete all FAQs from the knowledge base.
    Use with caution!
    """
    try:
        kb_service = KnowledgeBaseService()
        response = kb_service.delete_all_faqs()
        
        return {
            "message": "Successfully deleted all FAQs",
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete all FAQs: {str(e)}")


@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """
    Get knowledge base statistics.
    """
    try:
        kb_service = KnowledgeBaseService()
        stats = kb_service.get_stats()
        
        return {
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
