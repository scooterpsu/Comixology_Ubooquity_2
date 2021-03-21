/* Settings now in settings.js, so there's no need to edit this file. */

/* Saving Ubooquity preferences to sessionStorage. */
if(sessionStorage.getItem("settings") === null){
    var currentPath = location.href;
    if(currentPath.indexOf("/comics/") != -1){
        currentPath=currentPath.split("/comics/")[0];
    }else if(currentPath.indexOf("/books/") != -1){
        currentPath=currentPath.split("/books/")[0];
    }else if(currentPath.indexOf("/files/") != -1){
        currentPath=currentPath.split("/files/")[0];
    }else if(currentPath.indexOf("/theme/") != -1){
        currentPath=currentPath.split("/theme/")[0];
    }else if(currentPath.substring(currentPath.length-1) == "/"){
        currentPath=currentPath.slice(0, -1);
    }
    sessionStorage.settings = getPage(currentPath+'/public-api/preferences');
}
var settingsJSON = JSON.parse(sessionStorage.settings);
var proxyPrefix = "";
if(settingsJSON['reverseProxyPrefix'].length > 0){
    proxyPrefix = "/"+settingsJSON['reverseProxyPrefix'];
}
var itemsPerPage = settingsJSON['comicsPaginationNumber'];

var bookmarkLocation = "Ubooquity_Bookmarks2";
var Bookmarks = [];
var cacheLocation = "Ubooquity_IDcache2";
var IDcache = {"books": [], "comics": []};

var themeVariant;
var themeVariants = ['dark-a', 'dark-b', 'dark-c'];

/* Load theme settings from settings.js. */
loadScript(proxyPrefix+"/theme/settings.js", function(){
    if(themeVariant === null){
        themeVariant='default'; 
    }
    if(typeof Storage !== "undefined"){
        if (localStorage.getItem('UbooquityThemeVariant') !== null) {
            themeVariant=localStorage.getItem('UbooquityThemeVariant');
        }else{
            localStorage.setItem('UbooquityThemeVariant', 'default'); 
        } 
    } 
});
    
