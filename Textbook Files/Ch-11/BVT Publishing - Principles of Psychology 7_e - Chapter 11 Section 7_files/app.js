/** app.js **/
$(function(){

    // https://developers.google.com/analytics/devguides/collection/gtagjs/sending-data
    // $( document ).ajaxComplete(function(e, req, opts) {
        // console.log("app.js: " + opts.url);
        // gtag('js', new Date());
        // gtag('config', window.gaTrackingId, {
          // 'page_title': 'homepage',
          // 'page_location': 'http://foo.com/home',
          // 'page_path': '/home'
        // });
    // });
    // alert('app.js loaded!');
	
	function sslImgValid(){
		var name = 'sslImage';
		function getCookie(name) {
			return (name = (document.cookie + ';').match(new RegExp(name + '=.*;'))) && name[0].split(/=|;/)[1];
		}

		function setCookie(name, val){
			var e = new Date;
			e.setDate(e.getDate() + 1);
			document.cookie = name + "=" + val + ';expires=' + e.toUTCString() + ';path=/;domain=.' + document.domain;
		}
		
		if(null==getCookie(name)){
			var img = new Image;
			img.onload = function() { 
				setCookie('sslImage', 1);
			}
			img.onerror = function() {
				setCookie('sslImage', 0);
			}
			img.src = 'https://resources.bvtlab.com/spacer.png';
		}
		
		// if(getCookie(name)=='true'){
			// window['SSL_IMAGE_VALID'] = true;
		// } else {
			// window['SSL_IMAGE_VALID'] = false;
		// }
	} 
	sslImgValid();
	
	function toggleBackToTop()
	{
		if($(window).height()>$("body").height()){
			$(".my-back-up").hide();
		} else {
			$(".my-back-up").show();
		}
	}
	toggleBackToTop(); $( document ).ajaxComplete(toggleBackToTop);
	
    function countDown()
    {
        $(".app-countdown").each(function(index, elm){
            var expires = $(elm).data('expires');
            $.ajax({
               'url' : 'account/countdown', 
               'data' : { expires : expires, editionId : $(elm).data('editionId'), code : $(elm).data('code') },
               'success' : function(response){
                   $(elm).html(response);
               }
            });
        });
        
        // $(".app-countdown").on('click', "a.app-purchase-options", function(e){
            // e.preventDefault;
            
            // $.ajax({
               // 'url' : 'buy', 
               // 'data' : {},
               // 'success' : function(response){
                   // swal(response);
               // }
            // });
            
            // return false;
        // });
    }
    countDown();
	
// <a href="#report-a-problem" data-li-id="" data-tr-id=""><i class="fa fa-flag"></i> Report a problem</a>
	$("#pageContainer").on('mouseenter', ".my-tooltip2-toggle", function(e){
		$(".my-tooltip2").hide();
		let lpad = $(this).data("lpad") ? $(this).data("lpad") : 14;
		let viewPortHt = $(window).height();
		let scrollTop = $(document).scrollTop();
		let x = $(this).offset();
		let tooltip = $(this).next(".my-tooltip2");
		let boxPosition = (x.top-scrollTop)+$(tooltip).innerHeight();
		
		if( boxPosition > viewPortHt ){
			let over = boxPosition - viewPortHt;
			let newTop = x.top - (over+10);
			x.top = newTop;
		}
		
		if($(".fa-info-circle", tooltip).hasClass("w3-right")){
			let newLeft = x.left - $(tooltip).innerWidth() + lpad;
			x.left = newLeft;
		}
		$(tooltip).clone().appendTo("body").offset(x).show();
	});
	
	// $("#pageContainer").on('mouseleave', ".my-tooltip2", function(e){
	$("body").on('mouseleave', ".my-tooltip2", function(e){
		$(this).remove();
	});
	
	$("#pageContainer").on('click', "a[href=\"#report-a-problem\"]", function(e){
		e.preventDefault();
		var liId = $(this).data("liId");
		var trId = $(this).data("trId");
		swal({
			text: 'Please provide a detailed description of the problem.', 
            input: 'textarea',
            confirmButtonText: "Save",
            cancelButtonText: "Close",
            showCancelButton: true
        }).then(function(result){
            if(result.value){
                $.fn.datar({
                    url : '/contact/flag-question',
                    data : {
                        comment : result.value,
                        liId : liId,
						trId : trId
                    },
                    type : "post",
                    success: function(response){
                        swal({
                            position: 'right',
                            type: 'success',
                            title: 'Thank you!',
                            text: 'Our team has been notified of this issue.',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    },
                    dataType : 'json'
                }, function(){}, function(){});
            }
        });
		return false;
	});
    
});

