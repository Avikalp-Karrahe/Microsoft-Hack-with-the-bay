from flask import Blueprint, jsonify, request
from app.services.document_parser import DocumentParser
import os
import tempfile
import requests

bp = Blueprint('documents', __name__, url_prefix='/api/documents')
parser = DocumentParser()

# Store parsed results temporarily (in production, use a proper cache/db)
_cached_results = {}


@bp.route('/parse', methods=['POST'])
def parse_documents():
    """
    Parse documents from a directory
    
    Request body:
    {
        "path": "/path/to/documents",
        "pattern": "*.pdf",  // optional
        "recursive": false   // optional
    }
    """
    data = request.get_json()
    
    if not data or 'path' not in data:
        return jsonify({'error': 'Missing required field: path'}), 400
    
    path = data['path']
    pattern = data.get('pattern')
    recursive = data.get('recursive', False)
    
    # Validate path exists
    if not os.path.exists(path):
        return jsonify({'error': f'Path does not exist: {path}'}), 404
    
    try:
        results = parser.parse_documents(path, pattern, recursive)
        
        # Cache results with path as key
        _cached_results[path] = results
        
        # Get summary
        summary = parser.get_document_summary(results)
        
        return jsonify({
            'success': True,
            'path': path,
            'summary': summary,
            'message': f'Parsed {summary["total_documents"]} document(s) with {summary["total_pages"]} total pages'
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Failed to parse documents: {str(e)}'
        }), 500


@bp.route('/page/<int:page_number>', methods=['POST'])
def get_page(page_number):
    """
    Get content for a specific page number
    
    Request body:
    {
        "path": "/path/to/documents"  // must match previously parsed path
    }
    """
    data = request.get_json()
    
    if not data or 'path' not in data:
        return jsonify({'error': 'Missing required field: path'}), 400
    
    path = data['path']
    
    # Check if we have cached results for this path
    if path not in _cached_results:
        return jsonify({
            'error': 'No parsed results found for this path. Please parse documents first using /api/documents/parse'
        }), 404
    
    results = _cached_results[path]
    page_content = parser.get_page_content(results, page_number)
    
    if page_content:
        return jsonify({
            'success': True,
            'page': page_content
        })
    else:
        return jsonify({
            'error': f'Page {page_number} not found in parsed documents'
        }), 404


@bp.route('/parse-and-get-page', methods=['POST'])
def parse_and_get_page():
    """
    Parse documents and immediately retrieve a specific page
    
    Request body:
    {
        "path": "/path/to/documents",
        "page_number": 33,
        "pattern": "*.pdf",  // optional
        "recursive": false   // optional
    }
    """
    data = request.get_json()
    
    if not data or 'path' not in data or 'page_number' not in data:
        return jsonify({'error': 'Missing required fields: path, page_number'}), 400
    
    path = data['path']
    page_number = data['page_number']
    pattern = data.get('pattern')
    recursive = data.get('recursive', False)
    
    # Validate path exists
    if not os.path.exists(path):
        return jsonify({'error': f'Path does not exist: {path}'}), 404
    
    try:
        # Parse documents
        results = parser.parse_documents(path, pattern, recursive)
        
        # Cache results
        _cached_results[path] = results
        
        # Get summary
        summary = parser.get_document_summary(results)
        
        # Get specific page
        page_content = parser.get_page_content(results, page_number)
        
        if page_content:
            return jsonify({
                'success': True,
                'summary': summary,
                'page': page_content
            })
        else:
            return jsonify({
                'success': False,
                'summary': summary,
                'error': f'Page {page_number} not found in parsed documents',
                'message': f'Parsed {summary["total_pages"]} total pages'
            }), 404
    
    except Exception as e:
        return jsonify({
            'error': f'Failed to parse documents: {str(e)}'
        }), 500


@bp.route('/summary', methods=['POST'])
def get_summary():
    """
    Get summary of previously parsed documents

    Request body:
    {
        "path": "/path/to/documents"
    }
    """
    data = request.get_json()

    if not data or 'path' not in data:
        return jsonify({'error': 'Missing required field: path'}), 400

    path = data['path']

    if path not in _cached_results:
        return jsonify({
            'error': 'No parsed results found for this path. Please parse documents first.'
        }), 404

    results = _cached_results[path]
    summary = parser.get_document_summary(results)

    return jsonify({
        'success': True,
        'summary': summary
    })


@bp.route('/chunks', methods=['POST'])
def get_all_chunks():
    """
    Get all chunks from previously parsed documents

    Request body:
    {
        "path": "/path/to/documents"
    }
    """
    data = request.get_json()

    if not data or 'path' not in data:
        return jsonify({'error': 'Missing required field: path'}), 400

    path = data['path']

    if path not in _cached_results:
        return jsonify({
            'error': 'No parsed results found for this path. Please parse documents first.'
        }), 404

    results = _cached_results[path]
    chunks = parser.get_all_chunks(results)

    return jsonify({
        'success': True,
        'total_chunks': len(chunks),
        'chunks': chunks
    })


@bp.route('/markdown', methods=['POST'])
def get_markdown():
    """
    Get full markdown content from previously parsed documents

    Request body:
    {
        "path": "/path/to/documents"
    }
    """
    data = request.get_json()

    if not data or 'path' not in data:
        return jsonify({'error': 'Missing required field: path'}), 400

    path = data['path']

    if path not in _cached_results:
        return jsonify({
            'error': 'No parsed results found for this path. Please parse documents first.'
        }), 404

    results = _cached_results[path]
    markdown = parser.get_markdown(results)

    return jsonify({
        'success': True,
        'markdown': markdown
    })


@bp.route('/parse-url', methods=['POST'])
def parse_from_url():
    """
    Download a document from URL and parse it

    Request body:
    {
        "url": "https://..."
    }
    """
    data = request.get_json()

    if not data or 'url' not in data:
        return jsonify({'error': 'Missing required field: url'}), 400

    url = data['url']

    try:
        # Download the file
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(response.content)
            temp_path = temp_file.name

        # Get directory and filename
        temp_dir = os.path.dirname(temp_path)
        temp_filename = os.path.basename(temp_path)

        # Parse the document
        results = parser.parse_documents(temp_dir, temp_filename)

        # Cache results
        _cached_results[temp_dir] = results

        # Get summary and chunks
        summary = parser.get_document_summary(results)
        chunks = parser.get_all_chunks(results)
        markdown = parser.get_markdown(results)

        # Clean up temp file
        try:
            os.unlink(temp_path)
        except:
            pass

        return jsonify({
            'success': True,
            'summary': summary,
            'chunks': chunks,
            'markdown': markdown,
            'total_chunks': len(chunks)
        })

    except requests.RequestException as e:
        return jsonify({
            'error': 'Failed to download document',
            'details': str(e)
        }), 500

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to parse document',
            'details': str(e),
            'traceback': traceback.format_exc()
        }), 500

