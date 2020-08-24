FROM alpine as depencyInstall
RUN apk add nodejs npm
WORKDIR /srv
COPY . .
RUN npm install

FROM alpine as mainImage
RUN apk add openssl nodejs
COPY --from=depencyInstall /srv /srv
WORKDIR /srv
CMD [ "/srv/docker_run.sh" ]
