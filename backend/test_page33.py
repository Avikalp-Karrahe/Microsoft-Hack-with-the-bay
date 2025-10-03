"""
Simple test to get page 33 content from the Loan Servicing PDF
"""
import os
from pathlib import Path
from app.services.document_parser import DocumentParser


def main():
    # Path to the PDF
    downloads_path = str(Path.home() / "Downloads")
    pdf_file = "Loan-Servicing-and-Collections-Manual-latest.pdf"
    
    print("Initializing parser...")
    parser = DocumentParser()
    
    print(f"Parsing {pdf_file}...")
    results = parser.parse_documents(path=downloads_path, pattern=pdf_file)
    
    # Get page 33 (index 32 since 0-indexed)
    page_33 = parser.get_page_content(results, 32)
    
    if page_33:
        print("\n" + "=" * 80)
        print("PAGE 33 CONTENT")
        print("=" * 80)
        print(page_33['content'])
        print("\n" + "=" * 80)
    else:
        print("❌ Page 33 not found")
        
        # Debug: show what pages are available
        summary = parser.get_document_summary(results)
        print(f"Total pages available: {summary['total_pages']}")
        
        # Show all chunks with their page numbers
        print("\nShowing first 5 chunks with page info:")
        chunks = parser.get_all_chunks(results)
        for chunk in chunks[:5]:
            pages_str = ', '.join(map(str, chunk['pages'])) if chunk['pages'] else 'no page info'
            print(f"Chunk {chunk['index']}: pages [{pages_str}] - {chunk['text'][:100]}...")


if __name__ == '__main__':
    main()
