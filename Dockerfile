# Sử dụng image node chính thức từ Docker Hub
FROM node:16

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép các file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở port mà ứng dụng Express sử dụng
EXPOSE 8080

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]
