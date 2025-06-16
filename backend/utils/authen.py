# import random
# import smtplib
# from email.mime.text import MIMEText

# def generate_otp():
#     return str(random.randint(100000, 999999))

# def send_otp_email(to_email, otp):
#     try:
#         msg = MIMEText(f'Mã OTP của bạn là: {otp}')
#         msg['Subject'] = 'Xác thực OTP'
#         msg['From'] = 'your_email@gmail.com'
#         msg['To'] = to_email

#         server = smtplib.SMTP('smtp.gmail.com', 587)
#         server.starttls()
#         server.login('your_email@gmail.com', 'your_app_password')
#         server.send_message(msg)
#         server.quit()

#         return True
#     except Exception as e:
#         print(f"Lỗi gửi email: {e}")
#         return False



from flask_mail import Message
from extensions import mail  # ✅ KHÔNG vòng lặp vì mail nằm trong extensions riêng
import random

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    try:
        msg = Message("Xác minh đăng ký tài khoản", recipients=[email])
        msg.body = f"Mã OTP của bạn là: {otp}\nMã này sẽ hết hạn sau 5 phút."
        mail.send(msg)
        return True
    except Exception as e:
        print("Lỗi gửi OTP:", e)
        return False
