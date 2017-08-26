FROM node:boron

RUN mkdir -p /usr/src/app/latex
WORKDIR /usr/src/app

COPY package.json .

RUN apt-get update
RUN apt-get -y install texlive texlive-latex-extra imagemagick
RUN npm install

COPY . .

CMD [ "npm", "start" ]
