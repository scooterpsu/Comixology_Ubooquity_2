#!/bin/bash
jsonConvert=`cat $1 | pup '.cell json{}'`
hrefs=`echo $jsonConvert | jq '.[].children[].children[0].href | select(length > 0)'`
onclicks=`echo $jsonConvert | jq '.[].children[].children[0].onclick | select(length > 0)'| sed s/"\&#39;"/"'"/g`
pageIDs=`printf "$hrefs" | cut -d \/ -f 4`
rawfilenames=`echo $jsonConvert | jq '.[].children[].children[0].children[0].src | select(length > 0)'`
issueTest=`echo "$pageIDs" | sed -n "1p"`
pageLabels=`echo $jsonConvert | jq .[].children[1].text`
cellDataArray=`paste -d',' <(printf "${hrefs}") <(printf "${onclicks}") <(echo "${rawfilenames}") <(printf "${pageLabels}")`
echo "$cellDataArray" > output.csv