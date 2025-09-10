#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run the sync script with the provided email
pnpm tsx scripts/sync-user-subscription.ts "$1"
