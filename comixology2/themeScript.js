/* Settings */
var itemsPerPage=36; 
var maxPages=20;
var defaultSearch = "comics" /* set to "comics" or "books". Only applies to pages outside of /comics/ or /books/ */
var comicsBaseID=1; /* set to null to disable publisher page */
var booksBaseID=1; /* set to null to disable author page */
var storyArcID=200227; /* set to null to disable story arc functions */
var homepageIssues=30; /* Number of issues to display on homepage (in Latest/Random Comics/Books) */
var featuredPublishers=["DC Comics","Marvel","Image","IDW Publishing","Dark Horse Comics", "Vertigo"]; /* set to null to disable Featured publisher list */
var showRandom=true; /* Show Random Comics/Random Books sliders on homepage */
var showRecommendations=false; /* Load suggestions from /files/extras/bookmark_export.csv on homepage */
var registerLink=false; /* Include register link on login forum */
var hideCoverList=true; /* Remove table of alternate covers from comic descriptions */

var proxyPrefix = "";
if (document.cookie.split(';').filter(function(item) {
    return item.indexOf('UbooquityBase=') >= 0
}).length){
    if(getCookie("UbooquityBase").length > 0){
        proxyPrefix = "/"+getCookie("UbooquityBase");
    }
}else{
    document.cookie = "UbooquityBase="+getJSON('public-api/preferences')['reverseProxyPrefix'];
    if(getCookie("UbooquityBase").length > 0){
        proxyPrefix = "/"+getCookie("UbooquityBase");
    }
}

