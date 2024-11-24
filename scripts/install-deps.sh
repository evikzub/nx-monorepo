#!/bin/bash
# Install or update dependencies
npm ci
npm audit fix
npm outdated 