# Stage 1: PHP + Node build
FROM php:8.4-fpm-alpine AS build

WORKDIR /var/www/html

# Install PHP extensions + Node
RUN apk add --no-cache \
    bash git zip unzip postgresql-dev libzip-dev oniguruma-dev curl \
    nodejs npm

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies & build frontend
RUN npm install
RUN npm run build

# Stage 2: Production image with Nginx + PHP-FPM
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install PHP extensions + Nginx + Supervisor
RUN apk add --no-cache \
    postgresql-dev libzip-dev oniguruma-dev \
    nginx supervisor \
    bash git curl nodejs npm

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Copy built PHP app from build stage
COPY --from=build /var/www/html /var/www/html

# Copy Nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy Supervisor config
COPY ./supervisor/supervisord.conf /etc/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

# Start Supervisor (runs PHP-FPM + Nginx)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
