# Vijay Simha Reddy — DevOps Portfolio

## Run locally
1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Working contact backend
- `POST /api/contact` validates and stores messages in `data/messages.json`.
- `GET /api/health` is a health endpoint.
- Optional SMTP can be enabled by copying `.env.example` to `.env` and adding SMTP credentials.

## Before deployment
- Replace `public/Vijay_Simha_Reddy_Resume.pdf.placeholder` with your actual PDF named `Vijay_Simha_Reddy_Resume.pdf`.
- For production, use environment variables for SMTP credentials and a persistent database instead of JSON file storage.
- Deploy the Node/Express app to a backend host (or your own server) and point your domain to it.
