from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class FAQ(BaseModel):
    id: str = Field(..., description="Unique FAQ identifier")
    question: str = Field(..., description="FAQ question")
    answer: str = Field(..., description="FAQ answer")
    category: str = Field(..., description="FAQ category (e.g., payments, security)")
    keywords: List[str] = Field(default_factory=list, description="Keywords for better search")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FAQUploadRequest(BaseModel):
    faqs: List[FAQ]


class FAQSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")
    category: Optional[str] = Field(None, description="Filter by category")
    min_score: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity score")


class FAQSearchResult(BaseModel):
    faq: FAQ
    score: float = Field(..., description="Similarity score (0-1)")
    
    
class FAQSearchResponse(BaseModel):
    results: List[FAQSearchResult]
    query: str
    total_results: int
