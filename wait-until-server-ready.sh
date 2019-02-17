#!/bin/bash
# wait-until-server-ready.sh
# looks for a specific string to appear in a log before exiting.
# waits for the log file to appear.
# try this a few times before giving up (max number of retries).
#
# how to use:
#
# npm start 2>&1 | tee server.log &
# to run the server part in background.
# then wait for it to be ready
# run whatever you want, like integration tests
# kill %1 to stop the background process.

echo "Waiting for server.log to appear and contain a line with 'server listing on port' in it..."
number_of_test=1
MAX_NB_RETRIES=50
while [ $number_of_test -le $MAX_NB_RETRIES ]; do
  echo "$number_of_test"
  if [ -f server.log ]; then
    result=$(grep -nE 'server listening on port' server.log) # -n shows line number
    echo "DEBUG: Result found is '$result'"
    if [ "$result" != "" ]; then
        echo "READY!"
        break
    else
        let number_of_test=number_of_test+1
    fi
  else
    let number_of_test=number_of_test+1
    echo "DEBUG: server.log not found..."
  fi
  sleep 1
done
echo "finished after trying $(($number_of_test-1)) times"
