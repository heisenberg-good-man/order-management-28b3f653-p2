from datetime import datetime
from models.constants import generate_id


class Demand:
    def __init__(
        self,
        profession_type,
        location,
        budget,
        expected_time,
        remark="",
        user_id="user_001",
        user_name="用户小明",
    ):
        self.id = generate_id("demand")
        self.user_id = user_id
        self.user_name = user_name
        self.profession_type = profession_type
        self.location = location
        self.budget = budget
        self.expected_time = expected_time
        self.remark = remark
        self.created_at = datetime.now().isoformat()
        self.status = "OPEN"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "profession_type": self.profession_type,
            "location": self.location,
            "budget": self.budget,
            "expected_time": self.expected_time,
            "remark": self.remark,
            "created_at": self.created_at,
            "status": self.status,
        }
