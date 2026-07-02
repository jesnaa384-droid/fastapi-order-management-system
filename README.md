# Order Management System

## Tech Stack

- FastAPI
- SQLAlchemy
- SQLite
- Next.js
- React
- JWT Authentication
- WebSocket
- Docker

## Features

- Create Order
- Delete Order
- View Orders
- Search Orders
- Filter Orders
- Update Order Status
- INR to USD Conversion
- JWT Login
- Logging
- WebSocket Support
- 
## demo login credentials

username:admin
password:admin123


## Run Backend

```bash
uvicorn main:app --reload
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- POST /login
- GET /orders
- POST /orders
- PUT /orders/{id}
- DELETE /orders/{id}
- GET /random-user

## Docker

```bash
docker-compose up --build
```