/* Load JQuery and JQuery UI, then rebuild pages. */
loadScript(proxyPrefix+"/theme/js/jquery-3.3.1.min.js", function(){
    loadScript(proxyPrefix+"/theme/js/jquery-ui.min.js", function(){
        $.ajaxSetup({ cache: false });
        $('head').append('<link rel="stylesheet" href="'+proxyPrefix+'/theme/comixology.css" type="text/css" />');
        if(typeof Storage !== "undefined"){
            if (localStorage.getItem(bookmarkLocation) !== null) {
                Bookmarks=JSON.parse(localStorage.getItem(bookmarkLocation));
            }else{
                localStorage.setItem(bookmarkLocation,JSON.stringify([])); 
            }
            
            if (localStorage.getItem(cacheLocation) !== null) {
                IDcache=JSON.parse(localStorage.getItem(cacheLocation));
            }else{
                localStorage.setItem(cacheLocation,JSON.stringify({"books": [], "comics": []})); 
            }
        }
                                    
        if($('#loginform').length === 0){
            /* Homepage */             
            if(location.pathname == proxyPrefix+'/'){
                $('#group').hide(); 
                $('<div class="content_body clearfix"><div class="main_homepage_content"><a class="banner-container" href="#"><img src="'+proxyPrefix+'/theme/wideAd.jpg"></a></div><div class="homeRightCol"><div class="sidebar-image-container"><a class="sidebar-banner" href="#"><img src="'+proxyPrefix+'/theme/squareAd.jpg"></a></div><div class="standard_section"><div class="standard_section_header"><h3>Quick Links</h3></div><ul id="quickLinksUl" class="sidebar-list"></ul></div></div></div>').prependTo('body');
                if(settingsJSON['isComicsProviderEnabled']){
                    $('#latest-comics').insertBefore('#comics');
                    $(makeSliderList('newComics','Latest Comics',proxyPrefix+'/comics/?latest=true')).css("zIndex",5).appendTo('.main_homepage_content');
                    if(storyArcID){ 
                        $('<a href="'+proxyPrefix+'/comics/'+storyArcID+'/" id="story-arcs">Story Arcs</a>').insertAfter('#comics');
                    }
                    $('<div>').load(proxyPrefix+'/comics/?latest=true'+" #group", function(){
                        $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#newComics .list-content');
                        if($('#newComics .cellcontainer').length){
                            initializeControls('newComics');
                            homepageWrap('newComics');
                        }else{
                            $('#newComics').remove();
                        }
                        if(showRandom){
                            $('<div>').load(proxyPrefix+'/comics/?random=true'+" #group", function(){
                                $(makeSliderList('randomComics','Random Comics',proxyPrefix+'/comics/?random=true')).css("zIndex",4).insertAfter('#newComics');
                                $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#randomComics .list-content');
                                if($('#randomComics .cellcontainer').length){
                                    initializeControls('randomComics');
                                    homepageWrap('randomComics');
                                }else{
                                    $('#randomComics').remove();
                                }
                            });
                        }
                    });
                    $('<div class="popupmenu" id="comicdetails"></div>').insertAfter('#group');
                }
                if(settingsJSON['isBooksProviderEnabled']){
                    $('#latest-books').insertBefore('#books');
                    $(makeSliderList('newBooks','Latest Books',proxyPrefix+'/books/?latest=true')).css("zIndex",3).appendTo('.main_homepage_content');
                    if(seriesID){ 
                        $('<a href="'+proxyPrefix+'/books/'+seriesID+'/" id="story-arcs">Series</a>').insertAfter('#books');
                    }
                    $('<div>').load(proxyPrefix+'/books/?latest=true'+" #group", function(){
                        $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#newBooks .list-content');
                        if($('#newBooks .cellcontainer').length){
                            initializeControls('newBooks');
                            homepageWrap('newBooks');
                        }else{
                            $('#newBooks').remove();
                        }
                        if(showRandom){
                            $(makeSliderList('randomBooks','Random Books',proxyPrefix+'/books/?random=true')).css("zIndex",2).insertAfter('#newBooks');
                            $('<div>').load(proxyPrefix+'/books/?random=true'+" #group", function(){
                                $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#randomBooks .list-content');
                                if($('#randomBooks .cellcontainer').length){
                                    initializeControls('randomBooks');
                                    homepageWrap('randomBooks');
                                }else{
                                    $('#randomBooks').remove();
                                }
                            });
                        }
                    });
                    $('<div class="popupmenu" id="bookdetails"></div>').insertAfter('#group');
                }
                if((Bookmarks.length > 0)&&(Bookmarks != undefined)){
                    $(makeSliderList('bookmarks','Bookmarks',proxyPrefix+'/theme/mybooks.htm')).css("zIndex",1).appendTo('.main_homepage_content');
                    if(Bookmarks.length < homepageIssues){
                        var bookmarkLimit = Bookmarks.length;
                    }else{
                        var bookmarkLimit = homepageIssues;
                    }
                    for (i = 0; i < bookmarkLimit; i++) {            
                        buildElement(Bookmarks[i][0],Bookmarks[i][1],Bookmarks[i][2],Bookmarks[i][3], i+1, '#bookmarks .list-content');
                    }
                    initializeControls('bookmarks');
                    homepageWrap('bookmarks');
                }
                if((settingsJSON['isFilesProviderEnabled'])&&(audiobookShare)){
                    $('<a href="'+proxyPrefix+'/files/'+audiobookShare+'/" id="audiobooks">Audiobooks</a>').insertBefore('#files');
                }
                $("#group a").each(function(){
                    $(this).wrap('<li>');
                    $(this).parent().appendTo('#quickLinksUl');
                });
                $('<div id="dimoverlay"></div>').insertAfter('#group');
                
            /*< Books or Comics module >*/   
            }else if(location.pathname.startsWith(proxyPrefix+'/comics/')||location.pathname.startsWith(proxyPrefix+'/books/')){   
            
                /* Get module and book ID */
                var locationParts = location.pathname.split('/');
                var baseType;
                if(location.pathname.startsWith(proxyPrefix+'/comics/')){
                    baseType = "comics";
                }else if(location.pathname.startsWith(proxyPrefix+'/books/')){
                    baseType = "books";
                }
                var myID = 0;
                
                /* If multiple base shares exist / No folders (Grouping: None) */
                if((location.pathname== proxyPrefix+'/comics/')||(location.pathname== proxyPrefix+'/books/')){
                    $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">'+baseType.charAt(0).toUpperCase()+baseType.slice(1)+'</a> &gt; <h2 class="hinline"></h2></div></div>').insertBefore('#group');
                    if($('.rootlink').length){
                        var rootLinks = $('.rootlink');
                        for (i = 0; i < rootLinks.length; i++) {            
                            buildElement(rootLinks[i].href,'',rootLinks[i].href+'?cover=true',rootLinks[i].text, i+1, '#group');
                        }
                        $('.rootlink, br').remove();
                    }else if($('.cellcontainer').length){
                        if(location.search == ""){
                            $('.hinline').text('All '+baseType.charAt(0).toUpperCase()+baseType.slice(1));
                        }else if(location.search == "?random=true"){
                            $('.hinline').text('Random '+baseType.charAt(0).toUpperCase()+baseType.slice(1));
                        }else if(location.search == "?latest=true"){
                            $('.hinline').text('Latest '+baseType.charAt(0).toUpperCase()+baseType.slice(1));
                        }else if(location.search.startsWith('?search')){
                            if($('.searcharrowform').length !== 0){
                                $('.hinline').text('Search for "'+$('.searcharrowform input').attr('value')+'"');
                            }else{
                                $('.hinline').text('Search Results');    
                            }
                            $('#group').addClass('searchPage');
                        }
                        containerWrap();
                    }
                }else{
                    myID = locationParts[locationParts.indexOf(baseType)+1];
                }
           
                /*< Only Comics module >*/
                if(location.pathname.startsWith(proxyPrefix+'/comics/')){
 
                    /* Publisher page */
                    if(myID==comicsBaseID){
                        $('#folderinfo').remove();
                        $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Comics</a> &gt; <h2 class="hinline">Publishers</h2></div>').insertBefore('#group');
                        $('<img id="publishers" src="'+proxyPrefix+'/theme/publishers.jpg">').insertBefore('#group');
                        $('#group').addClass('scriptPage');
                        containerWrap();
                        if(featuredPublishers){
                            $('<div id="featured"><header><div class="header-row"><div class="list-title-container"><h3 class="list-title">Featured</h3></div><ul class="list-actions no-list-actions"></ul></div></header></div>').insertBefore('#group');
                            for (i = 0; i < featuredPublishers.length; i++) {    
                                addFeatured(featuredPublishers[i], 0);
                            }
                        } 
                        if(storyArcID){
                            hideStoryArcs();
                        }
                    }
                    
                    /* Story Arc pages */
                    if(storyArcID){
                        if(myID==storyArcID){
                            $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Comics</a> &gt; <h2 class="hinline">Story Arcs</h2></div>').insertBefore('#group');
                            $('<img id="publishers" src="'+proxyPrefix+'/theme/storyarc.jpg">').insertBefore('#group');
                            $('#group').addClass('scriptPage');
                            containerWrap('arc');
                        }     
                    }
                /*< Only Comics module >*/
                /*< Only Books module >*/
                }else if(location.pathname.startsWith(proxyPrefix+'/books/')){
                    
                    /* Authors page */
                    if(myID==booksBaseID){
                        $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Books</a> &gt; <h2 class="hinline">Authors</h2></div>').insertBefore('#group');
                        $('<img id="publishers" src="'+proxyPrefix+'/theme/authors.jpg">').insertBefore('#group');
                        $('#group').addClass('scriptPage');
                        containerWrap();
                        if(seriesID){
                            hideSeries();
                        }
                    } 
                    
                    /* Series pages */
                    if(seriesID){
                        if(myID==seriesID){
                            $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Books</a> &gt; <h2 class="hinline">Series</h2></div>').insertBefore('#group');
                            $('<img id="publishers" src="'+proxyPrefix+'/theme/series.jpg">').insertBefore('#group');
                            $('#group').addClass('scriptPage');
                            containerWrap('arc');
                        }
                    }
                
                }
                /*</ Only Books module >*/
                
                /* Add header to #group. */
                if((!$('#group header').length)&&(!$('#folderinfo').length)){
                        $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                }                
                if(baseType=="comics" && myID==comicsBaseID){
                    if(featuredPublishers){
                        $('#group .list-title').text("All Publishers");
                    }else{
                        $('#group .list-title').text("Publishers");
                    }
                }else if(baseType=="books" && myID==booksBaseID){ 
                    $('#group .list-title').text("Authors");
                }else if(location.search.startsWith('?search')){
                    if($('#series, #storyarc').length){
                        if(baseType=='comics'){
                            $('#group .list-title').text("Single Issues");
                        }else if(baseType=='books'){
                            $('#group .list-title').text("Books");
                        }
                    }
                }else if($(".thumb a:not([href='#'])").length == 0){
                    if((baseType=="comics")&&(myID != 0)){
                        $('#group .list-title').text("Issues");
                    }
                }
                
                /* Copy #folderinfo to pages 2+. */
                if((location.search.indexOf("?index=") != -1)&&(location.search.indexOf("?index=0") == -1)&&(location.search.indexOf("search") == -1)&&(myID != 0)){
                    $('<div>').load(location.pathname+" #folderinfo", function(){
                        var type;
                        if($(this).find('#folderinfo').length > 0){
                            $('#cmx_breadcrumb').remove();
                            $(this).find('#folderinfo').prependTo('#group');
                            if($('#folderinfo #cover').length){
                                $('#publisher, #publisher2').attr('href',$('#arrowup').attr('href'));
                                if($('#folderinfo #publisher2').length){
                                    $("#group").addClass("seriesPage");
                                }else{
                                    $("#group").addClass("arcPage");
                                    type="arc";
                                }
                            }else{
                                $("#group").addClass("publisherPage");
                            }
                        }
                        containerWrap(type);
                        if($('#group header').length){
                            $('#group').prepend($('#group header'));
                        }
                    });
                }
                
                /* If no folder-info, check for series.json */
                if((!$('#group #folderinfo').length)&&($('.cellcontainer').length)&&(settingsJSON['enableFolderMetadataDisplay'])&&!($('#group').hasClass('scriptPage'))&&(myID != 0)){
                    $.ajax({
                        url:'?folderinfo=series.json',
                        type:'GET',
                        error: function(jqXHR, exception){
                            if(jqXHR.status == 404) {
                                console.log('The above 404 just means there is no series.json for this page, it can be ignored. - ScooterPSU');
                            }else if(jqXHR.status == 500) {
                                // Figure out better solution for 500's (disable series.json on root links?)
                            }else{
                                console.error('There is something wrong in the JSON formatting of this series.json. Probably an unescaped quote or special character.');
                            }
                        },
                        success: function(data, textStatus, xhr){
                            if(data.metadata != undefined){ 
                                var type = data.metadata[0].type;
                                $('<div class="headerSection"></div>').insertBefore($('#group'));
                                if(type=="comicSeries"){
                                    $('#group').addClass('seriesPage');
                                    containerWrap();
                                }else if(type=="comicArc"){
                                    $('#group').addClass('arcPage');   
                                    containerWrap('arc');         
                                    if(useSimpleArcTemplate){
                                        type = "comicArcSimple";
                                    }
								}else if(type=="comicChar"){
									$('#group').addClass('seriesPage');
									containerWrap();
                                }
                                $('#group').addClass('scriptPage');
                                $('<div>').load(proxyPrefix+'/theme/templates/'+type+'.html', function(){
                                    $(".headerSection").html($(this).contents().contents());
                                    $('#cover').attr('src','?folderinfo=folder.jpg');
                                    $('#publisher, #publisher2').attr('href', $('#arrowup').attr('href'));
									if(type=="comicChar"){
										 if(comicCharHeader === null){
        								 	comicCharHeader=false; 
    									 }
										 if(comicCharHeader){
										 	$('<div align="center"><img id="charHeaderImg" width="1100" height="258"></div>').insertBefore($('.headerSection'));
										 	$('#charHeaderImg').attr('src', '?folderinfo=header.jpg');
										 }else{
											$(".headerSection").css('background-image','url(?folderinfo=header.jpg)');
											$(".headerSection").addClass('embeddedHeader');
											$(".social-links").css('cssText','background-color: rgba(0,0,0,.4) !important');
										 }
										 $('#group .list-title').text("Series");
									}
                                    $('#pubImg').attr('src', $('#arrowup').attr('href')+'?folderinfo=folder.jpg');
									$('#pubImg').on("error", function(){
										var pub = data.metadata[0].publisher;
										$(this).attr('src', '/theme/publishers/'+pub+'.jpg');
										$(this).on("error", function(){
											$(this).attr('src', proxyPrefix+'/theme/folder.png');
										});
									});
                                    $('#cover').on("error", function(){
                                        $(this).attr('src', proxyPrefix+'/theme/folder.png');
                                    });
                                    getSeriesJson('?folderinfo=series.json');
                                    if($('.publisherContainer').length){
                                        $(document).ajaxStop(function(){
                                            var curloc = 2
                                            if ($('#cmx_breadcrumb a').length > 0){
                                                var curloc = $('#cmx_breadcrumb a').length - 1;
                                            }
                                            var publisher = $('#cmx_breadcrumb a:eq('+curloc+')').text();
                                            publisher = publisher.replace('_', '');
                                            $('.publisher').text(publisher);
                                            $('#pubImg').attr('title',publisher);
                                        })
                                    }
                                });
                            }
							if(data.oneshots != undefined){ 
								if(!$('#oneshots').length){
									$('<div id="oneshots" style="display: none;"><header><div class="header-row"><div class="list-title-container"><h3 class="list-title">One-Shots</h3></div><ul class="list-actions no-list-actions"></ul></div></header></div>').insertAfter($('#group'));
									
								}
								for (i = 0; i < data.oneshots.length; i++) {
									$(".cellcontainer:has(.label:contains('"+data.oneshots[i].replace(/'/g,'\\\'')+"'))").appendTo($('#oneshots'));
								}
								if($('#oneshots .cellcontainer').length){
									$('#oneshots').show();
								}
							}
                        }
                    });
                }
                               
                /* Story Arc/Series page with json.cbr/json.epub */
                if($('.cellcontainer .label:contains("json")').length||(!($('.cellcontainer').length)&&location.search.startsWith('?index'))){
                    if(location.href.indexOf("/comics/") != -1){
                        type = 'comic';
                    }else if(location.href.indexOf("/books/") != -1){
                        type = 'book';
                    }
                    arcRunner(type);                    
                } 
                
                /* Series Pages and Publisher Pages */ 	
                if(!($('#group').hasClass('wrapped'))){
                    if(($('#group').hasClass('seriesPage'))||($('#group').hasClass('publisherPage'))){	
                        containerWrap();	
                    }else if($('#group').hasClass('arcPage')){
                        containerWrap('arc');	
                    }
                }
            /*</ Books or Comics module >*/
            /*< Files and Audiobooks module >*/
            }else if(location.pathname.startsWith(proxyPrefix+'/files/')){
                $('body').contents().wrapAll($('<div>', {
                    id: 'group'
                })); 
                if((location.href.indexOf("/"+audiobookShare+"/") != -1)&&(audiobookShare)){
                    $('#cmx_breadcrumb a:eq(0)').text('Audiobooks');
                    $('#group a').first().remove();
                    if(location.pathname== proxyPrefix+'/files/'+audiobookShare+'/'){
                        $('<img id="publishers" src="'+proxyPrefix+'/theme/audiobooks.jpg">').insertBefore('#group');
                        $('#group').addClass('scriptPage');
                    }else{
                        $('<div>').load("folder-info.html", function( response, status, xhr ) {
                            if (status != "error") {
                                $('#group').prepend('<div id="folderinfo"></div>');
                                $('#folderinfo').html($(this));
                                $('#group #folderinfo').append($('#cmx_breadcrumb'));
                            }else{
                                console.log('The above 404 just means there is no folder-info.html for this page, it can be ignored. - ScooterPSU');
                            }
                        });
                    }
                    if(($('#group a[href$=".mp3"]').length == 0)&&($('#group a[href$=".m4a"]').length == 0)&&($('#group a[href$=".m4b"]').length == 0)){
                        var rootLinks = $('#group a[href$="/"]');
                        for (i = 0; i < rootLinks.length; i++) {            
                            buildElement(rootLinks[i].href,'',rootLinks[i].href+'folder.jpg',rootLinks[i].text.replace('/', ''), i+1, '#group');
                        }
                        $('.thumb a img').on("error", function(){
                            $(this).attr('src', proxyPrefix+'/theme/folder.png');
                        });
                    }else{
                        $('<div>').load(proxyPrefix+"/theme/templates/player.html #audiobooks", function(){
                            loadScript(proxyPrefix+"/theme/audiobook.js", function(){
                            loadScript(proxyPrefix+"/theme/js/jsmediatags.min.js", function(){
                                $('#audioPlayer .controlButton').show();
                                $('#group').addClass('audiobook');
                                checkAudio();
                                if(!autoPlayAudiobooks){
                                    audio.pause();
                                }
                                if($('#playlist li').length < 22){
                                    var addNum = 22 - $('#playlist li').length;
                                    for (i = 0; i < addNum; i++) {
                                        $('<li></li>').appendTo($('#playlist'));
                                    }
                                }
                            });
                            });
                            $('head').append('<link rel="stylesheet" type="text/css" href="'+proxyPrefix+'/theme/player.css">');
                            $("#group").append($(this).contents().contents());
                        })

                    }
                }else{
                    $('#group').addClass('filePage');
                    $('#group a').each(function(){
                        $(this).wrap('<div class="icon"></div>');
                        $(this).parent().appendTo('#group');
                        if($(this).attr('href').match("/$")){
                            $(this).text($(this).text().replace('/', ''));
                            $(this).prepend('<img class="folder">');
                        }else if($(this).attr('href').match(".cbz$")||$(this).attr('href').match(".cbr$")){
                            $(this).prepend('<img class="cbz">'); 
                        }else if($(this).attr('href').match(".png$")||$(this).attr('href').match(".jpg$")||$(this).attr('href').match(".gif$")){
                            $(this).prepend('<img src="'+$(this).attr('href')+'">'); 
                        }else if($(this).attr('href').match(".htm$")||$(this).attr('href').match(".html$")||$(this).attr('href').match(".css$")){
                            $(this).prepend('<img class="htm">'); 
                        }else if($(this).attr('href').match(".pdf$")){
                            $(this).prepend('<img class="pdf">'); 
                        }else if($(this).attr('href').match(".epub$")){
                            $(this).prepend('<img class="epub">'); 
                        }else if($(this).attr('href').match("cvinfo$")){
                            $(this).prepend('<img class="cvinfo">'); 
                        }else{
                            $(this).prepend('<img class="genericFile">');               
                        }
                    });
                    $('#group a img').first().removeClass().addClass('openFolder');
                    if(audiobookShare){
                        $('a[href="'+proxyPrefix+'/files/'+audiobookShare+'/"]').parent().remove();
                    }
                }
                $('#group br').remove();
             
            /*</ Files and Audiobooks module >*/    
            }            

        }else{
            /* Add Register link to login form. */
            if(registerLink){
                $('body').prepend('<a href="'+proxyPrefix+'/theme/register.htm" id="registerLink">Register</a>');
            }
        }   
        
        /*< All page functions >*/
        /* Add breadcrumb navigation. */
        if(($('#cmx_breadcrumb').length === 0)&&((location.pathname != proxyPrefix+'/')||($('#loginform').length == 1))&&!($('body').hasClass('noBreadcrumb'))){ 
            $("body").prepend('<div class="breadcrumb" id="cmx_breadcrumb"><a href="/">Home</a> &gt; <h2 class="hinline"></h2></div>');    
            if($('#loginform').length == 0){
                if(location.href.indexOf("/files/") != -1){
                    var pathSplit;
                    if((location.href.indexOf("/files/"+audiobookShare+"/") != -1)&&(audiobookShare)){
                        $('#cmx_breadcrumb a').text('Audiobooks');
                        $('#cmx_breadcrumb a').attr('href', '/files/'+audiobookShare+'/');
                        pathSplit = '/files/'+audiobookShare+'/';
                    }else{
                        $('#cmx_breadcrumb a').text('File Browser');
                        $('#cmx_breadcrumb a').attr('href', '/files/');
                        pathSplit = '/files/';
                    }                        
                    var pathname = location.pathname.split(pathSplit)[1];
                    var folders = decodeURIComponent(pathname).slice(0,-1).split('/');
                    var hinlineText = folders.pop();
                    var pathFolders = "";
                    for (i = 0; i < folders.length; i++) {
                        pathFolders += encodeURIComponent(folders[i]) + "/";
                        $('.breadcrumb a:last-of-type').after(' > <a href="'+proxyPrefix+pathSplit+pathFolders+'">'+folders[i]+'</a> ');
                    }
                    $('.hinline').text(hinlineText); 
                }else if(location.href.indexOf("/books/") != -1){
                    $('#cmx_breadcrumb a:eq(0)').text('Books');                        
                    $('#cmx_breadcrumb a:eq(0)').attr('href', '/books/');
                    buildBreadcrumb(location.pathname);
					if($('#cmx_breadcrumb').find('a[href*="'+seriesID+'"]').length){
						containerWrap('arc');
					}else{
						containerWrap();
					}
                }else if(location.href.indexOf("/comics/") != -1){
                    $('#cmx_breadcrumb a:eq(0)').text('Comics');                        
                    $('#cmx_breadcrumb a:eq(0)').attr('href', '/comics/');
                    buildBreadcrumb(location.pathname);
					if($('#cmx_breadcrumb').find('a[href*="'+storyArcID+'"]').length){
						containerWrap('arc');
					}else{
						containerWrap();
					}
                }                 
            }else{
                $('.hinline').text('Log In');
                clearUsername();
            }
            fixPaths('#cmx_breadcrumb a','href');
        }
        
        /* Add and update navigation header. */
        if($('.top-navigation').length === 0){
            $('<div>').load(proxyPrefix+"/theme/templates/header.html #header", function(){
                $("body").prepend($(this).contents());  
                $(".dropdown").mouseover(function(){
                    $(this).parent().find("ul").show('blind', 50);
                });
                if(settingsJSON['isUserManagementEnabled']){
                    if(sessionStorage.getItem("username") === null){
                        $('<div>').load(proxyPrefix+"/index.html #userinfo", function(){
                            var connectedString = $(this).text();
                            if(connectedString.indexOf('Connected') == -1){  
                                $('#menuitem_login ul,.books,.booksOnly,.comics,.comicsOnly,.both,.files,#menuitem_browse,#searchForm').remove();
                                $('.topright-menu').remove();
                            }else{
                                sessionStorage.username = connectedString.split("-")[0].split("Connected as ")[1].trim();
                                $('#username').text(sessionStorage.username);
                            }
                        });
                    }else{
                        $('#username').text(sessionStorage.username);
                    }
                }else{
                    $('#menuitem_login ul li:eq(1)').remove();
                    if(!($('#loginform').length)){
                        $('#username').text(defaultUsername);
                    }
                }
                if(!comicsBaseID){
                    $('#submenuitem_browse_publisherLink').text('Comics');
                }
                if(!settingsJSON['isComicsProviderEnabled']){
                    $('#menuitem_new_comics').remove();
                    $('#menuitem_new').remove();
                    $('#submenuitem_browse_publisher').remove();
                    $('#submenuitem_browse_storyArc').remove();
                    $('#submenuitem_browse_randomComicsOnly').remove();
                    $('#submenuitem_browse_randomBooks').remove();
                    $('#submenuitem_browse_randomComics').remove();
                }
                if(!booksBaseID){
                    $('#submenuitem_browse_authorsLink').text('Books');
                }
                if(!settingsJSON['isBooksProviderEnabled']){
                    $('#menuitem_new_books').remove();
                    $('#menuitem_new').remove();
                    $('#submenuitem_browse_authors').remove();
                    $('#submenuitem_browse_series').remove();
                    $('#submenuitem_browse_randomBooksOnly').remove();
                    $('#submenuitem_browse_randomBooks').remove();
                    $('#submenuitem_browse_randomComics').remove();
                }
                if((settingsJSON['isBooksProviderEnabled'])&&(settingsJSON['isComicsProviderEnabled'])){
                    $('#menuitem_new_books').remove();
                    $('#menuitem_new_comics').remove();
                    $('#submenuitem_browse_randomBooksOnly').remove();
                    $('#submenuitem_browse_randomComicsOnly').remove();
                }
                if((!settingsJSON['isBooksProviderEnabled'])&&(!settingsJSON['isComicsProviderEnabled'])){
                    $('#menuitem_browse').remove();
                    $('#searchForm').remove();
                }
                if(!settingsJSON['isFilesProviderEnabled']){
                    $('#menuitem_files').remove();
                    $('#submenuitem_audiobooks').remove();
                }
                if(!storyArcID){
                    $('#submenuitem_browse_storyArc').remove();
                }else{
                    $('#submenuitem_browse_storyArcLink').attr('href','/comics/'+storyArcID+'/');                    
                }
                if(!seriesID){
                    $('#submenuitem_browse_series').remove();
                }else{
                    $('#submenuitem_browse_seriesLink').attr('href','/books/'+seriesID+'/');                    
                }
                if(!audiobookShare){
                    $('#submenuitem_audiobooks').remove();
                }else{
                    $('#submenuitem_audiobooksLink').attr('href','/files/'+audiobookShare+'/');                   
                }
                if(!settingsJSON['isOpdsProviderEnabled']){
                    $('#menuitem_mobile').remove();
                }

                fixPaths('.top-navigation a', 'href');
                if($('.main-menu a[href="'+location.pathname+location.search+'"]').length){
                    $('.main-menu a[href="'+location.pathname+location.search+'"]').closest('.main-menu > li').addClass("sel");
                }else if(($('#cmx_breadcrumb a:eq(0)').length)&&($('#cmx_breadcrumb a:eq(0)')[0].pathname != proxyPrefix+'/')&&($('.main-menu a[href$="'+$('#cmx_breadcrumb a:eq(0)')[0].pathname+'"]').length)){
                    $('.main-menu a[href$="'+$('#cmx_breadcrumb a:eq(0)')[0].pathname+'"]').closest('.main-menu > li').addClass("sel");
                }
                $('.primary_navigation_frame').fixToTop();

                $('#menuitem_home a img').attr('src', proxyPrefix+'/theme/home-light.svg')

                /* Search */
                var searchString;
                if((location.href.indexOf("/books/") != -1)&&(location.href.indexOf("/files/") == -1)){
                    searchString='/books/?search=simple';
                }else if((location.href.indexOf("/comics/") != -1)&&(location.href.indexOf("/files/") == -1)){
                    searchString='/comics/?search=true';
                }else{
                    if(defaultSearch=="books"){
                        searchString = '/books/?search=simple';
                    }else if(defaultSearch=="comics"){
                        searchString = '/comics/?search=true';
                    }    
                }
                $('#searchForm').attr('action',function(){
                    return proxyPrefix + searchString;
                });
                /* Apply theme variant/conditional logo. */
                switchTheme(themeVariant);
            });              
        }
        
        /* Reorganize/move page numbers/page arrows so they're in a common element. */
        if($('.pagenumber').length > 1){
            $("#group").append('<div class="pager"></div>'); 
            $('#arrowleft10, #searchleft10').text('First');
            $('#arrowright10, #searchright10').text('Last');
            $('#arrowleft, #searchleft').text('<');
            $('#arrowright, #searchright').text('>');
            $(".pager").append($('#searchleft10').parent());
            $(".pager").append($('#searchleft').parent());
            $(".pager").append($('#arrowleft10'));
            $("#arrowleft10").attr('href', '?index=0');
            $(".pager").append($('#arrowleft'));
            $(".pager").append($('.pagenumber'));
            $('.pagenumber').hide();
            if($('.pagenumber').index($('.currentpagenumber'))==2){
                $('.pagenumber').slice(0, 5).show();
            }else if($('.pagenumber').index($('.currentpagenumber'))+1==$('.pagenumber').length){
                $('.pagenumber').slice(-5).show();
            }else{
                if($('.pagenumber').index($('.currentpagenumber')) != 0){
                    $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))-1).show();
                }else{
                    $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+4).show(); 
                }
                $('.currentpagenumber').show();
                $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+1).show();
                if($('.pagenumber').index($('.currentpagenumber')) > 1){
                    $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))-2).show();    
                }else{
                    $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+3).show();    
                }
                if($('.pagenumber').index($('.currentpagenumber'))+1 != $('.pagenumber').length){
                    $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+2).show();    
                }
                if($('.pagenumber').index($('.currentpagenumber')) == $('.pagenumber').length-2){
                    $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))-3).show();
                }
            }
            if($('.searcharrowform').length){
                $(".pagenumber:not([style*='display: none'])").each(function(){
                    if($(this).hasClass('currentpagenumber')){
                        $(this).appendTo(".pager");  
                    }else{
                        $form = $('<form class="searcharrowform" method="POST">');
                        var str=$(this)[0].href;
                        str=str.substring(str.lastIndexOf("?") + 1, str.length);
                        $form.attr('action',location.pathname+"?search="+getSearchParams('search')+"&"+str);
                        $form.append('<input type="hidden" name="searchstring" value="'+$('.searcharrowform input').attr('value')+'">');
                        $form.append('<button type="submit" class="pagenumber">'+$(this).text()+'</button>');
                        $form.appendTo(".pager");
                        $(this).remove();
                    }                
                });
                $("#searchleft10").parent().attr('action', location.pathname+"?search="+getSearchParams('search')+"&index=0");
                $("#searchright10").parent().attr('action', location.pathname+"?search="+getSearchParams('search')+"&index="+($('.pagenumber').length*itemsPerPage-itemsPerPage));
            }
            $(".pager").append($('#arrowright'));
            $(".pager").append($('#arrowright10'));
            $("#arrowright10").attr('href', '?index='+($('.pagenumber').length*itemsPerPage-itemsPerPage));
            $(".pager").append($('#searchright').parent());
            $(".pager").append($('#searchright10').parent());  
            $(".pager").append('<div class="pager-jump-container"><label>Jump to:</label><input class="pager-jump" type="text" value="'+$('.currentpagenumber').text()+'"> / '+$('.pagenumber').length+'</div>');
            $(".pager-jump").keyup(function(e) {
                if(e.which == 13){
                    if($('.pager-jump').val() <= $('.pagenumber').length){
                        if(!$('.searcharrowform').length){
                            location = location.href.split('?')[0]+"?index="+($('.pager-jump').val()*itemsPerPage-itemsPerPage);
                        }else{
                            $form = $('<form class="searcharrowform" method="POST">'); 
                            $form.attr('action',location.pathname+"?search="+getSearchParams('search')+"&index="+($('.pager-jump').val()*itemsPerPage-itemsPerPage));
                            $form.append('<input type="hidden" name="searchstring" value="'+$('.searcharrowform input').attr('value')+'">');
                            $(document.body).append($form);
                            $form.submit();
                        }
                    }
                }
            });
            $('.pager .pagenumber').addClass('pager-link');
            $('.pager .topbutton').removeClass('topbutton').addClass('pager-link');
            $(".pager").append($('<div class="pager-text">').text("Page "+$('.currentpagenumber').text()+" of "+$('.pagenumber').length));
        }
        
        /* Add html footer to all pages. */
        if($('#footer').length === 0){
            $('<div>').load(proxyPrefix+"/theme/templates/footer.html #footer", function(){
                $("body").append($(this).contents());
                if(((location.href.indexOf("/books/") != -1)||(location.href.indexOf("/comics/") != -1))&&(location.href.indexOf("/files/") == -1)&&((location.search.length==0)||(location.search=="?settings=true")||(location.href.indexOf("?index=") != -1))){
                    $("#footerSettings option[value='"+$("input[name='grouping']:checked").val()+"']").attr('selected','selected');
                    $("#footerSettings option[value='"+$("input[name='sortingCriterion']:checked").val()+"']").attr('selected','selected');
                    $("#footerSettings option[value='"+$("input[name='sortingOrder']:checked").val()+"']").attr('selected','selected');
                    $('#footerSettings').attr('action',function(){
                        if(location.href.indexOf("/comics/") != -1){
                            return proxyPrefix+'/comics/?settings=true';
                        }else if(location.href.indexOf("/books/") != -1){
                            return proxyPrefix+'/books/?settings=true';
                        }
                    });
                }else{
                    $('#footerSettings label:eq(0), #footerSettings label:eq(1)').remove();
                }
                if(location.href.indexOf("/files/") != -1){
                    $('.footer_navigation_column').eq(1).find('ul').append('<li>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></li>');
                    $('.footer_navigation_column:eq(2)').remove();
                }
                if(themeVariants.length){
                    $("#footerSettings select[name='themeSelector']").css({'display':'inline-block'});
                    $.each(themeVariants, function( index, value ) {
                        $("#footerSettings select[name='themeSelector']").append('<option value="'+value+'">'+value+'</option>') 
                    });
                    $("#footerSettings option[value='"+themeVariant+"']").attr('selected','selected');
                }else{
                    $('#footerSettings').parent().remove();
                }
            });
        }
        
        /* Remove extraneous elements. */
        $("#searchbox").remove();
        $("#poweredby").remove();  
        $("#banner").remove();
        $("body > #logoutlink").remove();
        $("body > br").remove();

        $(document).ajaxStop(function(){
            /* Copy breadcrumb text to page title. */
            var defaultTitle = "Digital Media";
            if($('#cmx_breadcrumb').length > 0){
                var category = $('#cmx_breadcrumb a:eq(0)').text();
                if (category == "Home"){ category = defaultTitle};
                if($('.hinline').text().length > 0 ){
                    document.title = $('.hinline').text() + " - "+ category +" by Ubooquity";
                }else if($('#cmx_breadcrumb').text().split(" > ").pop().length){
                    document.title = $('#cmx_breadcrumb').text().split(" > ").pop() + " - "+ category +" by Ubooquity";
                }else{
                    document.title = category +" by Ubooquity";
                }
            }else{
                document.title = defaultTitle + " by Ubooquity";
            }

            /* Run pageFunction() for pages like mobile.htm and mybooks.htm */
            if((typeof pageFunction !== 'undefined')&&($.isFunction(pageFunction))&&!($('#group').hasClass('pageFunction'))){
                $('#group').addClass('pageFunction');
                 pageFunction();
            }
                         
            /* Reader session settings */
            sessionStorage.originUrl = location.href;
            sessionStorage.loadBookmark = true;
             
             /* Hide page loading until everything is done. */
            $("body").show();
            $("html").css('background','0');
            
            /* Attach code to "Bookmark Series/Story Arc" button. */
            $('#bookmarkButton').off('click').on('click',function(){
                storeElement(location.pathname,'',location.pathname+'?cover=true',$('.seriesname').text(),true);
            });
            
            /* Remove social links from series/arc pages. */
            if(hideSocialLinks){
                $('.social-links').remove();
            }
        });
        
        /* Functions that will not load without jQuery. */
        String.prototype.unquoted = function (){return this.replace (/(^")|("$)/g, '')}
        $.fn.fixToTop = function(){
            var $window = $(window);
            return this.each(function(){
                var $this = $(this),
                //initial_top = $this.position().top;
                initial_top = 71;
                $window.on('scroll',function(event) {
                    var cur_top = $this.position().top,
                        window_scroll_amt = $window.scrollTop();
                    if(window_scroll_amt > initial_top) {
                        $this.addClass('fixToTop');
                    }else{
                        $this.removeClass('fixToTop');
                    }
                });
            });
        };
        $.urlParam = function(name){
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.href);
            if (results==null){
               return 0;
            }
            else{
               return results[1] || 0;
            }
        }
        $.expr[':'].exact = $.expr.createPseudo(function(arg) {
            return function( elem ) {
                return $(elem).text().match("^" + arg + "$");
            };
        });
        $('img.svg').each(function(){
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');
            $.get(imgURL, function(data) {
                var $svg = jQuery(data).find('svg');
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }
                $svg = $svg.removeAttr('xmlns:a');
                $img.replaceWith($svg);
            }, 'xml');
        });
        /*</ All page functions >*/
    });
});

