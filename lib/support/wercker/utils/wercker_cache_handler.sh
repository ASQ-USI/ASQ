#!/bin/bash
# HANDLES CACHE FOR SYSTEM LEVEL DEPENDENCIES
set -e

# TODO: invalidate cache in case of errors
# TODO: make somehow independent from the operating system, installing the tools we use
# TODO: improve command output colors using the Wercker library to do so 
# TODO: make it more generic, especially the methods handling store/restore of the cache
#				because now they somehow are designed specifically for the use we to in ASQ,
#	      especially for what concern the excluded folders

#$1 = cache_folder_name
#$2 = file based on which we decide if invalidate the cache, and that has to be run
#$3 = space separated list of folders we want to cache
cache() {
	work_with_cache $1 $2 "$3";
}

#$1 = cache_folder_name
#$2 = file based on which we decide if invalidate the cache, and that has to be run
#$3 = space separated list of folders we want to cache
work_with_cache() {
	# if it is the first time we are using the cache
	if [ ! -d "$WERCKER_CACHE_DIR/$1" ] || [ ! -f "$WERCKER_CACHE_DIR/$1/$2" ]; then
		echo "First time initialization of the cache for "$1
		setup_cache $1 $2;
		execute_file $2;
		handle_cache "store" $1 "$3";
		adds_file_invalidating_the_cache $1 $2;
	else
  	cache_status=$(check_cache_validity $1 $2)

  	# Debug echoes
  	# NOTE: The comment are here, because they do not get printed on
  	#       Wercker if inside the subshell call
  	md5_current=($(md5sum "$2"))
		md5_cached=($(md5sum "$WERCKER_CACHE_DIR/$1/$2"))
		echo "Cached MD5 for "$2" is "$md5_cached
		echo "Current MD5 for "$2" is "$md5_current

  	# if the cache it is not valid
  	if [ "$cache_status" = "invalid" ]; then
  		echo "Cache is invalid for "$1
  		clear_cache $1;
  		setup_cache $1 $2;
			execute_file $2;
			adds_file_invalidating_the_cache $1 $2;
			handle_cache "store" $1 "$3";
		else
			echo "Reusing cache for "$1
			handle_cache "restore" $1 "$3";
		fi

	fi

}

#$1 = cache_folder_name
setup_cache() {

	echo "Setting up the cache for "$1

	if [ ! -d "$WERCKER_CACHE_DIR/$1" ]; then
	  echo 'Creating '$WERCKER_CACHE_DIR'/'$1
  	mkdir -p "$WERCKER_CACHE_DIR/$1"
  else
  	echo 'Already existing '$WERCKER_CACHE_DIR'/'$1
	fi

	echo "Done Setting up cache for "$1
}

#$1 = action: store or restore
#$2 = cache_folder_name
#$3 = space separated list of folders we want to cache
handle_cache() {
	folders_array=($3)
	number_of_folders=${#folders_array[*]}

	if [ "$number_of_folders" -eq "1" ]; then
		handle_single_folder_cache $1 $2 "$3";
	else
		handle_multiple_folder_cache $1 $2 "$3";
	fi
}

# TODO: refactor to remove duplicated code across methods handling the cache
#$1 = action: store or restore
#$2 = cache_folder_name
#$3 = space separated list of folders we want to cache
handle_multiple_folder_cache() {
	for directory in $3; do

		directory_name_with_underscore=${directory//\//\_}

		case $1 in
	    "store")
	      SRC=$WERCKER_SOURCE_DIR'/'${directory}
	      DST=$WERCKER_CACHE_DIR'/'
	      ;;
	    "restore")
	      SRC=$WERCKER_CACHE_DIR'/'
	      DST=$WERCKER_SOURCE_DIR'/'${directory}
	      ;;
	  esac
	  
	  # TODO: make it parameterizable in the directories to exclude
	  # run tar
	  if test -d "${SRC}"; then
	  	# TODO: make it work using a multiline command
	  	# excludes system dirs: proc, sys, dev
	  	# excludes Wercker dirs: pipeline, $2
	  	if [ $1 == "store" ]; then
	  		echo "Storing Cache for "$2" and folder "$SRC
	  		# TODO: improve the way the stdout and stderr are redirected
	  		# TODO: evaluate if adding --ignore-failed-read
	  		current_folder=$(pwd)
	  		cd $SRC
	  		tar --same-owner -zcf "${DST}/${2}/${directory_name_with_underscore}.tar.gz" . > /dev/null 2>&1
	  		cd $current_folder
	  	# restores the cache, only if we saved some files
	  	elif test -f "${SRC}/${2}/${directory_name_with_underscore}.tar.gz"; then
	  		echo "Restoring Cache for "$2" and folder "$DST
	  		# just copy all the cache back
	  		# TODO: exclude file used for managing the cache invalidation
	  		# TODO: evaluate if adding --ignore-command-error
	  		# NOTE: Better to use the overwrite behavior, because we change symbolic links
	  		[ -d "${DST}" ] || mkdir -p "${DST}"
	  		tar --overwrite --warning=no-timestamp --exclude="${SRC}/${2}/${directory_name_with_underscore}.tar.gz" -pxf "${SRC}/${2}/${directory_name_with_underscore}.tar.gz" -C "${DST}"
	  	fi
	  	
	  fi
	done
}

