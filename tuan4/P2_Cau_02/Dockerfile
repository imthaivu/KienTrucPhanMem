# 1. Sử dụng python:3.9 làm base image theo yêu cầu đề bài
FROM python:3.9

# 2. Thiết lập thư mục làm việc mặc định trong container
WORKDIR /app

# 3. Copy file danh sách thư viện vào trước
COPY requirements.txt .

# 4. Chạy lệnh pip để cài đặt Flask (và các thư viện khác nếu có)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy toàn bộ mã nguồn (gồm file app.py) vào thư mục /app
COPY . .

# 6. Báo cho Docker biết ứng dụng chạy trên cổng 5000
EXPOSE 5000

# 7. Lệnh mặc định để khởi động ứng dụng
CMD ["python", "app.py"]