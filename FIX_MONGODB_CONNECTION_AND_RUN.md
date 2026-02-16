# Fix MongoDB Connection and Run the Project

This guide helps you connect the backend to MongoDB Atlas and run both servers locally.

## Prerequisites
- Node.js v18+ and npm installed
- A MongoDB Atlas cluster and database user
- Ports available: 5000 (backend), 5173 (frontend)

## 1) Create MongoDB Atlas Connection
- Sign in to MongoDB Atlas and create a free cluster (choose a region close to you)
- Database Access
  - Create a user with Username and Password
  - Role: Read and write to any database (or scoped to your DB)
- Network Access
  - Add IP 0.0.0.0/0 temporarily for local dev (or your machine’s IP)
- Get connection string (SRV URI):
  - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority`
  - Keep this secure; you’ll paste it into the backend `.env` below

## 2) Configure Backend Environment
- Path: `server/.env`
- Example:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
```
- Notes:
  - The backend reads `MONGO_URI` or `MONGODB_URI`
  - Do not commit this file

## 3) Configure Frontend Environment
- Path: `client/.env`
- Example:
```
VITE_API_URL=http://localhost:5000/api
```

## 4) Install Dependencies
- Backend:
```
cd server
npm install
```
- Frontend:
```
cd client
npm install
```

## 5) Run Servers
- Backend:
```
cd server
npm run dev
```
- Frontend:
```
cd client
npm run dev
```
- Verify:
  - Backend: http://localhost:5000/api/health → `{ "ok": true }`
  - Frontend: http://localhost:5173

## 6) CORS Configuration
- Backend allows local frontend origin and credentials:
  - Origin: `http://localhost:5173`
  - This is already set in the backend configuration

## Troubleshooting
- Authentication failed
  - Check username/password in `MONGO_URI`
  - Ensure the user has proper roles and database permissions
- IP not allowed
  - Add your machine’s IP or 0.0.0.0/0 (temporary) to Atlas Network Access
- Cluster not reachable
  - Region or firewall issues; verify internet access and Atlas status
  - `serverSelectionTimeoutMS` logs indicate connection attempts timing out
- Wrong database name
  - Use a simple DB name (e.g., `smart_hospital_queue`)
- Env variable not loaded
  - Ensure `.env` exists under `server/` and `dotenv` loads it
  - Restart the backend after changes

## Notes
- Backend defaults:
  - Port: `5000`
  - DB env keys: `MONGO_URI` or `MONGODB_URI`
  - Health endpoint: `/api/health`
- Frontend defaults:
  - API base: `VITE_API_URL=http://localhost:5000/api`