function switchTheme(theme){
    $('body').removeClass();
    $('link[title=themeVariant]').remove();
    if(theme == undefined){
        theme = "default";
    }
    localStorage.setItem('UbooquityThemeVariant', theme);
    themeVariant = theme;
    var themePath = "";
    if((theme != "")&&(theme != "default")){ 
        themePath = 'themes/'+themeVariant+'/';
        $('body').addClass(theme);
        $('body').addClass('themed');
        $('head').append('<link rel="stylesheet" title="themeVariant" href="'+proxyPrefix+'/theme/themes/'+theme+'/'+theme+'.css" type="text/css" />');
    }
    if(settingsJSON['isComicsProviderEnabled']&&!settingsJSON['isBooksProviderEnabled']){
        $('.comixology-logo').css("background-image", "url('"+proxyPrefix+"/theme/"+themePath+"Ubooquity-logo_1_comic.png')");
    }else if(settingsJSON['isBooksProviderEnabled']&&!settingsJSON['isComicsProviderEnabled']){
        $('.comixology-logo').css("background-image", "url('"+proxyPrefix+"/theme/"+themePath+"Ubooquity-logo_1_ebook.png')");
    }else{
        $('.comixology-logo').css("background-image", "url('"+proxyPrefix+"/theme/"+themePath+"Ubooquity-logo_1_comic_ebook.png')");
    }
    /* Audiobook controls */
    $('#sb img').attr('src',proxyPrefix+'/theme/'+themePath+'filebrowser/rewind-symbol.png');
    $('#pp img').attr('src',proxyPrefix+'/theme/'+themePath+'filebrowser/pause-play-button.png');
    $('#sf img').attr('src',proxyPrefix+'/theme/'+themePath+'filebrowser/fast-forward-media-control-button.png');
    $('#dl img').attr('src',proxyPrefix+'/theme/'+themePath+'filebrowser/download-arrow.png');
    
    /* Filebrowser icons */       
    $('.filePage .openFolder').attr('src', proxyPrefix+'/theme/'+themePath+'filebrowser/black-open-folder-shape.png'); 
    $('.filePage .genericFile, .filePage .cbz, .filePage .png, .filePage .htm, .filePage .pdf, .filePage .epub, .filePage .cvinfo').attr('src', proxyPrefix+'/theme/'+themePath+'filebrowser/file-interface-symbol.png');
    $('.filePage .folder').attr('src', proxyPrefix+'/theme/'+themePath+'filebrowser/black-folder.png');
}

