#!/bin/bash

set -e

# example execution: ./restore_db -l cents_dev_db -r cents-dev1

helpFunction()
{
   echo "Usage: $0 -l local_db_name -r remote_db_name"
   exit 1
}

while getopts ":l:r:" opt
do
   case "$opt" in
      l ) LOCAL_DB_NAME="$OPTARG" ;;
      r ) REMOTE_DB_NAME="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$LOCAL_DB_NAME" ] || [ -z "$REMOTE_DB_NAME" ];
then
   helpFunction
fi

download_backup () {
  scp dev-bastion:~/db_backups/"$REMOTE_DB_NAME".dump tmp/"$REMOTE_DB_NAME".dump
}

restore_db () {
  psql postgres -c "DROP DATABASE $LOCAL_DB_NAME;" && \
  psql postgres -c "CREATE DATABASE $LOCAL_DB_NAME;"

  echo "Restoring $LOCAL_DB_NAME database to remote db: $REMOTE_DB_NAME"
  pg_restore -d "$LOCAL_DB_NAME" tmp/"$REMOTE_DB_NAME".dump

  # remove psql dump file after restore completes
  rm -rf tmp
}


read -rp "Running this will drop your local $LOCAL_DB_NAME database \
and restore it with the remote $REMOTE_DB_NAME database. Are you sure? [y/n]"$'\n' response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
then
  [ ! -d tmp ] && mkdir tmp;
  download_backup
  restore_db
  echo "Restoration complete!"
fi

