# PSite Backend

This is the backend API for the PSite project, built with NestJS and TypeScript.

## Project Structure

The project is organized as follows:

- `src/`: Source code
  - `app.module.ts`: Main application module
  - `main.ts`: Application entry point
  - `images/`: Images module for handling image resources

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Yarn package manager
- PostgreSQL database

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start the development server
yarn start:dev
```

The API will be available at http://localhost:3000/api.

### Building for Production

```bash
# Build the application
yarn build

# Run in production mode
yarn start:prod
```

## API Endpoints

The API provides the following endpoints:

- `GET /api`: Welcome message
- `GET /api/images`: Get all images
- `GET /api/images/:id`: Get image by ID
- `POST /api/images`: Create a new image
- `PUT /api/images/:id`: Update an image
- `DELETE /api/images/:id`: Delete an image

## Database Configuration

The application uses PostgreSQL. You can configure the database connection in `src/app.module.ts` or using environment variables:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=passwordPsite
DATABASE_NAME=psiteDB
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Docker

The application can be run using Docker:

```bash
# Build and start the container
docker-compose up
```

This will start:
- The API at http://localhost:3000
- A PostgreSQL database at localhost:5432

## Integration with Frontend

This backend is designed to work with the PSite frontend application. The backend provides API endpoints that the frontend consumes.

### Running the Full Stack

To run both the frontend and backend together, use the combined docker-compose file in the parent directory:

```bash
# From the parent directory
docker-compose -f docker-compose.full.yml up
```

This will start:
- The backend API at http://localhost:3000/api
- The frontend at http://localhost:5173
- A PostgreSQL database

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## License

This project is licensed under the MIT License.