function fixPaths(parent, attr, extraPath){
    if(proxyPrefix != ""){
        $(parent).attr(attr,function(index,value) {
            if(extraPath){
                value = extraPath + value;
            }
            if((value != "#")&&(value.indexOf(proxyPrefix) == -1)){
                return proxyPrefix + value;
            }else{
                return value;
            }
        });
    }
}

function containerWrap(wrapType){
    if(!$('#group').hasClass('wrapped')){
        $('#group').addClass('wrapped');
        $(".cellcontainer .label").each(function(index){
            if($(this).text() == "json"){
                $(this).parent().parent().hide();
                return
            }
            if(!$(this).parent().parent().is('[id]')){
                $(this).parent().parent().attr('ID', index+1);
            }
            var fullLabel = $(this).text();
            if(!displayTitleInsteadOfFileName){
                var labelParts = parseLabel(fullLabel);
                var issueNum = labelParts[0];
                var seriesName = labelParts[1]; 
                var seriesYear = labelParts[2];
                var arcNum = labelParts[3];
            }else{
                var seriesName = fullLabel;
                var issueNum = ""; 
                var seriesYear = ""; 
                var arcNum = "";
            }
            /* Issue / Bookmark */
            if($(this).parent().find('a')[0].hasAttribute('onclick')){
                var menuBlock = '';
                var bookPath = $(this).parent().find('img').attr('src').split('?cover=true')[0];
                var readLink = parseImgPath(bookPath);
                if(readLink[1] == 'comicdetails'){
                    checkBookmarkAPI(readLink, $(this).parent().parent().attr('ID'));
                }
                if($(this).parent().find('a').attr('onclick') != ""){
                    menuBlock += '<a class="action-button read-action primary-action" href="#" onclick="readBook('+readLink[0]+', \''+proxyPrefix+'/\', \''+readLink[1]+'\')"><div class="title-container"><span class="action-title">Read</span></div></a>'
                }
                menuBlock += '<a class="action-button expand-action primary-action clickdown"><div class="icon"></div></a><ul class="dropdownmenu"><li><a href="#" '
                if(location.href.indexOf("mybooks.htm") != -1){
                    menuBlock += 'onclick="delBookmark($(this).parent().parent().parent().parent().find(\'.thumb a img\').attr(\'src\'));return false;">Remove From'
                }else{
                    menuBlock += 'onclick="storeElement($(this).parent().parent().parent().parent().find(\'.thumb a\').attr(\'href\'),$(this).parent().parent().parent().parent().find(\'.thumb a\').attr(\'onclick\'),$(this).parent().parent().parent().parent().find(\'.thumb a img\').attr(\'src\'),$(this).parent().parent().parent().parent().find(\'.label\').text(),true);return false;">Add To'   
                }
                menuBlock += ' Bookmarks</a></li>'
                if($(this).parent().find('a').attr('onclick') != ""){
                    menuBlock += '<hr class="inline-rule"><li><a href="'+bookPath+'">Download Book</a></li>'
                }
                menuBlock += '</ul>'
                $(menuBlock).insertAfter($(this));         
                if((issueNum != "")||(issueNum == "0")){
                    $('<h6 class="content-subtitle">#'+issueNum+'</h6>').insertAfter($(this));                   
                }else{
                    $('<h6 class="content-subtitle empty"></h6>').insertAfter($(this));
                }
                var titleText = seriesName;
                if(seriesYear.length){
                    titleText += ' '+seriesYear;
                }
                $('<h5 class="content-title">'+titleText+'</h5>').insertAfter($(this));
                $(this).parent().find('.content-title').prop('title',titleText);
                if((issueNum != "")||(issueNum == "0")){
                    titleText += ' #'+issueNum;
                }
                $(this).parent().find('.thumb a img').prop('title',titleText);
                $('<progress value="10" max="100" class="lv2-item-progress"></progress>').insertAfter($(this));
                /* Story Arc */
                if((arcNum != "")&&(wrapType=="arc")){
                    $(this).parent().find('.content-title').text(titleText);
                    $(this).parent().find('.content-title').prop('title',titleText);
                    $(this).parent().find('.content-subtitle').text('#'+parseFloat(arcNum));
                }
             /* Series */
            }else{
                var bookID = $(this).parent().parent().attr('ID');
                if(isNaN(fullLabel.split(' - ').pop().split(')')[0])){
                    fullLabel = fullLabel.replace(' - ', ': ');
                }
                fullLabel = fullLabel.replace('_ ', ': ');
                if(showBookCount){
                    var issueCount = parseInt($(this).parent().parent().find('.numberblock').text());
                    var bookText;
                    if(issueCount > 1){
                        bookText = "Books";
                    }else{
                        bookText = "Book";
                    }
                    $('<h6 class="content-subtitle empty">'+issueCount+' '+bookText+'</h6>').insertAfter($(this)); 
                }
                $('<h5 class="content-title label">'+fullLabel+'</h5>').insertAfter($(this));
                $(this).parent().find('.content-title').prop('title',fullLabel);
                $(this).parent().find('.thumb a img').prop('title',fullLabel);
                cacheID($(this).parent().find('.thumb a img').attr('src'), $(this).parent().find('.label:not(.content-title)').text(),location.href);
                var imgPath = $(this).parent().find('.thumb a img').attr('src');
                var imgPathParts = imgPath.split('/');
                if(imgPathParts.indexOf('comics') != -1){
                    var type = 'comics';
                    var targetID = imgPathParts[imgPathParts.indexOf('comics')+1];
                }
                 if(imgPathParts.indexOf('books') != -1){
                    var type = 'books';
                    var targetID = imgPathParts[imgPathParts.indexOf('books')+1];
                }
                if(type == 'comics'){
                    var grepResult = $.grep(IDcache[type], function(e){ return e.bookID == targetID && e.parent == storyArcID; });
                }else if (type== 'books'){
                    var grepResult = $.grep(IDcache[type], function(e){ return e.bookID == targetID && e.parent == seriesID; });                    
                }
                if(grepResult.length > 0){
                    var destination = 'storyarc';
                }else{
                    var destination = 'series';
                }
                if(location.search.startsWith('?search')){
                    if(destination == 'storyarc'){
                        if(!$('#storyarc').length){
                            $('<div id="storyarc"><header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header></div>').insertBefore('#group');
                            if(location.pathname.startsWith(proxyPrefix+'/comics/')){
                                $('#storyarc .list-title').text("Story Arcs");
                            }else if(location.pathname.startsWith(proxyPrefix+'/books/')){
                                $('#storyarc .list-title').text("Series");
                            }
                        }
                    }else if(destination == 'series'){
                        if(!$('#series').length){
                            $('<div id="series"><header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header></div>').insertBefore('#group');
                            if(type=='comics'){
                                $('#series .list-title').text("Series");
                            }else if(type=='books'){
                                $('#series .list-title').text("Authors");
                            }
                        }
                    }
                    $('#'+destination).append($('#'+bookID));
                    if(!$('#group .cellcontainer').length){
                        $('#group header').remove();
                    }
                }
            }           
            $(this).hide();         
        });
        $(".clickdown").off('click').on('click', function(){
            $(this).parent().find("ul").toggle('blind', 50);
        });
        $(".clickdown").parent().off('mouseleave').on('mouseleave', function(){
            $(this).find("ul").hide();
        });
    }
}

