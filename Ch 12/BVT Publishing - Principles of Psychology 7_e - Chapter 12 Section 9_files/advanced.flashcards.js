/** advanced.flashcards.js **/

function AdvancedFlashcards(){
	
	this.load = function()
    {
        distributeCards();
        listeners();
        checkPaginationLinks();
    }
    
    function checkPaginationLinks()
    {
        var prevBookletId = $("#lab-container").data("prevBookletId");
        var nextBookletId = $("#lab-container").data("nextBookletId");
        var $prevBtn = $(".advancedFlashcards-container .prevBookletBtn");
        var $nextBtn = $(".advancedFlashcards-container .nextBookletBtn");
        
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
        $("dl.card").each(function(index, elm){
            trm = $("dt", elm).text();
            def = $("dd", elm).html();
            blockId = $(elm).data("block-id");
            hideIdx = $(elm).data("hide-index");
            if(hideIdx){
                return;
            }
            $block = $("#block_" + blockId);
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
        var count = $("span.advancedFlashcards-correct-count").text();
        $("span.advancedFlashcards-correct-count").text(parseInt(count)+1);
    }
	
	function storeCardInteraction(elm)
	{
		if(elm.tagName.toUpperCase()=='DL'){
			var dl = $(elm);		
		} else {
			var dl = $(elm).parents('DL');
		}
		/* $.ajax({
			 url : "/resources/flashcards/set-usage"
			,data : { indexId : $(dl).data("indexId") }
			,type : "post"
			,success : function(json){
				// console.log(json);
			}
			,dataType : "json"
		}); */
	}
    
    function listeners()
    {
		let context = $("#advancedFlashcards-container");
		let controlsContainer = $("#advancedFlashcardControls", context);
        $(".card", context).off('click');
        $(".card", context).on('click', function(){
			$("dt, dd", this).toggle(); 
			storeCardInteraction(this);
        });
        
        $(".card a.card-speak", context).off('click');
        $(".card a.card-speak", context).on('click', function(e){
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
        
        $(".card a.card-wrong", context).off('click');
        $(".card a.card-wrong", context).on('click', function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var card = $(this).parents(".card");
            swal("Ahh man!");
            return false;
        });
        
        $(".card a.card-right", context).off('click');
        $(".card a.card-right", context).on('click', function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var card = $(this).parents(".card");
            $(card).fadeOut("slow");
            updateCorrectCount();
			storeCardInteraction(this);
            return false;
        });
        
		
        $("a[href=#advancedFlashcards-shuffle]", controlsContainer).off('click');
        $("a[href=#advancedFlashcards-shuffle]", controlsContainer).on('click', function(e){
            e.preventDefault();
            $("#advancedFlashcards .card").shuffle();
            return false;
        });
        
        $("a[href=#advancedFlashcards-show-terms]", controlsContainer).off('click');
        $("a[href=#advancedFlashcards-show-terms]", controlsContainer).on('click', function(e){
            e.preventDefault();
            $(".card dd").hide();
            $(".card dt").show();
            return false;
        });
        
        $("a[href=#advancedFlashcards-show-defs]", controlsContainer).off('click');
        $("a[href=#advancedFlashcards-show-defs]", controlsContainer).on('click', function(e){
            e.preventDefault();
            $(".card dd").show();
            $(".card dt").hide();
            return false;
        });
        
        $("a[href=#advancedFlashcards-unhide]", controlsContainer).off('click');
        $("a[href=#advancedFlashcards-unhide]", controlsContainer).on('click', function(e){
            e.preventDefault();
            $(".card").show();
            $(".card dd").hide();
            $(".card dt").show();
            $("span.advancedFlashcards-correct-count").text(0);
            return false;
        });
    }
    
}

(function($){
    
	let currentSection = $("#myTocOpenBtn span.w3-hide-medium").text();
	
    function load()
    {
		$("button.lab-advanced-flashcard").on("click", getFlashcards); 
	}
	
	function getFlashcards()
	{
		let frm = $("#advancedFlashcardFiltersForm"),
			checkboxes = '',
			types = [],
			dt = {
				bookletId: $("#booklet-container").data("bookletId"),
				bookId: $("#booklet-container").data("bookId"),
				currentSection: currentSection
			};
		// console.log(['currentSection', currentSection]);
		
		if(frm.length){
			checkboxes = $(this).prop("name")=="section" ? "input[type=checkbox]" : "input[type=checkbox]:checked";
			Array.from($(checkboxes, frm)).forEach( (elm) => types.push($(elm).val()) );
		
			dt.section = $("input[name=section]:checked", frm).val();
			dt.chapterFrom = $("select[name=chapter-from]", frm).val();
			dt.chapterTo = $("select[name=chapter-to]", frm).val();
			dt.type = types;
		}
		$.ajax({
			url: "/resources/advanced-flashcards",
			data: dt,
			type: "post",
			dataType: "html",
			success: function(html){
				$(".advanced-flashcard-container").html(html);
				let obj = new AdvancedFlashcards();
				obj.load();
				listeners2();
				window.scrollTo(0, 0);
			}
		});
    }
	
    function jumpToSection(e)
    {
		e.preventDefault();
		currentSection = $(this).data("section");
		getFlashcards();
		return false;
    }
	
    function updateChapter(e)
    {
		e.preventDefault();
		$("input[value=\"range\"]").attr("checked",true);
		getFlashcards();
		return false;
    }
	
    function listeners2()
    {
		$("form#advancedFlashcardFiltersForm input").off("click");
		$("form#advancedFlashcardFiltersForm input").on("click", getFlashcards);
		$("form#advancedFlashcardFiltersForm select.filter-chapter").off("change");
		$("form#advancedFlashcardFiltersForm select.filter-chapter").on("change", updateChapter);
		$("a.advancedFlashcardsBtn").off("click");
		$("a.advancedFlashcardsBtn").on("click", jumpToSection);
	}
	
    load();
    
})(jQuery);