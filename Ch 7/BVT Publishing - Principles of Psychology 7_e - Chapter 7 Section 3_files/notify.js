
import "/vendors/toast/jquery.toast.js";

(function($){
	
	var bgImportant = "#ffcccc";
	var bgStandard = "#99ccff";
	var fgColor = "#000";
	
	function load()
	{
		getNotifications();
	}
	
	function getNotifications()
	{
		$.ajax({
			url : "/notifications/new",
			data : {},
			type : "GET",
			dataType : "JSON",
			success : function(json){
				makeToast(json);
			}
		});
	}
	
	function placeNotifications(notisCnt)
	{
		if(notisCnt==0) return;
		$("#brand-header .notify-count").text(notisCnt);
		$("#brand-header .notify-button").show();
	}
	
	function makeToast(json)
	{
		if($("#notifications-menu").length){ return; }
		var notis = json.notifications;
		var notisCnt = 0;
		$.each(notis, function(idx, elm){
			if(elm.Status!=null) return;
			notisCnt++;
			var bgColor = (elm.Type=="Important" ? bgImportant : bgStandard);
			var icon = (elm.Type=="Important" ? "warning" : "info");
			$.toast({
				heading: elm.Subject + ' ' + elm.Type,
				text: new String(elm.Message).slice(0, 40).trim() + '... <a href="/notifications/' + elm.ID + '">Read more</a>',
				hideAfter: false,
				stack: 4,
				position: "bottom-right",
				icon: icon,
				bgColor: bgColor,
				textColor: fgColor,
				beforeHide: function(){
					var id = parseInt(this.text.split("/notifications/")[1]);
					$.ajax({
						 url : '/notifications/read'
						,data : { notificationId : id }
						,type : 'POST'
					});
				}
			});
		});
		$(".jq-toast-single a").css({
			"color":fgColor,
			"border":"none",
			"textDecoration":"underline"
		});
		placeNotifications(notisCnt);
	}
	
	load();
	
})(jQuery);