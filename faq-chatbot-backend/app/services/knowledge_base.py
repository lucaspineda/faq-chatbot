from typing import List, Optional, Dict
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore
from app.models.faq import FAQ, FAQSearchResult
from datetime import datetime


class KnowledgeBaseService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
        self.namespace = "faqs"
    
    async def add_faq(self, faq: FAQ) -> Dict:
        """
        Add a single FAQ to the knowledge base.
        
        Args:
            faq: FAQ object to add
            
        Returns:
            Response from vector store
        """
        combined_text = f"Question: {faq.question}\nAnswer: {faq.answer}"
        if faq.keywords:
            combined_text += f"\nKeywords: {', '.join(faq.keywords)}"
        
        embedding = await self.embedding_service.generate_embedding(combined_text)
        
        metadata = {
            "question": faq.question,
            "answer": faq.answer,
            "category": faq.category,
            "keywords": faq.keywords,
            "created_at": faq.created_at.isoformat() if faq.created_at else datetime.utcnow().isoformat(),
            "updated_at": faq.updated_at.isoformat() if faq.updated_at else datetime.utcnow().isoformat()
        }
        
        response = self.vector_store.upsert(
            vectors=[(faq.id, embedding, metadata)],
            namespace=self.namespace
        )
        
        return response
    
    async def add_faqs_batch(self, faqs: List[FAQ]) -> Dict:
        """
        Add multiple FAQs to the knowledge base in batch.
        
        Args:
            faqs: List of FAQ objects to add
            
        Returns:
            Response from vector store
        """
        texts = []
        for faq in faqs:
            combined_text = f"Question: {faq.question}\nAnswer: {faq.answer}"
            if faq.keywords:
                combined_text += f"\nKeywords: {', '.join(faq.keywords)}"
            texts.append(combined_text)
        
        embeddings = await self.embedding_service.generate_batch_embeddings(texts)
        
        vectors = []
        for i, faq in enumerate(faqs):
            metadata = {
                "question": faq.question,
                "answer": faq.answer,
                "category": faq.category,
                "keywords": faq.keywords,
                "created_at": faq.created_at.isoformat() if faq.created_at else datetime.utcnow().isoformat(),
                "updated_at": faq.updated_at.isoformat() if faq.updated_at else datetime.utcnow().isoformat()
            }
            vectors.append((faq.id, embeddings[i], metadata))
        
        response = self.vector_store.upsert(
            vectors=vectors,
            namespace=self.namespace
        )
        
        return response
    
    async def search_faqs(
        self,
        query: str,
        top_k: int = 5,
        category: Optional[str] = None,
        min_score: float = 0.7
    ) -> List[FAQSearchResult]:
        """
        Search for relevant FAQs using semantic search.
        
        Args:
            query: User's search query
            top_k: Number of results to return
            category: Optional category filter
            min_score: Minimum similarity score (0-1)
            
        Returns:
            List of matching FAQs with scores
        """
        query_embedding = await self.embedding_service.generate_embedding(query)
        
        filter_dict = {"category": category} if category else None
        
        results = self.vector_store.search(
            query_vector=query_embedding,
            top_k=top_k,
            filter=filter_dict,
            namespace=self.namespace
        )
        
        faq_results = []
        for result in results:
            if result.score >= min_score:
                metadata = result.metadata
                faq = FAQ(
                    id=result.id,
                    question=metadata.get("question", ""),
                    answer=metadata.get("answer", ""),
                    category=metadata.get("category", ""),
                    keywords=metadata.get("keywords", []),
                    created_at=metadata.get("created_at"),
                    updated_at=metadata.get("updated_at")
                )
                faq_results.append(FAQSearchResult(faq=faq, score=result.score))
        
        return faq_results
    
    async def update_faq(self, faq: FAQ) -> Dict:
        """
        Update an existing FAQ (same as add, will overwrite).
        
        Args:
            faq: FAQ object with updated data
            
        Returns:
            Response from vector store
        """
        faq.updated_at = datetime.utcnow()
        return await self.add_faq(faq)
    
    def delete_faq(self, faq_id: str) -> Dict:
        """
        Delete an FAQ from the knowledge base.
        
        Args:
            faq_id: ID of the FAQ to delete
            
        Returns:
            Response from vector store
        """
        response = self.vector_store.delete(
            ids=[faq_id],
            namespace=self.namespace
        )
        return response
    
    def delete_all_faqs(self) -> Dict:
        """
        Delete all FAQs from the knowledge base.
        
        Returns:
            Response from vector store
        """
        response = self.vector_store.delete(
            delete_all=True,
            namespace=self.namespace
        )
        return response
    
    def get_stats(self) -> Dict:
        """
        Get knowledge base statistics.
        
        Returns:
            Statistics from vector store
        """
        return self.vector_store.get_stats()
    
    def format_context_for_chat(self, search_results: List[FAQSearchResult]) -> str:
        """
        Format search results into context string for chat.
        
        Args:
            search_results: List of FAQ search results
            
        Returns:
            Formatted context string
        """
        if not search_results:
            return ""
        
        context = "Based on our FAQ knowledge base:\n\n"
        
        for i, result in enumerate(search_results, 1):
            context += f"{i}. Q: {result.faq.question}\n"
            context += f"   A: {result.faq.answer}\n"
            context += f"   (Relevance: {result.score:.2%})\n\n"
        
        return context.strip()
