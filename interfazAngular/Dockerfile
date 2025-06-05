# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# Instalar dependencias de construcción (incluyendo Angular CLI)
RUN npm install -g @angular/cli@16

# Copiar y instalar dependencias del proyecto
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el resto de archivos y construir
COPY . .
RUN ng build --configuration production

# Stage 2: Serve
FROM nginx:1.25-alpine

# Configurar Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Exponer puerto y healthcheck
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]