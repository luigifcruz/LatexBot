FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Install app dependencies
COPY package.json /usr/src/bot/
RUN npm install

# Bundle app source
COPY . /usr/src/bot

EXPOSE 16000
CMD [ "npm", "start" ]
