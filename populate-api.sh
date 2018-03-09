#!/bin/bash

#
# This script's aim is to quickly create a lot of users, and a few games to populate the DB.
#

# to enable the 'word' alias below

# based on http://www.unixcl.com/2008/05/generate-random-words-in-linux.html
function word {
  # either "words" or "propernames"
  WORDFILE="/usr/share/dict/$2"
  NUMWORDS=$1
  RANDOM_CMD='od -vAn -N4 -tu4 /dev/urandom'

  #Number of lines in $WORDFILE
  tL=`awk 'NF!=0 {++c} END {print c}' $WORDFILE`

  for i in `seq $NUMWORDS`
  do
    rnum=$(($(${RANDOM_CMD})%$tL+1))
    sed -n "$rnum p" $WORDFILE
  done
}
# https://stackoverflow.com/questions/11392189/converting-string-from-uppercase-to-lowercase-in-bash
function toUpperCase {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}
function toLowerCase {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

TARGET="http://localhost:3000"

for USER_ID in 1 2 3 4 5 6 7 8 9 10
do
  firstname="$(word 1 propernames)"
  lastname="$(word 1 words)"
  domain="$(word 1 words)"
  # thanks https://stackoverflow.com/questions/5688576/how-to-use-mod-operator-in-bash
  random100="$(( $RANDOM % 100))"
  if [[ $((USER_ID % 2)) = 1 ]]; then
    avatar="https://randomuser.me/api/portraits/men/$random100.jpg"
  else
    avatar="https://randomuser.me/api/portraits/women/$random100.jpg"
  fi
  echo "we will create a user named $firstname $lastname @$domain, with avatar url : $avatar"
  curl -X POST \
    $TARGET/api/players \
    -H 'Cache-Control: no-cache' \
    -H 'Content-Type: application/json' \
    -d "{
    \"displayName\": \"$firstname $(toUpperCase $lastname)\",
    \"email\": \"$(toLowerCase $firstname).$(toLowerCase $lastname)@$(toLowerCase $domain).com\",
    \"avatar\": \"$avatar\"
  }"

done

