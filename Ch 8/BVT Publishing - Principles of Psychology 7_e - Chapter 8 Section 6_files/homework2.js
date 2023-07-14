
/** homework.js **/
(function($){

    function load()
    {
        setupHomeworkListeners();
        checkPaginationLinks();
    }
    
    function checkPaginationLinks()
    {
        var prevBookletId = $("#lab-container").data("prevBookletId");
        var nextBookletId = $("#lab-container").data("nextBookletId");
        var $prevBtns = $(".homework-container .prevBookletBtn");
        var $nextBtns = $(".homework-container .nextBookletBtn");
        
        if(!$prevBtns.length) return;
        if(!$nextBtns.length) return;
        
        if(prevBookletId){
            $prevBtns.each(function(index, prv){
                $(prv).show();
                $(prv).attr("onclick", $(prv).attr("onclick").replace('{prevBookletId}',prevBookletId));
            });
        } else {
            $prevBtns.hide();
        }
        
        if(nextBookletId){
            $nextBtns.each(function(index, nxt){
                $(nxt).show();
                $(nxt).attr("onclick", $(nxt).attr("onclick").replace('{nextBookletId}',nextBookletId));
            });
        } else {
            $nextBtns.hide();
        }
    }
    
    function setupHomeworkListeners()
    {
        $("a[name=ShowAllQuestionsBtn]").on('click', function(e){
            e.preventDefault;
            var $workContainer = $(this).parents(".homework-container");
            var $submitBtn = $("#submitCourseWorkContainer", $workContainer);
            var $forms = $("form.notCurrentBookletQuestion", $workContainer);
            $forms.slideToggle("slow");
            $submitBtn.toggle();
            $(".showAllCollapsed", $workContainer).toggle();
            $(".showAllExpanded", $workContainer).toggle();
            //$(".showAllExpanded").toggle();
            return false;
        });
        
    /** TEXTAREA **/
        // $(".homeworkQuestionOption").on('click', function(e){
        $(".homeworkIsOpen .homeworkQuestionTextarea").on('blur', function(e){
            var $txtArea = $(this);
            var data = $txtArea.data();
            if(typeof data['studentId']=='undefined') {
                swal('This assignment is closed.');
                return false;
            }
            var post = {
                studentId: data.studentId, 
                textbookResourceUsageId: data.textbookResourceUsageId, 
                questionInstanceId: data.questionInstanceId, 
                textbookResourceId: data.textbookResourceId, 
                questionId: data.questionId, 
                context: data.context, 
                response: $txtArea.val()
            };
            var $form = $txtArea.parents("form");
            $.fn.datar({
                url : '/book/answer',
                data : post,
                type : "post",
                success: function(response){
                    checkSubmitBtn();
                },
                dataType : 'json'
            }, function(){}, function(){}); 
        });
        
    /** OPTION SELECT **/
		let = currentOptionId = null;
		$(".homeworkIsOpen li").on('click', saveAnswer);
		async function saveAnswer(){	
			if(!(await Signn.checkStatus())){
				return; // Not logged in
			}
			        
			var $radio = $("input",this);
			var $li = $radio.parent('li');
			var $ul = $li.parent('ul');
			var id = $radio.attr('id');
			if($radio.is(":disabled")){
				return;
			}
			
			$(".fa-toggle-on", $ul).removeClass("fa-toggle-on").addClass("fa-toggle-off");
			$(".fa", $li).addClass("fa-toggle-on").removeClass("fa-toggle-off");
			if(id==currentOptionId){
				return false;
			}
			currentOptionId = id;
			
			if($radio.hasClass("clickProcessing") || $radio.is(":disabled")){
				return;
			}
			$radio.addClass("clickProcessing");
			setTimeout(function(){
				$radio.removeClass("clickProcessing");
			}, 2000);
	
            var data = $radio.data();
            if(typeof data['studentId']=='undefined') {
                $radio.removeAttr('checked');
                swal('This assignment is closed.');
                return false;
            }
            var post = {
                studentId: data.studentId, 
                textbookResourceUsageId: data.textbookResourceUsageId, 
                questionInstanceId: data.questionInstanceId, 
                textbookResourceId: data.textbookResourceId, 
                questionId: data.questionId, 
                context: data.context, 
                response: $radio.val()
            };
            var $form = $radio.parents("form");
            var $daddy = $radio.parents("li");
            var $gramps = $daddy.parents("ul");
            var $label = $radio.siblings("label");
            var instantFeedback = $radio.data("instantFeedback");
            $("li", $gramps).addClass("option-status-empty").removeClass("option-status-wrong").removeClass("option-status-right");
            $.fn.datar({
                url : '/book/answer',
                data : post,
                type : "post",
                dataType : 'json',
                success: function(response){
								
					if(instantFeedback==1){
                        if(response.answerIsCorrect){
                            $daddy.addClass("option-status-right");
                            $('.homework-rationale', $form[0]).slideDown();
                        } else {
                            $daddy.addClass("option-status-wrong");
                            $('.homework-rationale', $form[0]).slideDown();
                        }
                    }
                    $radio.attr("checked", true);
                    checkSubmitBtn();
					// currentOptionId = null;
                }
            }, function(){}, function(){}); 
        }
        
    /** WORK SUBMIT **/
        $("input[name=Submit_Course_Work]").on('click', function(){
            var studentId = $(this).data('studentId');
            var liId = $(this).data('liId');
			var total = $("#liId_" + liId + " input.homeworkQuestionOption").length / 4;
			var chkd = $("#liId_" + liId + " input.homeworkQuestionOption:checked").length;
			var	msg = "<span>Once you submit this assignment, you will not be able to change any of your answers.</span>";
			if(total>chkd){
				msg = "<strong style='color:red;'>You have only answered " + chkd + " out of " + total + " questions.</strong><br><br>Once you submit this assignment, you will not be able to make any changes.";
			}
            swal({
                title: "Are you ready?",
                html: msg,
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, I\'m sure!',
                cancelButtonText: 'No, let me go back'
            }).then(function(result){
				if(result=='Signed out!'){
					window.location = '/';
					return;
				}
				if (result.value) {
                    $(this).parent().hide();
                    $("#submitCourseWorkContainer").hide();
                    $.fn.datar({
                        url : '/book/complete-work',
                        data : { studentId : studentId, liId : liId },
                        type : "post",
                        success: function(res){
                            if(typeof res['score']!='undefined'){
                                var score = res.score.Score;
                                var possible = res.score.Possible_Points;
                                $(".homeworkQuestionOption").attr('disabled',true);
                                if(res.allowRetake){
                                    $("#retakeCourseWorkContainer").show();
                                }
                                setOptionFeedback();
                                swal('Your course work was submitted successfully! You answered ' + score + ' out of ' + possible + ' correctly.').then(function(){
									location.reload();
								});
                            } else {
                                swal('We\'re sorry but your course work could not be submitted!');
                            }
                        },
                        dataType : 'json'
                    }, function(){}, function(){});
                } else {
                    swal({
                        type: 'success',
                        title: 'Wise choice!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            });
        });
        
    /** WORK RETAKE **/
        // $("input[name=Retake_Course_Work]").on('click', function(){
        $(".retakeCourseWorkButton").on('click', function(e){
			e.preventDefault();
            var studentId = $(this).data('studentId');
            var liId = $(this).data('liId');
			var ran = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            $.fn.datar({
                url : '/book/retake-work',
                data : { studentId : studentId, liId : liId },
                type : "post",
                success: function(res){
                    if(typeof res['status']!='undefined' && res['status']==true){
						window.location = window.location.href + "?" + ran + "#lab-coursework-" + liId;
						location.reload();
                    } else {
                        $("#retakeCourseWorkContainer").show();
                        $("#submitCourseWorkContainer").hide();
                    }
                },
                dataType : 'json'
            }, function(){}, function(){});
			return false;
        });
    }
    
    function setOptionFeedback()
    {
        $(".homeworkQuestionOption:checked").each(function(index, elm){
            var label = $(elm).prev('label');
            if($(elm).data('it')==1){
                $(label).addClass("option-status-right");
            } else {
                $(label).addClass("option-status-wrong");
            }
        });
    }
    
    function checkSubmitBtn()
    {
        var questionCount = $(".homework-container form").length;
        var checkedCount = $(".homework-container input[type=radio]:checked").length;
        if(questionCount==checkedCount){
            $("input[name=Submit_Course_Work]").show();
        }
    }
	
    load();
    
})(jQuery);