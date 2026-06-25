import re

from models.constants import PROFESSION_TYPES, PRICING_MODES


def validate_provider_data(data):
    errors = {}

    if not data.get("name") or not data["name"].strip():
        errors["name"] = "请填写姓名"

    if not data.get("profession_type"):
        errors["profession_type"] = "请选择职业类型"
    elif data["profession_type"] not in PROFESSION_TYPES:
        errors["profession_type"] = "职业类型不合法"

    if not data.get("service_area") or not data["service_area"].strip():
        errors["service_area"] = "请填写服务区域"

    if data.get("pricing_mode") and data["pricing_mode"] not in PRICING_MODES:
        errors["pricing_mode"] = "报价方式不合法"

    price_range = data.get("price_range", "")
    if price_range:
        if not re.match(r"^\d+-\d+$", price_range):
            errors["price_range"] = "报价范围格式不正确，例如：100-500"

    return errors


def validate_auth_data(data):
    errors = {}

    if not data.get("real_name") or not data["real_name"].strip():
        errors["real_name"] = "请填写真实姓名"

    id_card = data.get("id_card_number", "")
    if not id_card:
        errors["id_card_number"] = "请填写身份证号"
    elif not re.match(r"^\d{17}[\dXx]$", id_card):
        errors["id_card_number"] = "身份证号格式不正确"

    if not data.get("id_card_front"):
        errors["id_card_front"] = "请上传身份证正面照"

    if not data.get("id_card_back"):
        errors["id_card_back"] = "请上传身份证反面照"

    return errors


def validate_demand_data(data):
    errors = {}

    if not data.get("profession_type"):
        errors["profession_type"] = "请选择职业类型"
    elif data["profession_type"] not in PROFESSION_TYPES:
        errors["profession_type"] = "职业类型不合法"

    if not data.get("location") or not data["location"].strip():
        errors["location"] = "请填写服务地点"

    budget = data.get("budget")
    if budget is None or budget == "":
        errors["budget"] = "请填写预算"
    else:
        try:
            budget_num = float(budget)
            if budget_num <= 0:
                errors["budget"] = "预算必须大于0"
        except (ValueError, TypeError):
            errors["budget"] = "预算格式不正确"

    if not data.get("expected_time"):
        errors["expected_time"] = "请选择期望服务时间"

    return errors


def validate_order_cancel(data):
    errors = {}
    if not data.get("cancel_reason") or not data["cancel_reason"].strip():
        errors["cancel_reason"] = "请填写取消原因"
    return errors
