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
    "EXCEPTION": "异常待处理",
    "COMPLETED": "已完成",
    "CANCELLED": "已取消",
}

ORDER_TRANSITIONS = {
    "待确认": ["已接单", "已取消"],
    "已接单": ["服务中", "已取消"],
    "服务中": ["已完成", "异常待处理", "已取消"],
    "异常待处理": ["服务中", "已取消"],
    "已完成": [],
    "已取消": [],
}

CONTRACT_STATUS = {
    "PENDING_SIGN": "待签署",
    "USER_SIGNED": "需求方已签",
    "PROVIDER_SIGNED": "服务商已签",
    "SIGNED": "已签署",
    "REJECTED": "已拒签",
    "VOID": "已作废",
}

PAYMENT_STATUS = {
    "PENDING_ESCROW": "待托管",
    "ESCROWED": "已托管",
    "IN_SERVICE_CONFIRMABLE": "服务中可确认",
    "PENDING_SETTLE": "待结算",
    "SETTLED": "已结算",
    "REFUND_PROCESSING": "退款处理中",
    "PARTIAL_REFUNDED": "部分已退款",
    "REFUNDED": "已退款",
}

INTERVENTION_STATUS = {
    "PENDING": "待处理",
    "PROCESSING": "处理中",
    "RESOLVED": "已处理",
    "CLOSED": "已关闭",
}

INTERVENTION_RESULT = {
    "CONTINUE_PERFORM": "继续履约",
    "PARTIAL_REFUND": "部分退款",
    "FULL_REFUND": "全额退款",
    "REJECT": "驳回申请",
    "MANUAL_FOLLOW_UP": "转人工跟进",
}

