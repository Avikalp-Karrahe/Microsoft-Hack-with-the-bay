"""
Test script to parse Loan-Servicing-and-Collections-Manual-latest.pdf
and display page 33 content
"""
import os
from pathlib import Path
from app.services.document_parser import DocumentParser


def main():
    # Path to Downloads folder
    downloads_path = str(Path.home() / "Downloads")
    pdf_file = "Loan-Servicing-and-Collections-Manual-latest.pdf"
    full_path = os.path.join(downloads_path, pdf_file)
    
    print("=" * 80)
    print("TESTING LOAN SERVICING PDF PARSER")
    print("=" * 80)
    print(f"\nLooking for PDF at: {full_path}")
    
    # Check if file exists
    if not os.path.exists(full_path):
        print(f"\n❌ ERROR: File not found!")
        print(f"Expected location: {full_path}")
        print(f"\nPlease ensure the file exists in your Downloads folder")
        return
    
    print(f"✓ File found!")
    file_size = os.path.getsize(full_path) / (1024 * 1024)  # Convert to MB
    print(f"✓ File size: {file_size:.2f} MB")
    
    # Initialize parser
    print("\n" + "-" * 80)
    print("PARSING DOCUMENT...")
    print("-" * 80)
    
    parser = DocumentParser()
    
    try:
        # Parse the specific PDF file
        results = parser.parse_documents(
            path=downloads_path,
            pattern=pdf_file
        )
        
        print(f"✓ Parsing complete!")
        print(f"\nRaw results type: {type(results)}")
        print(f"Number of results: {len(results) if results else 0}")
        
        # Get summary
        print("\n" + "-" * 80)
        print("DOCUMENT SUMMARY")
        print("-" * 80)
        
        summary = parser.get_document_summary(results)
        print(f"\nTotal documents parsed: {summary['total_documents']}")
        print(f"Total pages: {summary['total_pages']}")
        
        print("\nDocument details:")
        for i, doc in enumerate(summary['documents'], 1):
            print(f"  {i}. {doc['filename']}")
            print(f"     Pages: {doc['page_count']}")
            print(f"     Chunks: {doc['chunk_count']}")
        
        # Print some raw result info for debugging
        print("\n" + "-" * 80)
        print("RAW RESULT STRUCTURE (for debugging)")
        print("-" * 80)
        if results and len(results) > 0:
            first_result = results[0]
            print(f"\nFirst result type: {type(first_result)}")
            
            # Show key attributes
            if hasattr(first_result, 'start_page_idx'):
                print(f"Start page index: {first_result.start_page_idx}")
            if hasattr(first_result, 'end_page_idx'):
                print(f"End page index: {first_result.end_page_idx}")
            if hasattr(first_result, 'chunks'):
                print(f"Total chunks: {len(first_result.chunks)}")
                
                # Show page numbers available in chunks
                page_numbers = set()
                for chunk in first_result.chunks:
                    if hasattr(chunk, 'grounding') and chunk.grounding:
                        for grounding in chunk.grounding:
                            if hasattr(grounding, 'page'):
                                page_numbers.add(grounding.page)
                
                if page_numbers:
                    sorted_pages = sorted(list(page_numbers))
                    print(f"Pages with content (0-indexed): {sorted_pages[:10]}{'...' if len(sorted_pages) > 10 else ''}")
                    print(f"Page range: {min(sorted_pages)} to {max(sorted_pages)} ({len(sorted_pages)} unique pages)")
        
        # Get page 33 (0-indexed, so page 33 = index 32)
        print("\n" + "=" * 80)
        print("RETRIEVING PAGE 33 (index 32)")
        print("=" * 80)
        
        page_33 = parser.get_page_content(results, 32)  # 0-indexed
        
        if page_33:
            print(f"\n✓ Page 33 found!")
            print(f"\nPage Index: {page_33['page_number']}")
            print(f"Number of chunks: {page_33.get('num_chunks', 0)}")
            
            print(f"\nMetadata:")
            for key, value in page_33['metadata'].items():
                if key == 'chunk_types':
                    print(f"  {key}: {', '.join(set(value)) if value else 'none'}")
                else:
                    print(f"  {key}: {value}")
            
            print(f"\n" + "-" * 80)
            print("CONTENT:")
            print("-" * 80)
            content = page_33['content']
            print(content)
            print("-" * 80)
            print(f"\nContent length: {len(content)} characters")
            
        else:
            print(f"\n❌ Page 33 (index 32) not found!")
            print(f"Available pages: 0-{summary['total_pages'] - 1} (0-indexed)")
            
            # Try to print a few sample pages to help debug
            print("\n" + "-" * 80)
            print("SAMPLING FIRST FEW PAGES")
            print("-" * 80)
            for page_num in [0, 1, 2]:  # 0-indexed
                page = parser.get_page_content(results, page_num)
                if page:
                    print(f"\nPage index {page_num} preview (first 200 chars):")
                    print(page['content'][:200] + "...")
                    print(f"Number of chunks on this page: {page.get('num_chunks', 0)}")
        
        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ ERROR during parsing:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        
        # Print full traceback for debugging
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()


if __name__ == '__main__':
    main()

