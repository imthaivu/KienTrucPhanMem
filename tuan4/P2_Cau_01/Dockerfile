# 1. Sử dụng node:18 làm base image (như yêu cầu của đề bài)
FROM node:18

# 2. Tạo một thư mục làm việc mặc định bên trong container
WORKDIR /app

# 3. Copy file server.js từ máy tính của bạn vào thư mục /app trong container
COPY server.js .

# 4. Báo cho Docker biết container này sẽ giao tiếp qua cổng 3000
EXPOSE 3000

# 5. Lệnh mặc định sẽ được thực thi khi container bắt đầu chạy
CMD ["node", "server.js"]