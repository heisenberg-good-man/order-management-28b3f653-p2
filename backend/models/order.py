from datetime import datetime
from models.constants import generate_id, ORDER_STATUS


class Order:
    def __init__(
        self,
        demand_id,
        provider_id,
        provider_name,
        profession_type,
        location,
        budget,
        expected_time,
        user_id="user_001",
        user_name="用户小明",
        remark="",
    ):
        self.id = generate_id("order")
        self.demand_id = demand_id
        self.provider_id = provider_id
        self.provider_name = provider_name
        self.user_id = user_id
        self.user_name = user_name
        self.profession_type = profession_type
        self.location = location
        self.budget = budget
        self.expected_time = expected_time
        self.remark = remark
        self.status = ORDER_STATUS["PENDING_CONFIRM"]
        self.cancel_reason = ""
        self.created_at = datetime.now().isoformat()
        self.accepted_at = None
        self.started_at = None
        self.completed_at = None
        self.cancelled_at = None

    def to_dict(self):
        return {
            "id": self.id,
            "demand_id": self.demand_id,
            "provider_id": self.provider_id,
            "provider_name": self.provider_name,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "profession_type": self.profession_type,
            "location": self.location,
            "budget": self.budget,
            "expected_time": self.expected_time,
            "remark": self.remark,
            "status": self.status,
            "cancel_reason": self.cancel_reason,
            "created_at": self.created_at,
            "accepted_at": self.accepted_at,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "cancelled_at": self.cancelled_at,
        }

    def can_transition(self, new_status):
        valid_transitions = {
            ORDER_STATUS["PENDING_CONFIRM"]: [ORDER_STATUS["ACCEPTED"], ORDER_STATUS["CANCELLED"]],
            ORDER_STATUS["ACCEPTED"]: [ORDER_STATUS["IN_SERVICE"], ORDER_STATUS["CANCELLED"]],
            ORDER_STATUS["IN_SERVICE"]: [ORDER_STATUS["COMPLETED"], ORDER_STATUS["CANCELLED"]],
            ORDER_STATUS["COMPLETED"]: [],
            ORDER_STATUS["CANCELLED"]: [],
        }
        return new_status in valid_transitions.get(self.status, [])

    def accept(self):
        if self.can_transition(ORDER_STATUS["ACCEPTED"]):
            self.status = ORDER_STATUS["ACCEPTED"]
            self.accepted_at = datetime.now().isoformat()
            return True
        return False

    def start_service(self):
        if self.can_transition(ORDER_STATUS["IN_SERVICE"]):
            self.status = ORDER_STATUS["IN_SERVICE"]
            self.started_at = datetime.now().isoformat()
            return True
        return False

    def complete(self):
        if self.can_transition(ORDER_STATUS["COMPLETED"]):
            self.status = ORDER_STATUS["COMPLETED"]
            self.completed_at = datetime.now().isoformat()
            return True
        return False

    def cancel(self, reason):
        if self.can_transition(ORDER_STATUS["CANCELLED"]):
            self.status = ORDER_STATUS["CANCELLED"]
            self.cancel_reason = reason
            self.cancelled_at = datetime.now().isoformat()
            return True
        return False
