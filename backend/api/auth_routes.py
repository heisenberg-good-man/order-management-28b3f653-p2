from flask import Blueprint, request, jsonify

from data.database import get_db
from services.validation_service import validate_auth_data

auth_bp = Blueprint("realname_auth", __name__)


@auth_bp.route("/<provider_id>", methods=["GET"])
def get_auth(provider_id):
    db = get_db()
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 404, "data": None, "message": "服务商不存在"}), 404
    return jsonify({"code": 0, "data": provider.auth.to_dict(), "message": "success"})


@auth_bp.route("/<provider_id>/submit", methods=["POST"])
def submit_auth(provider_id):
    db = get_db()
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 404, "data": None, "message": "服务商不存在"}), 404

    data = request.get_json() or {}
    errors = validate_auth_data(data)
    if errors:
        return jsonify({"code": 400, "data": None, "message": "参数校验失败", "errors": errors}), 400

    provider.submit_auth(
        real_name=data["real_name"].strip(),
        id_card_number=data["id_card_number"].strip(),
        id_card_front=data["id_card_front"],
        id_card_back=data["id_card_back"],
    )
    return jsonify({"code": 0, "data": provider.auth.to_dict(), "message": "认证资料已提交，等待审核"})


@auth_bp.route("/<provider_id>/approve", methods=["POST"])
def approve_auth(provider_id):
    db = get_db()
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 404, "data": None, "message": "服务商不存在"}), 404

    provider.auth.approve()
    return jsonify({"code": 0, "data": provider.auth.to_dict(), "message": "实名认证已通过"})


@auth_bp.route("/<provider_id>/reject", methods=["POST"])
def reject_auth(provider_id):
    db = get_db()
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 404, "data": None, "message": "服务商不存在"}), 404

    data = request.get_json() or {}
    reason = data.get("reason", "").strip()
    if not reason:
        return jsonify({"code": 400, "data": None, "message": "请填写拒绝原因"}), 400

    provider.auth.reject(reason)
    return jsonify({"code": 0, "data": provider.auth.to_dict(), "message": "认证已拒绝"})
