/** context.js **/
(function($){
    
    var contextMenuIsVisible = true;
	var contextMenuExpireTimeout;
    
    function load()
    {
        $(document).on('contextmenu', "#booklet-container", function(e){
            e.preventDefault();
            return false;
        });
        
        $(document).on('mouseup', "#booklet-container", function(e){
            loadContextMenu();
        });
        
        // $(document).on('click', "#booklet-container", function(e){
            // loadContextMenu();
        // });
        
        $(document).on('taphold', "#booklet-container", function(e){
            loadContextMenu();
        });
        
        $(document).on('click', "#bc-menu-2-close", function(e){
            $("#booklet-context-menu").hide();
        });
    }
    
    function textIsSelected()
    {
        selectedText = false;
        if(window.getSelection){
            selectedText = window.getSelection();
        } else if(document.getSelection){
            selectedText = document.getSelection();
        } else {
            selectedText = document.selection.createRange().text;
        }
        if(!selectedText || selectedText==""){
            if(document.activeElement.selectionStart){
                selectedText = document.activeElement.value.substring(
                    document.activeElement.selectionStart
                    . document.activeElement.selectionEnd);
            }
        }
        return (selectedText.isCollapsed ? false : true);
    }
    
    function loadContextMenu()
    {        
		clearTimeout(contextMenuExpireTimeout);
        if (textIsSelected()) {
            $("#booklet-context-menu").show();
			contextMenuExpireTimeout = setTimeout(function(){
				if(!textIsSelected()){
					$("#booklet-context-menu").fadeOut("slow");
				}
			}, 5000);
        } else {
            $("#booklet-context-menu").hide();
        }
    }
    
    function resetMenu()
    {
        contextMenuIsVisible = false;
    }
    
    function _getAnchorNode()
    {
        var $nodes      = $("#booklet-container s"),
            anchorNode  = window.getSelection().anchorNode.parentNode,
            anchorIndex = $nodes.index(anchorNode),
            anchorElement,
            focusNode   = window.getSelection().focusNode.parentNode,
            focusIndex  = $nodes.index(focusNode),
            focusElement,
            topNode,
            pos,
            options;
        if(isNaN(Number(anchorIndex))){
            anchorIndex = anchorIndex.substring(1,10);
        }
        anchorElement = parseInt(anchorIndex);
        if(isNaN(Number(focusIndex))){
            focusIndex = focusIndex.substring(1,10);
        }
        focusElement = parseInt(focusIndex);
        topNode = focusElement > anchorElement ? anchorNode : focusNode;
        // bottomNode = focusElement > anchorElement ? focusNode : anchorNode;
        return topNode;
        // return bottomNode;
    }
    
    load();

    
})(jQuery);
