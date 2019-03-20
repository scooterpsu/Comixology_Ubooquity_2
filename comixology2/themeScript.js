/* Settings now in settings.js, so there's no need to edit this file. */

/* Saving Ubooquity preferences to sessionStorage. */
if(sessionStorage.getItem("settings") === null){
    var currentPath = window.location.href;
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

/* Load theme settings from settings.js. */
loadScript(proxyPrefix+"/theme/settings.js");
    
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
            if(window.location.pathname == proxyPrefix+'/'){
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
                    for (i = 0; i < Bookmarks.length; i++) {            
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
            }

            if((!window.location.search)||((window.location.search.indexOf('search') == -1)&&(window.location.search.indexOf('latest') == -1)&&(window.location.search.indexOf('random') == -1))){
                /* Publisher page */
                if(window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'){
                    $('#folderinfo').remove();
                    $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Comics</a> &gt; <h2 class="hinline">Publishers</h2></div>').insertBefore('#group');
                    $('<img id="publishers" src="'+proxyPrefix+'/theme/publishers.jpg">').insertBefore('#group');
                    $('#group').addClass('scriptPage');
                    containerWrap();
                    if(featuredPublishers){
                        $('<div id="featured"><header><div class="header-row"><div class="list-title-container"><h3 class="list-title">Featured</h3></div><ul class="list-actions no-list-actions"></ul></div></header></div>').insertBefore('#group');
                        $.expr[':'].exact = $.expr.createPseudo(function(arg) {
                            return function( elem ) {
                                return $(elem).text().match("^" + arg + "$");
                            };
                        });
                        for (i = 0; i < featuredPublishers.length; i++) {    
                            addFeatured(featuredPublishers[i], 0);
                        }
                    } 
                    if(storyArcID){
                        hideStoryArcs();
                    }
                }else{
                    /* If multiple base shares exist / No folders (Grouping: None) */
                    if((window.location.pathname== proxyPrefix+'/comics/')||(window.location.pathname== proxyPrefix+'/books/')){
                        var baseType;
                        if(window.location.pathname== proxyPrefix+'/comics/'){
                            baseType = "Comics";
                        }else if(window.location.pathname== proxyPrefix+'/books/'){
                            baseType = "Books";
                        }
                        $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">'+baseType+'</a> &gt; <h2 class="hinline"></h2></div></div>').insertBefore('#group');
                        if($('.rootlink').length){
                            var rootLinks = $('.rootlink');
                            for (i = 0; i < rootLinks.length; i++) {            
                                buildElement(rootLinks[i].href,'',rootLinks[i].href+'?cover=true',rootLinks[i].text, i+1, '#group');
                            }
                            $('.rootlink, br').remove();
                        }else if($('.cellcontainer').length){
                            $('.hinline').text('All '+baseType);
                            containerWrap();
                        }
                    }
                }
                
                /* Story Arc pages */
                if(storyArcID){
                    if((window.location.pathname== proxyPrefix+'/comics/'+storyArcID+'/')||(window.location.pathname== proxyPrefix+'/comics/'+storyArcID+'/folderCover')){
                        $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Comics</a> &gt; <h2 class="hinline">Story Arcs</h2></div>').insertBefore('#group');
                        $('<img id="publishers" src="'+proxyPrefix+'/theme/storyarc.jpg">').insertBefore('#group');
                        $('#group').addClass('scriptPage');
                        containerWrap('arc');
                    }     
                }
                
                
                /* Series pages */
                if(seriesID){
                    if((window.location.pathname== proxyPrefix+'/books/'+seriesID+'/')||(window.location.pathname== proxyPrefix+'/books/'+seriesID+'/folderCover')){
                        $('<div class="breadcrumb" id="cmx_breadcrumb"><a href="../">Books</a> &gt; <h2 class="hinline">Series</h2></div>').insertBefore('#group');
                        $('<img id="publishers" src="'+proxyPrefix+'/theme/series.jpg">').insertBefore('#group');
                        $('#group').addClass('scriptPage');
                        containerWrap('arc');
                    }
                }
                
                if($('.cellcontainer .label:contains("json")').length){
                    var type;
                    if(window.location.href.indexOf("/comics/") != -1){
                        type = 'comic';
                    }else if(window.location.href.indexOf("/books/") != -1){
                        type = 'book';
                    }
                    arcRunner(type); 
                } 
                
                /* Authors Page */
                if(window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'){
                    $('<img id="publishers" src="'+proxyPrefix+'/theme/authors.jpg">').insertBefore('#group');
                    $('#group').addClass('scriptPage');
                    containerWrap();
                    if(seriesID){
                        hideSeries();
                    }
                }             
                
                /* If no folder-info, check for series.json */
                if((!$('#group #folderinfo').length)&&(settingsJSON['enableFolderMetadataDisplay'])&&(window.location.href.indexOf("/comics/") != -1)&&!($('#group').hasClass('scriptPage'))){
                    $.ajax({
                        url:'?folderinfo=series.json',
                        type:'GET',
                        error: function(jqXHR, exception) {
                            if (jqXHR.status == 404) {
                                console.log('The above 404 just means there is no series.json for this page, it can be ignored. - ScooterPSU');
                            }else{
                                console.error('There is something wrong in the JSON formatting of this series.json. Probably an unescaped quote or special character.');
                            }
                        },
                        success: function(data, textStatus, xhr) {
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
                                }
                                $('#group').addClass('scriptPage');
                                $('<div>').load(proxyPrefix+'/theme/templates/'+type+'.html', function(){
                                    $(".headerSection").html($(this).contents().contents());
                                    $('#cover').attr('src','?folderinfo=/folder.jpg');
                                    $('#publisher, #publisher2').attr('href', $('#arrowup').attr('href'));
                                    $('#pubImg').attr('src', $('#arrowup').attr('href')+'?folderinfo=folder.jpg');
                                    $('#cover, #pubImg').on("error", function(){
                                        $(this).attr('src', proxyPrefix+'/theme/folder.png');
                                    });
                                    getSeriesJson('?folderinfo=series.json');
                                    if($('.publisherContainer').length){
                                        $(document).ajaxStop(function(){
                                            var publisher = $('#cmx_breadcrumb a:eq(1)').text();
                                            $('.publisher').text(publisher);
                                            $('#pubImg').attr('title',publisher);
                                        })
                                    }
                                });
                            }
                        }
                    });
                }
                
                /* Series Pages and Publisher Pages */ 	
                if(!($('#group').hasClass('wrapped'))){
                    if(($('#group').hasClass('seriesPage'))||($('#group').hasClass('publisherPage'))){	
                        containerWrap();	
                    }else if($('#group').hasClass('arcPage')){
                        containerWrap('arc');	
                    }
                }
            }
                                                
            /* File browser / Audiobooks */
            if(window.location.href.indexOf("/files/") != -1){
                $('body').contents().wrapAll($('<div>', {
                    id: 'group'
                })); 
                if((window.location.href.indexOf("/"+audiobookShare+"/") != -1)&&(audiobookShare)){
                    $('#cmx_breadcrumb a:eq(0)').text('Audiobooks');
                    $('#group a').first().remove();
                    if(window.location.pathname== proxyPrefix+'/files/'+audiobookShare+'/'){
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
                                fixPaths('#audioPlayer .controlButton img', 'src', '/theme/filebrowser/');
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
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/black-folder.png">');
                        }else if($(this).attr('href').match(".cbz$")||$(this).attr('href').match(".cbr$")){
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">'); 
                        }else if($(this).attr('href').match(".png$")||$(this).attr('href').match(".jpg$")||$(this).attr('href').match(".gif$")){
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">'); 
                        }else if($(this).attr('href').match(".htm$")||$(this).attr('href').match(".html$")||$(this).attr('href').match(".css$")){
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">'); 
                        }else if($(this).attr('href').match(".pdf$")){
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">'); 
                        }else if($(this).attr('href').match(".epub$")){
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">'); 
                        }else if($(this).attr('href').match("cvinfo$")){
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">'); 
                        }else{
                            $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file-interface-symbol.png">');               
                        }
                    });
                    $('#group a img').first().attr("src",proxyPrefix+"/theme/filebrowser/black-open-folder-shape.png");
                    if(audiobookShare){
                        $('a[href="'+proxyPrefix+'/files/'+audiobookShare+'/"]').parent().remove();
                    }
                }
                $('#group br').remove();

            }
                  
            /* All pages */

            /* Copy #folderinfo to pages 2+. */
            if((window.location.href.indexOf("?index=") != -1)&&(window.location.href.indexOf("?index=0") == -1)&&(window.location.search.indexOf("search") == -1)){
                $('<div>').load(window.location.href.split("?index=")[0]+" #folderinfo", function(){
                    var type;
                    if($(this).find('#folderinfo').length > 0){
                        $('#cmx_breadcrumb').remove();
                        $(this).find('#folderinfo').prependTo('#group');
                        if($('#folderinfo #cover').length){
                            var a = document.getElementById('publisher');
                            a.href = document.getElementById('arrowup').href;
                            if($('#folderinfo #publisher2').length){
                                var a = document.getElementById('publisher2');
                                a.href = document.getElementById('arrowup').href;
                                document.getElementById("group").classList.add("seriesPage");
                            }else{
                                document.getElementById("group").classList.add("arcPage");
                                type="arc";
                            }
                        }else{
                            document.getElementById("group").classList.add("publisherPage");
                        }
                    }
                    containerWrap(type);
                    if($('#group header').length){
                        $('#group').prepend($('#group header'));
                    }
                });
            }

            /* Add header to #group. */
            if(window.location.href.indexOf("/files/") == -1){
                if(((window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'))&&(((window.location.search.length == 0)||(window.location.search.indexOf('index') != -1))&&(window.location.search.indexOf('search') == -1))){
                    if($('#group header').length == 0){
                        $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                    }
                    if(featuredPublishers){
                        $('#group .list-title').text("All Publishers");
                    }else{
                        $('#group .list-title').text("Publishers");
                    }
                }else if(((window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'))&&(((window.location.search.length == 0)||(window.location.search.indexOf('index') != -1))&&(window.location.search.indexOf('search') == -1))){ 
                    if($('#group header').length == 0){
                        $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                    }
                    $('#group .list-title').text("Authors");
                }else if($(".thumb a:not([href='#'])").length == 0){
                    if((window.location.pathname!= proxyPrefix+'/comics/')&&(window.location.href.indexOf("/comics/") != -1)&&($('.rootlink').length == 0)){
                        if($('#group header').length == 0){
                            $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                        }
                        $('#group .list-title').text("Issues");
                    }else if((window.location.pathname!= proxyPrefix+'/books/')&&(window.location.href.indexOf("/books/") != -1)&&($('.rootlink').length == 0)){
                        if($('#group header').length == 0){
                            $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                        }
                        $('#group .list-title').text("");
                    }
                }
            }
        }else{
            /* Add Register link to login form. */
            if(registerLink){
                $('body').prepend('<a href="'+proxyPrefix+'/theme/register.htm" id="registerLink">Register</a>');
            }
        }   
        
        /* Add breadcrumb navigation. */
        if(($('#cmx_breadcrumb').length === 0)&&((window.location.pathname != proxyPrefix+'/')||($('#loginform').length == 1))&&!($('body').hasClass('noBreadcrumb'))){ 
            $("body").prepend('<div class="breadcrumb" id="cmx_breadcrumb"><a href="/">Home</a> &gt; <h2 class="hinline"></h2></div>');    
            if($('#loginform').length == 0){
                if((window.location.search.indexOf("search")>-1)||(window.location.search.indexOf("latest")>-1)||(window.location.search.indexOf("random")>-1)){
                    if(window.location.search.indexOf("search")>-1){
                        if($('.searcharrowform').length !== 0){
                            $('.hinline').text('Search for "'+$('.searcharrowform input').attr('value')+'"');
                        }else{
                            $('.hinline').text('Search Results');    
                        }
                    }else if(window.location.search.indexOf("latest")>-1){
                        $('.hinline').text('Latest Addtions');
                    }else if(window.location.search.indexOf("random")>-1){
                        if(window.location.href.indexOf("/books/") != -1){
                            $('.hinline').text('Random Books');
                        }else if(window.location.href.indexOf("/comics/") != -1){
                            $('.hinline').text('Random Comics');                        
                        }
                    }
                    if(window.location.href.indexOf("/books/") != -1){
                        $('#cmx_breadcrumb a').text('Books');
                        $('#cmx_breadcrumb a').attr('href', '/books/');
                    }else if(window.location.href.indexOf("/comics/") != -1){
                        $('#cmx_breadcrumb a').text('Comics');
                        $('#cmx_breadcrumb a').attr('href', '/comics/');                           
                    }
                    containerWrap();
                }else{
                    if(window.location.href.indexOf("/files/") != -1){
                        var pathSplit;
                        if((window.location.href.indexOf("/files/"+audiobookShare+"/") != -1)&&(audiobookShare)){
                            $('#cmx_breadcrumb a').text('Audiobooks');
                            $('#cmx_breadcrumb a').attr('href', '/files/'+audiobookShare+'/');
                            pathSplit = '/files/'+audiobookShare+'/';
                        }else{
                            $('#cmx_breadcrumb a').text('File Browser');
                            $('#cmx_breadcrumb a').attr('href', '/files/');
                            pathSplit = '/files/';
                        }                        
                        var pathname = window.location.pathname.split(pathSplit)[1];
                        var folders = decodeURIComponent(pathname).slice(0,-1).split('/');
                        var hinlineText = folders.pop();
                        var pathFolders = "";
                        for (i = 0; i < folders.length; i++) {
                            pathFolders += encodeURIComponent(folders[i]) + "/";
                            $('.breadcrumb a:last-of-type').after(' > <a href="'+proxyPrefix+pathSplit+pathFolders+'">'+folders[i]+'</a> ');
                        }
                        $('.hinline').text(hinlineText); 
                    }else if(window.location.href.indexOf("/books/") != -1){
                        $('#cmx_breadcrumb a:eq(0)').text('Books');                        
                        $('#cmx_breadcrumb a:eq(0)').attr('href', '/books/');
                        if(window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'){
                            $('.hinline').text('Authors');
                        }else{
                            if(($('#arrowup').attr('href')!=proxyPrefix+'/books/')&&($('#arrowup').attr('href')!=proxyPrefix+'/')){
                                $('#cmx_breadcrumb').prepend('<a href="/books/">Books</a> &gt; ');
                            }
                            if($('#arrowup').attr('href')==proxyPrefix+'/books/'+booksBaseID+'/'){
                                $('#cmx_breadcrumb a:eq(1)').text('Authors');
                            }else if($('#arrowup').attr('href')== proxyPrefix+'/books/'+seriesID+'/'){
                                $('#cmx_breadcrumb a:eq(1)').text('Series');
                            }else{
                                getParent($('#arrowup').attr('href'),$('#arrowup').attr('href'),'#cmx_breadcrumb a:eq(1)');
                            }
                            getName(window.location.pathname,$('#arrowup').attr('href'),'.hinline');
                            $('#cmx_breadcrumb a:eq(1)').attr('href',$('#arrowup').attr('href'));
                            containerWrap();
                        }
                    }else if(window.location.href.indexOf("/comics/") != -1){
                        $('#cmx_breadcrumb a:eq(0)').text('Comics');                        
                        $('#cmx_breadcrumb a:eq(0)').attr('href', '/comics/');
                        if(window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'){
                            $('.hinline').text('Publishers');
                        }else{
                            if(($('#arrowup').attr('href')!=proxyPrefix+'/comics/')&&($('#arrowup').attr('href')!=proxyPrefix+'/')){
                                $('#cmx_breadcrumb').prepend('<a href="/comics/">Comics</a> &gt; ');
                            }
                            if($('#arrowup').attr('href')== proxyPrefix+'/comics/'+comicsBaseID+'/'){
                                $('#cmx_breadcrumb a:eq(1)').text('Publishers');
                            }else if($('#arrowup').attr('href')== proxyPrefix+'/comics/'+storyArcID+'/'){
                                $('#cmx_breadcrumb a:eq(1)').text('Story Arcs');
                            }else{
                                getParent($('#arrowup').attr('href'),$('#arrowup').attr('href'),'#cmx_breadcrumb a:eq(1)');
                            }
                            getName(window.location.pathname,$('#arrowup').attr('href'),'.hinline');
                            $('#cmx_breadcrumb a:eq(1)').attr('href',$('#arrowup').attr('href'));
                            $(document).ajaxStop(function(){
                                if(($('#group').hasClass('arcPage'))&&(storyArcID)&&($('.breadcrumb a:eq(1)').attr('href')!=proxyPrefix+'/comics/'+storyArcID+'/')){
                                    $('.breadcrumb a:eq(0)').after(' > <a href="'+proxyPrefix+'/comics/'+storyArcID+'/">Story Arcs</a> ');
                                    containerWrap('arc');
                                }else{
                                    containerWrap();
                                }
                            })
                        }
                    }                 
                }
            }else{
                $('.hinline').text('Log In');
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
                        $('<div>').load(proxyPrefix+"/index.html", function(){
                            if($(this).find('#userinfo').text().indexOf('Connected') == -1){  
                                $('#menuitem_login ul,.books,.comics,.both,.files,#menuitem_browse,#searchForm').remove();
                                $('.topright-menu').remove();
                            }else{
                                sessionStorage.username = $(this).find('#userinfo').text().split("-")[0].split("Connected as ")[1].trim();
                                $('.loginLink').text(sessionStorage.username);
                            }
                        });
                    }else{
                        $('.loginLink').text(sessionStorage.username);
                    }
                }else{
                    $('#menuitem_login ul li:eq(1)').remove();
                    if(!($('#loginform').length)){
                        $('.loginLink').text(defaultUsername);
                    }
                }
                if(!settingsJSON['isComicsProviderEnabled']){
                    $('.comics, .comicsOnly, .both').remove();
                }
                if(!settingsJSON['isBooksProviderEnabled']){
                    $('.books, .booksOnly, .both').remove();
                }
                if((settingsJSON['isBooksProviderEnabled'])&&(settingsJSON['isComicsProviderEnabled'])){
                    $('.comicsOnly, .booksOnly').remove();
                }
                if((!settingsJSON['isBooksProviderEnabled'])&&(!settingsJSON['isComicsProviderEnabled'])){
                    $('#menuitem_browse, #searchForm').remove();
                }
                if(!settingsJSON['isFilesProviderEnabled']){
                    $('.files').remove();
                }
                if(!storyArcID){
                    $('#submenuitem_browse_storyArc').remove();
                }
                if(!seriesID){
                    $('#submenuitem_browse_series').remove();
                }
                if(!audiobookShare){
                    $('#menuitem_audiobooks').remove();
                }
                if(!settingsJSON['isOpdsProviderEnabled']){
                    $('#menuitem_mobile').remove();
                }
                        
                $('#submenuitem_browse_storyArc a').attr('href','/comics/'+storyArcID+'/');
                $('#submenuitem_browse_series a').attr('href','/books/'+seriesID+'/');
                $('#menuitem_audiobooks a').attr('href','/files/'+audiobookShare+'/');
                fixPaths('.top-navigation a', 'href');
                if(!booksBaseID){
                    $('#submenuitem_browse_authors a').text('Books');
                }
                if(!comicsBaseID){
                    $('#submenuitem_browse_publisher a').text('Comics');
                }
                if($('.main-menu a[href="'+window.location.pathname+window.location.search+'"]').length){
                    $('.main-menu a[href="'+window.location.pathname+window.location.search+'"]').closest('.main-menu > li').addClass("sel");
                }else if(($('#cmx_breadcrumb a:eq(0)').length)&&($('#cmx_breadcrumb a:eq(0)')[0].pathname != proxyPrefix+'/')&&($('.main-menu a[href$="'+$('#cmx_breadcrumb a:eq(0)')[0].pathname+'"]').length)){
                    $('.main-menu a[href$="'+$('#cmx_breadcrumb a:eq(0)')[0].pathname+'"]').closest('.main-menu > li').addClass("sel");
                }
                $('.primary_navigation_frame').fixToTop();
                fixPaths('.top-navigation a img', 'src');


                /* Search */
                var searchString;
                if((window.location.href.indexOf("/books/") != -1)&&(window.location.href.indexOf("/files/") == -1)){
                    searchString='/books/?search=simple';
                }else if((window.location.href.indexOf("/comics/") != -1)&&(window.location.href.indexOf("/files/") == -1)){
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
                
            });              
        }
        
        /* Reorganize/move page numbers/page arrows so they're in a common element. */
        if($('.pagenumber').length > 1){
            $("#group").append('<div id="pageController"></div>'); 
            $("#group #pageController").append($('#searchleft10').parent());
            $("#group #pageController").append($('#searchleft').parent());
            $("#group #pageController").append($('#arrowleft10'));
            $("#arrowleft10").attr('href', '?index=0');
            $("#group #pageController").append($('#arrowleft'));
            $("#group #pageController").append($('.pagenumber'));
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
                        $(this).appendTo("#group #pageController");  
                    }else{
                        $form = $('<form class="searcharrowform" method="POST">');
                        var str=$(this)[0].href;
                        str=str.substring(str.lastIndexOf("?") + 1, str.length);
                        $form.attr('action',window.location.pathname+"?search="+getSearchParams('search')+"&"+str);
                        $form.append('<input type="hidden" name="searchstring" value="'+$('.searcharrowform input').attr('value')+'">');
                        $form.append('<button type="submit" class="pagenumber">'+$(this).text()+'</button>');
                        $form.appendTo("#group #pageController");
                        $(this).remove();
                    }                
                });
                $("#searchleft10").parent().attr('action', window.location.pathname+"?search="+getSearchParams('search')+"&index=0");
                $("#searchright10").parent().attr('action', window.location.pathname+"?search="+getSearchParams('search')+"&index="+($('.pagenumber').length*itemsPerPage-itemsPerPage));
            }
            $("#group #pageController").append($('#arrowright'));
            $("#group #pageController").append($('#arrowright10'));
            $("#arrowright10").attr('href', '?index='+($('.pagenumber').length*itemsPerPage-itemsPerPage));
            $("#group #pageController").append($('#searchright').parent());
            $("#group #pageController").append($('#searchright10').parent());  
            $("#group #pageController").append('<div class="pager-jump-container"><label>  Jump to: </label><input class="pager-jump" type="text" value="'+$('.currentpagenumber').text()+'"> / '+$('.pagenumber').length+'</div>');
            $(".pager-jump").keyup(function(e) {
                if(e.which == 13){
                    if($('.pager-jump').val() <= $('.pagenumber').length){
                        if(!$('.searcharrowform').length){
                            window.location = window.location.href.split('?')[0]+"?index="+($('.pager-jump').val()*itemsPerPage-itemsPerPage);
                        }else{
                            $form = $('<form class="searcharrowform" method="POST">'); 
                            $form.attr('action',window.location.pathname+"?search="+getSearchParams('search')+"&index="+($('.pager-jump').val()*itemsPerPage-itemsPerPage));
                            $form.append('<input type="hidden" name="searchstring" value="'+$('.searcharrowform input').attr('value')+'">');
                            $(document.body).append($form);
                            $form.submit();
                        }
                    }
                }
            });
            $("#group #pageController").append($('<div id="pageNum">').text("Page "+$('.currentpagenumber').text()+" of "+$('.pagenumber').length));
        }else{
            $('#group').css('padding-bottom','0');
        }
        
        /* Add html footer to all pages. */
        if($('#footer').length === 0){
            $('<div>').load(proxyPrefix+"/theme/templates/footer.html #footer", function(){
                $("body").append($(this).contents());
                if(((window.location.href.indexOf("/books/") != -1)||(window.location.href.indexOf("/comics/") != -1))&&(window.location.href.indexOf("/files/") == -1)&&((window.location.search.length==0)||(window.location.search=="?settings=true")||(window.location.href.indexOf("?index=") != -1))){
                    $("#footerSettings option[value='"+$("input[name='grouping']:checked").val()+"']").attr('selected','selected');
                    $("#footerSettings option[value='"+$("input[name='sortingCriterion']:checked").val()+"']").attr('selected','selected');
                    $("#footerSettings option[value='"+$("input[name='sortingOrder']:checked").val()+"']").attr('selected','selected');
                    $('#footerSettings').attr('action',function(){
                        if(window.location.href.indexOf("/comics/") != -1){
                            return proxyPrefix+'/comics/?settings=true';
                        }else if(window.location.href.indexOf("/books/") != -1){
                            return proxyPrefix+'/books/?settings=true';
                        }
                    });
                }else{
                    $('#footerSettings').parent().remove();
                }
                if(window.location.href.indexOf("/files/") != -1){
                    $('.footer_navigation_column').eq(1).find('ul').append('<li>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></li>');
                    $('.footer_navigation_column:eq(2)').remove();
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
            sessionStorage.originUrl = window.location.href;
            sessionStorage.loadBookmark = true;
             
             /* Hide page loading until everything is done. */
            $("body").show();
            //$('#toppagebar').remove();
            $("html").css('background','0');
            
            /* Attach code to "Bookmark Series/Story Arc" button. */
            $('#bookmarkButton').off('click').on('click',function(){
                storeElement(window.location.pathname,'',window.location.pathname+'?cover=true',$('.seriesname').text(),true);
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
    });
});

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

function containerWrap(type){
    if(!$('#group').hasClass('wrapped')){
        $('#group').addClass('wrapped');
        $(".cellcontainer .label").each(function(){
            if($(this).text() == "json"){
                $(this).parent().parent().hide();
                return
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
                var readLink = getReadLink(bookPath);
                if(($(this).parent().find('a').attr('onclick') != "")&&(readLink !='#')){
                    menuBlock += '<a class="action-button read-action primary-action" href="'+readLink+'" data-action="read"><div class="title-container"><span class="action-title">Read</span></div></a>'
                }
                menuBlock += '<a class="action-button expand-action primary-action clickdown"><div class="icon"></div></a><ul class="dropdownmenu"><li><a href="#" '
                if(window.location.href.indexOf("mybooks.htm") != -1){
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
                if((arcNum != "")&&(type=="arc")){
                    $(this).parent().find('.content-title').text(titleText);
                    $(this).parent().find('.content-title').prop('title',titleText);
                    $(this).parent().find('.content-subtitle').text('#'+parseFloat(arcNum));
                }
             /* Series */
            }else{
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
                cacheID($(this).parent().find('.thumb a img').attr('src'), $(this).parent().find('.label:not(.content-title)').text(),window.location.href);
            }           
            $(this).hide();         
        });
        $(".clickdown").off('click').on('click', function(){
            $(this).parent().find("ul").toggle('blind', 50);
        });
        $(".clickdown").parent().mouseleave(function(){
            $(this).find("ul").hide();
        });
    }
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
    }
    if(srcParts.indexOf('books') != -1){
        type = "books";
        ID = srcParts[srcParts.indexOf('books')+1];
        parentID = parentParts[parentParts.indexOf('books')+1];
    }        
    if(IDcache[type].some(e => e.bookID === ID)){
       var bookIndex = IDcache[type].findIndex(e => e.bookID === ID);
    }else{
        if(ID&&parentID){
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
    $('#group').addClass('scriptPage');
    if($(".cellcontainer .label:contains('json')").length){
        var filename = $(".cellcontainer .label:contains('json')").parent().find('img').attr('src').split('?')[0];
        $.get(filename, function(response) {
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
                }else{
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
                        $('#cover').attr('src','?folderinfo=/folder.jpg');
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
        });
    }
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
            var readLink = getReadLink(bookPath);
            if(readLink != "#"){
                $('<div class="action-button-container read-button"><a class="title-container" href="'+getReadLink(bookPath)+'"><span class="action-title">Read</span></a></div>').appendTo($(this));
            }
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

/* Parent page name parsing */
function getName(pageURL,upURL,target,pageNum){
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
    if(IDcache[type].some(e => e.bookID === targetID)){
       var bookIndex = IDcache[type].findIndex(e => e.bookID === targetID);
       var label = IDcache[type][bookIndex].label;
       if(isNaN(label.split(' - ').pop().split(')')[0])){
            label = label.replace(' - ', ': ');
        }
        label = label.replace('_ ', ': ');
        $(target).text(label);
       return true;
    }
    if (pageNum === undefined) {
        pageNum = 0;
    }
    $('<div>').load(upURL+"?index="+(pageNum * itemsPerPage)+" #group", function(){
        if($(this).find('a[href$="'+pageURL+'"]').text().trim().length){
            var pageName = $(this).find('a[href$="'+pageURL+'"]').text();
        }else{
            var pageName = $(this).find('a[href$="'+pageURL+'"]').parent().parent().find('.label').text();
        }
        if(!pageName){
            pageName = $(this).find('a[href$="'+pageURL+'folderCover"]').parent().parent().find('.label').text();
        }
        if(pageName){
            if(isNaN(pageName.split(' - ').pop().split(')')[0])){
                pageName = pageName.replace(' - ', ': ');
            }
            pageName = pageName.replace('_ ', ': ');
            $(target).text(pageName);
            cacheID(pageURL, pageName, upURL);
            if(pageURL.indexOf('/books/') != -1){
                $(".label").text(function(index, text) {
                    return text.replace(pageName.split(' ').pop()+", "+pageName.split(" "+pageName.split(' ').pop())[0], '');
                });
                $(".label").text(function(index, text) {
                    return text.replace(pageName, '');
                });
            }
        }else{
            pageNum++;
            if(pageNum <= maxPages){
                getName(pageURL,upURL,target,pageNum);
            }           
        }
    });
}
function getParent(pageURL,upURL2,target,pageNum){
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
    if(IDcache[type].some(e => e.bookID === targetID)){
       var bookIndex = IDcache[type].findIndex(e => e.bookID === targetID);
       var label = IDcache[type][bookIndex].label;
       if(isNaN(label.split(' - ').pop().split(')')[0])){
            label = label.replace(' - ', ': ');
        }
        label = label.replace('_ ', ': ');
        $(target).text(label);
       return true;
    }    
    $('<div>').load(upURL2+" #arrowup", function(){
        getName(pageURL,$(this).find('a').attr('href'),target,0);
    });
}

/* Older method links */
function addFeatured(publisher, pageNum){
    if (pageNum === undefined){
        pageNum = 0;
    }
    if(IDcache['comics'].some(e => e.label == publisher && e.parent == comicsBaseID)){
        var bookIndex = IDcache['comics'].findIndex(e => e.label == publisher && e.parent == comicsBaseID);
        var bookID = IDcache['comics'][bookIndex].bookID;
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
    if(window.location.href.indexOf("mybooks.htm") != -1){
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
    }else{
        if((Bookmarks.length > 0)&&(Bookmarks != undefined)){
            if(!$('#bookmarks').length){
                $(makeSliderList('bookmarks','Bookmarks',proxyPrefix+'/theme/mybooks.htm')).css("zIndex",1).appendTo('.main_homepage_content');
            }
            $( "#bookmarks .cellcontainer" ).remove();
            for (i = 0; i < Bookmarks.length; i++) {            
                buildElement(Bookmarks[i][0],Bookmarks[i][1],Bookmarks[i][2],Bookmarks[i][3], i+1, '#bookmarks .list-content');
            }
            initializeControls('bookmarks');
            homepageWrap('bookmarks');
        }else{
            $('#bookmarks').remove();
        } 
    }
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
        if((comicsBaseID)&&(IDcache['comics'].some(e => e.label == publisher && e.parent == comicsBaseID))){
            var bookIndex = IDcache['comics'].findIndex(e => e.label == publisher && e.parent == comicsBaseID);
            var bookID = IDcache['comics'][bookIndex].bookID;
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
    if((authors.length > 0)&&($(whichPage+' #details_authors').length)){
        $(whichPage+' #column3 #container').append('<div class="credits"><dt>Written by</dt><h2 title="Written by">'+authors[0]+'</h2></div>');
    }
    if(authors.length > 1){
        $(whichPage+' #column3 #container').append('<div class="credits"><dt>Art by</dt><h2 title="Art by">'+authors[1]+'</h2></div>');
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

/* Parse cover image path to get read link path */
function getReadLink(coverPath){
    var numPages = 1000 /* Need to find a way to get this value without polling. Shoot high so the reader actually works. */
    var parts = coverPath.split('/');
    var bookID;
    var readLink;
    var reverseProxy = settingsJSON['reverseProxyPrefix'];
    if(parts.indexOf('books') != -1){
        bookID = parts[parts.indexOf('books')+1];
        var bookFileType = parts[parts.indexOf('books')+2].split('.').pop();
        if(bookFileType == "epub"){
            readLink = proxyPrefix+'/epubreader/'+bookID+'/?opening=true';
        }else if(bookFileType == "pdf"){
            readLink = proxyPrefix+'/bookreader/reader.html#?docId='+bookID+'&revProxy='+reverseProxy+'&startIndex=0&type=book&nbPages='+numPages+'&storeBookmarksInCookies='+bookmarkUsingCookies;
        }else{
            readLink = '#';
        }
    }
    if(parts.indexOf('comics') != -1){
        bookID = parts[parts.indexOf('comics')+1];
        readLink = proxyPrefix+'/comicreader/reader.html#?docId='+bookID+'&revProxy='+reverseProxy+'&startIndex=0&type=comic&nbPages='+numPages+'&storeBookmarksInCookies='+bookmarkUsingCookies;
    }
    return readLink
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