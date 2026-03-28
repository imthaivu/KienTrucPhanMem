# ==========================================
# STAGE 1: BUILDER (Dùng node:18 gốc, đầy đủ công cụ)
# ==========================================
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt TẤT CẢ thư viện (bao gồm cả devDependencies)
COPY package*.json ./
RUN npm install --no-package-lock

# Copy toàn bộ mã nguồn vào container
COPY . .

# Chạy lệnh build code (Ví dụ: Biên dịch TypeScript sang JavaScript vào thư mục /dist)
RUN npm run build


# ==========================================
# STAGE 2: RUNNER (Dùng node:18-alpine siêu nhẹ để chạy)
# ==========================================
FROM node:18-alpine

WORKDIR /app

# Copy lại file package.json từ máy vào (hoặc từ builder)
COPY package*.json ./

# Bước tối ưu hóa: CHỈ cài đặt các thư viện production, bỏ qua các thư viện dùng để dev/test
RUN npm install --only=production

# CHỈ copy thư mục code đã được build xong từ Stage 1 sang Stage 2
COPY --from=builder /app/dist ./dist

# Mở cổng cho ứng dụng (giả sử là 3000)
EXPOSE 3000

# Lệnh chạy ứng dụng từ thư mục đã build
CMD ["node", "dist/index.js"]