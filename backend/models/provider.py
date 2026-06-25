from datetime import datetime
from models.constants import generate_id, AUTH_STATUS
from models.realname_auth import RealNameAuth


class Provider:
    def __init__(
        self,
        name,
        profession_type,
        service_area,
        service_tags=None,
        pricing_mode="",
        price_range="",
        intro="",
        phone="",
        avatar="",
    ):
        self.id = generate_id("provider")
        self.name = name
        self.profession_type = profession_type
        self.service_area = service_area
        self.service_tags = service_tags or []
        self.pricing_mode = pricing_mode
        self.price_range = price_range
        self.intro = intro
        self.phone = phone
        self.avatar = avatar
        self.created_at = datetime.now().isoformat()
        self.auth = RealNameAuth(provider_id=self.id)

    def to_dict(self, include_auth=True):
        data = {
            "id": self.id,
            "name": self.name,
            "profession_type": self.profession_type,
            "service_area": self.service_area,
            "service_tags": self.service_tags,
            "pricing_mode": self.pricing_mode,
            "price_range": self.price_range,
            "intro": self.intro,
            "phone": self.phone,
            "avatar": self.avatar,
            "created_at": self.created_at,
            "auth_status": self.auth.status if self.auth else AUTH_STATUS["NOT_SUBMITTED"],
        }
        if include_auth and self.auth:
            data["auth"] = self.auth.to_dict()
        return data

    def update_profile(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key) and key != "id" and key != "created_at" and key != "auth":
                setattr(self, key, value)

    def submit_auth(self, real_name, id_card_number, id_card_front, id_card_back):
        if self.auth:
            self.auth.submit(real_name, id_card_number, id_card_front, id_card_back)
