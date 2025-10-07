from flask import Flask, jsonify
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for Next.js frontend and production domains
    CORS(app, resources={
        r"/api/*": {"origins": ["http://localhost:3000", "https://*.vercel.app"]},
        r"/documents/*": {"origins": ["http://localhost:3000", "https://*.vercel.app"]}
    })
    
    # Load config
    app.config['JSON_SORT_KEYS'] = False
    
    # Health check endpoint for Railway
    @app.route('/')
    def health_check():
        return jsonify({"status": "healthy", "service": "document-parser-backend"})
    
    # Register blueprints
    from app.routes import api, documents
    app.register_blueprint(api.bp)
    app.register_blueprint(documents.bp)
    
    return app

