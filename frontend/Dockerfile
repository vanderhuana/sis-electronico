# Frontend Dockerfile para ElectroTech
FROM nginx:alpine

# Crear directorio de trabajo
WORKDIR /usr/share/nginx/html

# Remover contenido por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos del frontend
COPY . /usr/share/nginx/html/

# Crear configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]