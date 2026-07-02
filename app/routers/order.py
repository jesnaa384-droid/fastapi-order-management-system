from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.auth import verify_token
from app.database.database import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate
from fastapi import APIRouter, Depends,HTTPException
from app.logger import logger
import requests
from app.websocket import broadcast

router = APIRouter()

@router.post("/orders")
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    new_order = Order(
        customer_name=order.customer_name,
        amount=order.amount,
        status="Pending"
    )
    logger.info(f"Creating order for {order.customer_name}")
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    await broadcast("order_created")
    

    return {
        "message": "Order created successfully",
        "id": new_order.id
    }

@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    await broadcast("order_deleted")

    return {"message": "Order deleted successfully"}

@router.get("/orders")
def get_orders(
    db: Session = Depends(get_db)
):
    orders = db.query(Order).all()

    try:
        response = requests.get(
            "https://open.er-api.com/v6/latest/INR",
            timeout=5
        )
        rate = response.json()["rates"]["USD"]
    except Exception:
        rate = 0.012

    result = []

    for order in orders:
        result.append({
            "id": order.id,
            "customer_name": order.customer_name,
            "amount": order.amount,
            "amount_usd": round(order.amount * rate, 2),
            "status": order.status,
            "created_at": order.created_at
        })

    return result
@router.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"message": "Order not found"}

    return order
from app.schemas.order import OrderUpdate

@router.put("/orders/{order_id}")
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"message": "Order not found"}

    order.status = order_update.status

    db.commit()
    db.refresh(order)
    await broadcast("order_updated")

    return {
        "message": "Order updated successfully",
        "order": order
    }