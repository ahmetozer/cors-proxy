FROM alpine as depencyInstall
RUN apk add nodejs npm
WORKDIR /srv
COPY . .
RUN npm install

FROM alpine as mainImage
COPY --from=depencyInstall /srv /srv
RUN apk add openssl nodejs ;\
chmod +x /srv/docker_run.sh
WORKDIR /srv
CMD [ "/srv/docker_run.sh" ]
