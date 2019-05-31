FROM node

RUN dpkg --add-architecture i386 && \
  apt update && \
  apt install -y wine && \
  apt install -y wine32 && \
  npm i -g electron-packager

WORKDIR /src
ADD . /src

RUN npm i

CMD [ "npm", "run", "release:build" ]
