# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# envsubst substitutes only $BACKEND_URL, leaving nginx variables ($uri, $host, etc.) intact
CMD ["/bin/sh", "-c", "envsubst '$BACKEND_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
