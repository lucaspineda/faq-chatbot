from openai import AsyncOpenAI
import os
from typing import List
import asyncio

client = None


def get_openai_client() -> AsyncOpenAI:
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        client = AsyncOpenAI(api_key=api_key)
    return client


class EmbeddingService:
    def __init__(self, model: str = "text-embedding-3-small"):
        self.model = model
        self.dimension = 1536
        self.client = get_openai_client()
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        try:
            response = await self.client.embeddings.create(
                model=self.model,
                input=text.strip()
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Failed to generate embedding: {str(e)}")
    
    async def generate_batch_embeddings(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batches.
        
        Args:
            texts: List of input texts to embed
            batch_size: Number of texts to process in each batch (max 2048 for OpenAI)
            
        Returns:
            List of embedding vectors in the same order as input texts
        """
        if not texts:
            return []
        
        texts = [text.strip() for text in texts if text and text.strip()]
        
        if not texts:
            raise ValueError("All texts are empty")
        
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            try:
                response = await self.client.embeddings.create(
                    model=self.model,
                    input=batch
                )
                
                batch_embeddings = [data.embedding for data in response.data]
                all_embeddings.extend(batch_embeddings)
                
            except Exception as e:
                raise Exception(f"Failed to generate batch embeddings: {str(e)}")
        
        return all_embeddings
