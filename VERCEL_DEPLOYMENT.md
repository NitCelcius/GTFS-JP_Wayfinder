# Vercel Deployment

This repository is configured for deployment on Vercel with both frontend and backend components.

## Configuration

The `vercel.json` file configures:
- **Frontend**: Next.js app in the `web/` directory
- **Backend**: FastAPI application in the `api/` directory  
- **Routing**: API routes under `/api/` path, all other routes to the web app

## Deployment Structure

```
vercel.json              # Main deployment configuration
├── web/                 # Next.js frontend
│   ├── package.json
│   └── ...
├── api/                 # FastAPI backend
│   ├── index.py         # Vercel entry point
│   ├── requirements.txt # Python dependencies
│   ├── src/             # Source code
│   └── ...
└── data/                # GTFS data files
    └── gtfs-akita-chuo-kotsu/
```

## Environment Variables

The following environment variables may need to be configured in Vercel:

- `PYTHONPATH`: Set to `api` (configured in vercel.json)
- Add any other environment variables your application needs

## API Considerations

**Important**: The current API implementation expects GTFS data files to be available at runtime. In Vercel's serverless environment, this may require:

1. Bundling GTFS data with the deployment (current approach)
2. Using external storage (S3, Database) for GTFS data
3. Loading data from environment variables or external APIs

The `api/index.py` file includes a fallback mechanism that provides basic functionality even when GTFS data is not available.

## CORS Configuration

The API has been configured to allow requests from Vercel domains. Update the `allow_origins` list in `api/src/gtfs_jp_wayfinder/main.py` with your actual Vercel domain.

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the `vercel.json` configuration
4. Deploy!

## Local Development

For local development, use:
```bash
# Install dependencies
pnpm install

# Start both frontend and backend
pnpm dev
```

## Notes

- The deployment uses Python 3.12 runtime
- Frontend is built with Next.js and Turbopack
- API functions have a 30-second timeout limit
- Maximum Lambda size is set to 50MB to accommodate the GTFS data