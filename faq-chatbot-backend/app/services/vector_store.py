from pinecone import Pinecone, ServerlessSpec
import os
from typing import List, Dict, Optional
import time


class VectorStore:
    def __init__(
        self,
        index_name: Optional[str] = None,
        dimension: int = 1536,
        metric: str = "cosine"
    ):
        self.api_key = os.getenv("PINECONE_API_KEY")
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        self.index_name = index_name or os.getenv("PINECONE_INDEX_NAME", "fintech-faq")
        self.dimension = dimension
        self.metric = metric
        
        self.pc = Pinecone(api_key=self.api_key)
        self._ensure_index_exists()
        self.index = self.pc.Index(self.index_name)
    
    def _ensure_index_exists(self):
        """
        Create index if it doesn't exist.
        """
        existing_indexes = [index.name for index in self.pc.list_indexes()]
        
        if self.index_name not in existing_indexes:
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric=self.metric,
                spec=ServerlessSpec(
                    cloud=os.getenv("PINECONE_CLOUD", "aws"),
                    region=os.getenv("PINECONE_REGION", "us-east-1")
                )
            )
            
            while not self.pc.describe_index(self.index_name).status['ready']:
                time.sleep(1)
    
    def upsert(
        self,
        vectors: List[tuple],
        namespace: str = ""
    ) -> Dict:
        """
        Insert or update vectors in the index.
        
        Args:
            vectors: List of tuples (id, embedding, metadata)
            namespace: Optional namespace for organizing vectors
            
        Returns:
            Response from Pinecone
        """
        try:
            response = self.index.upsert(
                vectors=vectors,
                namespace=namespace
            )
            return response
        except Exception as e:
            raise Exception(f"Failed to upsert vectors: {str(e)}")
    
    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filter: Optional[Dict] = None,
        namespace: str = "",
        include_metadata: bool = True
    ) -> List[Dict]:
        """
        Search for similar vectors.
        
        Args:
            query_vector: Query embedding vector
            top_k: Number of results to return
            filter: Metadata filter (e.g., {"category": "payments"})
            namespace: Optional namespace to search in
            include_metadata: Whether to include metadata in results
            
        Returns:
            List of matching results with scores and metadata
        """
        try:
            response = self.index.query(
                vector=query_vector,
                top_k=top_k,
                filter=filter,
                namespace=namespace,
                include_metadata=include_metadata
            )
            
            return response.matches
        except Exception as e:
            raise Exception(f"Failed to search vectors: {str(e)}")
    
    def delete(
        self,
        ids: Optional[List[str]] = None,
        delete_all: bool = False,
        namespace: str = "",
        filter: Optional[Dict] = None
    ) -> Dict:
        """
        Delete vectors from the index.
        
        Args:
            ids: List of vector IDs to delete
            delete_all: Delete all vectors in namespace
            namespace: Optional namespace
            filter: Metadata filter for deletion
            
        Returns:
            Response from Pinecone
        """
        try:
            if delete_all:
                response = self.index.delete(delete_all=True, namespace=namespace)
            elif filter:
                response = self.index.delete(filter=filter, namespace=namespace)
            elif ids:
                response = self.index.delete(ids=ids, namespace=namespace)
            else:
                raise ValueError("Must provide ids, filter, or delete_all=True")
            
            return response
        except Exception as e:
            raise Exception(f"Failed to delete vectors: {str(e)}")
    
    def get_stats(self, namespace: str = "") -> Dict:
        """
        Get index statistics.
        
        Args:
            namespace: Optional namespace
            
        Returns:
            Index statistics
        """
        try:
            stats = self.index.describe_index_stats()
            return stats
        except Exception as e:
            raise Exception(f"Failed to get stats: {str(e)}")
