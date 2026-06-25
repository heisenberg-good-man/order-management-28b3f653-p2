from models.provider import Provider
from models.demand import Demand
from models.order import Order
from models.constants import AUTH_STATUS, ORDER_STATUS


class Database:
    def __init__(self):
        self.providers = {}
        self.demands = {}
        self.orders = {}
        self._init_mock_data()

    def _init_mock_data(self):
        p1 = Provider(
            name="张阿姨",
            profession_type="月嫂",
            service_area="朝阳区,海淀区",
            service_tags=["金牌月嫂", "5年经验", "会做月子餐"],
            pricing_mode="按月计费",
            price_range="12000-18000",
            intro="从事母婴护理行业8年，持证上岗，服务过100+家庭。",
            phone="138****1234",
        )
        p1.auth.status = AUTH_STATUS["APPROVED"]
        p1.auth.real_name = "张桂芳"
        p1.auth.id_card_number = "11010119850101****"
        self.providers[p1.id] = p1

        p2 = Provider(
            name="李师傅",
            profession_type="维修工",
            service_area="西城区,东城区,朝阳区",
            service_tags=["水电维修", "家电维修", "24小时上门"],
            pricing_mode="按次计费",
            price_range="100-500",
            intro="10年家电维修经验，精通各类家电故障排查与维修。",
            phone="139****5678",
        )
        p2.auth.status = AUTH_STATUS["PENDING"]
        p2.auth.real_name = "李建国"
        p2.auth.id_card_number = "11010119800505****"
        self.providers[p2.id] = p2

        p3 = Provider(
            name="王大姐",
            profession_type="保姆",
            service_area="海淀区,丰台区",
            service_tags=["照顾老人", "做饭好吃", "干净利索"],
            pricing_mode="按月计费",
            price_range="6000-9000",
            intro="做家政工作5年，擅长照顾老人和做家务。",
            phone="137****9012",
        )
        p3.auth.status = AUTH_STATUS["REJECTED"]
        p3.auth.real_name = "王秀兰"
        p3.auth.reject_reason = "身份证件照片不清晰，请重新上传"
        self.providers[p3.id] = p3

        p4 = Provider(
            name="赵师傅",
            profession_type="维修工",
            service_area="朝阳区,通州区",
            service_tags=["管道疏通", "马桶维修", "水管漏水"],
            pricing_mode="按次计费",
            price_range="80-300",
            intro="专业管道疏通维修15年，快速上门。",
            phone="136****3456",
        )
        p4.auth.status = AUTH_STATUS["NOT_SUBMITTED"]
        self.providers[p4.id] = p4

        p5 = Provider(
            name="陈阿姨",
            profession_type="保洁",
            service_area="全市",
            service_tags=["深度保洁", "开荒保洁", "擦玻璃"],
            pricing_mode="按小时计费",
            price_range="40-60",
            intro="专业保洁服务，干净认真。",
            phone="135****7890",
        )
        p5.auth.status = AUTH_STATUS["APPROVED"]
        p5.auth.real_name = "陈美丽"
        p5.auth.id_card_number = "11010119881010****"
        self.providers[p5.id] = p5

        d1 = Demand(
            profession_type="月嫂",
            location="朝阳区建国路88号",
            budget=15000,
            expected_time="2026-07-15",
            remark="需要有金牌月嫂证书，会做月子餐",
        )
        self.demands[d1.id] = d1

        o1 = Order(
            demand_id=d1.id,
            provider_id=p1.id,
            provider_name=p1.name,
            profession_type="月嫂",
            location="朝阳区建国路88号",
            budget=15000,
            expected_time="2026-07-15",
            remark="需要有金牌月嫂证书，会做月子餐",
        )
        self.orders[o1.id] = o1


db = Database()


def get_db():
    return db
