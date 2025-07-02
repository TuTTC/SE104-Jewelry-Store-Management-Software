import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload_bp', __name__)

# Thư mục lưu trữ ảnh
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Các định dạng cho phép
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Hàm kiểm tra định dạng file
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route upload ảnh
@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return jsonify({"error": "Không tìm thấy file"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Chưa chọn file"}), 400

    if file and allowed_file(file.filename):
        # Tạo tên file mới tránh trùng lặp
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"

        file.save(os.path.join(UPLOAD_FOLDER, filename))

        image_url = f"http://localhost:5000/uploads/{filename}"
        return jsonify({"url": image_url})

    return jsonify({"error": "Chỉ cho phép file .jpg, .jpeg, .png"}), 400


# Route phục vụ ảnh tĩnh
@upload_bp.route('/uploads/<filename>')
def get_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
