#!/bin/bash
# MAINTAINER: Vincenzo Ferme <info@vincenzoferme.it>
# SETUP ASQ PRIVATE DEPENDENCIES
set -ex

# Configure ENV variables
export slide2htmlDir=slide2html
export slide2htmlBranch=master
export slide2htmlCommit=7e572868ebbd1b96b04f53a40c0bfebe9e34a16e

export uiDir=public/ui
export uiBranch=master
export uiCommit=07f7c55f7f82f5777a5351ff848fb22abc62fb1e

export cockpitDir=public/cockpit
export cockpitBranch=master
export cockpitCommit=06cabec7c6f42ec93a1d7779056381382ff9d6dd

# Execute the pipeline
current_folder=$(pwd)
# cd ${WERCKER_SOURCE_DIR}
CI_USER_TOKEN=${CI_USER_TOKEN} npm run install-private-dependencies
cd $current_folder

# Clean up folders if in CI (so we cache only the needed files)
if [ "$CI" = true ]; then
	rm -Rf $slide2htmlDir/.git $uiDir/.git $cockpitDir/.git
fi
