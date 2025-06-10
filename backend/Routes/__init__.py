from .dichvu import dichvu_bp
from .lapphieudichvu import phieudichvu_bp
from .phieunhap import phieunhap_bp
from .nhaphang import nhaphang_bp
from .phieumuahang import phieumuahang_bp
from .phieubanhang import phieubanhang_bp
from .donhang import donhang_bp
from .baocao import baocao_bp
from .thongke import thongke_bp

def register_routes(app):
    app.register_blueprint(dichvu_bp, url_prefix='/api')
    app.register_blueprint(phieudichvu_bp, url_prefix='/api')
    app.register_blueprint(phieunhap_bp, url_prefix='/api')
    app.register_blueprint(phieumuahang_bp, url_prefix='/api')
    app.register_blueprint(phieubanhang_bp, url_prefix='/api')
    app.register_blueprint(nhaphang_bp, url_prefix='/api')
    app.register_blueprint(donhang_bp, url_prefix='/api')
    app.register_blueprint(baocao_bp, url_prefix='/api')
    app.register_blueprint(thongke_bp, url_prefix='/api')