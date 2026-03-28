# 1. Sử dụng nginx:latest làm base image
FROM nginx:latest

# 2. Copy file index.html từ máy tính vào thư mục chứa web mặc định của Nginx trong container
COPY index.html /usr/share/nginx/html/index.html

# 3. Khai báo cổng 80 (cổng mặc định mà Nginx lắng nghe)
EXPOSE 80