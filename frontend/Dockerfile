# Etapa 1: Build do Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN [ -f dist/frontend/browser/index.html ] || cp dist/frontend/browser/index.csr.html dist/frontend/browser/index.html

# Etapa 2: Servir com Nginx
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80