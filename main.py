from app.routers.order import router
from fastapi import FastAPI
from fastapi import HTTPException
from app.auth.auth import create_access_token
from app.database.database import Base, engine
import requests
from fastapi import WebSocket
import logging
from app.websocket import websocket_endpoint
from fastapi.middleware.cors import CORSMiddleware


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

@app.get("/")
def home():
    return {"message": "Order Management API is running!"}
@app.post("/login")
def login(username: str, password: str):
    if username != "admin" or password != "admin123":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": username})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/random-user")
def random_user():
    response = requests.get("https://randomuser.me/api/")
    return response.json()
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    await websocket_endpoint(websocket)