#!/bin/bash
# SETUP ASQ DEPENDENCIES
set -ex

# Configure ENV variables
export NPM_CONFIG_LOGLEVEL=info
export NODE_VERSION=6.9.1
export NGINX_VERSION=1.9.7-1~trusty
export PDF2HTMLEX_VERSION=v0.14.6
export NGINX_CONFIG_VERSION=0.1.0
export NGINX_ASQ_CONFIG_VERSION=0.1.0
export NGINX_ASQ_SSL_CONFIG_VERSION=0.1.0
export RUNIT_NGINX_SERVICE_VERSION=0.1.0
export RUNIT_ASQ_SERVICE_VERSION=0.1.0
#TODO pin versions of ASQ dependencies
#TODO document the relevance of version pinning (also for configs) for cache invalidation

############### NODE ###############
# TODO: restore the sha256sum validation
# Node 6.9.1 (https://github.com/nodejs/docker-node/blob/master/6.9/Dockerfile)
# gpg keys listed at https://github.com/nodejs/node

curl --create-dirs -o "/tmp/node-v$NODE_VERSION-linux-x64.tar.gz" -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz"
tar -xzf "/tmp/node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1
rm "/tmp/node-v$NODE_VERSION-linux-x64.tar.gz"
ln -s /usr/local/bin/node /usr/local/bin/nodejs

############### NGINX ###############
# Nginx 1.9.7-1 (Adapted for ubuntu 14.04 used in the FROM baseimage, 
# original: https://github.com/nginxinc/docker-nginx/blob/08eeb0e3f0a5ee40cbc2bc01f0004c2aa5b78c15/Dockerfile)
apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
echo "deb http://nginx.org/packages/mainline/ubuntu/ trusty nginx" >> /etc/apt/sources.list

apt-get update -q
apt-get install -y ca-certificates nginx=${NGINX_VERSION}
# We only use sites-available and sites-enabled
rm -Rf /etc/nginx/conf.d/*

# Forward request and error logs to docker log collector
ln -sf /dev/stdout /var/log/nginx/access.log
ln -sf /dev/stderr /var/log/nginx/error.log

# Configure Nginx
cp conf/nginx/nginx-$NGINX_CONFIG_VERSION.conf /etc/nginx/nginx.conf
# To run in a Docker container
echo "daemon off;" >> /etc/nginx/nginx.conf

# Get Nginx ready to accept sites configurations
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/nginx/ssl/

############### ASQ DEPENDENCIES ###############
# Setup System Dependencies
apt-get install -y -q --no-install-recommends python git \
build-essential software-properties-common cmake make default-jre unzip

# Adds pdf2htmlEX
add-apt-repository "deb http://archive.ubuntu.com/ubuntu/ trusty multiverse"
add-apt-repository "deb http://archive.ubuntu.com/ubuntu/ trusty-updates multiverse"
apt-get update -qq
add-apt-repository ppa:fontforge/fontforge --yes
add-apt-repository ppa:delayargentina/delayx --yes
apt-get update -qq
apt-get install -y --allow-downgrades --allow-remove-essential --allow-change-held-packages -q --no-install-recommends libpoppler-dev \
libpoppler-private-dev libspiro-dev libcairo-dev libpango1.0-dev libfreetype6-dev \
libltdl-dev libfontforge-dev python-imaging python-pip
[ -d "pdf2htmlEX/" ] && rm -Rf "pdf2htmlEX/"
mkdir "pdf2htmlEX"
curl -SL "https://github.com/coolwanglu/pdf2htmlEX/archive/$PDF2HTMLEX_VERSION.tar.gz" | tar xvz --strip-components=1 -C pdf2htmlEX
current_folder=$(pwd)
cd pdf2htmlEX
cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DENABLE_SVG=ON .
make
make install
cd $current_folder
rm -Rf pdf2htmlEX

############### ASQ EXPECTED FOLDERS AND CONFIGURATIONS ###############
# Creates log folder
mkdir -p $ASQDIR/log/
# Creates the expected log file
touch $ASQDIR/log/app.log
# CONFIGURE NGINX, RUNIT
# CONFIGURE NGINX
# Copy custom configuration file from the current directory
cp conf/nginx/asq-$NGINX_ASQ_CONFIG_VERSION.conf /etc/nginx/sites-available/default.conf
ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf
# CONFIGURE RUNIT
# Nginx
mkdir /etc/service/nginx
cp runit/nginx-$RUNIT_NGINX_SERVICE_VERSION.sh /etc/service/nginx/run
chmod +x /etc/service/nginx/run
# Asq
mkdir /etc/service/asq
cp runit/asq-$RUNIT_ASQ_SERVICE_VERSION.sh /etc/service/asq/run
chmod +x /etc/service/asq/run

############### CLEANUP ASQ ENVIRONMENT SETUP ###############
# TODO: evaluate if we can remove other build time dependencies
# NOTE: default-jre is installed, because needed by pdf2htmlEX during the compilation process
apt-get remove -y --purge default-jre
apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false
apt-get clean autoclean
apt-get autoremove -y
# NOTE: do not delete system folders, to avoid messing up apt for next steps
#	      /var/lib/apt/lists/* /var/lib/{apt,dpkg,cache,log}/ 
rm -rf /tmp/* /var/tmp/*