from .dichvu import dichvu_bp
from .lapphieudichvu import phieudichvu_bp
from .phieunhap import phieunhap_bp
from .nhaphang import nhaphang_bp
from .phieumuahang import phieumuahang_bp
from .phieubanhang import phieubanhang_bp
from .donhang import donhang_bp
from .baocao import baocao_bp
from .auth import auth_bp
from .category import category_bp
from .product import product_bp
from .user import user_bp
from .thamso import thamso_bp
# from .thongke import thongke_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix = "/api/auth")
    app.register_blueprint(category_bp, url_prefix = "/api/category")
    app.register_blueprint(product_bp, url_prefix = "/api/product")
    app.register_blueprint(user_bp, url_prefix = "/api/user")
    app.register_blueprint(dichvu_bp, url_prefix='/api')
    app.register_blueprint(phieudichvu_bp, url_prefix='/api')
    app.register_blueprint(phieunhap_bp, url_prefix='/api')
    app.register_blueprint(phieumuahang_bp, url_prefix='/api')
    app.register_blueprint(phieubanhang_bp, url_prefix='/api')
    app.register_blueprint(nhaphang_bp, url_prefix='/api')
    app.register_blueprint(donhang_bp, url_prefix='/api')
    app.register_blueprint(baocao_bp, url_prefix='/api')
    app.register_blueprint(thamso_bp, url_prefix='/api')
    # app.register_blueprint(thongke_bp, url_prefix='/api')