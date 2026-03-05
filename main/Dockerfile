# Stage 1: PHP + Composer
FROM php:8.4-fpm-alpine AS php-build

WORKDIR /var/www/html

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
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Stage 2: Build frontend (Vite)
FROM node:20-alpine AS node-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 3: Nginx + PHP-FPM
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install Nginx
RUN apk add --no-cache nginx supervisor

# PHP extensions
RUN apk add --no-cache postgresql-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Copy PHP & app code
COPY --from=php-build /var/www/html /var/www/html
# Copy Vite build
COPY --from=node-build /app/public/build /var/www/html/public/build

# Nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Supervisor config
COPY ./supervisor/supervisord.conf /etc/supervisord.conf

# Storage permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
