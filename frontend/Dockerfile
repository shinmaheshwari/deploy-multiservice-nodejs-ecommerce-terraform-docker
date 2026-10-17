# ---- build stage ----
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Relative base URLs: the browser calls /svc/<name>/..., nginx proxies to the right container.
# This keeps the image independent of the EC2 public IP (no rebuild needed per environment).
ENV REACT_APP_USER_SERVICE_URL=/svc/user \
    REACT_APP_PRODUCT_SERVICE_URL=/svc/product \
    REACT_APP_CART_SERVICE_URL=/svc/cart \
    REACT_APP_ORDER_SERVICE_URL=/svc/order
# CRA's eslint 'react-app/jest' config breaks the build on current npm; linting isn't needed for the image
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
