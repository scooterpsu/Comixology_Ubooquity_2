#! /bin/bash
#Settings
sleepDelay="5"
googleLocalizaion="www.google.com"
useragent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.89 Safari/537.36'

#Don't change the below
my_dir=`dirname $0`
usage="Usage: $0 -c 'Comic Name' [-d 'Comic Year'] [-r 'Which result to save']"

#Big thanks to Mediabot666 for the argument parsing work!
while [ "$1" != "" ]; do
    case $1 in
    -c | --comic ) 
        shift
        comicname=$1
        echo Comic: $comicname;;
    -d | --date ) 
        shift 
        date=$1
        echo Date: $date;;
    -r | --result ) 
        shift 
        result=$1
        echo Result: $result;;
    -t | --type ) 
        shift 
        type=$1
        echo Type: $type;;
    -h | --help ) 
        echo $usage
        exit ;;
    * ) 
        exit 1
esac
shift
done

function seriesPageDownload(){
    curl --fail \
            -# \
            -H "User-Agent: ${useragent}" \
            -H "Referer: https://www.comixology.com/" \
            $1 \
            | $my_dir/pup '.series-cover json{}' | $my_dir/jq .[].src | tr -d '"'
}

function storyArcDownload(){
    curl --fail \
            -# \
            -H "User-Agent: ${useragent}" \
            -H "Referer: https://www.comixology.com/" \
            $1 \
            | $my_dir/pup '.story-arc-cover json{}' | $my_dir/jq .[].src | tr -d '"'
}

function comixologyDownload(){
    curl --fail \
            -# \
            -H "Accept:image/webp,image/*,*/*;q=0.8" \
            -H "Accept-Encoding:gzip, deflate, sdch, br" \
            -H "Accept-Language:en-US,en;q=0.8" \
            -H "User-Agent: ${useragent}" \
            -H "Referer: https://www.comixology.com/search/series?search=${1}&lang=1" \
            -o "$2" \
            $3
}

function getMyImages {
    webquery="$@"
    [ -z "$webquery" ] && exit 1  # insufficient arguments
    
    # indicate which search result you would like
    if [ -z "$result" ]; then
        result="1"
    fi
    
    # indicate which search result you would like
    if [ -z "$type" ]; then
        type="series"
    fi
    
    if [ "$type" = "series" ]; then
        extraString="+intitle:Digital"
    else
        extraString=""    
    fi
    
    # remove/replace offending characters
    webquery="${webquery//&/%26}"
    webquery="${webquery//:/%3A}"
    webquery="${webquery// /%20}"  
    webquery="${webquery//+/%2B}"  
    webquery="${webquery////%2F}" 
    comicname="${comicname//:/}"
    comicname="${comicname////-}"  

    echo Searching for Comixology page

    # construct google link   
    link="https://${googleLocalizaion}/search?q=intitle:\"${webquery}\"+inurl:${type}${extraString}&as_sitesearch=www.comixology.com"
    if [ ! -z "$date" ]; then
        link="https://${googleLocalizaion}/search?q=intitle:\"${webquery}\"+intitle:%28${date}+inurl:${type}${extraString}&as_sitesearch=www.comixology.com"   
    fi
    
    OUT=`curl --write-out '\n%{http_code}' -s -A $useragent -e https:${googleLocalizaion} $link`
    httpcode=`echo "$OUT" | tail -n1`
    echo HTTP Response: $httpcode
    if [ "$httpcode" = "302" ]; then
        echo Google bot detection triggered, try again later.
        exit 1
    fi
    pageURL=`echo "$OUT" | grep -o '<a href=['"'"'"][^"'"'"']*['"'"'"]' |  sed -e 's/^<a href=["'"'"']//' -e 's/["'"'"']$//' | grep "^/url" | cut -f1 -d"&" | cut -d"=" -f2 | head -n $result | tail -n1`
    if [ -z "$pageURL" ] && [ ! -z "$date" ]; then
        echo Waiting $sleepDelay seconds to look less automated
        sleep $sleepDelay 
        echo Trying again without date parameter
        link="https://${googleLocalizaion}/search?q=intitle:\"${webquery}\"+inurl:${type}${extraString}&as_sitesearch=www.comixology.com"
        OUT=`curl --write-out '\n%{http_code}' -s -A $useragent -e https:${googleLocalizaion} $link`
        httpcode=`echo "$OUT" | tail -n1`
        echo HTTP Response: $httpcode
        if [ "$httpcode" = "302" ]; then
            echo Google bot detection triggered, try again later.
            exit 1
        fi
        pageURL=`echo "$OUT" | grep -o '<a href=['"'"'"][^"'"'"']*['"'"'"]' |  sed -e 's/^<a href=["'"'"']//' -e 's/["'"'"']$//' | grep "^/url" | cut -f1 -d"&" | cut -d"=" -f2 | head -n $result | tail -n1`
    fi
    
    if [ -z "$pageURL" ]; then
        echo Series not found
    else
        echo Downloading Comixology page
        if [ "$type" = "series" ]; then
            imagelink=`seriesPageDownload $pageURL | rev | cut -d'.' -f3- | rev`
        else
            imagelink=`storyArcDownload $pageURL | rev | cut -d'.' -f3- | rev`  
        fi
        imagelink+=".jpg"
        if [ -z "$date" ]; then
            google_image="$my_dir/$comicname.jpg"
        else
            google_image="$my_dir/$comicname $date.jpg"
        fi

        comicname="${comicname// /+}"          
        echo Downloading image
        if comixologyDownload "${comicname}" "$google_image" $imagelink; then
            echo Success!
        else
            echo Either this uses a unique filename pattern, or Amazon/Cloudfare blocked the download.
        fi
    fi
}

if [ -z "$comicname" ]; then
    echo $usage
    exit 1
else
    getMyImages "$comicname"; 
fi