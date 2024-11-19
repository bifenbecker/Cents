# Cents-BE application

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/efd33b779dc54a199e13d7909dfdece6)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=make-cents/CentsBE&amp;utm_campaign=Badge_Grade) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/efd33b779dc54a199e13d7909dfdece6)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=make-cents/CentsBE&utm_campaign=Badge_Coverage)

## Development

### Prerequisites

#### Docker

Install instructions <https://docs.docker.com/get-docker/>
Make sure Docker is running before proceeding.

### Start application with `docker-compose`

1. Copy a test config `cp .env.test .env`
2. Add/Update .env variables from  1Password (Environment Variables - CentsBE Local). Reach out to your manager for access if you don't have it already.
3. Update the `DATA_PATH` variable with the path of the folder where you want data (Postgres, Redis, Elastic. MongoDB) to persist. Ex: `../data-CentsBE`.
   1. Note: To avoid losing your data, make sure `DATA_PATH` is not a temporal directory on your host machine.
4. Start stack in the background with `docker-compose up -d`.
   1. You may also choose to only load app critical containers with `docker-compose up main-app`.
5. Follow instructions [here](#db-restoration-for-docker-testing-setup) to restore dev data to your docker db.
6. run `docker ps | grep centsbe_main-app` and note `CONTAINER ID` or `NAME` of `centsbe_main-app` (typically name is centsbe_main-app_1)
7. Run DB migrations `docker exec -it centsbe_main-app_1 npx knex migrate:latest`
8. Setup Elasticsearch cache
   1. `docker exec -it centsbe_main-app_1 sh`
   2. `npm run elasticsearch-schema`
   3. `npm run create-businessCustomers-index`
   4. `npm run reindex-businessCustomers`
   5. `npm run create-stores-index`
   6. `npm run reindex-stores`
   7. `exit`
9. (Optional) Start the VS code Debug configuration (debug port 9778*).
10. When you are done testing, stop all the running containers with `docker-compose down`
11. (Optional) Remove all docker volumes `docker volume rm $(docker volume ls -q)`. Use with care because it will remove ALL docker volumes!!!

Example of attach section in .vscode:

```json
    {
        "name": "Attach",
        "port": 9778,
        "request": "attach",
        "skipFiles": [
            "<node_internals>/**"
        ],
        "type": "node",
        "address": "localhost",
        "localRoot": "${workspaceRoot}",
        "remoteRoot": "/app",
    },
```

Docker will build and start the application from current folder.

### Check the logs of the application running in daemon (`-d`) mode

#### Tail last 10 messages from application

```bash
docker-compose logs --tail=10 main-app
```

#### Watch live stream of the application logs

```bash
docker-compose logs --tail=10 -f main-app
```

#### Save all application logs to the file

```bash
docker-compose logs main-app > cents-be.log
```

## To run this as it would run in a live environment

update variable in .env file

```bash
MAIN_APP_CMD=node index.js
```

Rebuild the docker image with command

```bash
# Foreground
docker-compose up --force-recreate --build
# Or daemon mode
docker-compose up -d --force-recreate --build
```

If you want to use an image from registry
Update the MAIN_APP_IMAGE variable in .env file with desired image name

```bash
docker-compose -f docker-compose.yml -f docker-compose.ecr.yml up -d
```

### Setup and run application w/o docker

1. `npm install`
2. Install postgresql 11
   > For MacOS: `brew install postgresql@11`
3. Apply DB dump
4. Apply DB migrations `npm run migrate`
5. Install Redis and run it
   > For MacOS: `brew install redis@6.2`
6. Install Elasticsearch and run it
   > For MacOS: `brew tap elastic/tap && brew install elastic/tap/elasticsearch-full`
7. Create `.env` file (use `.env.test` as an example), update it accroding to your environment
8. Run following commands **in following order**
   1. `npm run elasticsearch-schema`
   2. `npm run create-businessCustomers-index`
   3. `npm run reindex-businessCustomers`
   4. `npm run create-stores-index`
   5. `npm run reindex-stores`
9. `node index.js`

## Testing

see Setup section of [TEST_INSTRUCTIONS](documents/TEST_INSTRUCTIONS.MD#setup)

## Possible errors

### On the first run you may need to fix permission for the elasticsearch data folder

Error

```java
ElasticsearchException[failed to bind service]; nested: AccessDeniedException[/usr/share/elasticsearch/data/nodes];
```

Fix

```bash
sudo chown 1000:1000 $DATA_PATH/elasticsearch
```

### Ports exposed

|Application|Port|
|-|-|
|Main Application|3001|
|Postgres|5432|
|PgAdmin (default creds: email - postgres@host.local, password - password)|5678|
|Redis|6379|
|MongoDB|27017|
|Mongo-express admin interface|8081|
|Kibana/OpenSearch Dashboards|5601|
|Elastic|9200|
|Cerebro|9000|

### 403 error when building Docker image

Try to connect via VPN (any VPN with servers in EU/USA/Canada should suffice).

### Any other connection errors when building / running Docker image

Try to restart Docker itself. (click restart in `Docker Desktop` menu).

## DB Restoration for Local Testing Setup (without Docker)

Database dumps from the dev db are taken every 4 hours and exist on our dev-bastion instance. To download and restore them locally:

1. Add your IP to the `ssh-access-to-dev-bastion` [security group](https://us-east-2.console.aws.amazon.com/ec2/v2/home?region=us-east-2#SecurityGroup:groupId=sg-0c273559ded4bb25f) ingress rules.
2. Make sure you have the pem key for the dev-bastion EC2 in this location on your machine: `~/.ssh/cents-dev.pem`
3. Add this configuration to your `~/.ssh/config` file (create if this doesnt exist):

    ```bash
    Host dev-bastion
    HostName <insert the dev-bastion public ip or dns hostname from AWS>
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/cents-dev.pem
    ```

4. Run `scripts/restore_db.sh -l local_db_name -r remote_db_name` to restore a copy of the dev db to your local db.
**WARNING**: When restoring to a local database, your local database will first be dropped.

## DB Restoration for Docker Testing Setup

1. Follow steps 1-3 above and then run the following commands:
2. `scripts/fetch_db_dump.sh -r cents-dev1` to download a copy of the dev db locally.
3. `docker ps | grep postgres` and note `CONTAINER ID` or `NAME` of `postgres` (typically name is postgres). `docker ps` lists your running containers.
4. `docker cp ./tmp/cents-dev1.dump postgres:/tmp/cents-dev1.dump` to copy the `.dump` file from your filesystem into the container so it can be accessed there.
5. `docker exec -it postgres sh` which opens an interactive shell inside the postgres container
6. `psql -U postgres` to login as the postgres user
7. `CREATE DATABASE cents_test WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';` to create a fresh test database in your container.
8. `exit` to exit psql.
9. `pg_restore -U postgres -d cents_test tmp/cents-dev1.dump` to restore the `.dump` file into this new database.
10. `exit` to exit the docker container.

### Common issues

- If you face a permissions issue when connecting to the host run: `chmod 700 ~/.ssh/cents-dev.pem`

## Generating Swagger Docs

In order to automatically generate updated swagger docs for all of our APIs, simply run `npm run swagger-autogen`.

The generated swagger docs can be accessible either at your localhost (by default, localhost:3001/api-docs), or on our Dev API at <https://api-dev.trycents.com/api-docs>.

## [Automated Testing Docs](./documents/TEST_INSTRUCTIONS.MD)
