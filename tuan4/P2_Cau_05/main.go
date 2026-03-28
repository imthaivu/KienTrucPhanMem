package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, Docker Go!\nỨng dụng này siêu nhẹ nhờ Multi-stage build.")
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Server Go đang chạy trên cổng 8080...")
    http.ListenAndServe(":8080", nil)
}