# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación Vue
RUN npm run build

# Production stage: use nginx to serve static assets and proxy API
FROM nginx:alpine

# Remove default nginx config and add our own
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
