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
ARG VITE_HYGRAPH_KEY
ARG HYGRAPH_URL
ARG PORT

# Set them as environment variables for build and runtime
ENV VITE_HYGRAPH_KEY=$VITE_HYGRAPH_KEY
ENV HYGRAPH_URL=$HYGRAPH_URL
ENV PORT=$PORT

RUN npm run build

CMD ["npm", "run", "start"]