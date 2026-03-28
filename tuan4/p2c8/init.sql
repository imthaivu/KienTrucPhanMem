-- Tạo một bảng đơn giản
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- Thêm một vài dữ liệu mẫu
INSERT INTO users (username, email) VALUES 
('nguyenvana', 'vana@example.com'),
('tranvib', 'tranb@example.com'),
('docker_master', 'master@docker.com');