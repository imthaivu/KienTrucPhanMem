# 1. Sử dụng image redis bản mới nhất theo yêu cầu
FROM redis:latest

# 2. Tạo một thư mục để chứa file cấu hình (đây là thư mục chuẩn thường dùng cho Redis)
WORKDIR /usr/local/etc/redis/

# 3. Copy file redis.conf từ máy tính của bạn vào container
COPY redis.conf .

# 4. Mở cổng 6379 (Cổng mặc định của Redis)
EXPOSE 6379

# 5. QUAN TRỌNG: Ghi đè lệnh khởi động mặc định. 
# Yêu cầu Redis server khởi chạy và đọc cấu hình từ file chúng ta vừa copy vào.
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]