from datetime import datetime


def generate_id(prefix):
    return f"{prefix}_{int(datetime.now().timestamp() * 1000)}"


PROFESSION_TYPES = [
    "保姆",
    "月嫂",
    "维修工",
    "保洁",
    "钟点工",
    "护工",
    "厨师",
    "育婴师",
    "搬家工",
    "家教",
]

PRICING_MODES = [
    "按小时计费",
    "按天计费",
    "按月计费",
    "按次计费",
]

AUTH_STATUS = {
    "PENDING": "待审核",
    "APPROVED": "已通过",
    "REJECTED": "已拒绝",
    "NOT_SUBMITTED": "未提交",
}

ORDER_STATUS = {
    "PENDING_CONFIRM": "待确认",
    "ACCEPTED": "已接单",
    "IN_SERVICE": "服务中",
    "COMPLETED": "已完成",
    "CANCELLED": "已取消",
}
