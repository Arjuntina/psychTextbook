
/** highlights.js **/
/* http://jsfiddle.net/JasonMore/gWZfb/ */
(function($){
	
    function load()
    {
		if(window['_highlights'] && window['_highlights'].length){
			var json = window['_highlights'][0];
			applyHighlights(json.bookHighlights);
			applyHighlights(json.instructorHighlights);
			applyHighlights(json.userHighlights);
		}
        listeners();
    }
    
    function listeners()
    {
        $(".highlighter").on('click', function(e){
            e.preventDefault();
            var color = $(this).data('color');
            newHighlight(color);
            return false;
        });
    }
    
    function applyHighlights(rows)
    {
        var $bc = $("#booklet-container"),
            $blocks = $(".block", $bc),
            $nodes = $("s", $bc),
            $aBlock,
            $zBlock,
            aBlockNode,
            zBlockNode,
            aNodeIndex,
            zNodeIndex;
        // Loop through highlights
        $.each(rows, function(index, row){
            $aBlock = $("#block_" + row.Start_Block_ID);
            $zBlock = $("#block_" + row.End_Block_ID);
            aBlockNode = $("s", $aBlock)[row.Start_Node];
            zBlockNode = $("s", $zBlock)[row.End_Node];
            aNodeIndex = $nodes.index(aBlockNode);
            zNodeIndex = $nodes.index(zBlockNode);
            for(apIdx=aNodeIndex; apIdx<=zNodeIndex; apIdx++){
                $($nodes[apIdx]).css({ "backgroundColor" : row.Color });
            }
        });
    }

    function newHighlight(highlightColor)
    {
        var $bc = $("#booklet-container");
        var bookId = $bc.data('book-id');
        var bookletId = $bc.data('booklet-id');
        // if (!window.getSelection().isCollapsed) {
        if (!window['_sel_'].isCollapsed) {
            var $nodes = $("#booklet-container s"),
                selectedText,
                aNode,
                zNode,
                aIndex,
                zIndex,
                aBlockId,
                zBlockId,
                thisNode,
                // anchorNode      = window.getSelection().anchorNode.parentNode,
                anchorNode      = window['_sel_'].anchorNode,
                anchorIndex     = $nodes.index(anchorNode),
                anchorElement,
                // focusNode       = window.getSelection().focusNode.parentNode,
                focusNode       = window['_sel_'].focusNode,
                focusIndex      = $("#booklet-container s").index(focusNode),
                focusElement,
                selectedText    = [];
                
            if (isNaN(Number(anchorIndex))) {
                anchorIndex = anchorIndex.substring(1,10);
                alert("Modified anchorIndex to " + anchorIndex);
            }
            anchorElement = parseInt(anchorIndex);
            
            if (isNaN(Number(focusIndex))) {
                focusIndex = focusIndex.substring(1,10);
                alert("Modified focusIndex to " + focusIndex);
            }
            focusElement = parseInt(focusIndex);
            
            if(focusElement > anchorElement){
                aIndex  = anchorElement;
                zIndex  = focusElement;
                aNode   = anchorNode;
                zNode   = focusNode;
            } else {
                aIndex  = focusElement;
                zIndex  = anchorElement;
                aNode   = focusNode;
                zNode   = anchorNode;
            }
            
            $aBlock  = $($nodes[aIndex]).parents(".block");
            $zBlock  = $($nodes[zIndex]).parents(".block");
            aBlockId = parseInt($aBlock.attr("id").replace('block_',''));
            zBlockId = parseInt($zBlock.attr("id").replace('block_',''));
            
            aBlockNodeIndex = $("s", $aBlock).index(aNode);
            zBlockNodeIndex = $("s", $zBlock).index(zNode);
            
            for (i = aIndex; i <= zIndex; i++) {
                thisNode = $nodes[i];
                if(thisNode){
                    /** APPLY HIGHLIGHT **/
                    $(thisNode).css({ "backgroundColor" : highlightColor });
                    /** STORE COLOR AND TEXT **/
                    selectedText.push($(thisNode).text());
                }
            }
            
            if( typeof window.getSelection().collapse=='object' ){
                window.getSelection().collapse(document.getElementById(aNode.toString()),0);
            }
            
            // INSERT HIGHLIGHTS
            var ajaxData = {
                "bookId": bookId,
                "bookletId": bookletId,
                "startNode": aBlockNodeIndex,
                "endNode": zBlockNodeIndex,
                "startBlockId": aBlockId,
                "endBlockId": zBlockId,
                "highlightColor": highlightColor,
                "selectedText" : selectedText.join('')
            };
            $.fn.datar({
                url : '/book/highlight',
                data : ajaxData,
                type : "post",
                success: function(response){
                },
                dataType : 'html'
            }, function(){}, function(){});
            
        } else {
            if(swal)
                swal("Please select some text to highlight.");
            else
                alert("Please select some text to highlight.");
        }
    }
    
    load();
    
})(jQuery);