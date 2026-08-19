# Solar & Wind Deployment Intelligence Platform

## Run with Docker

### Requirements
- Docker Desktop or Docker Engine installed and running
- Ports 5432, 8000, and 5173 available locally

### Environment variables
Create a root-level `.env` file from the example template before starting containers, or set the same values in your shell environment:

```bash
cp .env.example .env
```

Required values include:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `VITE_API_URL`

Do not commit real secrets or credentials.

### Build the images
```bash
docker compose build
```

### Start the stack
```bash
docker compose up -d
```

### Application URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

### Stop containers
```bash
docker compose down
```

### View logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Database persistence
The PostgreSQL data directory is stored in the named Docker volume `solar-wind-deployment-intelligence-platform_postgres_data` so your database remains available across container restarts without deleting the existing local database setup.

> The Docker database is isolated from the local non-container PostgreSQL environment and should be treated as the containerized deployment database.
