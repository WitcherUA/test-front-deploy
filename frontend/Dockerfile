# Stage 1: збірка фронтенду
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: запуск через Nginx
FROM nginx:alpine

# Копіюємо свій nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копіюємо білд у Nginx
COPY --from=builder /app/build /usr/share/nginx/html
