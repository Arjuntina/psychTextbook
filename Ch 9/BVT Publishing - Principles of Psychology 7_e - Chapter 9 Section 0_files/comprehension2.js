/** comprehension.js **/
(function($){
	
	function load()
	{
		$conts = $(".bhead-comprehension");
		var bookId = $("#booklet-container").data('bookId');
		var bookletId = $("#booklet-container").data('bookletId');
		var catchAllLoaded = false;
		var compBlockCount = parseInt($conts.length) - 1;
		var lastChapter = '';
		$conts.each(function(index, elm){
			_logi($(elm).text());
			var chapter = $(elm).text().replace('{','').replace('}','').trim();
			var lastChar = chapter.substring(chapter.length-1);
			if(isNaN(lastChar)){
				lastChapter = chapter.replace(lastChar,'');
			} else {
				catchAllLoaded = true;
				lastChapter = chapter;
			}
			$.fn.datar({
				url : '/resources/comprehension',
				data : { chapter : chapter, bookId : bookId, bookletId : bookletId },
				type : "post",
				success: function(response){
					$(elm).after(response);
					if(catchAllLoaded && compBlockCount==index){
						setTimeout(function(){
							setupComprehensionListeners();
						}, 3000);
					}
				},
			}, function(){ $(elm).hide(); }, function(){});
		});
		if(catchAllLoaded==false){
			$.fn.datar({
				url : '/resources/comprehension',
				data : { chapter : lastChapter, bookId : bookId, bookletId : bookletId },
				type : "post",
				success: function(response){
					$("#booklet-container").append(response);
					setTimeout(function(){
						setupComprehensionListeners();
					}, 3000);
				},
			}, function(){}, function(){});
		}
	}
    
    function setupComprehensionListeners()
    {
		let = currentOptionId = null;
        // $(".comprehension-container li").on('click', function(e){
        $(".comprehension-container li").on('click', saveAnswer);
		async function saveAnswer(){
			if(!(await Signn.checkStatus())){
				return; // Not logged in
			}
            var $radio = $(".comprehensionQuestionOption", this);
            var data = $radio.data();
            var post = {
                studentId: data.studentId, 
                textbookResourceUsageId: data.textbookResourceUsageId, 
                textbookResourceId: data.textbookResourceId, 
                questionId: data.questionId, 
                context: data.context, 
                response: $radio.val()
            };
            var $form = $radio.parents("form");
            var $label = $radio.siblings("label");
            var $daddy = $radio.parents("li");
            var $gramps = $daddy.parents("ul");
			var id = $radio.attr('id');
			if(id==currentOptionId){
				return false;
			}
			currentOptionId = id;
            $radio.attr("checked",true);
            $("li", $gramps)
                .addClass("option-status-empty")
                .removeClass("option-status-wrong")
                .removeClass("option-status-right");
            $.fn.datar({
                url : '/book/answer',
                data : post,
                type : "post",
                success: function(response){
                    if(response.answerIsCorrect){
                        $daddy.addClass("option-status-right");
                        $('.comprehension-rationale', $form[0]).slideDown();
                    } else {
                        $daddy.addClass("option-status-wrong");
                        $('.comprehension-rationale', $form[0]).slideDown();
                    }
                },
                dataType : 'json'
            }, function(){}, function(){});
        } // saveAnswer );
    }
    
    load();
    
})(jQuery);