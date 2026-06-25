from flask import Blueprint, request, jsonify

from data.database import get_db
from models.constants import PAYMENT_STATUS, ORDER_STATUS

payment_bp = Blueprint("payment", __name__)


def _payment_to_dict(p):
    return {
        "id": p.get("id"),
        "order_id": p.get("order_id"),
        "user_id": p.get("user_id"),
        "user_name": p.get("user_name"),
        "provider_id": p.get("provider_id"),
        "provider_name": p.get("provider_name"),
        "total_amount": p.get("total_amount", 0),
        "escrowed_amount": p.get("escrowed_amount", 0),
        "settled_amount": p.get("settled_amount", 0),
        "refunded_amount": p.get("refunded_amount", 0),
        "status": p.get("status", PAYMENT_STATUS["PENDING_ESCROW"]),
        "escrowed_at": p.get("escrowed_at"),
        "settled_at": p.get("settled_at"),
        "refund_applied_at": p.get("refund_applied_at"),
        "refund_processed_at": p.get("refund_processed_at"),
        "refund_reason": p.get("refund_reason", ""),
        "refund_remark": p.get("refund_remark", ""),
        "created_at": p.get("created_at"),
        "updated_at": p.get("updated_at"),
    }


def _find_payment_by_order(payments, order_id):
    return next((p for p in payments.values() if p.get("order_id") == order_id), None)


@payment_bp.route("", methods=["GET"])
def list_payments():
    db = get_db()
    payments = getattr(db, "payments", {})
    user_id = request.args.get("user_id")
    provider_id = request.args.get("provider_id")
    status = request.args.get("status")
    keyword = (request.args.get("keyword") or "").strip()

    result = list(payments.values())
    if user_id:
        result = [p for p in result if p.get("user_id") == user_id]
    if provider_id:
        result = [p for p in result if p.get("provider_id") == provider_id]
    if status:
        result = [p for p in result if p.get("status") == status]
    if keyword:
        result = [
            p for p in result
            if keyword in (p.get("order_id") or "")
            or keyword in (p.get("provider_name") or "")
            or keyword in (p.get("user_name") or "")
        ]

    return jsonify({"code": 0, "data": [_payment_to_dict(p) for p in result], "message": "success"})


@payment_bp.route("/<payment_id>", methods=["GET"])
def get_payment(payment_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = payments.get(payment_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "付款记录不存在"}), 404
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "success"})


@payment_bp.route("/by-order/<order_id>", methods=["GET"])
def get_payment_by_order(order_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = _find_payment_by_order(payments, order_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "该订单暂无付款记录"}), 404
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "success"})


@payment_bp.route("/<order_id>/escrow", methods=["POST"])
def escrow_payment(order_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = _find_payment_by_order(payments, order_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "付款记录不存在"}), 404

    data = request.get_json() or {}
    amount = data.get("amount")
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({"code": 400, "data": None, "message": "托管金额不合法"}), 400
    if amount <= 0:
        return jsonify({"code": 400, "data": None, "message": "托管金额必须大于 0"}), 400
    if payment.get("status") not in (PAYMENT_STATUS["PENDING_ESCROW"],):
        return jsonify({"code": 400, "data": _payment_to_dict(payment), "message": "当前状态不允许重复托管"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    payment["escrowed_amount"] = amount
    payment["status"] = PAYMENT_STATUS["ESCROWED"]
    payment["escrowed_at"] = now
    payment["updated_at"] = now
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "款项已托管"})


@payment_bp.route("/<order_id>/confirm-complete", methods=["POST"])
def confirm_service_complete(order_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = _find_payment_by_order(payments, order_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "付款记录不存在"}), 404

    if payment.get("status") not in (
        PAYMENT_STATUS["ESCROWED"],
        PAYMENT_STATUS["IN_SERVICE_CONFIRMABLE"],
    ):
        return jsonify({"code": 400, "data": _payment_to_dict(payment), "message": "服务未完成，暂不可确认结算"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    payment["status"] = PAYMENT_STATUS["PENDING_SETTLE"]
    payment["updated_at"] = now
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "服务已确认完成，等待结算"})


@payment_bp.route("/<order_id>/apply-refund", methods=["POST"])
def apply_refund(order_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = _find_payment_by_order(payments, order_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "付款记录不存在"}), 404

    data = request.get_json() or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"code": 400, "data": None, "message": "退款原因不能为空"}), 400

    if payment.get("status") not in (
        PAYMENT_STATUS["ESCROWED"],
        PAYMENT_STATUS["IN_SERVICE_CONFIRMABLE"],
        PAYMENT_STATUS["PENDING_SETTLE"],
    ):
        return jsonify({"code": 400, "data": _payment_to_dict(payment), "message": "当前状态不允许申请退款"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    payment["status"] = PAYMENT_STATUS["REFUND_PROCESSING"]
    payment["refund_reason"] = reason
    payment["refund_applied_at"] = now
    payment["updated_at"] = now
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "已提交退款申请，等待平台处理"})


@payment_bp.route("/<order_id>/settle", methods=["POST"])
def settle_payment(order_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = _find_payment_by_order(payments, order_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "付款记录不存在"}), 404

    if payment.get("status") not in (PAYMENT_STATUS["PENDING_SETTLE"],):
        return jsonify({"code": 400, "data": _payment_to_dict(payment), "message": "当前状态不允许结算"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    payment["settled_amount"] = payment.get("escrowed_amount", 0) - payment.get("refunded_amount", 0)
    payment["status"] = PAYMENT_STATUS["SETTLED"]
    payment["settled_at"] = now
    payment["updated_at"] = now
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "款项已结算给服务商"})


@payment_bp.route("/<order_id>/process-refund", methods=["POST"])
def process_refund(order_id):
    db = get_db()
    payments = getattr(db, "payments", {})
    payment = _find_payment_by_order(payments, order_id)
    if not payment:
        return jsonify({"code": 404, "data": None, "message": "付款记录不存在"}), 404

    data = request.get_json() or {}
    refund_type = data.get("refund_type", "full")
    refund_amount = data.get("refund_amount")
    remark = (data.get("remark") or "").strip()
    if not remark:
        return jsonify({"code": 400, "data": None, "message": "处理意见不能为空"}), 400

    if payment.get("status") not in (PAYMENT_STATUS["REFUND_PROCESSING"],):
        return jsonify({"code": 400, "data": _payment_to_dict(payment), "message": "当前状态不允许处理退款"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    escrowed = float(payment.get("escrowed_amount", 0))

    if refund_type == "reject":
        payment["status"] = PAYMENT_STATUS["PENDING_SETTLE"]
        payment["refund_remark"] = remark + "（退款申请已驳回）"
    elif refund_type == "partial":
        try:
            refund_amount = float(refund_amount)
        except (TypeError, ValueError):
            return jsonify({"code": 400, "data": None, "message": "部分退款金额不合法"}), 400
        if refund_amount <= 0 or refund_amount >= escrowed:
            return jsonify({"code": 400, "data": None, "message": "部分退款金额需大于 0 且小于托管总额"}), 400
        payment["refunded_amount"] = refund_amount
        payment["status"] = PAYMENT_STATUS["PARTIAL_REFUNDED"]
        payment["refund_remark"] = remark
        payment["settled_amount"] = escrowed - refund_amount
    else:
        payment["refunded_amount"] = escrowed
        payment["status"] = PAYMENT_STATUS["REFUNDED"]
        payment["refund_remark"] = remark

    payment["refund_processed_at"] = now
    payment["updated_at"] = now
    return jsonify({"code": 0, "data": _payment_to_dict(payment), "message": "退款已处理"})
