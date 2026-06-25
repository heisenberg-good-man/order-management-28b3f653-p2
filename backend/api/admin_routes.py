from flask import Blueprint, request, jsonify

from data.database import get_db
from models.constants import AUTH_STATUS, ORDER_STATUS

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    db = get_db()
    providers = list(db.providers.values())
    orders = list(db.orders.values())

    auth_stats = {
        AUTH_STATUS["NOT_SUBMITTED"]: 0,
        AUTH_STATUS["PENDING"]: 0,
        AUTH_STATUS["APPROVED"]: 0,
        AUTH_STATUS["REJECTED"]: 0,
    }
    for p in providers:
        auth_stats[p.auth.status] = auth_stats.get(p.auth.status, 0) + 1

    order_stats = {
        ORDER_STATUS["PENDING_CONFIRM"]: 0,
        ORDER_STATUS["ACCEPTED"]: 0,
        ORDER_STATUS["IN_SERVICE"]: 0,
        ORDER_STATUS["COMPLETED"]: 0,
        ORDER_STATUS["CANCELLED"]: 0,
    }
    for o in orders:
        order_stats[o.status] = order_stats.get(o.status, 0) + 1

    return jsonify({
        "code": 0,
        "data": {
            "total_providers": len(providers),
            "total_orders": len(orders),
            "auth_stats": auth_stats,
            "order_stats": order_stats,
        },
        "message": "success",
    })


@admin_bp.route("/providers", methods=["GET"])
def list_providers_admin():
    db = get_db()
    auth_status = request.args.get("auth_status")
    providers = list(db.providers.values())
    if auth_status:
        providers = [p for p in providers if p.auth.status == auth_status]
    result = [p.to_dict() for p in providers]
    return jsonify({"code": 0, "data": result, "message": "success"})


@admin_bp.route("/orders", methods=["GET"])
def list_orders_admin():
    db = get_db()
    status = request.args.get("status")
    orders = list(db.orders.values())
    if status:
        orders = [o for o in orders if o.status == status]
    result = [o.to_dict() for o in orders]
    return jsonify({"code": 0, "data": result, "message": "success"})
