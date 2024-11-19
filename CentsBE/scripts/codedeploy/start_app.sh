#!/bin/bash

set -e

echo "***starting pm2 services***"
cd /app/CentsBE
pm2 start index.js -i 1 --max-memory-restart 2G;
sleep 2;
pm2 status;
