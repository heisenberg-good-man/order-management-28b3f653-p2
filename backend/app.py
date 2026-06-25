from flask import Flask, jsonify
from flask_cors import CORS

from api.provider_routes import provider_bp
from api.auth_routes import auth_bp
from api.demand_routes import demand_bp
from api.order_routes import order_bp
from api.admin_routes import admin_bp


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(provider_bp, url_prefix="/api/providers")
    app.register_blueprint(auth_bp, url_prefix="/api/realname-auth")
    app.register_blueprint(demand_bp, url_prefix="/api/demands")
    app.register_blueprint(order_bp, url_prefix="/api/orders")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "message": "中介平台后端服务运行正常"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
