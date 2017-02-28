ASQ
===
ASQ aims to increase teacher awareness and student engagement in traditional brick-and-mortar classrooms by taking advantage of the latest Web technologies.
With ASQ teachers broadcast a Web-based slideshow synchronously to all students. They can pose [many types](https://github.com/ASQ-USI-Elements) of questions, track the students answering them, filter and discuss answers in real time.

About The Name
--------------

ASQ stands for Answer, Slide, Question.
The core concept of this app is a **S**lide that contains one or more **Q**uestion(s) for which the audience submits solutions and finaly the correct **A**nswer is displayed.
The three initials: S, Q, A can be reordered give ASQ (many thanks to Max for the idea!).  

Disclaimer
----------
This software is work-in-progress at an early stage (alpha). It might be unstable and insecure. You are using it at your own risk. We may introduce a lot of breaking changes in future releases. It is highly recommended that you install it behind the firewall of your institution/organization.

Installation
-------------
###Manual
Please follow the [installation guide](doc/install/installation.md)

###Docker with Docker Compose
You can find the ASQ docker image on the [Docker Hub](https://hub.docker.com/r/asqhub/asq/). With [Docker Compose](https://docs.docker.com/compose/) you can simply deploy ASQ with the deployment descriptor we provide. The steps are:

1. Get the `docker-compose.yml` or `docker-compose-ssl.yml` file from this repo, according to your requirements, and place it in a folder named `asq` on your machine.
2. Configure your deployment, if needed:
   - Replace the `${DOCKER_HUB_IMAGE_TAG}` variable with an actual tag, by manually changing it, or by [passing an environment variable](https://docs.docker.com/compose/compose-file/#variable-substitution) to [Docker Compose](https://docs.docker.com/compose/). You can find the list of available tags on the [Docker Hub](https://hub.docker.com/r/asqhub/asq/tags/). One is `master`, that is the default one.
   - Change the `${HOST}` variable passed to the ASQ service to match your host name, the same way as you did for the `${DOCKER_HUB_IMAGE_TAG}` variable. The default is `127.0.0.1`.
   - Change the `${SERVER_NAME}` variable passed to the ASQ service to match your requirements (e.g., if ASQ has to be exposed on a subdomain on your server), the same way as you did for the `${DOCKER_HUB_IMAGE_TAG}` variable. The default is `_`.
   - If you need [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) support, change the `${ENABLE_LDAP}` variable and the four `LDAP_*` variables according to your settings, or configure them as you did for the `${DOCKER_HUB_IMAGE_TAG}` variable. Alternatively remove the four `LDAP_*` variables if not needed for your deployment.
   - If you use the `docker-compose-ssl.yml` file, also change or set the same way as you did for the `${DOCKER_HUB_IMAGE_TAG}` variable, the following variables: `${HOST_SSL_CERTIFICATE_ABSOLUTE_PATH}` and `${HOST_SSL_KEY_ABSOLUTE_PATH}`. `${HOST_SSL_CERTIFICATE_ABSOLUTE_PATH}` must be the absolute path of the ssl certificate for the nginx server and `${HOST_SSL_KEY_ABSOLUTE_PATH}` must be the absolute path of the ssl key for the nginx server. 
   
The provided `docker-compose.yml`/`docker-compose-ssl.yml` file uses the [Docker Compose Version 2.1 format](https://docs.docker.com/compose/compose-file/#/versioning) thus it requires [**Docker Engine 1.12.0+**](https://docs.docker.com/engine/installation/) and [**Docker Compose 1.9.0+**](https://docs.docker.com/compose/install/).
Moreover it relies on [local Docker volumes](https://docs.docker.com/engine/reference/commandline/volume_create/) and on the bridge network provided by Docker. Refer to the [Docker Compose file reference](https://docs.docker.com/compose/compose-file/) to customise the deployment for your settings.

Getting started
----------------
Please follow the [getting started guide](doc/manual/getting_started.md)

Requirements
-------------
Ubuntu/Mac OS X/L**
node 4.0+
mongoDB 2.6.0 +
redis 2.0+

Browser Support
---------------
Currently we focus on supporting __Google Chrome__ and __Chromium__ . Safari and Firefox also seem to work but they are not officially supported. Please note that browser support depends also on [impress.js][5].

A brief history of ASQ
----------------------

This project started as part of the group project for the course [Software Atelier III: Web 2.0 technologies](http://www.inf.usi.ch/presentazione-studiare/container_education_utilities/orario_corsi/corso?id=985), taught by [Prof. Cesare Pautasso](http://www.inf.usi.ch/faculty/pautasso/), at the [Faculty of Informatics](http://www.inf.usi.ch/) of the [Università della Svizzera italiana](http://www.usi.ch/en/index.htm). The original authors were [Jacques DAFFLON](http://atelier.inf.usi.ch/~dafflonj/), Margarita GRINVALD and [Max VON BÜLOW](http://www.maxmediapictures.de/). The project was supervised by [Vasileios Triglianos](http://www.inf.usi.ch/phd/triglianos/).

Maintainers
-------
* [Vasileios Triglianos](http://www.inf.usi.ch/phd/triglianos/)

Past Contributors
-----------------
* [Zhenfei Nie](http://zhenfeinie.info/)
* [Jacques DAFFLON](http://atelier.inf.usi.ch/~dafflonj/)
* Margarita GRINVALD
* [Max VON BÜLOW](http://www.maxmediapictures.de/)

Changelog
---------

See the changelog [here](https://github.com/ASQ-USI/ASQ/blob/master/CHANGELOG.md).

Licence
---------
Reciprocal Public License 1.5 (RPL-1.5). See the full Licence text [here](LICENCE).

[1]: http://nodejs.org/                     "node.js"
[2]: http://expressjs.com/                  "express.js"
[3]: http://www.mongodb.org/                "MongoDB"
[4]: http://embeddedjs.com/                 "ejs"
[5]: http://passportjs.org/                 "Passport.js"
[6]: https://github.com/bartaz/impress.js/  "impress.js"
