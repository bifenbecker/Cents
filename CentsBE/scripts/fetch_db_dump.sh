#!/bin/bash

set -e

# example execution: ./fetch_db_dump -r cents-dev1

helpFunction()
{
   echo "Usage: $0 -r remote_db_name"
   exit 1
}

while getopts ":r:" opt
do
   case "$opt" in
      r ) REMOTE_DB_NAME="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$REMOTE_DB_NAME" ];
then
   helpFunction
fi

download_backup () {
  scp dev-bastion:~/db_backups/"$REMOTE_DB_NAME".dump tmp/"$REMOTE_DB_NAME".dump
}

[ ! -d tmp ] && mkdir tmp;
download_backup
echo "Download complete! The file should be located in CentsBE/tmp/$REMOTE_DB_NAME.dump"
