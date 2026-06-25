from data.database import get_db
from models.constants import AUTH_STATUS


def match_providers_for_demand(demand_id, limit=5):
    db = get_db()
    demand = db.demands.get(demand_id)
    if not demand:
        return [], "需求不存在"

    matched = []
    for provider in db.providers.values():
        score = 0
        reasons = []

        if provider.profession_type == demand.profession_type:
            score += 40
            reasons.append("职业类型匹配")

        provider_areas = [a.strip() for a in provider.service_area.split(",")]
        location_match = any(area in demand.location for area in provider_areas) or "全市" in provider_areas
        if location_match:
            score += 25
            reasons.append("服务区域覆盖")

        if provider.auth.status == AUTH_STATUS["APPROVED"]:
            score += 20
            reasons.append("已实名认证")
        elif provider.auth.status == AUTH_STATUS["PENDING"]:
            score += 5
            reasons.append("认证审核中")

        if provider.price_range:
            try:
                parts = provider.price_range.split("-")
                if len(parts) == 2:
                    low, high = int(parts[0]), int(parts[1])
                    if low <= demand.budget <= high:
                        score += 15
                        reasons.append("预算在报价范围内")
                    elif demand.budget > high:
                        score += 8
                        reasons.append("预算高于报价")
            except (ValueError, IndexError):
                pass

        if score > 0:
            matched.append({
                "provider": provider.to_dict(),
                "score": score,
                "match_reasons": reasons,
            })

    matched.sort(key=lambda x: x["score"], reverse=True)
    return matched[:limit], None
