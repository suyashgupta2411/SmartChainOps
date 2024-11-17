#!/bin/bash

# Stop and remove any existing containers
docker-compose down

# Start the new deployment
docker-compose up -d --build
