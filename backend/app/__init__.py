from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for Next.js frontend
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})
    
    # Load config
    app.config['JSON_SORT_KEYS'] = False
    
    # Register blueprints
    from app.routes import api
    app.register_blueprint(api.bp)
    
    return app

