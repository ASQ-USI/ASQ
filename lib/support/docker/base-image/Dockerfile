FROM phusion/baseimage:0.9.17

MAINTAINER Vincenzo FERME <info@vincenzoferme.it>

CMD ["/sbin/my_init"]

# SETUP ASQ DEPENDENCIES

# Node 5.1.0 (https://github.com/nodejs/docker-node/blob/3622304ad09a84826521e81cb7ddf253c020d89e/5.1/Dockerfile)

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 5.1.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc

# Nginx 1.9.7-1 (Adapted for ubuntu 14.04 used in the FROM baseimage, original: https://github.com/nginxinc/docker-nginx/blob/08eeb0e3f0a5ee40cbc2bc01f0004c2aa5b78c15/Dockerfile)

RUN apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
RUN echo "deb http://nginx.org/packages/mainline/ubuntu/ trusty nginx" >> /etc/apt/sources.list

ENV NGINX_VERSION 1.9.7-1~trusty

RUN apt-get update \
    && apt-get install -y ca-certificates nginx=${NGINX_VERSION} \
    # Clean up APT when done.
    && apt-get clean autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/lib/{apt,dpkg,cache,log}/ /tmp/* /var/tmp/*

# Forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

# Configure Nginx
ADD nginx.conf /etc/nginx/nginx.conf
# Tweak nginx to match the workers to cpu's
RUN procs=$(cat /proc/cpuinfo | grep processor | wc -l) && sed -i -e "s/worker_processes 1;/worker_processes $procs;/" /etc/nginx/nginx.conf
# Performance configurations
#RUN sed -i -e"s/keepalive_timeout\s*65/keepalive_timeout 2/" /etc/nginx/nginx.conf
RUN sed -i -e"s/keepalive_timeout 65/keepalive_timeout 65;\n        client_max_body_size 100m/" /etc/nginx/nginx.conf
# To run in a Docker container
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Get Nginx ready to accept sites configurations
RUN rm -Rf /etc/nginx/conf.d/*
RUN mkdir -p /etc/nginx/sites-available
RUN mkdir -p /etc/nginx/sites-enabled
RUN mkdir -p /etc/nginx/ssl/

VOLUME ["/var/cache/nginx"]

EXPOSE 80 443