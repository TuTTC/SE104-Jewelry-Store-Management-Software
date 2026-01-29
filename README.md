<!-- Banner -->
<p align='center'>
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
     <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

<h1 align="center"><b>NHẬP MÔN CÔNG NGHỆ PHẦN MỀM - SE104</b></h1>

## Giới thiệu môn học

| Thông tin       | Chi tiết                    |
| --------------- | --------------------------- |
| **Tên môn học** | Nhập môn công nghệ phần mềm |
| **Mã môn học**  | SE104                       |
| **Mã lớp**      | SE104.P23                   |
| **Giảng viên**  | TS. Nguyễn Thị Xuân Hương   |

## Thành viên nhóm

|  STT  |   MSSV   | Họ và Tên       |   Chức vụ   | GitHub                                                     | Email                  |
| :---: | :------: | --------------- | :---------: | ---------------------------------------------------------- | ---------------------- |
|   1   | 23521704 | Trần Thị Cẩm Tú | Nhóm trưởng | [@TuTTC](https://github.com/TuTTC)                         | 23521704@gm.uit.edu.vn |
|   2   | 23521821 | Mai Lê Bá Vương | Thành viên  | [@bavuong2005](https://github.com/bavuong2005)             | 23521821@gm.uit.edu.vn |
|   3   | 23521193 | Đinh Hoàng Phúc | Thành viên  | [@DinhHoangPhuc3010](https://github.com/DinhHoangPhuc3010) | 23521193@gm.uit.edu.vn |

---

<h2 align="center">Jewelry Store Management Software</h2>

### Giới thiệu

Phần mềm quản lý cửa hàng trang sức được phát triển nhằm hỗ trợ các cửa hàng kinh doanh vàng bạc, trang sức trong việc quản lý:
- Sản phẩm và danh mục
- Khách hàng và nhà cung cấp
- Đơn hàng và phiếu nhập
- Dịch vụ (sửa chữa, gia công)
- Báo cáo thống kê
- Tài khoản và phân quyền

---

## Công nghệ sử dụng

| Thành phần    | Công nghệ      |
| ------------- | -------------- |
| **Frontend**  | React.js       |
| **Backend**   | Flask (Python) |
| **Database**  | MySQL          |
| **Container** | Docker         |

---

## Cấu trúc dự án

```
SE104-Jewelry-Store-Management-Software/
├── backend/                    # Backend Flask API
│   ├── routes/                 # API routes (controllers)
│   ├── models/                 # Database models
│   ├── utils/                  # Helper functions
│   ├── seeds/                  # Seed data scripts
│   ├── migrations/             # Database migrations
│   ├── database/               # Database configuration
│   ├── main.py                 # Application entry point
│   ├── run.py                  # Flask runner
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Docker build instructions
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── layouts/            # Layout components
│   │   ├── services/           # API service calls
│   │   ├── context/            # React context
│   │   ├── hooks/              # Custom hooks
│   │   ├── routes/             # Route configuration
│   │   └── App.js              # Main app component
│   ├── public/                 # Static assets
│   └── Dockerfile              # Docker build instructions
├── database/                   # Database initialization scripts
│   └── init.sql
├── docker-compose.yml          # Docker Compose configuration
└── README.md
```

---

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Git

### 1. Clone repository

```bash
git clone https://github.com/TuTTC/SE104-Jewelry-Store-Management-Software.git
cd SE104-Jewelry-Store-Management-Software
```

### 2. Cài đặt Backend

```bash
cd backend

# Tạo môi trường ảo
python -m venv .venv

# Kích hoạt môi trường ảo
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### 3. Cấu hình Database

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jewelry_store
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET_KEY=your_secret_key

# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
```

### 4. Khởi chạy Backend

```bash
# Windows PowerShell
$env:FLASK_APP = "run.py"

# Chạy migrations (nếu cần)
flask db upgrade

# Khởi động server
flask run
```

Backend sẽ chạy tại: `http://localhost:5000`

### 5. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

## Chạy với Docker

### Yêu cầu
- Docker Desktop đã được cài đặt
- Docker Compose

### Khởi động

```bash
# Build và khởi động tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Dừng và xóa volumes (reset database)
docker-compose down -v
```

### Thông tin kết nối

| Service      | URL / Connection      |
| ------------ | --------------------- |
| **Frontend** | http://localhost:3000 |
| **Backend**  | http://localhost:5000 |
| **MySQL**    | localhost:3306        |
| **DB User**  | jewelry_user          |
| **DB Pass**  | jewelry_pass          |
| **DB Name**  | jewelry_store         |

---

## License

This project is licensed under the MIT License.

---

<!-- <p align="center">
  <i>Made with love by SE104.P23 Team</i>
</p> -->
