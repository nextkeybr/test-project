#!/bin/bash
cd "$(dirname "$0")"
(sleep 1.5; open http://localhost:3939) &
node server.js
