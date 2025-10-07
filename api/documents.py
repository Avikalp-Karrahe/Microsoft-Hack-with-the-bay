from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.routes.documents import bp as documents_bp

app = Flask(__name__)
CORS(app)

# Add a simple test route to verify the serverless function is working
@app.route('/')
def health_check():
    return jsonify({'status': 'ok', 'message': 'Documents API is running'})

# Register the documents blueprint without url_prefix since Vercel handles the /api/documents part
app.register_blueprint(documents_bp)

# This is the entry point for Vercel
# Vercel will automatically detect this as a Flask app