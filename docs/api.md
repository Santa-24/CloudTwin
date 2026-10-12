# CloudTwin API Documentation

Base URL: `/api`

All responses follow the canonical response structure:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

## Authentication (`/api/auth`)
- `POST /api/auth/signup`: Create a new user profile and return JWT.
- `POST /api/auth/login`: Authenticate existing user.
- `POST /api/auth/guest`: Instant guest demo session (zero configuration required).
- `GET /api/auth/me`: Retrieve current authenticated profile.
- `PUT /api/auth/profile`: Update profile information.

## Projects (`/api/projects`)
- `GET /api/projects`: List user's active projects with architecture & simulation counts.
- `POST /api/projects`: Create a new cloud architecture project.
- `GET /api/projects/{id}`: Retrieve project details, architectures, and reports.
- `PUT /api/projects/{id}`: Update project metadata.
- `DELETE /api/projects/{id}`: Remove project.

## Architectures (`/api/architectures`)
- `GET /api/architectures`: List architectures.
- `POST /api/architectures`: Create canonical architecture model.
- `GET /api/architectures/{id}`: Get full graph schema (nodes, connections, configs).
- `PUT /api/architectures/{id}`: Save/update architecture graph state.
- `DELETE /api/architectures/{id}`: Delete architecture.
- `POST /api/architectures/{id}/validate`: Run graph integrity validation.
- `GET /api/architectures/{id}/versions`: List snapshot versions.
- `POST /api/architectures/{id}/versions`: Create a new version snapshot.
- `POST /api/architectures/{id}/versions/{version_id}/restore`: Rollback to a specific snapshot.

## Simulations (`/api/simulations`)
- `GET /api/simulations/scenarios`: List available what-if scenarios (2x, 5x, 10x traffic, EC2 failure, RDS failover, AZ outage, NAT choke).
- `POST /api/simulations/run`: Execute scenario against architecture. Dispatches to Member 2 simulation engine and Member 3 analysis engines.
- `GET /api/simulations/results/{id}`: Get detailed simulation metrics and time series.

## Cost, Security & AI Intelligence
- `GET /api/cost/{architecture_id}?currency=USD|INR`: Retrieve baseline vs simulated cloud spend.
- `GET /api/security/{architecture_id}`: CIS AWS benchmark audit and security findings.
- `GET /api/recommendations/{architecture_id}`: AI architectural recommendations and topology diffs.

## Reports (`/api/reports`)
- `POST /api/reports/generate`: Generate complete audit report in Markdown / PDF format.
- `GET /api/reports/{id}/download`: Download raw Markdown / text report.
