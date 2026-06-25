from flask import Blueprint, request, jsonify

from data.database import get_db
from models.provider import Provider
from models.constants import PROFESSION_TYPES, PRICING_MODES
from services.validation_service import validate_provider_data

provider_bp = Blueprint("provider", __name__)


@provider_bp.route("", methods=["GET"])
def list_providers():
    db = get_db()
    profession = request.args.get("profession_type")
    auth_status = request.args.get("auth_status")
    providers = list(db.providers.values())

    if profession:
        providers = [p for p in providers if p.profession_type == profession]
    if auth_status:
        providers = [p for p in providers if p.auth.status == auth_status]

    result = [p.to_dict() for p in providers]
    return jsonify({"code": 0, "data": result, "message": "success"})


@provider_bp.route("/<provider_id>", methods=["GET"])
def get_provider(provider_id):
    db = get_db()
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 404, "data": None, "message": "服务商不存在"}), 404
    return jsonify({"code": 0, "data": provider.to_dict(), "message": "success"})


@provider_bp.route("", methods=["POST"])
def create_provider():
    data = request.get_json() or {}
    errors = validate_provider_data(data)
    if errors:
        return jsonify({"code": 400, "data": None, "message": "参数校验失败", "errors": errors}), 400

    db = get_db()
    provider = Provider(
        name=data["name"].strip(),
        profession_type=data["profession_type"],
        service_area=data["service_area"].strip(),
        service_tags=data.get("service_tags", []),
        pricing_mode=data.get("pricing_mode", ""),
        price_range=data.get("price_range", ""),
        intro=data.get("intro", ""),
        phone=data.get("phone", ""),
        avatar=data.get("avatar", ""),
    )
    db.providers[provider.id] = provider
    return jsonify({"code": 0, "data": provider.to_dict(), "message": "入驻成功"})


@provider_bp.route("/<provider_id>", methods=["PUT"])
def update_provider(provider_id):
    db = get_db()
    provider = db.providers.get(provider_id)
    if not provider:
        return jsonify({"code": 404, "data": None, "message": "服务商不存在"}), 404

    data = request.get_json() or {}
    errors = validate_provider_data(data)
    if errors:
        return jsonify({"code": 400, "data": None, "message": "参数校验失败", "errors": errors}), 400

    provider.update_profile(
        name=data["name"].strip(),
        profession_type=data["profession_type"],
        service_area=data["service_area"].strip(),
        service_tags=data.get("service_tags", []),
        pricing_mode=data.get("pricing_mode", ""),
        price_range=data.get("price_range", ""),
        intro=data.get("intro", ""),
        phone=data.get("phone", ""),
        avatar=data.get("avatar", ""),
    )
    return jsonify({"code": 0, "data": provider.to_dict(), "message": "资料更新成功"})


@provider_bp.route("/meta/options", methods=["GET"])
def get_options():
    return jsonify({
        "code": 0,
        "data": {
            "profession_types": PROFESSION_TYPES,
            "pricing_modes": PRICING_MODES,
        },
        "message": "success",
    })
