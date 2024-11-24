#!/bin/bash
# Clean development artifacts
rm -rf dist
rm -rf node_modules
rm -rf .nx/cache
docker system prune -f 