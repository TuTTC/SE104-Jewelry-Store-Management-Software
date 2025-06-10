from .dichvu import dichvu_bp
from .lapphieudichvu import phieudichvu_bp
from .phieunhap import phieunhap_bp
from .nhaphang import nhaphang_bp

def register_routes(app):
    app.register_blueprint(dichvu_bp, url_prefix='/api')
    app.register_blueprint(phieudichvu_bp, url_prefix='/api')
    app.register_blueprint(phieunhap_bp, url_prefix='/api')
    app.register_blueprint(nhaphang_bp, url_prefix='/api')