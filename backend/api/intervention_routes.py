from flask import Blueprint, request, jsonify

from data.database import get_db
from models.constants import INTERVENTION_STATUS, INTERVENTION_RESULT

intervention_bp = Blueprint("intervention", __name__)


def _intervention_to_dict(i):
    return {
        "id": i.get("id"),
        "order_id": i.get("order_id"),
        "initiator_id": i.get("initiator_id"),
        "initiator_name": i.get("initiator_name"),
        "initiator_role": i.get("initiator_role"),
        "reason": i.get("reason", ""),
        "appeal": i.get("appeal", ""),
        "supplement": i.get("supplement", ""),
        "status": i.get("status", INTERVENTION_STATUS["PENDING"]),
        "processor_id": i.get("processor_id"),
        "processor_name": i.get("processor_name"),
        "result": i.get("result"),
        "process_remark": i.get("process_remark", ""),
        "processed_at": i.get("processed_at"),
        "created_at": i.get("created_at"),
        "updated_at": i.get("updated_at"),
    }


@intervention_bp.route("", methods=["GET"])
def list_interventions():
    db = get_db()
    interventions = getattr(db, "interventions", {})
    order_id = request.args.get("order_id")
    initiator_id = request.args.get("initiator_id")
    status = request.args.get("status")
    keyword = (request.args.get("keyword") or "").strip()

    result = list(interventions.values())
    if order_id:
        result = [i for i in result if i.get("order_id") == order_id]
    if initiator_id:
        result = [i for i in result if i.get("initiator_id") == initiator_id]
    if status:
        result = [i for i in result if i.get("status") == status]
    if keyword:
        result = [
            i for i in result
            if keyword in (i.get("order_id") or "")
            or keyword in (i.get("reason") or "")
            or keyword in (i.get("initiator_name") or "")
        ]

    return jsonify({"code": 0, "data": [_intervention_to_dict(i) for i in result], "message": "success"})


@intervention_bp.route("/<intervention_id>", methods=["GET"])
def get_intervention(intervention_id):
    db = get_db()
    interventions = getattr(db, "interventions", {})
    intervention = interventions.get(intervention_id)
    if not intervention:
        return jsonify({"code": 404, "data": None, "message": "介入记录不存在"}), 404
    return jsonify({"code": 0, "data": _intervention_to_dict(intervention), "message": "success"})


@intervention_bp.route("", methods=["POST"])
def create_intervention():
    from models.constants import generate_id
    from datetime import datetime

    data = request.get_json() or {}
    order_id = (data.get("order_id") or "").strip()
    reason = (data.get("reason") or "").strip()
    appeal = (data.get("appeal") or "").strip()
    supplement = (data.get("supplement") or "").strip()

    if not order_id:
        return jsonify({"code": 400, "data": None, "message": "未选择关联订单"}), 400
    if not reason:
        return jsonify({"code": 400, "data": None, "message": "介入原因不能为空"}), 400
    if not appeal:
        return jsonify({"code": 400, "data": None, "message": "介入诉求不能为空"}), 400

    db = get_db()
    interventions = getattr(db, "interventions", {})
    if not hasattr(db, "interventions"):
        db.interventions = {}
        interventions = db.interventions

    now = datetime.now().isoformat()
    intervention = {
        "id": generate_id("iv"),
        "order_id": order_id,
        "initiator_id": data.get("initiator_id", "user_001"),
        "initiator_name": data.get("initiator_name", "用户"),
        "initiator_role": data.get("initiator_role", "user"),
        "reason": reason,
        "appeal": appeal,
        "supplement": supplement,
        "status": INTERVENTION_STATUS["PENDING"],
        "processor_id": None,
        "processor_name": None,
        "result": None,
        "process_remark": "",
        "processed_at": None,
        "created_at": now,
        "updated_at": now,
    }
    db.interventions[intervention["id"]] = intervention
    return jsonify({"code": 0, "data": _intervention_to_dict(intervention), "message": "介入申请已提交"})


@intervention_bp.route("/<intervention_id>/process", methods=["POST"])
def process_intervention(intervention_id):
    db = get_db()
    interventions = getattr(db, "interventions", {})
    intervention = interventions.get(intervention_id)
    if not intervention:
        return jsonify({"code": 404, "data": None, "message": "介入记录不存在"}), 404

    data = request.get_json() or {}
    result = (data.get("result") or "").strip()
    remark = (data.get("remark") or "").strip()

    if not result:
        return jsonify({"code": 400, "data": None, "message": "请选择处理结果"}), 400
    if result not in INTERVENTION_RESULT.values():
        return jsonify({"code": 400, "data": None, "message": "处理结果不合法"}), 400
    if not remark:
        return jsonify({"code": 400, "data": None, "message": "处理意见不能为空"}), 400

    if intervention.get("status") in (INTERVENTION_STATUS["RESOLVED"], INTERVENTION_STATUS["CLOSED"]):
        return jsonify({"code": 400, "data": _intervention_to_dict(intervention), "message": "该介入单已处理，不可重复操作"}), 400

    from datetime import datetime

    now = datetime.now().isoformat()
    intervention["result"] = result
    intervention["process_remark"] = remark
    intervention["processor_id"] = data.get("processor_id", "admin_001")
    intervention["processor_name"] = data.get("processor_name", "平台管理员")
    intervention["processed_at"] = now
    intervention["updated_at"] = now

    if result in (INTERVENTION_RESULT["MANUAL_FOLLOW_UP"],):
        intervention["status"] = INTERVENTION_STATUS["PROCESSING"]
    else:
        intervention["status"] = INTERVENTION_STATUS["RESOLVED"]

    return jsonify({"code": 0, "data": _intervention_to_dict(intervention), "message": "介入已处理"})
