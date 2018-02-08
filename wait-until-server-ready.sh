#!/bin/bash
# wait-until-server-ready.sh
# looks for a specific string to appear in a log before exiting.
#
# how to use:
#
# npm start 2>&1 | tee server.log &
# to run the server part in background.
# then wait for it to be ready
# run whatever you want, like integration tests
# kill %1 to stop the background process.

echo "Waiting for server to be ready..."
while true ; do
  echo "."
  result=$(grep -nE 'server listening on port' server.log) # -n shows line number
  echo "DEBUG: Result found is $result"
  if [ -z $result ] ; then
    echo "READY!"
    break
  fi
  sleep 1
done

