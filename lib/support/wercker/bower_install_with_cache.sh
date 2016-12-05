#!/bin/bash
set +e
# MAINTAINER: Vincenzo Ferme <info@vincenzoferme.it>
# HANDLES CACHE FOR BOWER DEPENDENCIES

# Partially inspired by: https://bitbucket.org/ryanharper007/wercker-bower-install/src/f6bc2d45546382012668ea8224f3f8bb6e743894/run.sh?at=master&fileviewer=file-view-default
export BOWER_STORAGE_CACHE="${WERCKER_CACHE_DIR}/wercker/bower"
mkdir -p $BOWER_STORAGE_CACHE
mkdir -p $BOWER_STORAGE_CACHE/.bower-cache
mkdir -p $BOWER_STORAGE_CACHE/.bower-registry
mkdir -p $BOWER_STORAGE_CACHE/.bower-tmp

bower install \
    --config.interactive=false \
    --config.storage.packages=$BOWER_STORAGE_CACHE/.bower-cache \
    --config.storage.registry=$BOWER_STORAGE_CACHE/.bower-registry \
    --config.tmp=$BOWER_STORAGE_CACHE/.bower-tmp \
    --allow-root
result="$?"

# Fail if it is not a success or warning
if [[ result -ne 0 && result -ne 6 ]]
then
    echo "$result"
    echo "bower command failed"
else
    echo "finished bower"
fi