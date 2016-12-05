#!/bin/bash
# MAINTAINER: Vincenzo Ferme <info@vincenzoferme.it>
# HANDLES CACHE FOR BOWER DEPENDENCIES
set -e

# Partially inspired by: https://bitbucket.org/ryanharper007/wercker-bower-install
export BOWER_STORAGE__CACHE="${WERCKER_CACHE_DIR}/wercker/bower"
mkdir -p $BOWER_STORAGE__CACHE
mkdir -p $BOWER_STORAGE__CACHE/.bower-cache
mkdir -p $BOWER_STORAGE__CACHE/.bower-registry
mkdir -p $BOWER_STORAGE__CACHE/.bower-tmp

# return 1 if local npm package is installed at ${WERCKER_SOURCE_DIR}/node_modules, else 0
# example
# echo "gruntacular : $(npm_package_is_installed gruntacular)"
# Source: https://gist.github.com/JamieMason/4761049
npm_package_is_installed() {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  ls ${WERCKER_SOURCE_DIR}/node_modules | grep $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

#$1 = space separated list of folders in which a bower.json is defined

# Detect bower command
if ! type bower &> /dev/null ; then
    # Check if it is in repo
    is_bower_installed=$(npm_package_is_installed bower)
    if [ "$is_bower_installed" -eq "1" ]; then
        echo "bower is available locally"
        #echo "bower version: $(node ${WERCKER_SOURCE_DIR}/node_modules/bower/bin/bower --version)"
        bower_command="node ${WERCKER_SOURCE_DIR}/node_modules/bower/bin/bower"
    fi
else
    echo "bower is available"
    #echo "bower version: $(bower --version)"
    bower_command="bower"
fi

current_folder=$(pwd)
for directory in $1; do
  cd ${WERCKER_SOURCE_DIR}/${directory}
  set +e
  $bower_command install \
      --config.interactive=false \
      --config.storage.packages=$BOWER_STORAGE__CACHE/.bower-cache \
      --config.storage.registry=$BOWER_STORAGE__CACHE/.bower-registry \
      --config.tmp=$BOWER_STORAGE__CACHE/.bower-tmp \
      --allow-root
  result="$?"
  set -e

  # Fail if it is not a success or warning
  if [[ result -ne 0 && result -ne 6 ]]
  then
      echo "$result"
      echo "bower command failed for "${directory}
  else
      echo "finished $bower_command for "${directory}
  fi

done
cd $current_folder