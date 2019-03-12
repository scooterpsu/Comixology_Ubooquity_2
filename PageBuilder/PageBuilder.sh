#!/bin/bash
my_dir=`dirname $0`
apikey="" #put your comicvine key here
coverDownload=true #scrapes Comixology for thumbnail
coverCreate=true #imageMagick must be installed for this to work

#This loads aliases so imageMagick can be run from a docker container
#shopt -s expand_aliases
#source /boot/aliases.sh

if [ -z "$apikey" ]; then
    echo "No Comicvine API key entered."
    exit 1
else
    if ([[ $1 == *"cvinfo" ]] && [[ -f "$1" ]]) || ([[ $1 == *"CVInfo" ]] && [[ -f "$1" ]]); then
        if [ ! -f "$(dirname "$1")/series.json" ] || [ ! -f "$(dirname "$1")/folder.jpg" ]; then
            urlInput=`cat "$1"`
            if [ -z "$urlInput" ]; then
                echo Missing URL in cvinfo file
                exit 1
            fi
            IFS='/' read -a url <<< "$urlInput"
            echo "Downloading comic data"
            if [[ $urlInput != *"storyarc"* ]]; then
                rawDesc=`curl -s "https://comicvine.gamespot.com/api/issues/?api_key="$apikey"&field_list=description&format=json&filter=issue_number:1,volume:"${url[4]##*-} | $my_dir/jq '.results[0].description'`
                description=`echo "${rawDesc#\"}" | awk -F'<h4>List of covers' '{print $1}' | sed -e 's/<[^>]*>//g' -e 's/"$//' -e 's/[”“]/\"/g' | sed 's/[\]//g'`
                pubinfo=`curl -s "https://comicvine.gamespot.com/api/volume/"4050-${url[4]##*-}"/?api_key="$apikey"&field_list=name,start_year,publisher,image&format=json"`
                coverurl=`echo "$pubinfo" | $my_dir/jq .results.image.medium_url | tr -d '"'`
                name=`echo "$pubinfo" | $my_dir/jq .results.name | tr -d '"'`
                publisher=`echo "$pubinfo" | $my_dir/jq .results.publisher.name | tr -d '"'`
                start_year=`echo "$pubinfo" | $my_dir/jq .results.start_year | tr -d '"'`
            else
                getInitial=`curl -s "https://comicvine.gamespot.com/api/story_arcs/?api_key="$apikey"&format=json&field_list=name,deck,publisher,image&filter=id:"${url[4]##*-}`
                description=`echo $getInitial | $my_dir/jq '.results[0].deck' | tr -d '"'`
                name=`echo $getInitial | $my_dir/jq '.results[0].name' | tr -d '"'`
                coverurl=`echo "$getInitial" | $my_dir/jq .results[0].image.medium_url | tr -d '"'`
                publisher=`echo $getInitial | $my_dir/jq '.results[0].publisher.name' | tr -d '"'`            
            fi
            if [ ! -f "$(dirname "$1")/series.json" ]; then
                if [[ $urlInput != *"storyarc"* ]]; then
                    seriesType="comicSeries"
                else
                    seriesType="comicArc"
                fi
                echo "Building comic json"
                JSON_STRING=$($my_dir/jq -n \
                  --arg desc "$description" \
                  --arg name "$name" \
                  --arg year "$start_year" \
                  --arg pub "$publisher" \
                  --arg type "$seriesType" \
                  '{metadata:[{description: $desc, name: $name, year: $year, publisher: $pub, type: $type}]}' )
                echo $JSON_STRING > $my_dir/temp/series.json
                mv $my_dir/temp/series.json "$(dirname "$1")/"
            else
                echo "series.json already exists, skipping"
            fi
            if [ ! -f "$(dirname "$1")/folder.jpg" ]; then
                if $coverDownload; then
                    if [[ $urlInput != *"storyarc"* ]]; then
                        $my_dir/imageGet.sh -c "$name" -d "$start_year"
                    else
                        $my_dir/imageGet.sh -c "$name" -t "story-arc"
                    fi
                    name="${name//:/}"
                    name="${name////-}"  
                    name="${name////-}" 
                    name="${name// /+}" 
                    if [ -f "$my_dir/temp/$name $start_year.jpg" ]; then
                        mv "$my_dir/temp/$name $start_year.jpg" "$(dirname "$1")/folder.jpg"
                        echo "Done!"
                    fi
                    if [ -f "$my_dir/temp/$name.jpg" ]; then
                        mv "$my_dir/temp/$name.jpg" "$(dirname "$1")/folder.jpg"
                        echo "Done!"
                    fi
                fi
                if $coverCreate; then
                    if [ ! -f "$(dirname "$1")/folder.jpg" ]; then
                            echo "Downloading from comicvine."
                            curl -# -o "$my_dir/temp/cover.jpg" $coverurl
                        if [ -f "$my_dir/temp/cover.jpg" ]; then
                            echo "Manually creating thumbnail "$(dirname "$1")/folder.jpg""
                            convert "$my_dir/temp/cover.jpg" -resize 640 "$my_dir/temp/folder.jpg"
                            mogrify -gravity north -extent 640x640 "$my_dir/temp/folder.jpg"
                            mv "$my_dir/temp/folder.jpg" "$(dirname "$1")/folder.jpg"
                            rm "$my_dir/temp/cover.jpg"
                            echo "Done!"
                        else
                            echo "No cover.jpg found. Using fallback.jpg."
                            cp "$my_dir/fallback.jpg" "$(dirname "$1")/folder.jpg"
                        fi
                    fi
                fi
            else
                echo "folder.jpg already exists, skipping"
            fi
        else
            echo "series.json and folder.jpg already exist"
        fi
    else
        echo "No cvinfo file found"
    fi
fi