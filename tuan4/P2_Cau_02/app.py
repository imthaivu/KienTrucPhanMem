from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, Docker Flask!"

if __name__ == '__main__':
    # host='0.0.0.0' là bắt buộc trong Docker để máy tính bên ngoài có thể truy cập vào
    app.run(host='0.0.0.0', port=5000)