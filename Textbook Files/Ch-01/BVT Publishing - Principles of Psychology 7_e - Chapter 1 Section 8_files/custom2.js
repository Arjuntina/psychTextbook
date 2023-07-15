
/** custom.js **/
(function($){
    
    function loadEditModeSwitch()
	{
		if(false==showTools){
			addToolsMenuToBlocks(false);
			return;
		}
		var context = $("#booklet-container");
		var bookId = $(context).data("bookId");
		$.fn.datar({
			url : '/custom/tools',
			data : { bookId : bookId },
			type : "post",
			success: function(html){
				if(html!=''){
					$("#booklet-container").append(html);
					editModeButton();
				}
				addToolsMenuToBlocks(editMode);
			}
		}, function(){}, function(){});
	}
	
	function editModeButton()
	{
		$(".authoring-tools-toggle button").on('click',function(){
			var edit = 0;
			if($(".fa-toggle-on", this).length){
				$(".fa-toggle-on", this).removeClass("fa-toggle-on").addClass("fa-toggle-off");
				$(this).parent().removeClass("editModeOn").addClass("editModeOff");
			} else {
				edit = 1;
				$(".fa-toggle-off", this).removeClass("fa-toggle-off").addClass("fa-toggle-on");
				$(this).parent().removeClass("editModeOff").addClass("editModeOn");
			}
			$.ajax({
				url: "custom/toolsMode",
				data: { 
					bookId : $(".authoring-tools-toggle").data('bookId'), 
					editMode : edit 
				},
				method: 'POST'
			}).done(function(json) {
				location.reload();
			});
		});
	}
    
	function injectBlock(blk, json, idx, obj)
	{
		var blkId = '';
		if(obj.Block_ID!=null){
			if(obj.Block_ID.match("block")){
				blk = $("#" + obj.Block_ID);
				blkId = "#" + obj.Block_ID;
			} else if(obj.Block_ID.match("booklet-container-b")){
				blk = $("#booklet-container-b");
				blkId = "#booklet-container-b";
			} else {
				blk = $("#block_" + obj.Block_ID);
				blkId = "#block_" + obj.Block_ID;
			}
		}
		var layout = "div[data-layout-id=" + obj.Layout_ID + "]";
		$("> ul.customContentTools", blk).remove();
		var tmpContents = $(blk).html();
		
		// $(blk).html('<span style="display:none">' + tmpContents + '</span><span style="display:block;">' + obj.Content + '</span>');
		$(blk).addClass("block customized-block").removeClass("bodyIndent bodyFirst");
		if(editMode){ 
			$(blk).addClass("customizable");
			addToolsMenu($(blkId));
		}
		if(obj.Visible=='0'){
			if(json.userType=='Instructor' && json.authorTools['Edit_Mode']==1) {
				hideNStuff(blk, null, obj);
			} else {
				$(blk).hide();
			}
		} else {
			$(blk).html(obj.Content);
			addToolsMenu($(blkId));
		}
	}
	
	function loadCustomBlocks()
	{
		var bookletId = $("#booklet-container").data("bookletId");
		var blk;
		$.fn.datar({
			url : '/custom',
			data : { bookletId : bookletId },
			type : "post",
			success: function(json){
				var rows = json.rows;
				if(editMode){
					$("#booklet-container").append(buildAddBtn(null, true));
				} else {
					$("#booklet-container").append(buildAddBtn(null, false));
				}
				setTimeout(function(){
					$(rows).each(function(idx, obj){
						injectBlock(blk, json, idx, obj);
					});
				}, 200);
			},
			dataType : 'json'
		}, function(){}, function(){});
	}
	
	function buildAddBtn(anchor, placeHolderWithButton)
	{
		var id = (anchor ? $(anchor).prop('id') + '-b' : "booklet-container-b");
		var btn = '';
		if(placeHolderWithButton){
			btn = $("<button>").html("<em class=\"fa fa-plus\"></em>").addClass("add_custom_btn").attr("data-block-id",id);
		}
		return $("<p>").html(btn).attr("id",id).addClass("block").attr("data-class",$(anchor).prop("class") + " customized-block"); // custom-added-block");
	}
	
	function hideNStuff(block, blockId, obj)
	{
		var html, text, id;
		if(obj){
			html = obj.Content;
			text = $(obj.Content).text().substr(0, 70).trim();
			id = 'data-block-id="'+obj.Block_ID+'"';
		} else {
			html = $(block).html();
			text = $(block).text().substr(0, 70).trim();
			id = 'data-block-id="'+blockId+'"';
		}
		$(block).html('<a href="#cct-show" ' + id + '><i class="fa fa-eye"></i> show</a>&nbsp;<small>HIDDEN</small> ' + text + '...<div class="custom-hide-html" style="display:none;">' + html + '</div>');
		$(block).addClass("custom-hidden-sneakapeak").removeClass("customized-block bodyIndent bodyFirst");
	}
	
	function addCreateButton(elm, placeHolderWithButton)
	{
		if($(elm).html()=='') return;
		if($(elm).attr("id").match("custom_block")) return;
// console.log({id:$(elm).attr("id"),elm:elm,placeHolderWithButton:placeHolderWithButton});
		$(elm).before(buildAddBtn($(elm), placeHolderWithButton)); //$("<button>").text("Add Content +").addClass("add_custom_btn"));
	}
	
	function addToolsMenu(elm)
	{
		if(false==editMode) return;
		if($(elm).html()=='') return;
		var isCustomized = false;
		var blockId = $(elm).attr("id");
		var revertAttr = {
			"href":"#cct-revert",
			"data-block-id":blockId
		};
		var editAttr = {
			"href":"#cct-edit",
			"data-block-id":blockId
		};
		var removeAttr = {
			"href": "#cct-remove",
			"data-block-id": blockId
		};
		var ul = $('<ul>').addClass("customContentTools");
			// if(isCustomized){
				// ul.append($('<li>').html($('<a>').attr(revertAttr).html('<i class="fa fa-history"></i>')));
			// }
		ul.append($('<li>').html($('<a>').attr(editAttr).html('<i class="fa fa-edit"></i>')));
		ul.append($('<li>').html($('<a>').attr(removeAttr).html('<i class="fa fa-eye-slash"></i>')));
		ul.append($('<li>').html($('<a>').attr(revertAttr).html('<i class="fa fa-history"></i>')));
		if($("> ul.customContentTools", elm).length){
			 $("ul.customContentTools", elm).replaceWith(ul);
		} else {
			$(elm).append(ul);
		}
	}
	
	function addToolsMenuToBlocks(placeHolderWithButton)
	{
	// LOOP THROUGH BLOCKS AND ADD EDIT CONTROLS
		var custElms = [];
		custElms.push(".bodyFirst");
		custElms.push(".bodyIndent");
		custElms.push(".customized-block");
		$(custElms.join(":visible, ")).each(function(idx, elm){
			if(!$(elm).attr("id")){ return; }
			if(editMode){
				$(elm).addClass("customizable");
				addToolsMenu($(elm));
			}
			addCreateButton(elm, placeHolderWithButton);
		});
	}
	
	function setBlockHold(blockId, hold)
	{
		$.ajax({
			url : '/custom/hold',
			data : { 
				blockId : blockId,
				hold : hold
			},
			type : "post",
			success: function(str){}
		});
	}
	
	function openEditor(toolLink, custom)
	{
		var block = $(toolLink).parents("p.block");
		var val = custom=='custom' ? '' : ($(">span:hidden", block).length ? $(">span:visible", block).html() : $(block).html()); //mode=='add' ? '' : $(block).html();
		var blockId = $(toolLink).data("blockId");
		var isCustom = false; 
		var context = $("#booklet-container");
		var bookletId = $(context).data("bookletId");
		var textarea = $('<textarea>')
			.css({"width":0,"height":0})
			.attr("id","customContentEditor" + blockId)
			.val(val);
		swal({ 
			width:"90%",
			width: 750,
			html: textarea,
			onOpen: function(modalDom){
				setTimeout(function(){
					tinymce.init({
						forced_root_block : "",
						selector: 'textarea#customContentEditor' + blockId,
						plugins: [
							"paste advlist lists image media link",
							"table visualblocks wordcount textcolor"
						],
						width: "100%",
						height: $(window).height()*0.70,
						menubar: "insert table",
						// toolbar: "undo redo paste pastetext bold italic underline fontselect fontsizeselect forecolor alignleft aligncenter alignright alignjustify indent outdent numlist bullist image media link table",
						toolbar: "undo redo bold italic underline fontselect fontsizeselect forecolor backcolor alignleft aligncenter alignright alignjustify indent outdent numlist bullist image media link table",
						content_style: '.bob-hidden { display:none; } .customContentTools { display:none; } s { text-decoration:none; } ',
						font_formats: 'Verdana=Verdana, Geneva, sans-serif; Times New Roman=TimesNewRoman, "Times New Roman", Times, Baskerville, Georgia, serif;',
						fontsize_formats: '14px 17px 20px 26px',
						color_cols: 4,
						color_rows: 2,
						color_map: [
							"000000", "Black",
							"595959", "Gray",
							"0033cc", "Blue",
							"008000", "Green",
							"c00000", "Red",
							"7030a0", "Purple",
							"ff9900", "Orange",
							"ffffff", "White"
						],
						custom_colors: false,
						paste_as_text: true,
						force_br_newlines : false,
						force_p_newlines : true
					});
				}, 1000);
			},
			onClose: function(){
				tinymce.remove();
			},
			confirmButtonText: "Save",
			cancelButtonText: "Close",
			showCancelButton: true
		}).then(function(result){
			if(result.value){
				var tmpContent = $("#customContentEditor" + blockId).val().split('<ul class="customContentTools">');
				var content = tmpContent[0];
				if(content==''){
					return false;
				}
				tinymce.remove();
				$.fn.datar({
					url : '/custom/edit',
					data : { 
						content : content,
						isCustom : isCustom,
						bookletId : bookletId,
						blockId : blockId
					},
					type : "post",
					success: function(html){
						if(html){
							$(block).html(html).addClass("customized-block").removeClass("bodyIndent bodyFirst");
							if($(block).data("class") != 'undefined'){
								$(block).attr("class",$(block).data("class"));
							}
							addToolsMenu($(block));
						}
					}
				}, function(){}, function(){});
			}
			setBlockHold($(block).attr("id"),0);
		});
	}
		
	function revertBlock(e)
	{
		e.preventDefault();
		var toolLink = $(this);
		var block = $(toolLink).parents("p.block");
		$.fn.datar({
			url : '/custom/revert',
			data : { 
				blockId : $(block).attr("id")
			},
			type : "post",
			success: function(resp){
				Swal.fire({
					title: "Versions",
					html: resp,
					width: "50%",
					showCloseButton: true,
					confirmButtonText: "Close"
				});
			}
		}, function(){}, function(){});
		return false;
	}
		
	var editMode = false;
	var showTools = false;
    function load()
    {
		var tiny = 	null;
		var context = $("#booklet-container");
		editMode = $("#booklet-container").data("editMode")==1 ? true : false;
		showTools = $("#booklet-container").data("showAuthoringTools")==1 ? true : false;
		$(context).addClass('customize-mode');
		loadEditModeSwitch();
		loadCustomBlocks();

		$(context).on('click', "a[href=#cct-revert]", revertBlock);
		
	// ON CLICK BLOCK EDIT ICON
		function editBlock(e)
		{
			e.preventDefault();
			var toolLink = $(this);
			$.ajax({
				url : '/custom/hold',
				data : { 
					blockId : $(toolLink).data("blockId"),
					hold : 1
				},
				type : "post",
				success: function(str){
					if(str=='1'){
						swal("This block is currently being edited by another user. Please try again later.");
					} else {
						openEditor(toolLink);
					}
				}
			});
			return false;
		}
		$(context).on('click', "a[href=#cct-edit]", editBlock);
		
	// ON CLICK BLOCK ADD ICON
		/* function addBlock(e)
		{
			e.preventDefault();
			var toolLink = $(this);
			openEditor(toolLink, 'add', null, null);
			// loadStyles(toolLink, 'add');
			return false;
		}
		$(context).on('click', "a[href=#cct-add]", addBlock); */
		
	// ON CLICK BLOCK ADD ICON
		function showBlock(e)
		{
			e.preventDefault();
			var toolLink = $(this);
			var block = $(toolLink).parents(".block");
			// var blockId = $(toolLink).data("blockId");
			var blockId = $(block).attr("id");
			var bookletId = $("#booklet-container").data("bookletId");
			var html = $(".custom-hide-html", block).html();
			$.fn.datar({
				url : '/custom/show',
				data : { 
					bookletId : bookletId,
					blockId : blockId,
					content : html
				},
				type : "post",
				success: function(resp){
					var content = $(".custom-hide-html", block).html();
					$(block).html(content);
					$(block).removeClass("custom-hidden-sneakapeak").addClass("customizable customized-block");
					addToolsMenu($(block));
				}
			}, function(){}, function(){});
			return false;
		}
		$(context).on('click', "a[href=#cct-show]", showBlock);
		
	// ON CLICK BLOCK REMOVE ICON
		function removeBlock(e)
		{
			e.preventDefault();
			if(confirm('Are you sure that you want to remove this?'))
			{
				var block = $(this).parents("p.block");
				var blockId = $(block).prop("id");
				var bookletId = $(context).data("bookletId");
				$.fn.datar({
					url : '/custom/hide',
					data : { 
						bookletId : bookletId,
						blockId : blockId
					},
					type : "post",
					success: function(){
						hideNStuff(block, blockId, null);
					}
				}, function(){}, function(){});
			}
			return false;
		}
		$(context).on('click', "a[href=#cct-remove]", removeBlock);

		function addCustom(e)
		{
			e.preventDefault();
			openEditor(this, 'custom');
			return false;
		}
		$(context).on('click', "button.add_custom_btn", addCustom);


		$("body").on("click", ".swal2-content .versions-container a.versions-activate", function(e){
			e.preventDefault();
			let customBlockBackupsId = $(this).attr("href").replace('#activate-','');
			let status = $(this).parent("h5").text().split(' - ');
			$(this).parent("h5").addClass("active");
			$(this).parent("h5").next(".versions-text").addClass("active");
			$.ajax({
				url : '/custom/activate',
				data : { 
					customBlockBackupsId: customBlockBackupsId,
					status: status[0]
				},
				type : "post",
				success: function(resp){
					Swal.close();
					window.location.reload();			
				}
			});
			return false;
		});
    }
 
 	load();
	
})(jQuery);