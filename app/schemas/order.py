from pydantic import BaseModel

class OrderCreate(BaseModel):
    customer_name: str
    amount: float

class OrderResponse(BaseModel):
    id: int
    customer_name: str
    amount: float
    status: str

    class Config:
        from_attributes = True
class OrderUpdate(BaseModel):
    status: str