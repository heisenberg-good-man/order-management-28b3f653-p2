from flask import Blueprint, request, jsonify

from data.database import get_db
from models.constants import CONTRACT_STATUS

contract_bp = Blueprint("contract", __name__)


def _contract_to_dict(c):
    return {
        "id": c.get("id"),
        "order_id": c.get("order_id"),
        "demand_id": c.get("demand_id", ""),
        "user_id": c.get("user_id"),
        "user_name": c.get("user_name"),
        "provider_id": c.get("provider_id"),
        "provider_name": c.get("provider_name"),
        "profession_type": c.get("profession_type"),
        "service_address": c.get("service_address"),
        "service_time": c.get("service_time"),
        "quoted_price": c.get("quoted_price"),
        "service_commitment": c.get("service_commitment", ""),
        "breach_clause": c.get("breach_clause", ""),
        "status": c.get("status", CONTRACT_STATUS["PENDING_SIGN"]),
        "user_signed_at": c.get("user_signed_at"),
        "provider_signed_at": c.get("provider_signed_at"),
        "reject_reason": c.get("reject_reason", ""),
        "void_reason": c.get("void_reason", ""),
        "created_at": c.get("created_at"),
        "updated_at": c.get("updated_at"),
    }


@contract_bp.route("", methods=["GET"])
def list_contracts():
    db = get_db()
    contracts = getattr(db, "contracts", {})
    user_id = request.args.get("user_id")
    provider_id = request.args.get("provider_id")
    status = request.args.get("status")
    keyword = (request.args.get("keyword") or "").strip()

    result = list(contracts.values())
    if user_id:
        result = [c for c in result if c.get("user_id") == user_id]
    if provider_id:
        result = [c for c in result if c.get("provider_id") == provider_id]
    if status:
        result = [c for c in result if c.get("status") == status]
    if keyword:
        result = [
            c for c in result
            if keyword in (c.get("order_id") or "")
            or keyword in (c.get("provider_name") or "")
            or keyword in (c.get("user_name") or "")
        ]

    return jsonify({"code": 0, "data": [_contract_to_dict(c) for c in result], "message": "success"})


@contract_bp.route("/<contract_id>", methods=["GET"])
def get_contract(contract_id):
    db = get_db()
    contracts = getattr(db, "contracts", {})
    contract = contracts.get(contract_id)
    if not contract:
        return jsonify({"code": 404, "data": None, "message": "合同不存在"}), 404
    return jsonify({"code": 0, "data": _contract_to_dict(contract), "message": "success"})


@contract_bp.route("/by-order/<order_id>", methods=["GET"])
def get_contract_by_order(order_id):
    db = get_db()
    contracts = getattr(db, "contracts", {})
    contract = next((c for c in contracts.values() if c.get("order_id") == order_id), None)
    if not contract:
        return jsonify({"code": 404, "data": None, "message": "该订单暂无合同"}), 404
    return jsonify({"code": 0, "data": _contract_to_dict(contract), "message": "success"})


@contract_bp.route("/<contract_id>/sign", methods=["POST"])
def sign_contract(contract_id):
    db = get_db()
    contracts = getattr(db, "contracts", {})
    contract = contracts.get(contract_id)
    if not contract:
        return jsonify({"code": 404, "data": None, "message": "合同不存在"}), 404

    data = request.get_json() or {}
    role = data.get("role")
    if role not in ("user", "provider"):
        return jsonify({"code": 400, "data": None, "message": "签署角色不合法"}), 400

    if contract.get("status") not in (
        CONTRACT_STATUS["PENDING_SIGN"],
        CONTRACT_STATUS["USER_SIGNED"],
        CONTRACT_STATUS["PROVIDER_SIGNED"],
    ):
        return jsonify({"code": 400, "data": _contract_to_dict(contract), "message": "当前合同状态无法签署"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    if role == "user":
        contract["user_signed_at"] = now
        if contract.get("provider_signed_at"):
            contract["status"] = CONTRACT_STATUS["SIGNED"]
        else:
            contract["status"] = CONTRACT_STATUS["USER_SIGNED"]
    else:
        contract["provider_signed_at"] = now
        if contract.get("user_signed_at"):
            contract["status"] = CONTRACT_STATUS["SIGNED"]
        else:
            contract["status"] = CONTRACT_STATUS["PROVIDER_SIGNED"]
    contract["updated_at"] = now
    return jsonify({"code": 0, "data": _contract_to_dict(contract), "message": "合同签署成功"})


@contract_bp.route("/<contract_id>/reject", methods=["POST"])
def reject_contract(contract_id):
    db = get_db()
    contracts = getattr(db, "contracts", {})
    contract = contracts.get(contract_id)
    if not contract:
        return jsonify({"code": 404, "data": None, "message": "合同不存在"}), 404

    data = request.get_json() or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"code": 400, "data": None, "message": "拒签原因不能为空"}), 400

    if contract.get("status") in (CONTRACT_STATUS["SIGNED"], CONTRACT_STATUS["VOID"]):
        return jsonify({"code": 400, "data": _contract_to_dict(contract), "message": "当前合同状态无法拒签"}), 400

    from datetime import datetime

    contract["status"] = CONTRACT_STATUS["REJECTED"]
    contract["reject_reason"] = reason
    contract["updated_at"] = datetime.now().isoformat()
    return jsonify({"code": 0, "data": _contract_to_dict(contract), "message": "合同已拒签"})


@contract_bp.route("/<contract_id>/void", methods=["POST"])
def void_contract(contract_id):
    db = get_db()
    contracts = getattr(db, "contracts", {})
    contract = contracts.get(contract_id)
    if not contract:
        return jsonify({"code": 404, "data": None, "message": "合同不存在"}), 404

    data = request.get_json() or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"code": 400, "data": None, "message": "作废原因不能为空"}), 400

    from datetime import datetime

    contract["status"] = CONTRACT_STATUS["VOID"]
    contract["void_reason"] = reason
    contract["updated_at"] = datetime.now().isoformat()
    return jsonify({"code": 0, "data": _contract_to_dict(contract), "message": "合同已作废"})


@contract_bp.route("/<contract_id>", methods=["PUT"])
def update_contract(contract_id):
    db = get_db()
    contracts = getattr(db, "contracts", {})
    contract = contracts.get(contract_id)
    if not contract:
        return jsonify({"code": 404, "data": None, "message": "合同不存在"}), 404

    data = request.get_json() or {}
    for field in ("service_commitment", "breach_clause", "quoted_price", "service_time", "service_address"):
        if field in data:
            contract[field] = data[field]

    from datetime import datetime

    contract["updated_at"] = datetime.now().isoformat()
    return jsonify({"code": 0, "data": _contract_to_dict(contract), "message": "合同条款已更新"})
