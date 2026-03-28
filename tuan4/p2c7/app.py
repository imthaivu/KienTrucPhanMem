import os

# Đọc biến môi trường có tên là 'APP_ENV'
# Nếu không tìm thấy biến này, nó sẽ trả về giá trị mặc định là 'Không xác định'
app_environment = os.environ.get('APP_ENV', 'Không xác định')

print("========================================")
print(f"🚀 Ứng dụng Python đang khởi động...")
print(f"🌍 Môi trường hiện tại: {app_environment}")
print("========================================")