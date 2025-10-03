from flask import Blueprint, jsonify, request
from app.services.document_parser import DocumentParser
import os

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

