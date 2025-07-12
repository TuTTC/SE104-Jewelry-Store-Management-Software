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
from .supplier import supplier_bp
from .permissions import permission_bp
from .inventory import tonkho_bp
from .thamso import thamso_bp
from .upload_img import upload_bp
from .reports import reports_bp
from .returns import return_bp
from .sanpham import sanpham_bp
# from .thongke import thongke_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix = "/api/auth")
    app.register_blueprint(category_bp, url_prefix = "/api/categories")
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
    app.register_blueprint(supplier_bp, url_prefix='/api/suppliers')
    app.register_blueprint(permission_bp, url_prefix='/api/permissions')
    app.register_blueprint(tonkho_bp, url_prefix='/api/inventory')
    app.register_blueprint(thamso_bp, url_prefix='/api/parameter')
    app.register_blueprint(upload_bp)
    app.register_blueprint(reports_bp,url_prefix='/api/reports' )
    app.register_blueprint(return_bp, url_prefix='/api')
    app.register_blueprint(sanpham_bp, url_prefix='/api')
    # app.register_blueprint(thongke_bp, url_prefix='/api')