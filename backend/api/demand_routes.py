from flask import Blueprint, request, jsonify

from data.database import get_db
from models.demand import Demand
from services.validation_service import validate_demand_data
from services.matching_service import match_providers_for_demand

demand_bp = Blueprint("demand", __name__)


@demand_bp.route("", methods=["GET"])
def list_demands():
    db = get_db()
    result = [d.to_dict() for d in db.demands.values()]
    return jsonify({"code": 0, "data": result, "message": "success"})


@demand_bp.route("/<demand_id>", methods=["GET"])
def get_demand(demand_id):
    db = get_db()
    demand = db.demands.get(demand_id)
    if not demand:
        return jsonify({"code": 404, "data": None, "message": "需求不存在"}), 404
    return jsonify({"code": 0, "data": demand.to_dict(), "message": "success"})


@demand_bp.route("", methods=["POST"])
def create_demand():
    data = request.get_json() or {}
    errors = validate_demand_data(data)
    if errors:
        return jsonify({"code": 400, "data": None, "message": "参数校验失败", "errors": errors}), 400

    db = get_db()
    demand = Demand(
        profession_type=data["profession_type"],
        location=data["location"].strip(),
        budget=float(data["budget"]),
        expected_time=data["expected_time"],
        remark=data.get("remark", ""),
        user_id=data.get("user_id", "user_001"),
        user_name=data.get("user_name", "用户小明"),
    )
    db.demands[demand.id] = demand
    return jsonify({"code": 0, "data": demand.to_dict(), "message": "需求发布成功"})


@demand_bp.route("/<demand_id>/match", methods=["GET"])
def match_providers(demand_id):
    limit = request.args.get("limit", 5, type=int)
    matched, error = match_providers_for_demand(demand_id, limit)
    if error:
        return jsonify({"code": 404, "data": None, "message": error}), 404
    return jsonify({
        "code": 0,
        "data": {
            "demand_id": demand_id,
            "matched_count": len(matched),
            "providers": matched,
        },
        "message": "success" if matched else "没有可匹配的服务商",
    })