function checkBookmarkAPI(returnval, containerID){
    var bookID = returnval[0];
    if(returnval[1]=='comicdetails'){
        var isBook = false;
    }else{
        var isBook = true;
    }
    var markPage;
    var pageCount;
    $.ajax({
        type: "GET",
        url: proxyPrefix+"/user-api/bookmark?isBook="+isBook+"&docId="+bookID,
    }).done(function(data){
        if(data != undefined){
            if(data.mark != "0"){
                if(data.mark.indexOf('#') > -1){
                    data.mark = data.mark.split('#')[0];
                }
                markPage = +data.mark + 1;
                $('#'+containerID).find('progress').attr('value',markPage);
                $.ajax({
                    type: "GET",
                    url: proxyPrefix+"/"+returnval[1]+"/"+bookID,
                }).done(function(bookData){
                    $('<div>').html(bookData).promise().done(function (ajaxReturn){
                        var sizeReturn = $(ajaxReturn).find('#details_size')[0];
                        pageCount = $(sizeReturn).text().split(' pages')[0];
                        $('#'+containerID).find('progress').attr('max',pageCount);
                        $('#'+containerID).find('progress').attr('title', 'Page ' +markPage + ' of ' + pageCount);
                        $('#'+containerID).find('progress').css('display', 'block');
                    });
                });
            }
        }
    });
}

function cacheID(srcURL, labelText, parentURL){
    var srcParts = srcURL.split('/');
    var parentParts = parentURL.split('/');
    var type;
    var ID;
    var parentID;
    if(srcParts.indexOf('comics') != -1){
        type = "comics";
        ID = srcParts[srcParts.indexOf('comics')+1];
        parentID = parentParts[parentParts.indexOf('comics')+1];
        if(ID == comicsBaseID){
            labelText = "Publishers";
        }
        if(ID == storyArcID){
            labelText = "Story Arcs";
        }
    }
    if(srcParts.indexOf('books') != -1){
        type = "books";
        ID = srcParts[srcParts.indexOf('books')+1];
        parentID = parentParts[parentParts.indexOf('books')+1];
        if(ID == booksBaseID){
            labelText = "Authors";
        }
    }        
    var grepResult = $.grep(IDcache[type], function(e){ return e.bookID == ID; });
    if(grepResult.length > 0){
        var bookID = grepResult[0].bookID;
    }else{
        if((ID)&&(!isNaN(parentID))){
            IDcache[type].push({'bookID': ID, "label": labelText, "parent": parentID});
            localStorage.setItem(cacheLocation,JSON.stringify(IDcache));
        }
    }
}

function clearIDCache(){
    IDcache = {"books": [], "comics": []};
    localStorage.setItem(cacheLocation,JSON.stringify(IDcache));
}

/* series.json read */
function getSeriesJson(filename){
    $.get(filename, function(response) {
        if((response.metadata)&&($('.headerSection').length)){
            var seriesname = response.metadata[0].name;
            if(response.metadata[0].year){
                seriesname += " ("+response.metadata[0].year+")";
            }
            $('.seriesname').text(seriesname);
            var description = response.metadata[0].description;
            if(response.metadata[0].players){
                description +="<br><br><b>Featured Characters:</b> "+response.metadata[0].players;
            }
            $('#desc').html(description);
            $('#cover').attr('title', seriesname);
			if(response.metadata[0].type == "comicChar"){
			$('#cover').click(function(){
				 window.open("https://comicvine.gamespot.com/" + response.metadata[0].name + "/4005-" + response.metadata[0].id, "_blank");
			});
			}
            $(document).ajaxStop(function(){
                $('.hinline').text(seriesname);
            })
        }
    });
}

/* Story Arc Functions */
var arcname;
function hideStoryArcs(){
    $('a[href="'+proxyPrefix+'/comics/'+storyArcID+'/"]').parent().parent().remove();
    $('a[href="'+proxyPrefix+'/comics/'+storyArcID+'/folderCover"]').parent().parent().remove();
}
function hideSeries(){
    $('a[href="'+proxyPrefix+'/books/'+seriesID+'/"]').parent().parent().remove();
    $('a[href="'+proxyPrefix+'/books/'+seriesID+'/folderCover"]').parent().parent().remove();
}
function arcRunner(bookType){ 
    var filename;
    if(bookType == 'comic'){
        filename = 'json.cbr';
    }else if(bookType == 'book'){
        filename = 'json.epub';
    }
    $.get('?folderinfo='+filename, function(response) {
        $("div").remove(".cellcontainer");
        $('#group').removeClass('wrapped');
        var arclist = JSON.parse(response);
        $('#group').addClass('arcPage');
        if(arclist.metadata){
            arcname = arclist.metadata[0].arcname;
            if(arclist.metadata[0].year){
                arcname += " ("+arclist.metadata[0].year+")";
            }
            var description = arclist.metadata[0].description;
            if($('#folderinfo').length){
                $('.arcname').text(arcname);

                if(arclist.metadata[0].players){
                    description +="<br><br><b>Featured Characters:</b> "+arclist.metadata[0].players;
                }
                $('#desc').html(description);
                $('#cover').attr('src','?folderinfo=folder.jpg');
                    $('#cover').on("error", function(){
                        $(this).attr('src', proxyPrefix+'/theme/folder.png');
                    });
                $('#cover').attr('title', arcname);
            }else if(settingsJSON['enableFolderMetadataDisplay']){
                $('#group').addClass('scriptPage');
                $('<div class="headerSection"></div>').insertBefore($('#group'));
                if($('#group header').length){
                    $('#group').prepend($('#group header'));
                }
                var type;
                if(useSimpleArcTemplate){
                    type = "comicArcSimple";
                }else{
                    if(bookType == "book"){
                        type = "bookSeries";
                    }else if(bookType == "comic"){
                        type = "comicArc";
                    }
                }
                $('<div>').load(proxyPrefix+'/theme/templates/'+type+'.html', function(){
                    $(".headerSection").html($(this).contents().contents());
                    $('#cover').attr('src','?folderinfo=folder.jpg');
                    $('#cover').on("error", function(){
                        $(this).attr('src', proxyPrefix+'/theme/folder.png');
                    });
                    $('#cover').attr('title', arcname);
                    $('#publisher').attr('href', $('#arrowup').attr('href'));
                    $('.seriesname').text(arcname);
                    if(arclist.metadata[0].players){
                        description +="<br><br><b>Featured Characters:</b> "+arclist.metadata[0].players;
                    }
                    $('#desc').html(description);
                });                    
            }
        }
        if(arclist.Issues){
            for (i = 0; i < arclist.Issues.length; i++) {
                buildElement("#","showHidePopupMenu('"+bookType+"details','searchbox','pageselector','settingsbox');load"+bookType.charAt(0).toUpperCase() + bookType.slice(1)+"Details("+arclist.Issues[i].dbnumber+",'"+ proxyPrefix +"/');return false;",proxyPrefix +"/"+bookType+"s/"+arclist.Issues[i].dbnumber+"/"+arclist.Issues[i].comicname+"?cover=true",arclist.Issues[i].label,i,"#group");
            }
        }
        containerWrap('arc');
        if($('.cellcontainer').length > itemsPerPage){
            paginate(itemsPerPage);
        }
    });
}

