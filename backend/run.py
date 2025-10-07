from app import create_app
from dotenv import load_dotenv
import os

# Load environment variables from .env.local in the parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

app = create_app()

if __name__ == '__main__':
    # Use PORT environment variable for Railway deployment, fallback to 3001 for local
    port = int(os.environ.get('PORT', 3001))
    app.run(debug=False, host='0.0.0.0', port=port)


