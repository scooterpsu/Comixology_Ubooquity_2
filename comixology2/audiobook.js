var links = [];
var audio = document.getElementById("audio");
var time = document.getElementById("time");
var seekbar = document.getElementById('seekbar');
var audioFiles = [/\.mp3$/, /\.m4a$/, /\.m4b$/];
var imgNames = ["folder.jpg", "folder.png", "cover.jpg", "cover.png", "album art.jpg", "album art.png"];

//hide audio file extensions
function cleanFileLinks(){
	for (var i=0; i < document.links.length; i++){
		for (var j=0; j < audioFiles.length; j++){
			if (audioFiles[j].test(document.links[i].text)){
				document.links[i].text = document.links[i].text.substring(0, document.links[i].text.length-4);
				break;
			}
		}
	}
}

//check if page contains audio files
function checkAudio(){
	cleanFileLinks();
	var count = 0;
	for (var i=0; i < document.links.length; i++){
		for (var j=0; j < audioFiles.length; j++){
			if (audioFiles[j].test(document.links[i].href)){
				count++;
				links.push([document.links[i].href, document.links[i].text]);
				break;
			}
		}
	}
	if (count >= 1){
		startPlayer();
	}
}

//check if image exists
function imageExists(imageURL){
    var http = new XMLHttpRequest();
    http.open('HEAD', imageURL, false);
    http.send();
    return http.status != 404;
}

//Get external cover image
//uses the imgNames array
function getExternalCover(){
    var img = links[0][0].slice(0,links[0][0].lastIndexOf("/"));
    var imgMatch = -1;
    for(var i=0; i<imgNames.length;i++){
        if(imageExists(img+"/"+imgNames[i])){
            imgMatch = i;
            break;
        }
    }
    if(imgMatch >= 0){
        document.getElementById('ab-cover').src = img+"/"+imgNames[imgMatch];
    } else {
        document.getElementById('ab-cover').src= proxyPrefix+"/theme/folder.png";
    }
}

//Get internal cover image
function getTagCover(file){
    jsmediatags.read(file, {
        onSuccess: function(tag) {
            var tags = tag.tags;
            //console.log(tags);
            document.getElementById('ab-title').textContent = tags.album || "";
            document.getElementById('ab-artist').textContent = tags.artist || "";
            document.getElementById('ab-album').textContent = tags.album || "";
            var image = tags.picture;
            if (image) {
                var base64String = "";
                for (var i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                var base64 = "data:image/jpeg;base64," + window.btoa(base64String);
                document.getElementById('ab-cover').setAttribute('src',base64);
            }
        },
        onError: function(error) {
            console.log('tag not found', error.type, error.info);
        }
    });

}

//Get the cover image or show default image
function getCover(file){
    if(document.getElementById('ab-cover').getAttribute('src') == ""){
        if(file){
            getTagCover(file);
        }
        //if no internal look for external dummy
        if(document.getElementById('ab-cover').getAttribute('src')  == ""){
            getExternalCover();
        }
    }
}

//Add Audio Sources //generate playlist and populate sourcetag as required
function addSources(){
    var source = document.getElementById('source');
    var playlist = document.getElementById('playlist');
    
    //set player defaults
    source.src = links[0][0];
    audio.load();
    document.getElementById('ab-title').innerHTML = links[0][1];
    document.getElementById('dl').href = links[0][0];
    
    //If multi-file book load as playlist
    if (links.length > 1){
        for(var i=0;i<links.length;i++){
            var track = '<li><a id="'+i+'"onclick="document.getElementById(\'source\').src=\''+links[i][0]+'\';'
                +'document.getElementById(\'audio\').load();'
                +'document.getElementById(\'ab-title\').innerHTML=\''+links[i][1].replace(/'/g, "\\'")+'\';'
                +'document.getElementById(\'dl\').href=\''+links[i][0]+'\';'
                +'getCover(\''+links[i][0]+'\');">'
                +links[i][1].trim()+'</a></li>';
            playlist.innerHTML += track;
        }
    }else{
        document.getElementById('playlist').remove();
        document.getElementById('audioPlayer').style.marginLeft = "auto";
        document.getElementById('audioPlayer').style.marginRight = "auto";
        document.getElementById('audioPlayer').style.width = "auto";
    }
    
    //add listener for audioplayer to go to next track on end
    audio.addEventListener('ended', function(e){
        for(var j=0;j<links.length;j++){
            playPause();
            if(links[j][0] == source.src && j != links.length-1){
                document.getElementById('ab-title').innerHTML = links[j+1][1];
                document.getElementById('dl').href = links[j+1][0];
                source.src = links[j+1][0];
                audio.load();
                break;
            }
        }	
    });
}

//loads the seekbar start and stop times
function setupSeekbar(){
    seekbar.min = audio.startTime;
    seekbar.max = audio.startTime + audio.duration;
}     

//skips audio player to location on seekbar
function seekAudio(){
    audio.currentTime = seekbar.value;
}

//loads and updates the player interface as required
function updateUI(){
    //var lastBuffered = audio.buffered.end(audio.buffered.length-1);
    seekbar.min = 0;
    seekbar.max = audio.duration;
    seekbar.value = audio.currentTime;
    if(isNaN(audio.duration)){
        time.innerHTML = "00:00 / 00:00";
    } else {
        if(audio.duration/60 >= 60){
            document.getElementById("time").innerHTML = pad(Math.floor((audio.currentTime/60)/60),2)+":"+pad(Math.floor((audio.currentTime/60)%60),2)+":"+pad(Math.floor(audio.currentTime%60),2)+" / "+pad(Math.floor((audio.duration/60)/60),2)+":"+pad(Math.floor((audio.duration/60)%60),2)+":"+pad(Math.floor(audio.duration%60),2);
        } else {
            document.getElementById("time").innerHTML = pad(Math.floor(audio.currentTime/60),2)+":"+pad(Math.floor(audio.currentTime%60),2)+" / "+pad(Math.floor(audio.duration/60),2)+":"+pad(Math.floor(audio.duration%60),2);
        }
    }
}

//controls play/pause button	
function playPause(){
    if(audio.paused){
        audio.play();
        //console.log('play');
    } else {
        audio.pause();
        //console.log('paused');
    }
}

//Processing
function startPlayer(){
    //set up seekbar for audio player
    seekbar.value = 0;
    audio.ondurationchange = setupSeekbar;
    seekbar.onchange = seekAudio;
    audio.ontimeupdate = updateUI;
    audio.addEventListener('durationchange', setupSeekbar);
    audio.addEventListener('timeupdate', updateUI);
    
    getCover(links[0][0]); //load cover art
    addSources(); //load playlist 
}