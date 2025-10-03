from flask import Blueprint, jsonify, request

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask backend is running'
    })


@bp.route('/example', methods=['GET', 'POST'])
def example():
    """Example endpoint"""
    if request.method == 'POST':
        data = request.get_json()
        return jsonify({
            'message': 'Data received',
            'data': data
        }), 201
    
    return jsonify({
        'message': 'Example endpoint',
        'methods': ['GET', 'POST']
    })

