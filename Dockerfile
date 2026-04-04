FROM node:lts-buster

# Sakinisha dependencies za system
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    imagemagick \
    webp \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Weka working directory
WORKDIR /app

# Copy package files kwanza (ili cache iwe bora)
COPY package*.json ./

# Sakinisha npm packages
RUN npm install --production

# Copy code yote
COPY . .

# Expose port (hata kama si web service, Render inahitaji wakati mwingine)
EXPOSE 10000

# Anza bot
CMD ["node", "index.js"] "index.js"]
