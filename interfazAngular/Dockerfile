# Etapa de construcción - Node.js 20.x (LTS actual)
FROM node:20-alpine3.19 as build

WORKDIR /usr/src/app

# Instala las dependencias de construcción (necesarias para algunos paquetes nativos)
RUN apk add --no-cache python3 make g++

# Copia los archivos de dependencias primero para mejor caching
COPY package.json package-lock.json ./

# Instalación limpia de dependencias
RUN npm ci --omit=dev --silent && \
    npm cache clean --force

# Instala Angular CLI globalmente (versión compatible con Node 20)
RUN npm install -g @angular/cli@latest

# Copia el resto de los archivos
COPY . .

# Build de producción optimizado
RUN ng build --configuration production --output-hashing=all

# ---

# Etapa de producción - Nginx 1.25 (estable más reciente)
FROM nginx:1.25-alpine3.19

# Configuración optimizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia solo los archivos construidos
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Configuración de seguridad
RUN rm -rf /etc/nginx/conf.d/default.conf.bak && \
    chown -R nginx:nginx /usr/share/nginx/html

# Salud del contenedor
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:5009 || exit 1

EXPOSE 5009

CMD ["nginx", "-g", "daemon off;"]