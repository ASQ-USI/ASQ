#!/bin/sh
#Configure nginx
client_max_body_size="NGINX_CLIENT_MAX_BODY_SIZE"
client_max_body_size_val="${!client_max_body_size}"
		
if [ "$client_max_body_size_val" ]; then
	sed -ri 's/(client_max_body_size)\s+(\d+[M,m]?;)/\1 '$client_max_body_size_val';/' /etc/nginx/nginx.conf
fi

nginx 2>&1