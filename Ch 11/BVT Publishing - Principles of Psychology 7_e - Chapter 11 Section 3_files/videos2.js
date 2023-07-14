/** videos.js **/
(function($){
	
    function load()
    {
        // VIDEOS
        $(".block-video").each(function(index, elm){
            var id = $(elm).attr("id").replace('block_','');
            if(id==3737)
                _getVideoForBlock3737(id);
            else
                _getVideoForBlock(id);
        });
        
        // VIDEO QUESTIONS
        $(".block-video-questions").each(function(index, elm){
            _getVideoQuestionsForBlock(elm);
        });
        
        // _getVideoQuestionsForBlock($("#block_67797"));
		
        setTimeout(function(){
            setupVideoQuestionListeners();
        }, 2000);
    }
    
    function _getVideoQuestionsForBlock(elm)
    {
        var group = $(elm).text().replace('{','').replace('}','');
        // var group = 'Business Cycle';
        if($(elm).length){
	       $.fn.datar({
                url : '/book/video/questions',
                data : { 
                    group : group,
                    bookId : $("#booklet-container").data("bookId")
                },
                type : "post",
                success: function(response){
					$(elm).html('');
                    if(response){
                        $(elm).after(response);
                    } else {
						// console.log('Video Fail...');
					}
                },
                dataType : 'html'
            }, function(){ }, function(){});
        }
    }
    
    function _getVideoForBlock(id)
    {
        var $blk = $("div#block_" + id);
		// var txt = "{Me Toitle|https://youtu.be/9wvE7juy_Vs}";
		// var txt = "{https://youtu.be/9wvE7juy_Vs|Me Toitle}";
		var txt = $blk.text();
		var title = 'Video';
        var video = txt.replace('{','').replace('}','');
		var pipe = /\|/;
		if(pipe.test(video)){
			var x = video.split('|');
			if(x[1].search('http')){
				title = x[1];
				video = x[0];
			} else {
				title = x[0];
				video = x[1];
			}
		}
        if($blk.length){
            $.fn.datar({
                url : '/book/video',
                data : { 
                    video : video,
					title : title
                },
                type : "get",
                success: function(response){
                    if(response){
                        $blk.html('');
                        $blk.after(response);
                    }
                },
                dataType : 'html'
            }, function(){}, function(){});
        }
    }
    
    function _getVideoForBlock3737(id)
    {
        var $blk = $("div#block_" + id);
        if($blk.length){
            $.fn.datar({
                url : '/book/video/blk' + id,
                data : null,
                type : "get",
                success: function(response){
                    if(response){
                        $blk.html('');
                        $blk.after(response);
                    }
                },
                dataType : 'html'
            }, function(){}, function(){});
        }
    }
    
    function returnVideoPlayerHtml(video)
    {
        var html = [];
        html.push('<video width="100%" controls>');
        html.push('<source src="' + video + '" type="video/mp4">');
        html.push('Your browser does not support the video tag.');
        html.push('</video>');
        return html.join('\r\n');
    }
    
    function setupVideoQuestionListeners()
    {
        $(".video-questions-container li").on('click', function(e){
            var $radio = $(".videoQuestionsQuestionOption", this);
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
                        $('.video-questions-rationale', $form[0]).slideDown();
                    } else {
                        $daddy.addClass("option-status-wrong");
                        $('.video-questions-rationale', $form[0]).slideDown();
                    }
                },
                dataType : 'json'
            }, function(){}, function(){});
        });
    }
    
    load();
    
})(jQuery);

