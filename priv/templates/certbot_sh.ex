#!/bin/sh
echo <%= server.key %> | sudo apt-get install -y software-properties-common 
 sudo add-apt-repository -y ppa:certbot/certbot 
 sudo apt-get update 
 sudo apt-get install -y certbot
 sudo cp letsencrypt.ini /etc/letsencrypt/

 sudo certbot certonly --dry-run --config /etc/letsencrypt/letsencrypt.ini

 sudo apt install -y nginx