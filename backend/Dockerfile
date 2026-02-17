# Використовуємо Node.js для бекенду
FROM node:18-alpine

WORKDIR /app

# Копіюємо залежності
COPY package*.json ./
RUN npm install --production

# Копіюємо код
COPY . .

# Запускаємо сервер
CMD ["node", "server.js"]
