/** summary.js **/
(function($){
    
	var prevBookletId = $("#lab-container").data("prevBookletId");
	var nextBookletId = $("#lab-container").data("nextBookletId");
	var $prevBtn = $(".summary-container .prevBookletBtn");
	var $nextBtn = $(".summary-container .nextBookletBtn");
	
	if(!$prevBtn.length) return;
	if(!$nextBtn.length) return;
	
	if(prevBookletId){
		$prevBtn.show();
		$prevBtn.attr("onclick", $prevBtn.attr("onclick").replace('{prevBookletId}',prevBookletId));
	} else {
		$prevBtn.hide();
	}
	
	if(nextBookletId){
		$nextBtn.show();
		$nextBtn.attr("onclick", $nextBtn.attr("onclick").replace('{nextBookletId}',nextBookletId));
	} else {
		$nextBtn.hide();
	}
    
})(jQuery);
