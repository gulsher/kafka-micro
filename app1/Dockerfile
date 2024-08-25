FROM node:16.9.0-alpine
WORKDIR /app
COPY package.json .
RUN npm i
RUN npm i -g nodemon
COPY . .
CMD ["nodemon", "index.js"]