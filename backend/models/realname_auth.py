from datetime import datetime
from models.constants import generate_id, AUTH_STATUS


class RealNameAuth:
    def __init__(
        self,
        provider_id,
        real_name="",
        id_card_number="",
        id_card_front="",
        id_card_back="",
        status=None,
        reject_reason="",
        submitted_at=None,
        reviewed_at=None,
    ):
        self.id = generate_id("auth")
        self.provider_id = provider_id
        self.real_name = real_name
        self.id_card_number = id_card_number
        self.id_card_front = id_card_front
        self.id_card_back = id_card_back
        self.status = status or AUTH_STATUS["NOT_SUBMITTED"]
        self.reject_reason = reject_reason
        self.submitted_at = submitted_at
        self.reviewed_at = reviewed_at

    def to_dict(self):
        return {
            "id": self.id,
            "provider_id": self.provider_id,
            "real_name": self.real_name,
            "id_card_number": self.id_card_number,
            "id_card_front": self.id_card_front,
            "id_card_back": self.id_card_back,
            "status": self.status,
            "reject_reason": self.reject_reason,
            "submitted_at": self.submitted_at,
            "reviewed_at": self.reviewed_at,
        }

    def submit(self, real_name, id_card_number, id_card_front, id_card_back):
        self.real_name = real_name
        self.id_card_number = id_card_number
        self.id_card_front = id_card_front
        self.id_card_back = id_card_back
        self.status = AUTH_STATUS["PENDING"]
        self.submitted_at = datetime.now().isoformat()
        self.reject_reason = ""

    def approve(self):
        self.status = AUTH_STATUS["APPROVED"]
        self.reviewed_at = datetime.now().isoformat()
        self.reject_reason = ""

    def reject(self, reason):
        self.status = AUTH_STATUS["REJECTED"]
        self.reviewed_at = datetime.now().isoformat()
        self.reject_reason = reason
