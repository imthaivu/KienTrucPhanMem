# 1. Sử dụng image Python (bản slim cho nhẹ)
FROM python:3.9-slim

# 2. Thiết lập thư mục làm việc
WORKDIR /app

# 3. Khai báo biến môi trường APP_ENV với giá trị mặc định là 'development'
ENV APP_ENV=development

# 4. Copy mã nguồn vào container
COPY app.py .

# 5. Chạy file Python
CMD ["python", "app.py"]