#!/usr/bin/env bash
export PATH="/home/jetson/.local/bin:$PATH"

cd /home/jetson/rpos
touch sdsad.txt
/home/jetson/.nvm/versions/node/v18.20.8/bin/node rpos.js
