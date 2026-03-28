# 1. Sử dụng image PHP 8.2 có tích hợp sẵn Apache
FROM php:8.2-apache

# 2. Chuyển đến thư mục gốc của Apache (nơi chứa web)
WORKDIR /var/www/html

# 3. Khai báo cổng 80 (cổng mặc định của Apache)
EXPOSE 80

# Lưu ý: Chúng ta KHÔNG DÙNG lệnh COPY ở đây vì sẽ dùng Volume mount ở bước chạy.