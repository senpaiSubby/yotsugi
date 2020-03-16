FROM node:latest

# Update system
RUN apt update && apt install git -y
RUN npm install -g pm2 typescript gulp-cli
RUN curl https://rclone.org/install.sh | bash

# Create the directory
RUN mkdir -p /app
WORKDIR /app

# Copy and Install bot
COPY src /app/src

COPY package.json /app/
COPY tsconfig.json /app/
COPY tslint.json /app/

RUN ls -a

RUN npm install
RUN npm install --only=dev
RUN tsc

# Expose ports
EXPOSE 5700

# Expose volume
VOLUME /app/dist/config
VOLUME /app/logs

# Start
CMD ["pm2-runtime", "dist/index.js"]