/* Homepage Functions */
function makeSliderList(ID,title,link){
    var returnString = '<div id="'+ID+'" class="list-container slider-list"><header><div class="header-row"><div class="list-title-container">';
    if(link){
        returnString += '<a href="'+link+'" class="header-row-title-link">';
    }else{
        returnString += '<a href="#" onclick="return false;" class="header-row-title-link">';        
    }
    returnString += '<h3 class="list-title">'+title+'</h3></a><ul class="list-actions "><li>';
    if(link){ 
        returnString += '<a href="'+link+'" class="header-row-view-all-link">View More</a>';
    }
    returnString += '</li></ul></div></div></header><button class="slide-control slide-previous"></button><div class="list-content"></div><button class="slide-control slide-next"></button><footer><ul class="pager-links"></ul></footer></div>';
    return returnString
}
var transisitionSpeed = 300;        
function initializeControls(containerID){
    $('#'+containerID+' .slide-control, #'+containerID+' footer').hide();
    if($('#'+containerID+' .list-content .cellcontainer').length > 5){
        $('#'+containerID+' .slide-next, #'+containerID+' footer').show();
        $('#'+containerID+' .pager-links').empty();
        for (i = 0; i < ($('#'+containerID+' .list-content .cellcontainer').length/5); i++) { 
            $('#'+containerID+' .pager-links').append('<li class="pager-link"></li>');
        }
        $('#'+containerID+' .pager-link:eq(0)').addClass('selected');
        $('#'+containerID+' .slide-next').off('click').on('click',function(){
            var dotIndex = $(this).parent().find('.pager-links .selected').index()+1;
            var dotCount = $(this).parent().find('.pager-link').length-1;
            $(this).parent().find('.cellcontainer').animate({ "left": "-=760px" }, transisitionSpeed); 
            if(dotIndex==dotCount){
                $(this).parent().find('.slide-next').hide();
            }
            $(this).parent().find('.slide-previous').show();
            $(this).parent().find('.pager-link').removeClass('selected');
            $(this).parent().find('.pager-link:eq('+dotIndex+')').addClass('selected'); 
        });
        $('#'+containerID+' .slide-previous').off('click').on('click',function(){
            var dotIndex = $(this).parent().find('.pager-links .selected').index()-1;
            var dotCount = $(this).parent().find('.pager-link').length-1;
            $(this).parent().find('.cellcontainer').animate({ "left": "+=760px" }, transisitionSpeed);
            if(dotIndex==0){
                $(this).parent().find('.slide-previous').hide();
            }
            $(this).parent().find('.slide-next').show();
            $(this).parent().find('.pager-link').removeClass('selected');
            $(this).parent().find('.pager-link:eq('+dotIndex+')').addClass('selected'); 
        });    
        $('#'+containerID+' .pager-link').off('click').on('click',function(){
            var dotDifference=$(this).index()-$(this).parent().find('.selected').index();
            if(dotDifference>0){for(var i = 0; i < dotDifference; i++){
                $('#'+containerID+' .slide-next').click(); 
            }}
            if(dotDifference<0){for(var i = 0; i > dotDifference; i--){
                $('#'+containerID+' .slide-previous').click();
            }}
        });    
    }
}

function homepageWrap(containerID){
    $('#'+containerID+" .cellcontainer .label").each(function(){
        if($(this).text() == "json"){
            $(this).parent().remove();
        }
        if(!$(this).find('.content-title').length){
            var labelText = $(this).text();
            if(!$(this).find('.title').length){
                $(this).empty();
                $('<div class="title">'+labelText+'</div>').appendTo($(this));
            }
            if(!displayTitleInsteadOfFileName){
                var labelParts = parseLabel($(this).text());
                var issueNum = labelParts[0];
                var seriesName = labelParts[1]; 
                var seriesYear = labelParts[2];
                var arcNum = labelParts[3];
            }else{
                var seriesName = $(this).text();
                var issueNum = ""; 
                var seriesYear = ""; 
                var arcNum = "";
            }
            $('<h5 title="'+seriesName+' '+seriesYear+'" class="content-title">'+seriesName+' '+seriesYear+'</h5>').appendTo($(this));
            if((issueNum != "")||(issueNum == "0")){
                $('<h6 class="content-subtitle">#'+issueNum+'</h6>').appendTo($(this));
            }
            var bookPath = $(this).parent().find('img').attr('src').split('?cover=true')[0];
            var readLink = parseImgPath(bookPath);
            $('<div class="action-button-container read-button"><a class="title-container" href="#" onclick="readBook('+readLink[0]+', \''+proxyPrefix+'/\', \''+readLink[1]+'\')"><span class="action-title">Read</span></a></div>').appendTo($(this));
            $('<hr class="inline-rule">').appendTo($(this));
            if($(this).parent().parent().parent().parent().attr('ID')!="bookmarks"){
                $('<div class="title-container"><span class="action-title" onclick="storeElement($(this).parent().find(\'.thumb a\').attr(\'href\'),$(this).parent().parent().parent().find(\'.thumb a\').attr(\'onclick\'),$(this).parent().parent().parent().find(\'.thumb a img\').attr(\'src\'),$(this).parent().parent().parent().find(\'.label .title\').text(),true);rebuildBookmarks();return false;">Add To Bookmarks</span></div>').appendTo($(this));
            }else{
                $('<div class="title-container"><span class="action-title" onclick="delBookmark($(this).parent().parent().parent().find(\'.thumb a img\').attr(\'src\'));rebuildBookmarks();return false;">Remove From Bookmarks</span></div>').appendTo($(this));                
            }
            if($(this).parent().find('a').attr('onclick') != ""){
                $('<hr class="inline-rule">').appendTo($(this));
                
                $('<a class="title-container" href="'+bookPath+'"><span class="action-title">Download Book</span></a>').appendTo($(this));
            }
        }
    })
    $('.cellcontainer').off("mouseenter mouseleave").hover(function(){
        $(this).find('.label').show();
    }, function(){
        $(this).find('.label').hide();
    });       
}

function clearUsername(){
    sessionStorage.removeItem('username');
}

/* Parse container label (filename) into title, issue number and year. */
function parseLabel(labelText){
    var issueNum = "";
    var seriesYear = "";
    var arcNum = "";
    /* If a Story Arc, use prefix number. 000-Series Name 000 */
    if((labelText.split('-').length > 1)&&!(isNaN(labelText.split('-')[0]))&&(labelText.split('-')[0].length==3)){
        arcNum = labelText.split('-')[0];
        labelText = labelText.split(arcNum+"-")[1].trim();
    }
    /* Series Name 000 (XXXX) => Series Name 000 */
    if((labelText.split(' ').pop().indexOf('(') != -1)&&(labelText.split(' ').pop().indexOf(')') != -1)){
        seriesYear = labelText.split(' ').pop();
        labelText = labelText.split(seriesYear)[0].trim();
    }
    /* Series Name 000 */
    if(($.isNumeric(labelText.split(' ').pop()))||((labelText.split(' ').length > 1)&&(weirdIssueNumbers.includes(labelText.split(' ').pop())))){
        issueNum = labelText.split(' ').pop();
        labelText = labelText.split(' '+issueNum)[0];
    /* 000 - Series Name */
    }else if((labelText.split(' - ').length > 1)&&!(isNaN(labelText.split(' - ')[0]))){
        issueNum = labelText.split(' - ')[0].trim();
        labelText = labelText.split(issueNum+" - ")[1].trim();
    /* 000: Series Name */
    }else if((labelText.split(': ').length > 1)&&!(isNaN(labelText.split(': ')[0]))){
        issueNum = labelText.split(': ')[0].trim();
        labelText = labelText.split(issueNum+": ")[1].trim();
    }
    /* Remove leading zeros. */
    if(weirdIssueNumbers.includes(issueNum)){
        issueNum = issueNum.replace(/^0+/, '');
    }else if(issueNum != ""){
        issueNum = parseFloat(issueNum);
    }
    /* Series Name - Subtitle => Series Name: Subtitle */
    if(isNaN(labelText.split(' - ').pop().split(')')[0])){
        labelText = labelText.replace(' - ', ': ');
    }
    /* Series Name_ Subtitle => Series Name: Subtitle */
    labelText = labelText.replace('_ ', ': ');
    var seriesName = labelText.trim();
    return [issueNum, seriesName, seriesYear, arcNum]
}

/* Build recursive breadcrumb navigation. */
function buildBreadcrumb(pageURL,pageNum){
    var pageURLparts = pageURL.split('/');
    var type;
    var targetID;
    if(pageURLparts.indexOf('comics') != -1){
        type = 'comics';
        targetID = pageURLparts[pageURLparts.indexOf('comics')+1];
    }
     if(pageURLparts.indexOf('books') != -1){
        type = 'books';
        targetID = pageURLparts[pageURLparts.indexOf('books')+1];
    }   
    if(!targetID){
        return true;
    }
    var grepResult = $.grep(IDcache[type], function(e){ return e.bookID == targetID; });
    if(grepResult.length > 0){
        var label = grepResult[0].label;
        var parent = grepResult[0].parent;
        if(isNaN(label.split(' - ').pop().split(')')[0])){
            label = label.replace(' - ', ': ');
        }
        label = label.replace('_ ', ': ');
        if(pageURL != location.pathname){
            $('.breadcrumb a:first-of-type').after(' > <a href="'+pageURL+'">'+label+'</a> ');
            buildBreadcrumb(proxyPrefix+'/'+type+'/'+parent+'/',pageNum);
        }else{
            $('.hinline').text(label);
            if(parent){
                buildBreadcrumb(proxyPrefix+'/'+type+'/'+parent+'/',pageNum);
            }
        }
        return true;
    }
    if (pageNum === undefined) {
        pageNum = 0;
    }
    $('<div>').load(pageURL+" #arrowup", function(parentData){
        var parentURL = $(parentData).find('#arrowup').attr('href');   
        if(parentURL == proxyPrefix+'/'){
            if($('#cmx_breadcrumb a').length < 2){
                if(booksBaseID&&(pageURL == proxyPrefix+'/books/'+booksBaseID+'/')){
                    $('#cmx_breadcrumb a:first-of-type').after(' > <a href="'+proxyPrefix+'/books/'+booksBaseID+'/">Authors</a> ');
                }
                if(comicsBaseID&&(pageURL == proxyPrefix+'/comics/'+comicsBaseID+'/')){
                    $('#cmx_breadcrumb a:first-of-type').after(' > <a href="'+proxyPrefix+'/comics/'+comicsBaseID+'/">Publishers</a> ');
                }
            }
            return true;
        }
        $('<div>').load($(parentData).find('#arrowup').attr('href')+"?index="+(pageNum * itemsPerPage)+' #group', function(parentPage){
            if($(parentPage).find('a[href*="'+targetID+'"]').length){
                if(targetID == storyArcID){
                    var pageName = "Story Arcs";
                }else{
                    if($(parentPage).find('a[href*="'+targetID+'"].rootlink').length){
                        var pageName = $(parentPage).find('a[href*="'+targetID+'"].rootlink').text();   
                    }else{
                        var pageName = $(parentPage).find('a[href*="'+targetID+'"]').parent().parent().find('.label').text();
                    }
                }
                if(isNaN(pageName.split(' - ').pop().split(')')[0])){
                    pageName = pageName.replace(' - ', ': ');
                }
                pageName = pageName.replace('_ ', ': ');
                if(pageURL != location.pathname){
                    $('.breadcrumb a:first-of-type').after(' > <a href="'+pageURL+'">'+pageName+'</a> ');
                    if(parentURL != proxyPrefix+'/'){
                        buildBreadcrumb(parentURL,pageNum);
                    }
                }else{
                    $('.hinline').text(pageName);
                    buildBreadcrumb(pageURL,pageNum);
                }
                cacheID(pageURL, pageName, parentURL);
            }else{
                pageNum++;
                if(pageNum <= maxPages){
                    buildBreadcrumb(pageURL,pageNum);
                }           
            }
        });
    });
}

