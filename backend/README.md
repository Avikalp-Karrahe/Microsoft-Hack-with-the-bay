# Flask Backend

Backend API for the fin-verc application.

## Setup

1. **Activate virtual environment** (from project root):
   ```bash
   source ../.venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server**:
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:5000`

## Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/example` - Example endpoint
- `POST /api/example` - Example POST endpoint

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes/              # API routes/blueprints
│   │   ├── __init__.py
│   │   └── api.py
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
└── .env.example            # Environment variables template
```

## Development

- The server runs with hot-reload enabled in development mode
- CORS is configured to accept requests from `http://localhost:3000`
- Add new routes in `app/routes/`
- Add business logic in `app/services/`


