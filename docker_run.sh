#!/bin/sh
echo "Cors Proxy"

    ## Check Certiface are exist
    FILE="/etc/ssl/certs/project.crt"
    if [ -f "$FILE" ];
    then
        echo "$FILE exists."
    else
        echo "$FILE does not exists."
        USE_Self_Certiface=1
    fi

    FILE="/etc/ssl/private/project.key"
    if [ -f "$FILE" ];
    then
        echo "$FILE exists."
    else
        echo "$FILE does not exists."
        USE_Self_Certiface=1
    fi

    ## Cert DIR /etc/nginx/project_cert_dir.conf

    if [ "$USE_Self_Certiface" == "1" ];
    then
        echo "Your website certifaces are not ready."
        echo "Using self certiface"
        ## Check Certiface are exist
        FILE="/etc/ssl/certs/nginx-selfsigned.crt"
        if [ -f "$FILE" ];
        then
            echo "$FILE exists."
        else
            echo "$FILE does not exists."
            Create_Self_Certiface=1
        fi

        FILE="/etc/ssl/private/nginx-selfsigned.key"
        if [ -f "$FILE" ];
        then
            echo "$FILE exists."
        else
            echo "$FILE does not exists."
            Create_Self_Certiface=1
        fi

        if [ "$Create_Self_Certiface" == "1" ];
        then
            openssl req \
            -x509 -nodes -days 365 \
            -newkey rsa:2048 \
            -keyout /etc/ssl/private/nginx-selfsigned.key \
            -out /etc/ssl/certs/nginx-selfsigned.crt \
            -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=lg.example.com"
        fi

        cat /etc/ssl/certs/nginx-selfsigned.crt > /etc/ssl/certs/cors_proxy.crt
        cat /etc/ssl/private/nginx-selfsigned.key > /etc/ssl/private/cors_proxy.key

    else
        cat /etc/ssl/certs/project.crt > /etc/ssl/certs/cors_proxy.crt
        cat /etc/ssl/private/project.key > /etc/ssl/private/cors_proxy.key
    fi

echo "Starting Cors Proxy"

node main.js
