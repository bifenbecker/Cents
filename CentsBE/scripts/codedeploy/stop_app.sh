#!/bin/bash

set -e

echo "***stopping pm2 services ***"
pm2 stop 0 && pm2 delete 0;
sleep 2;

