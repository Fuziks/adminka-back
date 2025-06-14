# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm install --no-audit --force

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем только production-зависимости
COPY package*.json ./
RUN npm install --omit=dev --no-audit --force

# Копируем собранный проект из builder
COPY --from=builder /app/dist ./dist

# Копируем необходимые файлы (если нужны)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]