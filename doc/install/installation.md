# Installation

## Important Notes
ASQ has been tested in Ubuntu and OS X systems. Probably it will work on more systems, but they are not supported as of yet.

## Overview
An ASQ installation consists of setting up the following components:

1. Packages / Dependencies
1. Node.js
1. ASQ
1. Nginx (optional)


## Packages / Dependencies
### Ubuntu

```bash
# Add public key and list file for MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y build-essential git redis-server mongodb-org unzip
```

### Mac OS X
First make sure you have [homebrew](http://brew.sh/) installed on your system. Homebrew needs the XCode command line tools, to install them have a look at __step 1__ of this [guide](http://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/). Then install homebrew

```bash
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```

Now let's install the dependencies

```bash
brew update
brew install mongodb redis
```

## Node.js
### Ubuntu
First install [nvm](https://github.com/creationix/nvm) to install manage Node.js versions

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
```

Reload your shell and then install Node.js

```bash
nvm install 4.0
nvm use 4.0
```

If you wish this version to be your default one, you can type:

```bash
nvm alias default 4.0
```

and to use it

```bash
nvm use default
```

### Mac OS X
Download and install version [4.2.4](https://nodejs.org/dist/v4.2.4/node-v4.2.4.pkg) from  the node.js website.

Alternatively, you can install [nvm](https://github.com/creationix/nvm) to install and manage more than one Node.js versions

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
Reload your shell and then install Node.js

    nvm install 4.0
    nvm use 4.0
If you wish this version to be your default one, you can type:

    nvm alias default 4.0
and to use it

    nvm use default


##ASQ
First, clone the repository

```bash
git clone https://github.com/ASQ-USI/ASQ.git ASQ
```

Then configure it

```bash
cd ASQ
# Copy the default example configuration
cp config/config.defaults.js.example config/config.defaults.js
# Set the `host` variable to your host's fully-qualified domain name
#
# If you want to use https make sure that you set `enableHTTPS` to `true`.
#
# If you are using a reverse proxy (like nginx) make sure `usingReverseProxy` is set to `true` and configure the 'reverseProxyOptions' object.
editor config/config.defaults.js
```

Install npm packages and bower components
    
```bash
npm install
```

Build assets

```bash
npm run build
```

At this point you can start ASQ. Run __one__ of the following

```bash
# start using npm
npm start
# start using node
node app.js
# start at specific port which will override the configuration
PORT=<port-number> node app.js
```

If you want to have the `stdout` nicely formatted then install `bunyan` globally:
    
```bash
npm install -g bunyan
```

and then pipe the start command to bunyan, for example
    
```bash
npm start | bunyan
```

### Developer
To run ASQ with all the developer goodies (watchers to recompile assets upon changes and restart ASQ) first create a `nodemon.json` file at the root DIR of ASQ to configure [nodemon](https://github.com/remy/nodemon):

```js
{
  "ignore": [
    ".git",
    "node_modules/**/node_modules",
    "test/*","client/*",
    "slides/*",
    "log/*",
    "plugins/*/node_modules/*"
  ],
  "watch": [ "app.js", "lib/*", "config/*", "models/*", "shared/*", "views/*", "routes/*", "plugins/*"],
  "execMap": {
    "js": "node --stack-trace-limit=1000 --stack-size=1024"
  }
}
```

then run

```bash
npm run dev
```

##Nginx
### Ubuntu
First install nginx

```bash
sudo apt-get install -y nginx
```

Copy the example site config (if you want to use https copy the `asq-ssl` configuration file instead of `asq`):

```bash
sudo cp lib/support/nginx/asq /etc/nginx/sites-available/asq
sudo ln -s /etc/nginx/sites-available/asq /etc/nginx/sites-enabled/asq
```

Make sure to edit the config file to match your setup:

```bash
# Change YOUR_SERVER_FQDN to the fully-qualified
# domain name of your host serving GitLab.
#
# Update the upstream `asq_node_upstream` with the addresses of your
# node instances
sudo editor /etc/nginx/sites-available/asq
```

To validate your `asq` or `asq-ssl` Nginx config file issue:

```bash
sudo nginx -t
```

You should receive `syntax is okay` and `test is successful` messages. If you receive errors check your `asq` or `asq-ssl` Nginx config file for typos, etc. as indicated in the error message given.

Finally, restart nginx

```bash
sudo service nginx restart
```

__Notice__: Don't forget to start your ASQ server!

### Mac OS X
First install nginx

```bash
brew install nginx
```

Append the contents of `lib/support/nginx/asq` (`lib/support/nginx/asq-ssl` if you want to enable https) in `nginx.conf` under the `http` directive .Make sure to edit the file to match your setup:

```bash
# Copy configuration and change YOUR_SERVER_FQDN to the fully-qualified
# domain name of your host serving GitLab.
#
# Update the upstream `asq_node_upstream` with the addresses of your
# node instances
sudo editor /usr/local/etc/nginx/nginx.conf
```

If you are using the `sites_available` and `sites_enabled` paradigm of Ubuntu, follow the Ubuntu configuration instructions above.

To validate your `asq` or `asq-ssl` Nginx config file, issue:

```bash
sudo nginx -t
```
    
You should receive `syntax is okay` and `test is successful` messages. If you receive errors check your `asq` or `asq-ssl` Nginx config file for typos, etc. as indicated in the error message given.

Finally, restart nginx

```bash
sudo nginx -s reload
```
__Notice__: Don't forget to start your ASQ server!



