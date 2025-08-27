#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Run the TypeScript script using ts-node
npx ts-node housekeeping/manulSketchUpdate.ts

# To run this script every day at 6pm PDT, add the following line to your crontab:
# 0 18 * * * /Users/jc/src/ga-api/housekeeping/refresh.sh