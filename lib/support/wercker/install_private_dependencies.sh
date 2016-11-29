#!/bin/bash
# SETUP ASQ PRIVATE DEPENDENCIES
set -ex

# Configure ENV variables
export slide2htmlDir=slide2html
export slide2htmlBranch=master
export slide2htmlCommit=7e572868ebbd1b96b04f53a40c0bfebe9e34a16e

export uiDir=public/ui
export uiBranch=master
export uiCommit=94d3b15481b416a987553adfbe8a3af99587cdb5

export cockpitDir=public/cockpit
export cockpitBranch=feat-use-polymer-build
export cockpitCommit=1cace88d4dff32e3366c1b6c97a3c4b350a6d81f

# Execute the pipeline
current_folder=$(pwd)
cd ${WERCKER_SOURCE_DIR}
CI_USER_TOKEN=${CI_USER_TOKEN} npm run install-private-dependencies
cd $current_folder

# Clean up folders if in CI (so we cache only the needed files)
if [ "$CI" = true ]; then
	rm -Rf $slide2htmlDir/.git $uiDir/.git $cockpitDir/.git
fi
