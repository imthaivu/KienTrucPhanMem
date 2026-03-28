# ==========================================
# GIAI ĐOẠN 1: BUILDER (Dùng image Go nặng để biên dịch)
# ==========================================
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copy các file code vào container
COPY go.mod ./
COPY main.go ./

# Biên dịch mã nguồn thành file thực thi có tên là "server-app"
RUN go build -o server-app main.go

# ==========================================
# GIAI ĐOẠN 2: RUNNER (Dùng image siêu nhẹ để chạy)
# ==========================================
# Alpine là một hệ điều hành Linux siêu nhỏ (chỉ khoảng 5MB)
FROM alpine:latest  

WORKDIR /app

# CHỈ copy file "server-app" đã biên dịch từ Giai đoạn 1 sang đây.
# Bỏ lại toàn bộ mã nguồn gốc và môi trường Go nặng nề ở phía sau.
COPY --from=builder /app/server-app .

# Mở cổng 8080
EXPOSE 8080

# Chạy file thực thi
CMD ["./server-app"]