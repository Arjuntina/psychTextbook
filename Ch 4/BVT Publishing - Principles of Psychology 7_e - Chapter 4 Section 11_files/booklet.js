/** booklet.js **/
(function($, window){
    
    var prefix = 'booklet';
    var bookletId = null;
    var bookId = null;
    var scrollTop = null;
    // var loaded = false;
    var appView = 'book'; // lab | book | classroom
    
    var moduleActive = true;
    var loaded = false;
    var startEvent = '';
    var doneEvent = 'booklet:loaded';
    var pauseScrollTracking = false;
    
    function hunt()
    {
        _logi('hunt()');
        if(moduleActive===false) {
            $(document).on(startEvent, triggerDone);
        } else {
            preload();
            if(startEvent!=''){
                $(document).on(startEvent, checkLoad);
            } else {
                checkLoad();
            }
        }
    }
    
    function checkLoad()
    {
        if(loaded===false)
            load();
        loaded = true;
    }
    
    function allDoneLoad()
    {
        var hsh = location.hash;
        if(hsh && hsh.match(/#block_/)){
            jumpToBlock(hsh);
        } else if(hsh.match(/#classroom-/)) {
            jumpToClassroomTab(hsh);
        } else if(hsh.match(/#lab-/)) {
            jumpToLabTab(hsh);
        } else {
            $("#booklet-container").show();
            getScrollPosition();
        }
        $("body").trigger("create");
        checkImgs();
    }
    
    function jumpToLabTab(hsh)
    {
		appView = 'lab';
        setTimeout(function(){
            $("#booklet-loader").fadeOut("slow");
            var $labContainer = $("#lab-container");
            var btn = "button." + hsh.replace('#','');
            $labContainer.show();
            $("a[href=#lab-container]").trigger("click");
            $(btn).trigger("click");
        }, 1000);
    }
    
    function jumpToClassroomTab(hsh)
    {
		appView = 'classroom';
		setTimeout(function(){
            $("#booklet-loader").fadeOut("slow");
            var $classroomContainer = $("#classroom-container");
            var btn = "button." + hsh.replace('#','');
            $classroomContainer.show();
            $("a[href=#classroom-container]").trigger("click");
            $(btn).trigger("click");
        }, 1000);
    }
    
    function jumpToBlock(hsh)
    {
        var $container = $("#booklet-container");
        $container.show();
        $("> div", $container).css({"opacity":"1"});
        $("#booklet-loader").fadeOut("slow");
        $("#next-booklet-container").fadeIn("slow");
        location.hash = hsh;
        $(window).scrollTop($(window).scrollTop()-60);
    }
    
    function preload()
    {
		var hsh = location.hash;
        if(hsh.match(/#classroom-/)) {
            appView = 'classroom';
        } else if(hsh.match(/#lab-/)) {
            appView = 'lab';
        }
		
        $("#booklet-loader").show();
        // $("#booklet-container").hide();
    }
    
    function postLoad()
    {
        $(document).on('click', 'a[href=#closePreview]', function(e){
            $(".imgPreview").remove();
            $(".ui-page").show();
            $(window).scrollTop(scrollTop);
        });
        
        // $(document).on('click', '#switch-containers', function(e){
            // $("#booklet-container").toggle('slow');
            // $("#lab-container").toggle('slow');
        // });
        
        $(document).on('click', 'a[href=#lab-container]', function(e){
            e.preventDefault();
            pauseScrollTracking = true;
            appView = 'lab';
            $('#lab-container').show();
            $('#classroom-container').hide();
            $('#booklet-container').hide();
            getScrollPosition();
            return false;
        });
        
        $(document).on('click', 'a[href=#classroom-container]', function(e){
            e.preventDefault();
            pauseScrollTracking = true;
            appView = 'classroom';
            $('#classroom-container').show();
            $('#lab-container').hide();
            $('#booklet-container').hide();
            getScrollPosition();
            return false;
        });
        
        $(document).on('click', 'a[href=#booklet-container]', function(e){
            e.preventDefault();
            pauseScrollTracking = true;
            appView = 'book';
            $('#classroom-container').hide();
            $('#lab-container').hide();
            $('#booklet-container').show();
            getScrollPosition();
            if(location.hash){
                location.hash = 'read';
            }
            return false;
        });
        
        triggerDone();
        initScrollListener();
        setupLastScriptListener();
        setNextBookletBtn();
    }
    
    function setupLastScriptListener()
    {
        var lastScript = '';
        $("script.scripts").each(function(index, elm){
            if(!$(elm).attr("src")) return;
            var tmpScript = $(elm).attr("src").replace('/js/views/','');
            var x = tmpScript.split('.');
            lastScript = x[0];
        });
        $(document).on(lastScript + ':loaded', allDoneLoad);
    }
    
    function triggerDone()
    {
        // for(tdIdx=0; tdIdx<5000; tdIdx++){}
        setTimeout(function(){
            $(document).trigger(doneEvent);
            _logi('triggerDone()'); 
        }, 1);
    }
    
    function load()
    {
        _logi("load()");
        postLoad();
        /*
        var $container = $("#booklet-container");
        if(!$container.length) return;
        bookId = $container.data('book-id');
        bookletId = $container.data('booklet-id');
        var handle = bookletId + "-booklet";
        $.fn.datar({
            url : '/book/booklet', 
            data : { bookletId : bookletId },
            type : "post",
            success: function(response){
                var content = response.substr(5);
                $("#booklet-container").html(content);
                postLoad();
            },
            dataType : 'text'
        }, function(){}, function(){});
        */
    }
    
    function checkImgs()
    {
        $("#booklet-container").on('click tap', 'img', function(e){
            e.preventDefault();
            pauseScrollTracking = true;
            var ht = ($(window).height() - 0) + "px";
            var wt = ($(window).width() - 0) + "px";
            var img = $(this).attr("src");
            $(window).scrollTop(0);
            $("#my-shell").hide();
            var preview = [];
            preview.push("<div class='imgPreview' --style='width:"+wt+";height:"+ht+";'>");
            preview.push("  <img src='" + img + "'>");
            preview.push("  <a href='#closePreview' title='Close preview'>");
            preview.push("      <i class='fa fa-times' aria-hidden='true'></i>");
            preview.push("  </a>");
            preview.push("</div>");
            $("#my-shell").after(preview.join(""));
            return false;
        });
        
        $("body").on('click tap', 'div.imgPreview > a', function(e){
            e.preventDefault();
            $(".imgPreview").remove();
            $("#my-shell").show();
            getScrollPosition();
            return false;
        });
    }
    
    
/** TABLE OF CONTENTS (TOC) **/
    $("#myTocOpenBtn").on('click', openToc);
    $("#myTocCloseBtn").on('click', closeToc);

    function openToc(e){
        e.preventDefault();
        pauseScrollTracking = true;
        $("#myTocOpenBtn").hide();
        $("#myTocCloseBtn").show();
        $("#pageContainer").hide();
        $("#myToc").css({"width":'100%'});
        $("#myToc").show();
        return false;
    }

    function closeToc(e){
        e.preventDefault();
        $("#myTocOpenBtn").show();
        $("#myTocCloseBtn").hide();
        $("#pageContainer").show();
        $("#myToc").hide();
        getScrollPosition();
        return false;
    }
    
    function setNextBookletBtn()
    {
        var $container = $("#booklet-container");
        if(!$container.length) return;
        bookletId = $container.data('booklet-id');
        var $curLink = $('#tocLink' + bookletId);
        var $curLine = $curLink.parents("div.tocLine");
        var $nxtLink = $('a[data-index=' + ($curLink.data("index")+1) + ']');
        var $prvLink = $('a[data-index=' + ($curLink.data("index")-1) + ']');
        var nextBtnText = $nxtLink.length ? $nxtLink.data("sectionNum") + " - " + $nxtLink.data("sectionTitle") : '';
        var prevBtnText = $prvLink.length ? $prvLink.data("sectionNum") + " - " + $prvLink.data("sectionTitle") : ''; 
		setTimeout(function(){
			if(nextBtnText==''){
				$("#nextBookletBtn").css({"visibility":"hidden"});
			} else {
				$("#nextBookletBtn").css({"visibility":"visible"});
				$("#nextBookletBtn").attr("href", $nxtLink.attr("href"));
				$("#nextBookletBtn span").text(nextBtnText);
			}
			if(prevBtnText==''){
				$("#prevBookletBtn").css({"visibility":"hidden"});
			} else {
				$("#prevBookletBtn").css({"visibility":"visible"});
				$("#prevBookletBtn").attr("href", $prvLink.attr("href"));
				$("#prevBookletBtn span").text(prevBtnText);
			}
		}, 1000);
        $curLine.css({"background-color":"#999"});
        sections($curLink.data("chapterId"));
    }

    
/** SCROLL METHODS **/
    function initScrollListener()
    {
        storeScrollPosition();
        $(document).on('scrollstop', manageStoreScrollPosition);
		
		var activeMainMenuLink;
		$(".mainMenuLink").on('mouseenter',function(e){
			activeMainMenuLink = $(".activeMainMenuLink").text();
		});
		$(".mainMenuLink ").on('click',function(e){
			if(activeMainMenuLink=='Book' && $(this).text()!='Book'){
				// Leaving book
				appView = $(this).text()=='Lab' ? 'lab' : 'classroom';
				storeScrollPosition();
			} else if($(this).text()=='Book' && (activeMainMenuLink=='Lab' || activeMainMenuLink=='Class')){
				// Entering book
				appView = 'book';
				storeScrollPosition();
			}
		});
    }
	
	function makeid() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text + ":" + Date.now();
	}
    
    var storeScrollPositionTimeout = null;
	var pageGuid = makeid();
    
    function manageStoreScrollPosition()
    {
        clearTimeout(storeScrollPositionTimeout);
        storeScrollPositionTimeout = setTimeout(function(){
            storeScrollPosition();
        }, 2500);
    }
    
    function storeScrollPosition()
    {
        var $container = $("#booklet-container");
        var bookletId = $container.data('booklet-id');
        var scrollTop = $(window).scrollTop();
        $.fn.datar({
            url : '/book/scroll-position', 
            data : { 
				scrollTop : scrollTop, 
				bookletId : bookletId, 
				appView   : appView, 
				pageGuid  : pageGuid 
			},
            type : "post",
            success: function(response){},
            dataType : 'text'
        }, function(){}, function(){});
    }
    
    function getScrollPosition()
    {
        var $container = $("#booklet-container");
        var bookletId = $container.data('booklet-id');
        $("#booklet-loader").show();
        pauseScrollTracking = false;
        $.fn.datar({
            url : '/book/get-scroll-position', 
            data : { bookletId : bookletId, appView : appView },
            type : "post",
            success: function(res){
                if(res.bookletId==bookletId){
                    $(window).scrollTop(res.scrollTop);
                    $("> div", $container).css({"opacity":"1"});
                    $("#booklet-loader").fadeOut("slow");
                    $("#next-booklet-container").fadeIn("slow");
                }
            },
            dataType : 'JSON'
        }, function(){}, function(){});
    }

    
/** UTILITIES **/
    function _logi(msg){ /* window._logi(msg, 'booklet.js'); */ } //if(console){ console.log(msg); } }
    
    hunt();
    
    
    
            
    /* var speed = 20;
    var interval = 15;
    var initPageSize = true;
    var vsWt = $("#pageContainer").width(); //window.innerWidth - 20;
    var vsHt = calculateBodyHeight();
    
    function calculateBodyHeight()
    {
        return new Number(window.innerHeight - parseInt($("header").height()));
    }
    
    setInterval(function(){
        vsWt = $("#pageContainer").width();
        if(initPageSize || (vsWt!=$(".page").width())){
            $(".page").width(vsWt);
            initPageSize = false;
        }
    }, 500);

    function doTransition($pg)
    {
        var halfWt = new Number(vsWt/2);
        $pg.addClass("pageTransition");
        $pg.css({"marginLeft":halfWt+"px", "width":vsWt+"px", "minHeight":vsHt+"px"});
        var loop = setInterval(function(){
            if(!$pg.length){
                clearInterval(loop);
            }
            var num = $pg.css("marginLeft").replace('px','');
            var ml = new Number(num);
            if(ml>interval){
                $pg.css({"marginLeft":ml-interval});
            } else {
                $pg.css({"marginLeft":0});
                clearInterval(loop);
                $(".pageShow").removeClass("pageShow");
                $pg.addClass("pageShow");
                $pg.removeClass("pageTransition");
                $pg.css({"minHeight":0});
            }
        }, speed);
    } */
    
    /* var duration = 0.5; //second
    var steps = 40;
    
    function slide(elementID, styleProperty, newValue) {
        var currentElement = document.getElementById(elementID);
        // console.log(currentElement);
        // alert(typeof window['getComputedStyle']);
        var currentStyles = window.getComputedStyle(currentElement); //, null);
        var currentValue = currentStyles[styleProperty];
        var currentNumValue = currentValue.match(/\d+/)[0] * 1; //" * 1" forces string to number
        var propertyUnits = currentValue.match(/[a-zA-Z]+/)[0];
        
        if (newValue == "auto") { // a numerical height of a div must be computed
            newValue = currentElement.scrollHeight;
            console.log(newValue)
        }
            
        var stepCount
        var timeIncrement = duration / steps * 1000; //miliseconds
        var stepSize = (newValue - currentNumValue) / steps;
        
        var transitionValue = currentNumValue;
        
        for (n=1;n<=steps;n++) {
            setTimeout(function(){
                transitionValue = transitionValue + stepSize;
                currentElement.style[styleProperty] = transitionValue+propertyUnits; 
            }, timeIncrement*n);
        }
        
    } */
    
    
    
})(jQuery, window);