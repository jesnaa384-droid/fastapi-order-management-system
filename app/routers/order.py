from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.auth import verify_token
from app.database.database import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate
from fastapi import APIRouter, Depends,HTTPException
from app.logger import logger


router = APIRouter()

@router.post("/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    new_order = Order(
        customer_name=order.customer_name,
        amount=order.amount,
        status="Pending"
    )
    logger.info(f"Creating order for {order.customer_name}")
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order created successfully",
        "id": new_order.id
    }

@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()

    return {"message": "Order deleted successfully"}

@router.get("/orders")
def get_orders(
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    return db.query(Order).all()


@router.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"message": "Order not found"}

    return order
from app.schemas.order import OrderUpdate

@router.put("/orders/{order_id}")
def update_order(
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

    return {
        "message": "Order updated successfully",
        "order": order
    }