FROM nginx:1.23

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

COPY . .

EXPOSE 80/tcp

CMD [ "nginx", "-g", "daemon off;" ]