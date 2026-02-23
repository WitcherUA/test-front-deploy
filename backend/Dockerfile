# Використовуємо Node.js
FROM node:18-alpine

# Робоча директорія
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install --production

# Копіюємо весь код бекенду
COPY . .

# Відкриваємо порт 5000
EXPOSE 5000

# Запускаємо бекенд
CMD ["npm", "start"]
