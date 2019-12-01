FROM node:latest

# Update system
RUN apt update && apt install git yarn -y
RUN npm install -g pm2

# Create the directory
RUN mkdir -p /app
WORKDIR /app

# Copy and Install bot
COPY . /app
RUN npm install

# Expose ports
EXPOSE 5700

# Expose volume
VOLUME /app/data

# Start
CMD ["pm2-runtime", "index.js"]