# TODO: refactor to remove duplicated code across methods handling the cache
#$1 = action: store or restore
#$2 = cache_folder_name
#$3 = space separated list of folders we want to cache
handle_single_folder_cache() {
	case $1 in
    "store")
      SRC=$3
      DST=$WERCKER_CACHE_DIR'/'
      ;;
    "restore")
      SRC=$WERCKER_CACHE_DIR'/'
      DST=$3
      ;;
  esac

  # TODO: make it parameterizable in the directories to exclude
  # run tar
  if test -d "${SRC}"; then
  	# TODO: make it work using a multiline command
  	# excludes system dirs: proc, sys, dev
  	# excludes Wercker dirs: pipeline, $2
  	if [ $1 == "store" ]; then
  		echo "Storing Cache for "$2
  		# TODO: improve the way the stdout and stderr are redirected
  		# TODO: evaluate if adding --ignore-failed-read
  		tar --same-owner --exclude="${SRC}/${2}" --exclude='/proc' --exclude='/sys' --exclude='/dev' --exclude='/mnt' --exclude='/pipeline' -zcf "${DST}/${2}/${2}.tar.gz" "${SRC}" > /dev/null 2>&1
  	# restores the cache, only if we saved some files
  	elif test -f "${SRC}/${2}/${2}.tar.gz"; then
  		echo "Restoring Cache for "$2
  		# just copy all the cache back
  		# TODO: exclude file used for managing the cache invalidation
  		# TODO: evaluate if adding --ignore-command-error
  		# NOTE: Better to use the overwrite behavior, because we change symbolic links
  		tar --overwrite --warning=no-timestamp --exclude="${SRC}/${2}.tar.gz" -pxf "${SRC}/${2}/${2}.tar.gz" -C "${DST}"
  	fi
  	
  fi
}

#$1 = cache_folder_name
#$2 = file based on which we decide if invalidate the cache, and that has to be run
adds_file_invalidating_the_cache() {

	echo "Adding file invalidating the cache for "$1

	# Adds the file used to decide if invalidate the cache, to the cache
	cp $2 $WERCKER_CACHE_DIR/$1/

	echo "Added file invalidating the cache for "$1
}

#$1 = cache_folder_name
#$2 = file based on which we decide if invalidate the cache, and that has to be run
#returns: "valid" if the cache is valid, "invalid" if the cache is not valid
check_cache_validity() {
	# disable case matching
	shopt -s nocasematch
	md5_current=($(md5sum "$2"))
	md5_cached=($(md5sum "$WERCKER_CACHE_DIR/$1/$2"))

	# compare the md5sum of the cached file, with the one of the current file
	# if they are different we invalidate the cache
	if [[ "$md5_current" != "$md5_cached" ]]; then
		echo "invalid";
	else
		echo "valid";
		# Copies the file invalidating the cache, to the cache every time, so we 
		# keep it fresh if it is not changes. This is due to the fact that Wercker 
		# deletes the cache after 14 days: http://devcenter.wercker.com/docs/pipelines/wercker-cache
		adds_file_invalidating_the_cache $1 $2;
	fi
}

#$1 = cache_folder_name
clear_cache() {
  echo 'Clearing '$WERCKER_CACHE_DIR'/'$1
  rm -R "$WERCKER_CACHE_DIR/$1"
}

#$1 = file based on which we decide if invalidate the cache, and that has to be run
execute_file() {
	# execute the file
	( "./$1" )
}

# call the cache method
cache "$@";