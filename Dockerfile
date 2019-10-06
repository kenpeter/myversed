# node version
FROM node:stretch

# up
RUN apt-get update
# office
RUN apt-get install libreoffice -y
RUN apt-get install vim -y
RUN npm install -g nodemon

# vimrc
WORKDIR /root
COPY .vimrc .

# workdir, user/src/app
WORKDIR /usr/src/app

# copy package json + lock
COPY package.json .
COPY package-lock.json .

# npm install
RUN npm install

# copy everything here
COPY . .

# 3000
EXPOSE 3000

# run node index.js
CMD [ "nodemon", "index.js" ]
