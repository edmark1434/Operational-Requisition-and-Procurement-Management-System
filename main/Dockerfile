# Base image
FROM php:8.4-cli-alpine

WORKDIR /var/www/html

# Install dependencies
RUN apk add --no-cache \
    bash \
    git \
    zip \
    unzip \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    nodejs \
    npm \
    curl \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install frontend dependencies
# Install frontend dependencies
RUN npm install
RUN npm run build

RUN php artisan config:clear \
    && php artisan route:clear \
    && php artisan cache:clear \
    && php artisan view:clear
# Fix permissions
RUN chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8000

# Start Laravel server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]