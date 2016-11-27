#!/bin/sh
# Tweak nginx to match the workers to cpu's
# procs=$(cat /proc/cpuinfo | grep processor | wc -l) && sed -i -e "s/worker_processes 1;/worker_processes $procs;/" /etc/nginx/nginx.conf
nginx 
# 2>&1
