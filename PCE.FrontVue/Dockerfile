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

# Production stage
FROM node:20-alpine
WORKDIR /app

# Instalar serve para servir la aplicación
RUN npm install -g serve

# Copiar archivos construidos del stage anterior
COPY --from=build /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "3000"]
