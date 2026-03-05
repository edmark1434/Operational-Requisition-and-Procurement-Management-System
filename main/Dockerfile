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

# Install PHP dependencies FIRST
RUN composer install --no-dev --optimize-autoloader


# Stage 2: Build frontend
FROM node:20-alpine AS node-build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Stage 3: Final image
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

COPY --from=php-build /var/www/html /var/www/html
COPY --from=node-build /app/public/build /var/www/html/public/build

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
