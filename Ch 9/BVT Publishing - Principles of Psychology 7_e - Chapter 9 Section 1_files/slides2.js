/** slides.js **/
(function($){
    
    function load()
    {
        $("button.lab-slides").on("click", loadInitialSlides);
        checkPaginationLinks();
    }
    
    function loadInitialSlides()
    {
        var $first = $(".slides-container img:first-child");
        $first.attr("src", $first.data("src"));
        $first.show();
        $("button.lab-slides").off("click", loadInitialSlides);
        return true; 
    }
    
    function checkPaginationLinks()
    {
        var prevChapterBookletId = $("#lab-container").data("prevChapterBookletId");
        var nextChapterBookletId = $("#lab-container").data("nextChapterBookletId");
        var $prevBtn = $(".slides-container .prevBookletBtn");
        var $nextBtn = $(".slides-container .nextBookletBtn");
        
        if(!$prevBtn.length) return;
        if(!$nextBtn.length) return;
        
        if(prevChapterBookletId){
            $prevBtn.show();
            $prevBtn.attr("onclick", $prevBtn.attr("onclick").replace('{prevChapterBookletId}',prevChapterBookletId));
        } else {
            $prevBtn.hide();
        }
        
        if(nextChapterBookletId){
            $nextBtn.show();
            $nextBtn.attr("onclick", $nextBtn.attr("onclick").replace('{nextChapterBookletId}',nextChapterBookletId));
        } else {
            $nextBtn.hide();
        }
    }
    
	load();
    
})(jQuery);
