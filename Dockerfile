FROM node:22-slim

# Install Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept build arguments for env variables
ARG DIRECTUS_URL
ARG DIRECTUS_STATIC_TOKEN
ARG PORT
ARG CORS_ORIGIN

# Set them as environment variables for build and runtime
ENV DIRECTUS_URL=$DIRECTUS_URL
ENV DIRECTUS_STATIC_TOKEN=$DIRECTUS_STATIC_TOKEN
ENV PORT=$PORT
ENV CORS_ORIGIN=$CORS_ORIGIN

RUN npm run build

CMD ["npm", "run", "start"]