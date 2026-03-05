# Base image
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install dependencies + Nginx + Node.js
RUN apk add --no-cache \
    bash \
    git \
    zip \
    unzip \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    curl \
    nodejs \
    npm \
    nginx \
    openssl \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Copy Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install JS dependencies and build assets
RUN npm install
RUN npm run build

# Set folder permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Generate self-signed SSL for HTTPS
RUN mkdir -p /etc/ssl/private \
    && openssl req -x509 -nodes -days 365 \
       -subj "/C=PH/ST=Cebu/L=Cebu City/O=Local/CN=localhost" \
       -newkey rsa:2048 \
       -keyout /etc/ssl/private/server.key \
       -out /etc/ssl/certs/server.crt

# Copy your Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose HTTPS port
EXPOSE 443

# Start PHP-FPM and Nginx
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
