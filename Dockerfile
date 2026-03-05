# Stage 1: Build assets
FROM node:20-alpine AS node-build

WORKDIR /app

# Copy frontend assets
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY resources/js ./resources/js

# Install Node dependencies
RUN npm install

# Build frontend (React + Tailwind)
RUN npm run build

# Stage 2: PHP Laravel
FROM php:8.4-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install PHP extensions required for Laravel
RUN apk add --no-cache \
    bash \
    git \
    zip \
    unzip \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    curl \
    npm \
    nodejs \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Copy Laravel project
COPY . .

# Copy built frontend assets from stage 1
COPY --from=node-build /app/public/js ./public/js
COPY --from=node-build /app/public/css ./public/css

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 9000 (php-fpm)
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
