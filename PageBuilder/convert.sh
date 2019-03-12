#!/bin/bash
my_dir=`dirname $0`
inputHTML=`cat "$1"`
name=`echo $inputHTML | $my_dir/pup '#title text{}' | xargs`
if ([[ $name == *"("* ]]) && ([[ "${name: -1}" == ")" ]]); then
start_year=`echo $name | rev | cut -d \( -f1 | cut -c 2- | rev`
name=`echo $name | sed -e "s/ ($start_year)$//"`
fi
description=`echo $inputHTML | $my_dir/pup '#desc text{}'`
publisher=`echo $inputHTML | $my_dir/pup '#publisher text{}'`
seriesType="comicSeries"
JSON_STRING=$($my_dir/jq -n \
    --arg desc "$description" \
    --arg name "$name" \
    --arg year "$start_year" \
    --arg pub "$publisher" \
    --arg type "$seriesType" \
    '{metadata:[{description: $desc, name: $name, year: $year, publisher: $pub, type: $type}]}' )
echo $JSON_STRING > $my_dir/temp/series.json
mv $my_dir/temp/series.json "$(dirname "$1")/"
rm "$(dirname "$1")/folder.css"
rm "$(dirname "$1")/folder-info.html"