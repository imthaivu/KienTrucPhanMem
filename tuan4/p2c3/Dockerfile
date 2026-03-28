# 1. Sử dụng node:18-alpine làm base image siêu nhẹ
FROM node:18-alpine

# 2. Thiết lập thư mục làm việc trong container
WORKDIR /app

# 3. Copy file chứa danh sách thư viện (package.json) vào trước
# Mẹo: Điều này giúp Docker cache lại bước cài đặt, nếu bạn chỉ sửa code giao diện mà không cài thêm thư viện mới thì Docker sẽ không phải chạy lại npm install.
COPY package*.json ./

# 4. Cài đặt các thư viện (node_modules)
RUN npm install

# 5. Copy toàn bộ mã nguồn dự án vào container
COPY . .

# 6. Mở cổng 3000 (cổng mặc định của React Create App) hoặc 5173 (nếu dùng Vite)
EXPOSE 3000

# 7. Lệnh khởi động React ở chế độ phát triển (Development)
# Nếu bạn dùng Vite ở Bước 1, hãy sửa lại thành CMD ["npm", "run", "dev"]
CMD ["npm", "start"]