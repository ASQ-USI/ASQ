FROM asqhub/base-image:devel

MAINTAINER Vincenzo FERME <info@vincenzoferme.it>

#Environment Variables
#ENV NODE_ENV production
#ENV HOST 195.176.181.25
#ENV PORT 3000

# LOAD ASQ
# Create folders
RUN mkdir /ASQ
WORKDIR /ASQ
RUN mkdir log
# Copy ASQ
COPY . /ASQ

# INSTALL ASQ
# Setup Dependencies
RUN apt-get update -q \
	&& apt-get install -y -q --no-install-recommends git python build-essential unzip \
	&& apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false \
	# Clean up APT when done.
    && apt-get clean autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/lib/{apt,dpkg,cache,log}/ /tmp/* /var/tmp/*
# Install ASQ
RUN npm install --unsafe-perm 
RUN npm run build
# Uninstall dev dependencies AND Dependencies not needed at runtime
RUN npm prune --production \
    && apt-get remove -y --purge python build-essential \
    # Clean up when done.
    && rm -rf /tmp/* /var/tmp/*

# CONFIGURE ASQ
#Configure ASQ
RUN mv /ASQ/config/config.docker.js /ASQ/config/config.production.js

# CONFIGURE NGINX
# Copy custom configuration file from the current directory
RUN cp /ASQ/lib/support/nginx/asq.conf /etc/nginx/sites-available/default.conf
RUN ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf

# CONFIGURE RUNIT
# Nginx
RUN mkdir /etc/service/nginx
RUN cp /ASQ/lib/support/docker/runit/nginx.sh /etc/service/nginx/run
RUN chmod +x /etc/service/nginx/run
# Asq
RUN mkdir /etc/service/asq
RUN cp /ASQ/lib/support/docker/runit/asq.sh /etc/service/asq/run
RUN chmod +x /etc/service/asq/run

#Configure Image
VOLUME ["/ASQ"]
EXPOSE 3000