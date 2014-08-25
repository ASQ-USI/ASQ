# Installation

## Important Notes
ASQ has been tested in Ubuntu and OS X systems. Probably it will work on more systems, but they are not supported as of yet.
ASQ uses some features (mainly generators) of the upcoming harmony verion of ECMAScript. For this reason it needs an odd numbered version of node `0.11.x` which is considered unstable.

## Overview
An ASQ installation consists of setting up the following components:

1. Packages / Dependencies
1. Node.js
1. ASQ
1. Nginx (optional)


## Packages / Dependencies
### Ubuntu
    # Add public key and list file for MongoDB
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
    sudo apt-get update -y
    sudo apt-get upgrade -y
    sudo apt-get install -y redis-server mongodb-org
### Mac OS X
First make sure you have brew installed on your system. Brew needs the XCode command lines tools, to install them have a look at __step 1__ of this [guide](http://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/). Then install brew

    ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
Then install dependencies

    brew update
    brew install mongodb redis-server
 

## Node.js
### Ubuntu
First install nvm to manage Node.js versions

    curl https://raw.githubusercontent.com/creationix/nvm/v0.13.1/install.sh | bash
then install Node.js

    nvm install 0.11.13
    nvm use 0.11.13
If you wish this version to be your default one, you can type:

    nvm alias default 0.11.13
and to use it

    nvm use default

### Mac OS X
Download and install version [0.11.13](http://nodejs.org/dist/v0.11.13/node-v0.11.13.pkg) from  the node.js website

##ASQ
First, clone the repository

    git clone https://github.com/ASQ-USI/ASQ.git ASQ
then configure it

    cd ASQ
    # Install dependencies
    npm install
    # Copy the default example configuration
    cp config/config.defaults.js.example config/config.defaults.js
    # Set the `host` variable to your host's fully-qualified domain name
    #
    # If you want to use https make sure that you set `enableHTTPS` to `true`.
    #
    # If you are using a reverse proxy (like nginx) make sure `usingReverseProxy` is set to `true` and configure the 'reverseProxyOptions' object.
    editor config/config.defaults.js
At this point you can start ASQ

    # start using npm
    npm start
    # start using node
    node --harmony app.j
    # start at specific port which will override the configuration
    PORT=<port-number> node --harmony app.js

##Nginx
### Ubuntu
First install nginx

    sudo apt-get install -y nginx

Copy the example site config (if you want to use https copy the `asq-ssl` configuration file instead of `asq`):

    sudo cp lib/support/nginx/asq /etc/nginx/sites-available/asq
    sudo ln -s /etc/nginx/sites-available/asq /etc/nginx/sites-enabled/asq

Make sure to edit the config file to match your setup:

    # Change YOUR_SERVER_FQDN to the fully-qualified
    # domain name of your host serving GitLab.
       #
    # Update the upstream `asq_node_upstream` with the addresses of your
    # node instances
    sudo editor /etc/nginx/sites-available/asq
To validate your `asq` or `asq-ssl` Nginx config file issue:

    sudo nginx -t
    
You should receive `syntax is okay` and `test is successful` messages. If you receive errors check your `asq` or `asq-ssl` Nginx config file for typos, etc. as indicated in the error message given.

Finally, restart nginx

    sudo service nginx restart
__Notice__: Don't forget to start your ASQ server!

### Mac OS X
First install nginx

    brew install nginx

Append the contents of `lib/support/nginx/asq` (`lib/support/nginx/asq-ssl` if you want to enable https) in `nginx.conf` under the `http` directive .Make sure to edit the file to match your setup:

    # Copy configuration and change YOUR_SERVER_FQDN to the fully-qualified
    # domain name of your host serving GitLab.
    #
    # Update the upstream `asq_node_upstream` with the addresses of your
    # node instances
    sudo editor /usr/local/etc/nginx/nginx.conf

If you are using the `sites_available` and `sites_enabled` paradigm of Ubuntu, follow the Ubuntu configuration instructions above.

To validate your `asq` or `asq-ssl` Nginx config file issue:

    sudo nginx -t
    
You should receive `syntax is okay` and `test is successful` messages. If you receive errors check your `asq` or `asq-ssl` Nginx config file for typos, etc. as indicated in the error message given.

Finally, restart nginx

    sudo nginx -s reload
__Notice__: Don't forget to start your ASQ server!



