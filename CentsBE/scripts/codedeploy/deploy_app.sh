#!/bin/bash

set -e

APP_DIR="/app/CentsBE"

case "$APPLICATION_NAME" in
    cents-dev)
	  SECRET_NAME="dev/be/env"
	  ;;
    cents-drycleaning)
	  SECRET_NAME="drycleaning/be/env"
    ;;
    cents-preprod)
	  SECRET_NAME="preprod/be/env"
	  ;;
	*)
	  echo "$APPLICATION_NAME app has no secret configured! exiting..." && exit 1;
esac

build_env () {
   echo "*** getting latest secrets from $SECRET_NAME ***"
   sleep 1;
   aws secretsmanager get-secret-value \
       --secret-id "$SECRET_NAME" \
       --query SecretString \
       --output text | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' \
       > "$APP_DIR/.env"
   sleep 2;

   # Get cron_jobs tag info on instance using instance metadata
   CRON_JOBS=$(curl http://169.254.169.254/latest/meta-data/tags/instance/cron_jobs)

   # SET QUEUE_RUNNER=TRUE for single instance since default is false
   [[ "$CRON_JOBS" == 'True' ]] && \
        echo "setting queue runner to TRUE for $(hostname)" && \
        sed -i -e 's/QUEUE_RUNNER=FALSE/QUEUE_RUNNER=TRUE/g' "$APP_DIR/.env";

   # SET ENABLE_EMAIL_DIGEST=TRUE for single instance since default is false
   [[ "$CRON_JOBS" == 'True' ]] && \
        echo "setting enable email digest to TRUE for $(hostname)" && \
        sed -i -e 's/ENABLE_EMAIL_DIGEST=FALSE/ENABLE_EMAIL_DIGEST=TRUE/g' "$APP_DIR/.env";

   echo "*** verifying .env file exists or not ***"
   if [ -f "$APP_DIR/.env" ]; then echo ".env file found"; else (echo ".env file not found"; exit 1); fi

   # validate a key
   grep -Fq "DB_NAME" "$APP_DIR/.env" || (echo ".env file is missing DB_NAME. Exiting.."; exit 1);
}

install_deps () {
   echo "***installing modules inside dir: $(pwd)"
   npm ci;
}

migrate () {
   echo "***starting data migrations for $APPLICATION_NAME ***"
   sleep 3;
   npx knex migrate:latest
   echo "*** data migration complete ***"
}

cd "$APP_DIR"
build_env
install_deps
migrate