/* Older method links */
function addFeatured(publisher, pageNum){
    if (pageNum === undefined){
        pageNum = 0;
    }
    var grepResult = $.grep(IDcache['comics'], function(e){ return e.label == publisher && e.parent == comicsBaseID; });
    if(grepResult.length > 0){
        bookID =  grepResult[0].bookID;
        buildElement(proxyPrefix+'/comics/'+bookID+'/folderCover','null',proxyPrefix+'/comics/'+bookID+'/folderCover?cover=true',publisher,'0','#featured');
    }else{
        $('<div>').load(location.pathname+"?index="+(pageNum * itemsPerPage)+" .cellcontainer:has(.label:exact('"+publisher+"'))", function(){
            if ($(this).find('.cellcontainer').length > 0) {
                cacheID($(this).find('.cellcontainer').find('img').attr('src'),$(this).find('.cellcontainer').find('.label').text(),location.pathname);
                $(this).find('.cellcontainer').clone().appendTo( "#featured" ); 
            }else{
                pageNum++;
                if(pageNum <= maxPages){
                    addFeatured(publisher, pageNum);
                }            
            }
        });
    }
}

/* Bookmark Functions */
function storeElement(href,onclick,img,label,showalert){
    Bookmarks.push([href,onclick,img,label]);
    localStorage.setItem(bookmarkLocation,JSON.stringify(Bookmarks));
    if(bookmarkConfirm){
      alert(label+' added to bookmarks');  
    }
}

function buildElement(href,onclick,img,label,index,target){
    var $temp = $('<div>', {
        "class": 'cell'
    }).wrap($('<div>', {
        "class": 'cellcontainer',
        id: index
    }));
    $temp.append(($('<div>', {
        "class": 'thumb'
    })).append($('<a>').attr({
        href: href,
        "onclick": onclick
    }).append($('<img>').attr({
        src: img
    }))));
    $temp.append($('<div>', {
        "class": 'label',
        text: label
    }));
    $temp.parent().appendTo(target);
}

function rebuildBookmarks(){
    if(location.href.indexOf("mybooks.htm") != -1){
        $( ".cellcontainer" ).remove();
        for (i = 0; i < Bookmarks.length; i++) {            
            buildElement(Bookmarks[i][0],Bookmarks[i][1],Bookmarks[i][2],Bookmarks[i][3], i+1, '#group');
        }
        $('#group').sortable({
            items: ".cellcontainer",
            containment: "document",
            placeholder: "sortable-placeholder",
            activate: function ( event, ui ) {
                $('.sortable-placeholder').width(ui.item[0].clientWidth-10);
            },
            stop: function( event, ui ) {
                resaveBookmarks();
            }
        });
        $('#group').removeClass('wrapped');
        containerWrap();
        if(Bookmarks.length){
            $('.list-count').text(Bookmarks.length + ' Books');
        }
        var bookmarksPerPage = 15;
        $('.pager').remove();
        if($('.cellcontainer').length > bookmarksPerPage){
            paginate(bookmarksPerPage);
        }
    }else{
        if((Bookmarks.length > 0)&&(Bookmarks != undefined)){
            if(!$('#bookmarks').length){
                $(makeSliderList('bookmarks','Bookmarks',proxyPrefix+'/theme/mybooks.htm')).css("zIndex",1).appendTo('.main_homepage_content');
            }
            $( "#bookmarks .cellcontainer" ).remove();
            if(Bookmarks.length < homepageIssues){
                var bookmarkLimit = Bookmarks.length;
            }else{
                var bookmarkLimit = homepageIssues;
            }
            for (i = 0; i < bookmarkLimit; i++) {            
                buildElement(Bookmarks[i][0],Bookmarks[i][1],Bookmarks[i][2],Bookmarks[i][3], i+1, '#bookmarks .list-content');
            }
            initializeControls('bookmarks');
            homepageWrap('bookmarks');
        }else{
            $('#bookmarks').remove();
        } 
    }
}

function paginate(thingsPerPage){
    var startIndex = $.urlParam('index');
    var currentPage = (startIndex / thingsPerPage) + 1;
    var pageCount = Math.ceil($('.cellcontainer').length / thingsPerPage);
    $('#group').append('<div class="pager"><a href="?index=0" id="arrowleft10" class="hidden pager-link">First</a><a href="?index='+(startIndex - thingsPerPage)+'" id="arrowleft" class="pager-link">&lt;</a><a href="?index='+(+startIndex + +thingsPerPage)+'" id="arrowright" class=" pager-link">&gt;</a><a href="?index='+((pageCount - 1) * thingsPerPage)+'" id="arrowright10" class="hidden pager-link">Last</a><div class="pager-jump-container"><label>Jump to:</label><input class="pager-jump" type="text" value="'+currentPage+'"> / '+pageCount+'</div><div class="pager-text">Page '+currentPage+' of '+pageCount+'</div></div>');
    for (i = 0; i < pageCount; i++) {
        if((i+1) == currentPage){
            $('<div class="pagenumber currentpagenumber pager-link" style="">'+(i+1)+'</div>').insertBefore($('.pager #arrowright'));
        }else{
            $('<a href="?index='+(i*thingsPerPage)+'" class="pagenumber pager-link">'+(i+1)+'</a>').insertBefore($('.pager #arrowright'));
        }
    }
    if(currentPage == 1){
        $('.pager #arrowleft').addClass('hidden');
    }
    if(currentPage == pageCount){
        $('.pager #arrowright').addClass('hidden');
    }
    if(currentPage > 2){
        $('.pager #arrowleft10').removeClass('hidden');
    }
    if((pageCount > 2)&&(currentPage != pageCount)){
        $('.pager #arrowright10').removeClass('hidden');
    }
    $('.pagenumber').hide();
    if($('.pagenumber').index($('.currentpagenumber'))==2){
        $('.pagenumber').slice(0, 5).show();
    }else if($('.pagenumber').index($('.currentpagenumber'))+1==$('.pagenumber').length){
        $('.pagenumber').slice(-5).show();
    }else{
        if($('.pagenumber').index($('.currentpagenumber')) != 0){
            $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))-1).show();
        }else{
            $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+4).show(); 
        }
        $('.currentpagenumber').show();
        $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+1).show();
        if($('.pagenumber').index($('.currentpagenumber')) > 1){
            $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))-2).show();    
        }else{
            $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+3).show();    
        }
        if($('.pagenumber').index($('.currentpagenumber'))+1 != $('.pagenumber').length){
            $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))+2).show();    
        }
        if($('.pagenumber').index($('.currentpagenumber')) == $('.pagenumber').length-2){
            $('.pagenumber').eq($('.pagenumber').index($('.currentpagenumber'))-3).show();
        }
    }
    $(".pager-jump").keyup(function(e) {
        if(e.which == 13){
            if($('.pager-jump').val() <= pageCount){
                location = location.href.split('?')[0]+"?index="+($('.pager-jump').val()*thingsPerPage-thingsPerPage);
            }
        }
    });
    $('.cellcontainer').hide();
    $('.cellcontainer').each(function(index,element){
        if((index >= startIndex)&&(index < (+startIndex + +thingsPerPage))){
            $(this).show();
        }
    });
}

function resaveBookmarks(){
    Bookmarks = [];
    localStorage.setItem(bookmarkLocation,JSON.stringify([]));  
    $('#group .cellcontainer').each(function (){
        storeElement($(this).find(".thumb a").attr("href"),$(this).find(".thumb a").attr("onclick"),$(this).find(".thumb a img").attr("src"),$(this).find(".label").text(),false);
    });
}

function delBookmark(url){
    for(var i = 0; i < Bookmarks.length; i++){
       if(Bookmarks[i][2] === url) {
         Bookmarks.splice(i,1);
         localStorage.setItem(bookmarkLocation,JSON.stringify(Bookmarks));
         rebuildBookmarks();
       }
    }
}

function exportBookmarks(){
    var csvContent = "data:text/csv;charset=utf-8,";
    Bookmarks.forEach(function(infoArray, index){
        dataString = '"'+infoArray.join('","')+'"';
        csvContent += index < Bookmarks.length-1 ? dataString+ "\n" : dataString;
    }); 
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookmark_export.csv");
    link.click();
}

function exportBookmarksJSON(){
    var Issues = []
    Bookmarks.forEach(function(infoArray, index){
        if(infoArray[2].split('/').pop().split('?')[0].indexOf('.') != -1){
            Issues.push({ "label" : pad(index+1, 3)+"-"+infoArray[3], "dbnumber": infoArray[2].split('/')[infoArray[2].split('/').length-2], "comicname": infoArray[2].split('/').pop().split('?')[0]});
        }
    }); 
    var outerObject = new Object();
    outerObject.metadata = [{"arcname":"Bookmarks", "year": new Date().getFullYear(), "description":"Assorted exported bookmarks.", "players":""}]
    outerObject.Issues = Issues;
    var blob = new Blob([JSON.stringify(outerObject)], {type: 'text/plain'});
    var link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "json.cbr");
    link.click();
}

function clearBookmarks(){
    Bookmarks = [];
    localStorage.setItem(bookmarkLocation,JSON.stringify(Bookmarks));  
    location.reload();
}

function pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length-size);
}

/* Registration functions (won't work without import access). */   
var serverSalt="d0809793df2c3be1a77a229781cfe1cdb1a2a"; /* shouldn't be unique as far as I can find */
function generateHash(username,password){
    $('#resultbox').val(username + ":" + hex_hmac_sha256(password,serverSalt));
}
function importUser(string){
    var username=string.split(":")[0];
    var passhash=string.split(":")[1];
    document.getElementById('cmd').value = 'cmd_createuser';
    document.getElementById('user').value = username;
    document.getElementById('hash').value = passhash;
    document.getElementById('editform').submit();
}

