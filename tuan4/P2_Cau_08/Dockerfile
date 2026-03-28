# 1. Sử dụng image PostgreSQL phiên bản 15 theo yêu cầu
FROM postgres:15

# 2. Thiết lập các biến môi trường BẮT BUỘC của PostgreSQL
# (Lưu ý: Trong thực tế, mật khẩu nên được bảo mật và truyền từ bên ngoài vào, 
# nhưng để thực hành nhanh, chúng ta có thể set cứng ở đây).
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=supersecret
ENV POSTGRES_DB=mydatabase

# 3. Copy file init.sql vào "thư mục phép thuật" của PostgreSQL
# Mọi script trong thư mục này sẽ tự động chạy khi container tạo mới lần đầu
COPY init.sql /docker-entrypoint-initdb.d/