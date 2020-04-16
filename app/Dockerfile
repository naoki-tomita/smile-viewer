FROM node

RUN dpkg --add-architecture i386 && \
  apt-get update && \
  apt-get install -y wine && \
  apt-get install -y wine32

RUN npm i -g electron-packager

WORKDIR /src
ADD . /src

RUN yarn

CMD [ "yarn", "release:build" ]
