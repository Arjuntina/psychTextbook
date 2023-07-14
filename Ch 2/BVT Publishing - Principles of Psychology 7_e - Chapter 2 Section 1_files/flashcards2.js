/** flashcards.js **/
(function($){
    
    function load()
    {
        distributeCards();
        listeners();
        checkPaginationLinks();
    }
    
    function checkPaginationLinks()
    {
        var prevBookletId = $("#lab-container").data("prevBookletId");
        var nextBookletId = $("#lab-container").data("nextBookletId");
        var $prevBtn = $(".flashcard-container .prevBookletBtn");
        var $nextBtn = $(".flashcard-container .nextBookletBtn");
        
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
    }
        
    function distributeCards()
    {
        var trm = null,
            def = null,
            blockId = null,
            $block = null;
            // $layout = null
        $("dl.card").each(function(index, elm){
            trm = $("dt", elm).text();
            def = $("dd", elm).html();
            blockId = $(elm).data("block-id");
            hideIdx = $(elm).data("hide-index");
            if(hideIdx){
                return;
            }
            $block = $("#block_" + blockId);
            // $layout = $block.parents(".layoutDesign");
            // layoutId = $layout.data("layout-id");
            id = "keyTerm_" + blockId + "_" + index;
            if(!$block.next('.key-term-container').length){
                $block.after('<div class="key-term-container"></div>');
            }
            $block.next('.key-term-container').append(_buildKeyTermOutput(trm, def, id, index+1));
        });
    }
    
    function _buildKeyTermOutput(term, def, id, btIdx)
    {
        var card = [];
        card.push("<dl id='"+id+"' class='key-term'>");
        card.push(" <dt><span style='color:#696969;'>Key term:</span> <em>"+term.trim().replace(':definition','')+"</em></dt><dd>"+def+"</dd>");
        card.push("</dl>");
        return card.join("");
    }
    
    function updateCorrectCount()
    {
        var count = $("span.flashcards-correct-count").text();
        $("span.flashcards-correct-count").text(parseInt(count)+1);
    }
	
	function storeCardInteraction(elm)
	{
		if(elm.tagName.toUpperCase()=='DL'){
			var dl = $(elm);		
		} else {
			var dl = $(elm).parents('DL');
		}
		$.ajax({
			 url : "/resources/flashcards/set-usage"
			,data : { indexId : $(dl).data("indexId") }
			,type : "post"
			,success : function(json){
				// console.log(json);
			}
			,dataType : "json"
		});
	}
    
    function listeners()
    {
        $(".card").on('click', function(){
			$("dt, dd", this).toggle(); 
			storeCardInteraction(this);
        });
        
        $(".card a.card-speak").on('click', function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var $card = $(this).parents(".card");
            var $term = $("dt:visible", $card);
            var $def = $("dd:visible", $card);
            if($term.length){
                responsiveVoice.speak($term.text());
            } else {
                responsiveVoice.speak($def.text());
            }
            return false;
        });
        
        $(".card a.card-wrong").on('click', function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var card = $(this).parents(".card");
            swal("Ahh man!");
            return false;
        });
        
        $(".card a.card-right").on('click', function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var card = $(this).parents(".card");
            $(card).fadeOut("slow");
            updateCorrectCount();
			storeCardInteraction(this);
            return false;
        });
        
        $("#flashcardControls a[href=#flashcards-shuffle]").on('click', function(e){
            e.preventDefault();
            $("#flashcards .card").shuffle();
            return false;
        });
        
        $("#flashcardControls a[href=#flashcards-show-terms]").on('click', function(e){
            e.preventDefault();
            $(".card dd").hide();
            $(".card dt").show();
            return false;
        });
        
        $("#flashcardControls a[href=#flashcards-show-defs]").on('click', function(e){
            e.preventDefault();
            $(".card dd").show();
            $(".card dt").hide();
            return false;
        });
        
        $("#flashcardControls a[href=#flashcards-unhide]").on('click', function(e){
            e.preventDefault();
            $(".card").show();
            $(".card dd").hide();
            $(".card dt").show();
            $("span.flashcards-correct-count").text(0);
            return false;
        });
    }
    
    function _logi(msg){ /* window._logi(msg, 'flashcards.js'); */ } //if(console){ console.log(msg); } }
    
    load();
    
})(jQuery);