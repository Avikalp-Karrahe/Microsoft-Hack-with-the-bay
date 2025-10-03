from agentic_doc.parse import parse
from agentic_doc.connectors import LocalConnectorConfig
from typing import List, Dict, Any, Optional


class DocumentParser:
    """Service for parsing documents using agentic_doc"""
    
    def __init__(self):
        self.config = LocalConnectorConfig()
    
    def parse_documents(
        self, 
        path: str, 
        pattern: Optional[str] = None, 
        recursive: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Parse documents from a directory
        
        Args:
            path: Path to documents directory
            pattern: Optional pattern to filter files (e.g., "*.pdf")
            recursive: Whether to search subdirectories
            
        Returns:
            List of parsed document results
        """
        if recursive:
            self.config = LocalConnectorConfig(recursive=True)
        else:
            self.config = LocalConnectorConfig()
        
        if pattern:
            results = parse(self.config, connector_path=path, connector_pattern=pattern)
        else:
            results = parse(self.config, connector_path=path)
        
        return results
    
    def get_page_content(self, results: List[Dict[str, Any]], page_number: int) -> Optional[Dict[str, Any]]:
        """
        Extract content for a specific page number
        
        Args:
            results: Parsed document results
            page_number: Page number to retrieve (0-indexed)
            
        Returns:
            Page content if found, None otherwise
        """
        for result in results:
            # ParsedDocument has chunks, not pages
            if hasattr(result, 'chunks') and result.chunks:
                page_chunks = []
                
                # Collect all chunks for this page
                for chunk in result.chunks:
                    # Check if chunk has grounding info with page numbers
                    if hasattr(chunk, 'grounding') and chunk.grounding:
                        for grounding in chunk.grounding:
                            # Page numbers in grounding are 0-indexed
                            if hasattr(grounding, 'page') and grounding.page == page_number:
                                page_chunks.append(chunk)
                                break
                
                if page_chunks:
                    # Combine content from all chunks on this page
                    content = "\n\n".join([chunk.text for chunk in page_chunks if hasattr(chunk, 'text')])
                    return {
                        'page_number': page_number,
                        'content': content,
                        'metadata': self._extract_chunks_metadata(page_chunks),
                        'num_chunks': len(page_chunks)
                    }
        
        return None
    
    def _extract_page_metadata(self, page) -> Dict[str, Any]:
        """Extract metadata from a page object"""
        metadata = {}
        
        # Common metadata fields
        for attr in ['page_number', 'width', 'height', 'images', 'tables']:
            if hasattr(page, attr):
                metadata[attr] = getattr(page, attr)
        
        return metadata
    
    def _extract_chunks_metadata(self, chunks: List[Any]) -> Dict[str, Any]:
        """Extract metadata from a list of chunks"""
        metadata = {
            'chunk_types': [],
            'has_tables': False,
            'has_images': False,
        }
        
        for chunk in chunks:
            if hasattr(chunk, 'chunk_type'):
                metadata['chunk_types'].append(str(chunk.chunk_type))
            
            # Check for tables and images in chunks
            if hasattr(chunk, 'content_type'):
                content_type = str(chunk.content_type).lower()
                if 'table' in content_type:
                    metadata['has_tables'] = True
                if 'image' in content_type:
                    metadata['has_images'] = True
        
        return metadata
    
    def get_document_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get summary information about parsed documents
        
        Args:
            results: Parsed document results
            
        Returns:
            Summary with document count, page count, etc.
        """
        total_pages = 0
        documents = []
        
        for result in results:
            doc_info = {
                'filename': getattr(result, 'filename', getattr(result, 'doc_type', 'unknown')),
                'page_count': 0,
                'chunk_count': 0
            }
            
            # Calculate page count from start_page_idx and end_page_idx
            if hasattr(result, 'start_page_idx') and hasattr(result, 'end_page_idx'):
                start = getattr(result, 'start_page_idx', 0)
                end = getattr(result, 'end_page_idx', 0)
                doc_info['page_count'] = max(0, end - start + 1)
                total_pages += doc_info['page_count']
            
            # Count chunks
            if hasattr(result, 'chunks') and result.chunks:
                doc_info['chunk_count'] = len(result.chunks)
            
            documents.append(doc_info)
        
        return {
            'total_documents': len(results),
            'total_pages': total_pages,
            'documents': documents
        }
    
    def get_all_chunks(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Get all chunks from parsed documents
        
        Args:
            results: Parsed document results
            
        Returns:
            List of chunks with their content and metadata
        """
        all_chunks = []
        
        for result in results:
            if hasattr(result, 'chunks') and result.chunks:
                for i, chunk in enumerate(result.chunks):
                    chunk_data = {
                        'index': i,
                        'text': getattr(chunk, 'text', ''),
                        'chunk_type': str(getattr(chunk, 'chunk_type', 'unknown')),
                        'pages': []
                    }
                    
                    # Extract page numbers from grounding
                    if hasattr(chunk, 'grounding') and chunk.grounding:
                        for grounding in chunk.grounding:
                            if hasattr(grounding, 'page'):
                                chunk_data['pages'].append(grounding.page)
                    
                    all_chunks.append(chunk_data)
        
        return all_chunks
    
    def get_markdown(self, results: List[Dict[str, Any]]) -> str:
        """
        Get the full markdown content from parsed documents
        
        Args:
            results: Parsed document results
            
        Returns:
            Combined markdown content
        """
        markdown_parts = []
        
        for result in results:
            if hasattr(result, 'markdown') and result.markdown:
                markdown_parts.append(result.markdown)
        
        return "\n\n---\n\n".join(markdown_parts)