/* Book popup rebuild */
function rebuildBookDetails(rootPath, xmlhttp, whichPage){
    $(whichPage).append('<a id="details_close" href="#" onclick="showHidePopupMenu(\''+whichPage.split('#')[1]+'\',\'searchbox\',\'pageselector\',\'settingsbox\');return false;">×</a>');
    $(whichPage).append('<div id="column1" class="detail-content"><div id="coverImg" class="cboxElement"></div><ul class="detail-item-actions"><li><a class="action-button read-action primary-action" href=""><div class="title-container"><span class="action-title">Read</span></div></li><li><a class="action-button read-action primary-action" href=""><div class="title-container"><span class="action-title">Download</span></div></li></ul></div>');
    $(whichPage).append('<div id="column2"><h1 class="title" itemprop="name"></h1><section class="item-description" itemprop="description"></section></div>');
    $(whichPage).append('<div id="column3"><div id="container" class="credits"><div class="title">Credits</div><div class="publisher"></div></div>');

    $(whichPage+' #details_cover img').addClass('cover').appendTo(whichPage+' #coverImg');
    if($(whichPage+' #details_read').length){
        $(whichPage+' #column1 .action-button:eq(0)').attr('href',$(whichPage+' #details_read').attr('href'));
    }else{
        $(whichPage+' #column1 .action-button:eq(0)').attr('href','#');
        $(whichPage+' #column1 .action-button:eq(0)').addClass('disabled');
    }
    $(whichPage+' #column1 .action-button:eq(1)').attr('href',$(whichPage+' #details_download').attr('href'));
    if(($(whichPage+' #details_series').length)&&(whichPage == "#comicdetails")){
        if($(whichPage+' #details_series').text().indexOf(' - ') != -1){
            var series = $(whichPage+' #details_series').text().split(' - ');
            var issueNum = series.pop().split(')')[0];
            var title = $(whichPage+' #details_series').text().split('(')[1].split(' - '+issueNum)[0];
        }else{
            var title = $(whichPage+' #details_series').text().split('(')[1].split(')')[0];
            var issueNum = null;
        }
        var year = $(whichPage+' #details_language_pubdate').text().split(' ').pop();
        if(year.length > 0){
            title += ' ('+year+')';
        }
        if(issueNum){
            title += ' #'+issueNum;
        }
        $(whichPage+' #column2 .title').text(title);
        $(whichPage+' #coverImg .cover').attr('title', title);
        if(showComicIssueTitle){
            $('<h3 class="subtitle">'+$(whichPage+' #details_title').text()+'</h3>').insertAfter(whichPage+' #column2 .title');
        }
    }else{
        $(whichPage+' #column2 .title').text($(whichPage+' #details_title').text());
        $(whichPage+' #coverImg .cover').attr('title', $(whichPage+' #details_title').text());
    }
    var descText = $(whichPage+' #details_description').text();
    if(hideCoverList){
        descText=descText.split('*List of covers and their creators:*')[0].trim();
    }
    $(whichPage+' #column2 .item-description').text(descText.trim());
    if(!hideSocialLinks){
        $(whichPage+' #column2').append('<aside class="social-links"></aside>');
    }
    if($(whichPage+' #details_genre').length){
        var publisher = $(whichPage+' #details_genre').text().split('[')[0].replace(/[^a-zA-Z 0-9]+/g, '');
        $(whichPage+' #column3 .publisher').append($( "<img>", {"class": "icon", "title": publisher}));
        $(whichPage+' #column3 .publisher').append($("<h3>", {"class": "name", "title": "Publisher", "text": publisher}));
        var grepResult = $.grep(IDcache['comics'], function(e){ return e.label == publisher && e.parent == comicsBaseID; });
        if(grepResult.length > 0){
            var bookID = grepResult[0].bookID;
            $(whichPage+' #column3 .publisher .icon').attr("src", proxyPrefix+"/comics/"+bookID+"/?folderinfo=folder.jpg");
            $(whichPage+' #column3 .publisher .icon').wrap($("<a>", {"class":"iconLink", "href": proxyPrefix+"/comics/"+bookID+"/"}));
            $(whichPage+' #column3 .publisher .name').wrap($("<a>", {"class":"textLink", "href": proxyPrefix+"/comics/"+bookID+"/"}));
        }else{
            $(whichPage+' #column3 .publisher .icon').attr('src', proxyPrefix+'/theme/folder.png');
        }
        $('.icon').on("error", function(){
            $(this).attr('src', proxyPrefix+'/theme/folder.png');
        });
    }
    var authors = $(whichPage+' #details_authors').text().split(' - ');
    if((authors.length > 0)&&($(whichPage+' #details_authors').length)&&($(whichPage+' #details_authors').text().length)){
		$(whichPage+' #column3 #container').append('<div class="credits writers"><dt>Written by</dt></div>');
		var writers = removeDuplicates(authors[0].split(', '));
		for (i = 0; i < writers.length; i++) {            
			$('.writers').append('<dd><h2 title="Written by"><a onclick=\'authorSearch("'+whichPage+'","'+writers[i]+'");\'>'+writers[i]+'</a></h2></dd>')
		}
    }
    if(authors.length > 1){
        $(whichPage+' #column3 #container').append('<div class="credits artists"><dt>Art by</dt></div>');
		var artists = removeDuplicates(authors[1].split(', '));
		for (i = 0; i < artists.length; i++) {            
			$('.artists').append('<dd><h2 title="Art by"><a onclick=\'authorSearch("'+whichPage+'","'+artists[i]+'");\'>'+artists[i]+'</a></h2></dd>')
		}
    }
    $(whichPage+' #column3 #container').append('<div class="title new_title">About Book</div>');
    if($(whichPage+' #details_size').length){
        var size = $(whichPage+' #details_size').text().split(' - ');
        $(whichPage+' #column3 #container').append('<h4 class="subtitle">Page Count</h4><div class="aboutText">'+size[0]+'</div><h4 class="subtitle">File Size</h4><div class="aboutText">'+size[1]+'</div>');
    }
    if($(whichPage+' #details_language_pubdate').length){
        var pubdate = $(whichPage+' #details_language_pubdate').text().split(' ');
        var date = $(whichPage+' #details_language_pubdate').text().split(' ').pop();
        if((pubdate.length > 3)&&(date.indexOf('-') != -1)){
            var dateParts=date.split('-');
            var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var month=months[parseInt(dateParts[1])-1];
            var fancyDate=month+' '+parseInt(dateParts[2])+' '+dateParts[0];
            $(whichPage+' #column3 #container').append('<h4 class="subtitle">Publication Date</h4><div class="aboutText">'+fancyDate+'</div>');
        }
        if(pubdate.length > 2){
            if(pubdate[1].indexOf('MB') != -1){
                $(whichPage+' #column3 #container').append('<h4 class="subtitle">File Size</h4><div class="aboutText">'+pubdate[1].split('MB')[0]+' MB</div>');
            }
        }
        $(whichPage+' #column3 #container').append('<h4 class="subtitle">File Format</h4><div class="aboutText">'+pubdate[0]+'</div>');
    }
    if(($(whichPage+' .details_rating').length) && ($(whichPage+' .details_rating').attr('id') != "details_rating0")){
        $(whichPage+' #column3 #container').append('<div class="rating"><div class="title new_title">Rating</div><div class="avgrating" itemprop="aggregateRating" itemscope="" itemtype="http://schema.org/AggregateRating"><span id="AvgRating"><span class="star-rating-control"><div role="text" aria-label="1" class="star-rating rater-0 star-rating-applied star-rating-readonly" id="AvgRating_0"></div><div role="text" aria-label="2" class="star-rating rater-0 star-rating-applied star-rating-readonly" id="AvgRating_1"></div><div role="text" aria-label="3" class="star-rating rater-0 star-rating-applied star-rating-readonly" id="AvgRating_2"></div><div role="text" aria-label="4" class="star-rating rater-0 star-rating-applied star-rating-readonly" id="AvgRating_3"></div><div role="text" aria-label="5" class="star-rating rater-0 star-rating-applied star-rating-readonly" id="AvgRating_4"></div></span></span></div></div>');
        $(whichPage+' .star-rating').each(function( index ) {
            if(index < $(whichPage+' .details_rating').attr('id').split('details_rating')[1]){
                $(whichPage+' .star-rating').eq(index).addClass('star-rating-on');
            }
        });
    }
    $(whichPage+' #details').hide();
}

function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}

function authorSearch(whichPage, name){
	if(whichPage=="#bookdetails"){
		var searchString = '/books/?search=simple';
	}else if(whichPage=="#comicdetails"){
		var searchString = '/comics/?search=true';
	}    
	$('#searchForm').attr('action',function(){
		return proxyPrefix + searchString;
	});
	$('#searchTerm').val(name);
	$('#searchForm').submit();
}

/* Parse cover image path to get read link path */
function parseImgPath(coverPath){
    var numPages = 1000 /* Need to find a way to get this value without polling. Shoot high so the reader actually works. */
    var parts = coverPath.split('/');
    var bookID;
    var type;
    if(parts.indexOf('books') != -1){
        bookID = parts[parts.indexOf('books')+1];
        type = "bookdetails";
    }
    if(parts.indexOf('comics') != -1){
        bookID = parts[parts.indexOf('comics')+1];
        type = "comicdetails";
    }
    return [bookID, type]
}

function getSearchParams(k){
     var p={};
     location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
     return k?p[k]:p;
}

/* Duplicated from Ubooquity to hook rebuildBookDetails. Stripped out sessionStorage since it's previously duplicated. */
function loadBookDetails(itemId, rootPath){
    getDetails(itemId, rootPath, 'bookdetails');
}

function loadComicDetails(itemId, rootPath){
    getDetails(itemId, rootPath, 'comicdetails');
}

function getDetails(itemId, rootPath, target){
	var xmlhttp;
	document.getElementById(target).innerHTML="<div id=\"progressbar\"></div>";
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	document.getElementById(target).innerHTML=xmlhttp.responseText;
            rebuildBookDetails(rootPath, xmlhttp, '#'+target); // Only addition to original function
	    }
	}
	xmlhttp.open("GET", rootPath + target+"/" + itemId ,true);
	xmlhttp.send();
}

function readBook(itemId, rootPath, target){
	var xmlhttp;
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
            $('<div>').html(xmlhttp.responseText).promise().done(function (xmlhttpReturn){
                window.open($(xmlhttpReturn).find('#details_read')[0].href,"_self"); 
            });
	    }
	}
	xmlhttp.open("GET", rootPath + target+"/" + itemId ,true);
	xmlhttp.send();
}

/* What makes this all possible. */
function loadScript(url, callback){
    var script = document.createElement("script")
    script.type = "text/javascript";
    if(callback){
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" || script.readyState == "complete"){
                    script.onreadystatechange = null;
                    callback();
                }
            };
        }else{  //Others
            script.onload = function(){
                callback();
            };
        }
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

/* Cookie functions (for loading settings). */
function getPage(url) {
    var resp;
    var xmlHttp;
    resp  = '';
    xmlHttp = new XMLHttpRequest();
    if(xmlHttp != null){
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        resp = xmlHttp.responseText;
    }
    return resp ;
}
