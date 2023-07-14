
/** search.js **/
(function($){
	
    var myHilitor = new Hilitor("booklet-content");
    
    var substringMatcher = function(strs)
    {
        return function findMatches(q, cb) {
            var matches, substrRegex
            
            // an array that will be populated with substring matches
            matches = []
            
            if( '' === q )
                cb( strs )
            else if(typeof strs != 'undefined')
            {
                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i')
                
                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(strs, function(i, str) {
                    if (substrRegex.test(str)) {
                        matches.push(str)
                    }
                })
                if( matches.length == 0 ) matches.push( "No matches" )
                cb(matches)
            }
        };
    }
    
    function madAjax( method, url, data, finish)
    {
        if( method == 'GET' ){
            $.get(  url, data, function(rtn, status, xhr){ finish(rtn); }, 'json');
        } else if( method == 'POST' ){
            $.post( url, data, function(rtn, status, xhr){ finish(rtn); }, 'json');
        }
    }
	   
    function load()
    {
        $("button#searchButton").on("click", doSearch);
    }
    
    function toggleResults(e)
    {
        e.preventDefault;
        var cls = $(this).attr("href").replace('#','.');
        if($("li:hidden", cls).length){
            $("li:hidden", cls).show();
        } else {
            $("li:gt(5)", cls).hide();
        }
        return false;
    }
    
    function doSearch()
    {
		$("#searchButton").hide();
		$("#searchButton").after("<strong class='searching-message'><em>Searching...</em></strong>");
        var $bc = $("#booklet-container");
        var searchData = {
            bookId : $bc.data('bookId'),
            term : $('input[name="searchTerm"]').val(),
            content : $('input[name=Content]:checked').length,
            index : $('input[name=Indexes]:checked').length,
            toc : $('input[name=TOC]:checked').length
        }
        $.fn.datar({
            url : '/search/index',
            data : searchData,
            type : "post",
            success: function(response){
				$("#searchButton").show();
				$(".searching-message").remove();
                $(".searchResults").html(response);
                $(".sr-more-link").on('click', toggleResults);
            },
            dataType : 'html'
        }, function(){}, function(){});
    }
    
    function initSearchForm()
    {
        var data = { 
            // action: 'suggest', 
            book_id: $("#booklet-container").data('bookId') 
        };
        madAjax( 'POST', '/search/suggest', data, function(rtn){
            $( 'input[name="searchTerm"]' ).typeahead({
                hint: false,
                highlight: true,
                minLength: 2
            },
            {
                limit: 10000,
                name: 'subject',
                source: substringMatcher(rtn['Subject Index'])
            },
            {
                limit: 1000,
                name: 'name',
                source: substringMatcher(rtn['Name Index'])
            },
            {
                limit: 10000,
                name: 'key_term',
                source: substringMatcher(rtn['Key Term'])
            },
            {
                limit: 1000,
                name: 'toc',
                source: substringMatcher(rtn['TOC'])
            });
            $('input[name="searchTerm"]').on('typeahead:active', function(){
                $(this).val('');
            });
            $('input[name="searchTerm"]').on('typeahead:select', function(ev, suggestion) {
                if( false === isNaN( parseInt( suggestion.substr( 0, 1 ) ) ) ){
                    suggestion = suggestion.substr( -( suggestion.length - suggestion.indexOf( ":" )-1 ) ).trim()
                    $('input[name="TOC"]').attr("checked","checked");
                    $('input[name="Indexes"]').removeAttr("checked");
                } else {
                    $('input[name="TOC"]').removeAttr("checked");
                    $('input[name="Indexes"]').attr("checked","checked");
                }
                $('input[name="searchTerm"]').typeahead( 'val', suggestion );
                $("button#searchButton").trigger("click");
            });
        }); 
    }
    
    function searchWikipedia(term)
    {
        // alert("Let's do a wikipedia search for `" + term + "`");
        $.ajax({
            type: "GET",
            // url: "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + term + "&callback=?",
            url: "http://en.wiktionary.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + term + "&callback=?",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                if(data.error){
                    alert(data.error);
                } else {
                    $("#booklet-container").html(data.parse.text['*']);
                }
            },
            error: function (errorMessage) {
            }
        });
    }
    
    function searchBook(term)
    {
        var $bc = $("#booklet-container");
        var bookId = $bc.data('book-id');
        $.fn.datar({
            url : '/book/search',
            data : { term : term, bookId : bookId },
            type : "post",
            success: function(response){
                swal({
                    title: 'Search results',
                    html: response
                });
            },
            dataType : 'html'
        }, function(){}, function(){});
    }
    
    function searchPage(term)
    {
        // http://www.the-art-of-web.com/javascript/search-highlight/
        myHilitor.apply(term);
        // myHilitor.remove();
    }
    
    load();
    
})(jQuery);