FROM node:14

WORKDIR /usr/src/auth

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD [ "node", "./bin/www" ]