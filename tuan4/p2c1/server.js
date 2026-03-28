// Khởi tạo một web server đơn giản bằng module 'http' có sẵn của Node.js
const http = require('http');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, Docker!\n');
});

// Yêu cầu server lắng nghe ở cổng 3000
server.listen(3000, () => {
    console.log('Server đang chay tren cong 3000...');
});