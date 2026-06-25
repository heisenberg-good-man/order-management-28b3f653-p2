from flask import Blueprint, request, jsonify

from data.database import get_db
from models.order import Order
from models.constants import ORDER_STATUS
from services.validation_service import validate_order_cancel

order_bp = Blueprint("order", __name__)


@order_bp.route("", methods=["GET"])
def list_orders():
    db = get_db()
    user_id = request.args.get("user_id")
    provider_id = request.args.get("provider_id")
    status = request.args.get("status")

    orders = list(db.orders.values())
    if user_id:
        orders = [o for o in orders if o.user_id == user_id]
    if provider_id:
        orders = [o for o in orders if o.provider_id == provider_id]
    if status:
        orders = [o for o in orders if o.status == status]

    result = [o.to_dict() for o in orders]
    return jsonify({"code": 0, "data": result, "message": "success"})


@order_bp.route("/<order_id>", methods=["GET"])
def get_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404
    return jsonify({"code": 0, "data": order.to_dict(), "message": "success"})


@order_bp.route("", methods=["POST"])
def create_order():
    data = request.get_json() or {}
    db = get_db()

    provider_id = data.get("provider_id")
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 400, "data": None, "message": "服务商不存在"}), 400

    demand_id = data.get("demand_id")
    demand = db.demands.get(demand_id) if demand_id else None

    profession_type = data.get("profession_type") or (demand.profession_type if demand else None)
    location = data.get("location") or (demand.location if demand else None)
    budget = data.get("budget") or (demand.budget if demand else None)
    expected_time = data.get("expected_time") or (demand.expected_time if demand else None)

    if not profession_type or not location or budget is None or not expected_time:
        return jsonify({"code": 400, "data": None, "message": "订单信息不完整"}), 400

    existing = [
        o for o in db.orders.values()
        if o.provider_id == provider_id
        and o.user_id == data.get("user_id", "user_001")
        and o.status in [ORDER_STATUS["PENDING_CONFIRM"], ORDER_STATUS["ACCEPTED"], ORDER_STATUS["IN_SERVICE"], ORDER_STATUS["EXCEPTION"]]
    ]
    if existing:
        return jsonify({"code": 409, "data": None, "message": "该服务商已有进行中的订单，请勿重复提交"}), 409

    order = Order(
        demand_id=demand_id or "",
        provider_id=provider_id,
        provider_name=provider.name,
        profession_type=profession_type,
        location=location,
        budget=float(budget),
        expected_time=expected_time,
        user_id=data.get("user_id", "user_001"),
        user_name=data.get("user_name", "用户小明"),
        remark=data.get("remark", demand.remark if demand else ""),
    )
    db.orders[order.id] = order
    return jsonify({"code": 0, "data": order.to_dict(), "message": "下单成功，等待服务商确认"})


@order_bp.route("/<order_id>/accept", methods=["POST"])
def accept_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404
    if order.accept():
        return jsonify({"code": 0, "data": order.to_dict(), "message": "已接单"})
    return jsonify({"code": 400, "data": order.to_dict(), "message": "当前订单状态无法接单"}), 400


@order_bp.route("/<order_id>/start", methods=["POST"])
def start_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404
    if order.start_service():
        return jsonify({"code": 0, "data": order.to_dict(), "message": "服务已开始"})
    return jsonify({"code": 400, "data": order.to_dict(), "message": "当前订单状态无法开始服务"}), 400


@order_bp.route("/<order_id>/complete", methods=["POST"])
def complete_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404
    if order.complete():
        return jsonify({"code": 0, "data": order.to_dict(), "message": "订单已完成"})
    return jsonify({"code": 400, "data": order.to_dict(), "message": "当前订单状态无法完成"}), 400


@order_bp.route("/<order_id>/cancel", methods=["POST"])
def cancel_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404

    data = request.get_json() or {}
    errors = validate_order_cancel(data)
    if errors:
        return jsonify({"code": 400, "data": None, "message": "参数校验失败", "errors": errors}), 400

    if order.cancel(data["cancel_reason"].strip()):
        return jsonify({"code": 0, "data": order.to_dict(), "message": "订单已取消"})
    return jsonify({"code": 400, "data": order.to_dict(), "message": "当前订单状态无法取消"}), 400


@order_bp.route("/<order_id>/escalate", methods=["POST"])
def escalate_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404

    data = request.get_json() or {}
    remark = (data.get("remark") or "").strip()
    if not remark:
        return jsonify({"code": 400, "data": None, "message": "异常处理备注不能为空"}), 400

    if order.escalate(remark):
        return jsonify({"code": 0, "data": order.to_dict(), "message": "已标记为异常待处理"})
    return jsonify({"code": 400, "data": order.to_dict(), "message": "当前订单状态无法标记异常"}), 400


@order_bp.route("/<order_id>/resolve", methods=["POST"])
def resolve_order(order_id):
    db = get_db()
    order = db.orders.get(order_id)
    if not order:
        return jsonify({"code": 404, "data": None, "message": "订单不存在"}), 404

    data = request.get_json() or {}
    remark = (data.get("remark") or "").strip()
    if not remark:
        return jsonify({"code": 400, "data": None, "message": "异常处理备注不能为空"}), 400

    if order.resolve(remark):
        return jsonify({"code": 0, "data": order.to_dict(), "message": "异常已处理，订单恢复服务中"})
    return jsonify({"code": 400, "data": order.to_dict(), "message": "当前订单状态无法恢复服务"}), 400