loadScript(proxyPrefix+"/theme/js/jquery-3.3.1.min.js", function(){
    loadScript(proxyPrefix+"/theme/js/jquery-ui.min.js", function(){
        $.ajaxSetup({ cache: false });
        $('head').append('<link rel="stylesheet" href="'+proxyPrefix+'/theme/comixology.css" type="text/css" />');
        if(typeof Storage !== "undefined"){
            if (localStorage.getItem("Ubooquity_Bookmarks2") !== null) {
                Bookmarks=JSON.parse(localStorage.getItem("Ubooquity_Bookmarks2"));
            }
        }
                            
        if($('#loginform').length === 0){
            /* Homepage */             
            if(window.location.pathname == proxyPrefix+'/'){
                $('#group').hide(); 
                $('<div class="content_body clearfix"><div class="main_homepage_content"><a class="banner-container" href="#"><img src="'+proxyPrefix+'/theme/wideAd.jpg"></a></div><div class="homeRightCol"><div class="sidebar-image-container"><a class="sidebar-banner" href="#"><img src="'+proxyPrefix+'/theme/squareAd.jpg"></a></div><div class="standard_section"><div class="standard_section_header"><h3>Quick Links</h3></div><ul id="quickLinksUl" class="sidebar-list"></ul></div></div></div>').insertAfter('#userinfo');
                if($('#files').length > 0 && showRecommendations){
                    $(makeSliderList('recommendations','Recommendations',null)).css("zIndex",6).appendTo('.main_homepage_content');
                    $.get(proxyPrefix+'/files/extras/bookmark_export.csv').done(function(data) {
                        var csvList = data.split("\n");
                        for (i = 0; i < csvList.length; i++) {  
                            var splitLine = csvList[i].unquoted().split("\",\"");
                            buildElement(splitLine[0],splitLine[1],splitLine[2],splitLine[3], i+1, '#recommendations .list-content');
                        }
                        initializeControls('recommendations');
                        homepageWrap();
                    }).fail(function() {
                        console.log('To enable recommendations, give user access to a file share called "/extras" with a bookmark export file (export.csv) in it');
                    });
                }
                if($('#comics').length > 0){
                    $('head').append('<link rel="stylesheet" href="'+proxyPrefix+'/theme/comics.css" type="text/css" />');
                    $('#latest-comics').insertBefore('#comics');
                    $(makeSliderList('newComics','Latest Comics',proxyPrefix+'/comics/?latest=true')).css("zIndex",5).appendTo('.main_homepage_content');
                    if(storyArcID){ 
                        $('<a href="'+proxyPrefix+'/comics/'+storyArcID+'/" id="story-arcs">Story Arcs</a>').insertAfter('#comics');
                    }
                    $('<div>').load(proxyPrefix+'/comics/?latest=true'+" #group", function() {
                        $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#newComics .list-content');
                        initializeControls('newComics');
                        homepageWrap();
                        if(showRandom){
                            $('<div>').load(proxyPrefix+'/comics/?random=true'+" #group", function() {
                                $(makeSliderList('randomComics','Random Comics',proxyPrefix+'/comics/?random=true')).css("zIndex",4).insertAfter('#newComics');
                                $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#randomComics .list-content');
                                initializeControls('randomComics');
                                homepageWrap();
                            });
                        }
                    });
                    $('<div class="popupmenu" id="comicdetails"></div>').insertAfter('#group');
                }
                if($('#books').length > 0){
                    $('head').append('<link rel="stylesheet" href="'+proxyPrefix+'/theme/books.css" type="text/css" />');
                    $('#latest-books').insertBefore('#books');
                    $(makeSliderList('newBooks','Latest Books',proxyPrefix+'/books/?latest=true')).css("zIndex",3).appendTo('.main_homepage_content');
                    $('<div>').load(proxyPrefix+'/books/?latest=true'+" #group", function() {
                        $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#newBooks .list-content');
                        initializeControls('newBooks');
                        homepageWrap();
                        if(showRandom){
                            $(makeSliderList('randomBooks','Random Books',proxyPrefix+'/books/?random=true')).css("zIndex",2).insertAfter('#newBooks');
                            $('<div>').load(proxyPrefix+'/books/?random=true'+" #group", function() {
                                $(this).find('.cellcontainer:lt('+homepageIssues+')').appendTo('#randomBooks .list-content');
                                initializeControls('randomBooks');
                                homepageWrap();
                            });
                        }
                    });
                    $('<div class="popupmenu" id="bookdetails"></div>').insertAfter('#group');
                }
                if(Bookmarks.length > 0){
                    $(makeSliderList('bookmarks','Bookmarks',proxyPrefix+'/theme/mybooks.htm')).css("zIndex",1).appendTo('.main_homepage_content');
                    for (i = 0; i < Bookmarks.length; i++) {            
                        buildElement(Bookmarks[i][0],Bookmarks[i][1],Bookmarks[i][2],Bookmarks[i][3], i+1, '#bookmarks .list-content');
                    }
                    initializeControls('bookmarks');
                    homepageWrap();
                }
                $("#group a").each(function(){
                    $(this).wrap('<li>');
                    $(this).parent().appendTo('#quickLinksUl');
                });
                $('<div id="dimoverlay"></div>').insertAfter('#group');
            }else{
                
            }

            if((!window.location.search)||((window.location.search.indexOf('search') == -1)&&(window.location.search.indexOf('latest') == -1)&&(window.location.search.indexOf('random') == -1))){
                /* Publisher page */
                if(window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'){
                    $('#folderinfo').remove();
                    $('.cell img').css({'border': 0});
                    $('<div class="breadcrumb" id="cmx_breadcrumb" style="position:relative !important;top:-10px !important"><a href="../">Comics</a> &gt; <h2 class="hinline">Publishers</h2></div>').insertBefore('#group');
                    $('<img id="publishers" src="'+proxyPrefix+'/theme/publishers.jpg">').insertBefore('#group');
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
                    /* If multiple base shares exist */
                    if((window.location.pathname== proxyPrefix+'/comics/')||(window.location.pathname== proxyPrefix+'/books/')){
                        $('#folderinfo').remove();
                        var baseType;
                        if(window.location.pathname== proxyPrefix+'/comics/'){
                            baseType = "Comics";
                        }else if(window.location.pathname== proxyPrefix+'/books/'){
                            baseType = "Books";
                        }
                        $('<div class="breadcrumb" id="cmx_breadcrumb" style="position:relative !important;top:-10px !important"><a href="../">Home</a> &gt; <h2 class="hinline">'+baseType+'</h2></div></div>').insertBefore('#group');
                        $('#group').css({'margin-top':'-9px'});
                    }
                }
                
                /* Story Arc pages */
                if(storyArcID){
                    if(window.location.pathname== proxyPrefix+'/comics/'+storyArcID+'/'){
                        $('#folderinfo').remove();
                        $('.cell img').css({'border': 0});
                        $('<div class="breadcrumb" id="cmx_breadcrumb" style="position:relative !important;top:-10px !important"><a href="../">Comics</a> &gt; <h2 class="hinline">Story Arcs</h2></div>').insertBefore('#group');
                        $('<img id="publishers" src="'+proxyPrefix+'/theme/storyarc.jpg">').insertBefore('#group');
                    }     
                    if ($('#publisher').text()=="Story Arcs"){
                         //arcRunner(); 
                    } 
                }
                
                /* Authors Page */
                if(window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'){
                    $('<img id="publishers" src="'+proxyPrefix+'/theme/authors.jpg">').insertBefore('#group');
                    $('#cmx_breadcrumb').css({'position':'relative','top':'-10px'});
                    $('#publishers').css({'top':'44px'});
                    $('#group').css({'margin-top':'57px'});
                }          
                
                /* Series Pages */ 
                if($('#group').hasClass('seriesPage')){
                    seriesWrap();
                }
            }
                        
            /* File browser */
            if(window.location.href.indexOf("/files/") != -1){
                $('body').contents().wrapAll($('<div>', {
                    id: 'group'
                }));  
                $('#group a').each(function(){
                    $(this).wrap('<div class="icon"></div>');
                    $(this).parent().appendTo('#group');
                    if($(this).attr('href').match("/$")){
                        $(this).text($(this).text().replace('/', ''));
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/folder.png">');
                    }else if($(this).attr('href').match(".cbz$")||$(this).attr('href').match(".cbr$")){
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/comic.png">'); 
                    }else if($(this).attr('href').match(".png$")||$(this).attr('href').match(".jpg$")||$(this).attr('href').match(".gif$")){
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/image.png">'); 
                    }else if($(this).attr('href').match(".htm$")||$(this).attr('href').match(".html$")||$(this).attr('href').match(".css$")){
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/web.png">'); 
                    }else if($(this).attr('href').match(".pdf$")){
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/pdf.png">'); 
                    }else if($(this).attr('href').match(".epub$")){
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/epub.png">'); 
                    }else if($(this).attr('href').match("cvinfo$")){
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/config.png">'); 
                    }else{
                        $(this).prepend('<img src="'+proxyPrefix+'/theme/filebrowser/file.png">');               
                    }
                });
                $('table').remove();
                $('#group br').remove();
                $('#group a img').first().attr("src",proxyPrefix+"/theme/filebrowser/folderopen.png");
            }
            
            /* Bookmarks Page */
            if(window.location.href.indexOf("mybooks.htm") != -1){
                $('#group').addClass('bookmarks');
                rebuildBookmarks();
            }; 
                  
            /* All pages */
            /* Add class to Publisher Pages */
            if(($('#arrowup').attr('href')==proxyPrefix+'/books/')||($('#arrowup').attr('href')==proxyPrefix+'/books/'+booksBaseID+'/')||($('#arrowup').attr('href')==proxyPrefix+'/comics/')||($('#arrowup').attr('href')== proxyPrefix+'/comics/'+comicsBaseID+'/')){
                document.getElementById("group").className = "publisherPage";
                if($('#folderinfo').length){
                    $('#group').css({'margin-top':'10px'});
                    $('#group').css({'padding-top':'0'});
                }else{
                    if((window.location.pathname!= proxyPrefix+'/comics/'+storyArcID+'/')||(!storyArcID)){
                        getName(window.location.pathname,$('#arrowup').attr('href'),'.hinline');
                    }
                }
            }

            /* Copy #folderinfo to pages 2+ */
            if((window.location.href.indexOf("?index=") != -1)&&(window.location.href.indexOf("?index=0") == -1)&&(window.location.search.indexOf("search") == -1)){
                $('<div>').load(window.location.href.split("?index=")[0]+" #folderinfo", function() {
                    if($(this).find('#folderinfo').length > 0){
                        $('#folderinfo').remove();
                        if($(this).find('#cmx_breadcrumb').length > 0){
                            $('#cmx_breadcrumb').remove();
                        }
                        $(this).find('#folderinfo').prependTo('#group');
                        if($('#folderinfo #publisher2').length){
                            var a = document.getElementById('publisher');
                            a.href = document.getElementById('arrowup').href;
                            var a = document.getElementById('publisher2');
                            a.href = document.getElementById('arrowup').href;
                            document.getElementById("group").classList.add("seriesPage");
                            seriesWrap();
                        }
                        $('#group').css({'margin-top':'13px'});
                    }else{
                        getName(window.location.pathname,$('#arrowup').attr('href'),".hinline, #publisherHeader");
                    }
                });
            }

            /* Add header to #group */
            if(window.location.href.indexOf("/files/") == -1){
                if(((window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'))&&(((window.location.search.length == 0)||(window.location.search.indexOf('index') != -1))&&(window.location.search.indexOf('search') == -1))){
                    if($('#group header').length == 0){
                        $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                    }
                    if(featuredPublishers){
                        $('#group .list-title').text("All Publishers");
                        $('#group').css({'margin-top':'13px'});
                    }else{
                        $('#group .list-title').text("Publishers");
                    }
                }else if(((window.location.pathname== proxyPrefix+'/books/')||(window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'))&&(((window.location.search.length == 0)||(window.location.search.indexOf('index') != -1))&&(window.location.search.indexOf('search') == -1))){ 
                    if($('#group header').length == 0){
                        $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                    }
                    $('#group .list-title').text("Authors");
                }else if($(".thumb a:not([href='#'])").length == 0){
                    if((window.location.href.indexOf("/comics/") != -1)&&(window.location.search.length == 0)&&($('.rootlink').length == 0)){
                        if($('#group header').length == 0){
                            $('#group').prepend('<header><div class="header-row"><div class="list-title-container"><h3 class="list-title"></h3></div><ul class="list-actions no-list-actions"></ul></div></header>');
                        }
                        $('#group .list-title').text("Issues");
                    }
                }
            }

            /* Attach code to "Bookmark Series" button */
            $('#bookmarkButton').off('click').on('click',function(){
                storeElement(window.location.pathname,'',window.location.pathname + '?cover=true',$('#title').text(),true);
            });
        }else{
            /* Add Register link to login form */
            if(registerLink){
                $('body').prepend('<a href="'+proxyPrefix+'/theme/register.htm" id="registerLink">Register</a>');
            }
        }   
        
        /* Add breadcrumb navigation */
        if(($('#cmx_breadcrumb').length === 0)&&((window.location.pathname != proxyPrefix+'/')||($('#loginform').length == 1))){ 
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
                    seriesWrap();
                }else{
                    if(window.location.href.indexOf("/files/") != -1){
                        $('#cmx_breadcrumb a').text('File Browser');
                        $('#cmx_breadcrumb a').attr('href', '/files/');
                        $('.hinline').text(decodeURIComponent(window.location.pathname.split('/files')[1]));    
                    }else if(window.location.href.indexOf("/books/") != -1){
                        
                        $('#cmx_breadcrumb a:eq(0)').text('Books');                        
                        $('#cmx_breadcrumb a:eq(0)').attr('href', '/books/');
                        if(window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'){
                            $('.hinline').text('Authors');
                        }else if(window.location.pathname== proxyPrefix+'/books/'){
                            $('#cmx_breadcrumb').remove();
                            $('#group').css({'margin-top':'13px'});
                        }else{
                            getName(window.location.pathname,$('#arrowup').attr('href'),'.hinline');
                            $('#cmx_breadcrumb').prepend('<a href="/books/">Books</a> &gt; ');
                            $('#cmx_breadcrumb a:eq(1)').text('Authors');
                            seriesWrap();
                        }
                        
                    }else if(window.location.href.indexOf("/comics/") != -1){
                        
                        $('#cmx_breadcrumb a:eq(0)').text('Comics');                        
                        $('#cmx_breadcrumb a:eq(0)').attr('href', '/comics/');
                        if(window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'){
                            $('.hinline').text('Publishers');
                        }else if(window.location.pathname== proxyPrefix+'/comics/'){
                            $('#cmx_breadcrumb').remove();
                            $('#group').css({'margin-top':'13px'});
                        }else{
                            getName(window.location.pathname,$('#arrowup').attr('href'),'.hinline');
                            $('#cmx_breadcrumb').prepend('<a href="/comics/">Comics</a> &gt; ');
                            if(($('#arrowup').attr('href')== proxyPrefix+'/comics/'+comicsBaseID+'/')||($('#arrowup').attr('href')== proxyPrefix+'/comics/')){
                                $('#cmx_breadcrumb a:eq(1)').text('Publishers');
                            }else{
                                getParent($('#arrowup').attr('href'),$('#arrowup').attr('href'),'#cmx_breadcrumb a:eq(1)');
                                $('#cmx_breadcrumb a:eq(1)').attr('href',$('#arrowup').attr('href'));
                            }
                        }
                        
                    } 
                }
            }else{
                $('.hinline').text('Log In');
            }
            if(proxyPrefix != ""){
                $('#cmx_breadcrumb a').attr('href',function(i,v) {
                    if(v.indexOf(proxyPrefix) == -1){
                        return proxyPrefix + v;
                    }else{
                        return v;
                    }
                });
            }
        }
        
        /* Add and update navigation header */
        if($('.top-navigation').length === 0){
            $('<div>').load(proxyPrefix+"/theme/folder-info.html #header", function() {
                $("body").prepend($(this).contents().contents());  
                $(".dropdown").mouseover(function() {
                    $(this).parent().find("ul").show('blind', 50);
                });
                $(".clickdown").off('click').on('click', function() {
                    $(this).parent().find("ul").toggle('blind', 50);
                });
                $(".dropdown, .clickdown").parent().mouseleave(function() {
                    $(this).find("ul").hide();
                });
                $('<div>').load(proxyPrefix+"/index.html", function() {
                    /* Show/Hide buttons based on user permissions */
                    if($(this).find('#userinfo').text().indexOf('Connected') == -1){
                        $('#menuitem_login ul,.books,.comics,.both,.files,#menuitem_browse,#searchForm').remove();
                        $('.topright-menu').hide();
                    }else{
                        $('.topright-menu').show();
                        var userName = $(this).find('#userinfo').text().split("-")[0].split("Connected as ")[1].trim();
                        $(".loginLink").text(userName);
                        if($(this).find('#group').html().indexOf('id="comics"') == -1){
                            $('.comics').remove();
                            $('li[class="both"]').remove();
                        };
                        if($(this).find('#group').html().indexOf('id="books"') == -1){
                            $('.books').remove();
                            $('li[class="both"]').remove();
                        };
                        if(($(this).find('#group').html().indexOf('id="books"') > 0)&&($(this).html().indexOf('id="comics"') > 0)){
                            $('.comics:not(.both)').remove();
                            $('.books:not(.both)').remove();
                        }
                        if(($(this).find('#group').html().indexOf('id="comics"') == -1)&&($(this).html().indexOf('id="books"') == -1)){
                            $('#menuitem_browse').remove();
                            $('#searchForm').remove();
                        }
                        if($(this).find('#group').html().indexOf('id="files"') == -1){
                            $('.files').remove();
                        };
                        if(!storyArcID){
                            $('#submenuitem_browse_storyArc').remove();
                        }
                    }
                    $('#submenuitem_browse_storyArc a').attr('href','/comics/'+storyArcID+'/');
                    if(booksBaseID){
                        $('#submenuitem_browse_authors a').attr('href','/books/'+booksBaseID+'/');  
                    }else{
                        $('#submenuitem_browse_authors a').attr('href','/books/');
                        $('#submenuitem_browse_authors a').text('Books');
                    }
                    if(comicsBaseID){
                        $('#submenuitem_browse_publisher a').attr('href','/comics/'+comicsBaseID+'/');
                    }else{
                        $('#submenuitem_browse_publisher a').attr('href','/comics/');
                        $('#submenuitem_browse_publisher a').text('Comics');
                    }
                    $('.top-navigation a').attr('href',function(i,v) {
                        if(v != "#"){
                            v = proxyPrefix + v;
                        }
                        return v;
                    });
                    $(".top-navigation a").each(function(){
                        if ($(this).attr("href") == window.location.pathname+window.location.search){
                            $(this).closest('.main-menu > li').addClass("sel");
                        }
                    });
                    $('.primary_navigation_frame').fixToTop();
                    $('#menuitem_home a img').attr('src', proxyPrefix+'/theme/home-light.svg');

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
                    $('#searchForm').attr('action',function() {
                        return proxyPrefix + searchString;
                    });
                });
            });              
        }
        
        /* Reorganize/move page numbers/page arrows so they're in a common element */
        if($('.pagenumber').length > 1){
            $("#group").append('<div id="pageController"></div>'); 
            $("#group #pageController").append($('#searchleft10').parent());
            $("#group #pageController").append($('#searchleft').parent());
            $("#group #pageController").append($('#arrowleft10'));
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
        
        /* Add html footer to all pages */
        if($('#footer').length === 0){
            $('<div>').load(proxyPrefix+"/theme/folder-info.html #footer", function() {
                $("body").append($(this).contents().contents());
                if(((window.location.href.indexOf("/books/") != -1)||(window.location.href.indexOf("/comics/") != -1))&&(window.location.href.indexOf("/files/") == -1)&&((window.location.search.length==0)||(window.location.search=="?settings=true")||(window.location.href.indexOf("?index=") != -1))){
                    $("#footerSettings option[value='"+$("input[name='grouping']:checked").val()+"']").attr('selected','selected');
                    $("#footerSettings option[value='"+$("input[name='sortingCriterion']:checked").val()+"']").attr('selected','selected');
                    $("#footerSettings option[value='"+$("input[name='sortingOrder']:checked").val()+"']").attr('selected','selected');
                    $('#footerSettings').attr('action',function() {
                        if(window.location.pathname== proxyPrefix+'/comics/'+comicsBaseID+'/'){
                            return proxyPrefix+'/comics/?settings=true';
                        }else if(window.location.pathname== proxyPrefix+'/books/'+booksBaseID+'/'){
                            return proxyPrefix+'/books/?settings=true';
                        }else{
                            return window.location.pathname + '?settings=true';
                        }
                    });
                }else{
                    $('.footer_navigation_column:eq(2)').remove();
                }
            });
        }
        
        /* Remove extraneous elements */
        $("#searchbox").remove();
        $("#poweredby").remove();  
        $("#banner").remove();
        $("body > #logoutlink").remove();
        $("body > br").remove();

        $(document).ajaxStop(function() {
            /* Copy breadcrumb text to page title */
            var defaultTitle = "Digital Media";
            if($('#cmx_breadcrumb').length > 0){
                var category = $('#cmx_breadcrumb a:eq(0)').text();
                if (category == "Home"){ category = defaultTitle};
                if($('.hinline').length > 0 ){
                    document.title = $('.hinline').text() + " - "+ category +" by Ubooquity";
                }else{
                    document.title = $('#cmx_breadcrumb').text().split(" > ").pop() + " - "+ category +" by Ubooquity";
                }
            }else{
                document.title = defaultTitle + " by Ubooquity";
            }
                
            /* Hide offset page loading until everything is done */
            $("body").show();

            /* Replace any dashes with colons */
            $(".hinline").text(function(index, text) {
                return text.replace(' - ', ': ');
            });
             if((window.location.pathname != proxyPrefix+'/') && (window.location.pathname!= proxyPrefix+'/comics/'+storyArcID+'/')){
                $(".label").text(function(index, text) {
                    return text.replace(' - ', ': ');
                });
             }
            /*$('#cmx_breadcrumb a:eq(1)').text(function(index, text) {
                return text.replace(' - ', ': ');
            });*/
        });
        
        /* Functions that will not load without jQuery */
        String.prototype.unquoted = function (){return this.replace (/(^")|("$)/g, '')}
        $.fn.fixToTop = function() {
            var $window = $(window);
            return this.each(function() {
                var $this = $(this),
                initial_top = $this.position().top;
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
        $('img.svg').each(function() {
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

function seriesWrap(){
    $(".cellcontainer .label").each(function(){
        var labelText = $(this).text();
        var issueNum = "";
        var seriesYear = "";
        if ($('#publisher').text()=="Story Arcs"){
            if(labelText.split('-').length > 1){
                issueNum = parseInt(labelText.split('-')[0]);
                labelText = labelText.split(issueNum+"-")[1].trim();
            }
        }else{
            if((labelText.split('-').length > 1)&&!(isNaN(labelText.split('-')[0]))){
                labelText = labelText.split(labelText.split('-')[0]+"-")[1].trim();
            }
            if((labelText.split(' ').pop().indexOf('(') != -1)&&(labelText.split(' ').pop().indexOf(')') != -1)){
                seriesYear = labelText.split(' ').pop();
                labelText = labelText.split(seriesYear)[0].trim();
            }
            if((labelText.split(' ').length > 2)&&(labelText.split(' ')[1].indexOf('-') != -1)&&($.isNumeric(labelText.split(' ')[0]))){
                issueNum = labelText.split(' ')[0];
                labelText = labelText.split(issueNum + ' - ')[1].trim();
            }else if($.isNumeric(labelText.split(' ').pop())){
                issueNum = labelText.split(' ').pop();
                labelText = labelText.split(issueNum)[0];
            }
            if(issueNum != ""){
                issueNum = issueNum.replace(/^0+/, '').replace(/^$/, 0);
            }
        }
        seriesName = labelText.replace(' - ', ': ').trim();
        //$(this).parent().find('a').prop('title',$(this).text());
        if($(this).parent().find('a')[0].hasAttribute('onclick')){
            var menuBlock = '';
            if($(this).parent().find('a').attr('onclick') != ""){
                menuBlock += '<a class="action-button read-action primary-action" href="#" data-action="read" '
                if($(this).parent().find('a').attr('onclick').indexOf('comic') != -1){
                    menuBlock += 'onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadComicDetails')[1]+',\'comicdetails\',\'read\');"'
                }else if($(this).parent().find('a').attr('onclick').indexOf('book') != -1){
                    menuBlock += 'onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadBookDetails')[1]+',\'bookdetails\',\'read\');"'
                }
                menuBlock += '><div class="title-container"><span class="action-title">Read</span></div></a>'
            }
            menuBlock += '<a class="action-button expand-action primary-action clickdown"><div class="icon"></div></a><ul class="dropdownmenu"><li><a href="#" '
            if(window.location.href.indexOf("mybooks.htm") != -1){
                menuBlock += 'onclick="delBookmark($(this).parent().parent().parent().parent().find(\'.thumb a img\').attr(\'src\'));return false;">Remove From'
            }else{
                menuBlock += 'onclick="storeElement($(this).parent().parent().parent().parent().find(\'.thumb a\').attr(\'href\'),$(this).parent().parent().parent().parent().find(\'.thumb a\').attr(\'onclick\'),$(this).parent().parent().parent().parent().find(\'.thumb a img\').attr(\'src\'),$(this).parent().parent().parent().parent().find(\'.label\').text(),true);return false;">Add To'   
            }
            menuBlock += ' Bookmarks</a></li>'
            if($(this).parent().find('a').attr('onclick') != ""){
                if($(this).parent().find('a').attr('onclick').indexOf('comic') != -1){
                    menuBlock += '<hr class="inline-rule"><li><a href="#" onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadComicDetails')[1]+',\'comicdetails\',\'download\')">Download Comic</a></li>'
                }else if($(this).parent().find('a').attr('onclick').indexOf('book') != -1){
                    menuBlock += '<hr class="inline-rule"><li><a href="#" onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadBookDetails')[1]+',\'bookdetails\',\'download\')">Download Book</a></li>'
                }
            }
            menuBlock += '</ul>'
            $(menuBlock).insertAfter($(this));              
            if(issueNum != ''){
                $('<h6 class="content-subtitle">#'+issueNum+'</h6>').insertAfter($(this));
            }else{
                $('<h6 class="content-subtitle empty"></h6>').insertAfter($(this));
            }
        }   
        $('<h5 class="content-title">'+seriesName+' '+seriesYear+'</h5>').insertAfter($(this));
        $('<progress value="10" max="100" class="lv2-item-progress"></progress>').insertAfter($(this));
        $(this).parent().find('.content-title').prop('title',seriesName+' '+seriesYear);
        $(this).hide();         
    });
}

/* Story Arc Functions */
function hideStoryArcs(){
    $('a[href="'+proxyPrefix+'/comics/'+storyArcID+'/"]').parent().parent().remove();
    $('a[href="'+proxyPrefix+'/comics/'+storyArcID+'/folderCover"]').parent().parent().remove();
}
function arcRunner(){ 
    $.get("?folderinfo=/arclist.csv", function(response) {
        var arclist = response.split("\n");
        buildArc(arclist);
    }).fail(function() {
        console.log( "no arclist.csv found" );
    });
}
function buildArc(arclist){
    for (i = 0; i < arclist.length; i++) { 
        if(arclist[i].length > 0){
            var splitLine = arclist[i].unquoted().split("\",\"");
            var arcNum = padDigits(i+1,3);
            buildElement(splitLine[0],splitLine[1],splitLine[2],arcNum+"-"+splitLine[3],i+1, '#group');    
        }else{
            console.log("Issue "+(i+1)+" missing");
        }
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

function homepageWrap(){
    $(".cellcontainer .label").each(function(){
        if(!$(this).find('.content-title').length){
            var labelText = $(this).text();
            if(!$(this).find('.title').length){
                $(this).empty();
                $('<div class="title">'+labelText+'</div>').appendTo($(this));
            }
            var issueNum = "";
            var seriesYear = "";
            if((labelText.split(' ').pop().indexOf('(') != -1)&&(labelText.split(' ').pop().indexOf(')') != -1)){
                seriesYear = labelText.split(' ').pop();
                labelText = labelText.split(seriesYear)[0].trim();
            }
            if((labelText.split(' ').length > 2)&&(labelText.split(' ')[1].indexOf('-') != -1)&&($.isNumeric(labelText.split(' ')[0]))){
                issueNum = labelText.split(' ')[0];
                labelText = labelText.split(issueNum + ' - ')[1].trim();
            }else if($.isNumeric(labelText.split(' ').pop())){
                issueNum = labelText.split(' ').pop();
                labelText = labelText.split(issueNum)[0];
            }
            if(issueNum != ""){
                issueNum = issueNum.replace(/^0+/, '').replace(/^$/, 0);
            }
            seriesName = labelText.replace(' - ', ': ').trim();
            //$(this).parent().find('a').prop('title',$(this).text());
            
            $('<h5 title="'+seriesName+' '+seriesYear+'" class="content-title">'+seriesName+' '+seriesYear+'</h5>').appendTo($(this));
            if(issueNum != ""){
                $('<h6 class="content-subtitle">#'+issueNum+'</h6>').appendTo($(this));
            }
            if($(this).parent().find('a').attr('onclick').indexOf('comic') != -1){
                $('<div class="action-button-container read-button"><div class="title-container" onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadComicDetails')[1]+',\'comicdetails\',\'read\');"><span class="action-title">Read</span></div></div>').appendTo($(this));
            }else if($(this).parent().find('a').attr('onclick').indexOf('book') != -1){
                $('<div class="action-button-container read-button"><div class="title-container" onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadBookDetails')[1]+',\'bookdetails\',\'read\');"><span class="action-title">Read</span></div></div>').appendTo($(this));               
            }
            $('<hr class="inline-rule">').appendTo($(this));
            if($(this).parent().parent().parent().parent().attr('ID')!="bookmarks"){
                $('<div class="title-container"><span class="action-title" onclick="storeElement($(this).parent().find(\'.thumb a\').attr(\'href\'),$(this).parent().parent().parent().find(\'.thumb a\').attr(\'onclick\'),$(this).parent().parent().parent().find(\'.thumb a img\').attr(\'src\'),$(this).parent().parent().parent().find(\'.label .title\').text(),true);rebuildBookmarks();return false;">Add To Bookmarks</span></div>').appendTo($(this));
            }else{
                $('<div class="title-container"><span class="action-title" onclick="delBookmark($(this).parent().parent().parent().find(\'.thumb a img\').attr(\'src\'));rebuildBookmarks();return false;">Remove From Bookmarks</span></div>').appendTo($(this));                
            }
            if($(this).parent().find('a').attr('onclick') != ""){
                $('<hr class="inline-rule">').appendTo($(this));
                if($(this).parent().find('a').attr('onclick').indexOf('comic') != -1){
                    $('<div class="title-container" onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadComicDetails')[1]+',\'comicdetails\',\'download\');"><span class="action-title">Download Book</span></div>').appendTo($(this));
                }else if($(this).parent().find('a').attr('onclick').indexOf('book') != -1){
                    $('<div class="title-container" onclick="handleMedia'+$(this).parent().find('a').attr('onclick').split(');')[1].split('loadBookDetails')[1]+',\'bookdetails\',\'download\');"><span class="action-title">Download Book</span></div>').appendTo($(this));                
                }
            }
        }
    })
    $('.cellcontainer').off( "mouseenter mouseleave" ).hover(function(){
        $(this).find('.label').show();
    }, function(){
         $(this).find('.label').hide();
    });       
}

/* Parent page name parsing */
function getName(pageURL,upURL,target,pageNum){
    if (pageNum === undefined) {
        pageNum = 0;
    }
    $('<div>').load(upURL+"?index="+(pageNum * itemsPerPage)+" .cellcontainer", function() {
        var pageName = $(this).find('a[href$="'+pageURL+'"]').parent().parent().find('.label').text();
        if(!pageName){
            pageName = $(this).find('a[href$="'+pageURL+'folderCover"]').parent().parent().find('.label').text();
        }
        if (pageName){
            $(target).text(pageName);

            if(pageURL.indexOf('/books/') > -1){
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
    $('<div>').load(upURL2+" #arrowup", function() {
        getName(pageURL,$(this).find('a').attr('href'),target,0);
    });
}

/* Older method links */
function addFeatured(publisher, pageNum){
    //$( '.cellcontainer > .cell > .label:exact("'+publisher+'")' ).parent().parent().clone().appendTo( "#featured" );   
    if (pageNum === undefined) {
        pageNum = 0;
    }
    $('<div>').load(location.pathname+"?index="+(pageNum * itemsPerPage)+" .cellcontainer:has(.label:exact('"+publisher+"'))", function() {
        if ($(this).find('.cellcontainer').length > 0) {
            $(this).find('.cellcontainer').clone().appendTo( "#featured" ); 
        }else{
            pageNum++;
            if(pageNum <= maxPages){
                addFeatured(publisher, pageNum);
            }            
        }
    });
}


function addLink(pageID, searchString, orderNum, pageNum){
    if (pageNum === undefined) {
        pageNum = 0;
    }
    $('<div>').load("../"+pageID+"/?index="+(pageNum * itemsPerPage)+" .cellcontainer:has(.label:contains('"+searchString+"'))", function() {
        if ( $(this).children().length > 0 ) {
            if (orderNum !== undefined) {
                $(this).find(".cellcontainer").attr('id', orderNum);
            }
            $(this).find(".cellcontainer").attr('data-seriesid', pageID);
            $("#group").append($(this).find(".cellcontainer"));
        }else{
            pageNum++;
            if(pageNum <= maxPages){
                addLink(pageID, searchString, orderNum, pageNum);
            }
        }
    });
}

/* Bookmark Functions */
var Bookmarks = [];
function storeElement(href,onclick,img,label,showalert){
    if(showalert){
        //alert(label + ' bookmarked');
    }
    Bookmarks.push([href,onclick,img,label]);
    localStorage.setItem("Ubooquity_Bookmarks2",JSON.stringify(Bookmarks));
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
        seriesWrap();
        $(".clickdown").off('click').on('click', function() {
            $(this).parent().find("ul").toggle('blind', 50);
        });
        $(".dropdown, .clickdown").parent().mouseleave(function() {
            $(this).find("ul").hide();
        });
        if(Bookmarks.length){
            $('.list-count').text(Bookmarks.length + ' Books');
        }
    }else{
        if(Bookmarks.length != 0){
            if(!$('#bookmarks').length){
                $(makeSliderList('bookmarks','Bookmarks',proxyPrefix+'/theme/mybooks.htm')).css("zIndex",1).appendTo('.main_homepage_content');
            }
            $( "#bookmarks .cellcontainer" ).remove();
            for (i = 0; i < Bookmarks.length; i++) {            
                buildElement(Bookmarks[i][0],Bookmarks[i][1],Bookmarks[i][2],Bookmarks[i][3], i+1, '#bookmarks .list-content');
            }
            initializeControls('bookmarks');
        }else{
            $('#bookmarks').remove();
        } 
        homepageWrap();
    }
}

function resaveBookmarks(){
    Bookmarks = [];
    localStorage.setItem("Ubooquity_Bookmarks2",JSON.stringify([]));  
    $('#group .cellcontainer').each(function () {
        storeElement($(this).find(".thumb a").attr("href"),$(this).find(".thumb a").attr("onclick"),$(this).find(".thumb a img").attr("src"),$(this).find(".label").text(),false);
    });
}

function delBookmark(url){
    for(var i = 0; i < Bookmarks.length; i++) {
       if(Bookmarks[i][2] === url) {
         Bookmarks.splice(i,1);
         localStorage.setItem("Ubooquity_Bookmarks2",JSON.stringify(Bookmarks));
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

function clearBookmarks(){
    Bookmarks = [];
    localStorage.setItem("Ubooquity_Bookmarks2",JSON.stringify(Bookmarks));  
    location.reload();
}

/* Registration functions */   
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

/* Prototypes and generic functions */
function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function setInnerHTML(element, content) {
    element.innerHTML = content;
    return element;
} 

function loadScript(url, callback){
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    }else{  //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

/* Cookie functions (for loading settings) */
function getJSON(url) {
    var resp;
    var xmlHttp;
    resp  = '';
    xmlHttp = new XMLHttpRequest();
    if(xmlHttp != null){
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        resp = xmlHttp.responseText;
    }
    return JSON.parse(resp) ;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function handleMedia(itemId, rootPath, type, actionType){
    var xmlhttp;
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	document.getElementById(type).innerHTML=xmlhttp.responseText;
            var link = document.createElement("a");
            link.setAttribute("href", document.getElementById('details_'+actionType).href);
            if(actionType == "download"){
                link.setAttribute("download", decodeURI(document.getElementById('details_download').href.split('/').pop()));
            }
            link.click();
	    }
	}
	xmlhttp.open("GET", rootPath + type+ "/" + itemId ,true);
	xmlhttp.send();
}

function getSearchParams(k){
     var p={};
     location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
     return k?p[k]:p;
}

function loadComicDetails(itemId, rootPath){
	var xmlhttp;

	document.getElementById('comicdetails').innerHTML="<div id=\"progressbar\"></div>";
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	document.getElementById('comicdetails').innerHTML=xmlhttp.responseText;
            if(hideCoverList){
                var description = xmlhttp.responseText.split('<div id="details_description">')[1].split('</div>')[0];
                if(description.includes('*List of covers and their creators:*')){
                    description=description.split('*List of covers and their creators:*')[0].trim();
                    document.getElementById('details_description').innerHTML=description;
                }
            }
	    }
	}
	xmlhttp.open("GET", rootPath + "comicdetails/" + itemId ,true);
	xmlhttp.send();
}