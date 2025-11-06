# Используем официальный образ Node.js на базе Alpine Linux (легковесный)
FROM node:18-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем все файлы приложения
COPY . .

# Открываем порт 3000
EXPOSE 3000

# Команда запуска приложения
CMD ["node", "app.js"]
