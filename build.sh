#!/bin/bash
# Builds the bookmarklet. Requires: node, npm install (for terser)
set -e
cd "$(dirname "$0")"
node build.js
