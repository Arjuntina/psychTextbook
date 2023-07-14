/** Javascript for book content **/
$(function(){
    function setContentVisibility()
    {
        var btns = $("button.bob-document-toggle");
        $(btns).each( function(i,e){
            var controlled = $(e).attr("aria-controls");
            if( !controlled ) return;
            $(e).show();
            $("#"+controlled).hide();
        });
    }
    setContentVisibility();
});
  
/** COLLAPSE **/
$("#booklet-container").on("click", "a.bob-collapse-toggle", function(e){
    e.preventDefault();
    var toggleId = $(this).attr("href");
    $(toggleId).parent().toggle();
    if( $(this).children("span.bob-expanded").css("display") == "none" ){
        $(this).children("span.bob-expanded").css("display","inline");
        $(this).children("span.bob-collapsed").css("display","none");
    }
    else
    {
        $(this).children("span.bob-expanded").css("display","none");
        $(this).children("span.bob-collapsed").css("display","inline");
    }
});
    
/** New Accessible Collapsitron 2021 **/
$("#booklet-container").on("click","button.bob-document-toggle",function(e){
    e.preventDefault();
    var controlled = $(this).attr("aria-controls");
    if( !controlled ) return;
    if( $(this).attr("aria-expanded") == "false" )
    {
        $(this).html("-").attr("aria-expanded","true");
        $("#"+controlled).show();
    }
    else if( $(this).attr("aria-expanded") == "true" )
    {
        $(this).html("+").attr("aria-expanded","false");
        $("#"+controlled).hide();
    }
});
    
/** Download files **/
$("#booklet-container").on("click", "a.get_document", function(e){
    e.preventDefault();
    var dataset = $(this).data();
    var url = window.location.protocol 
            + "//" 
            +  window.location.hostname 
            + "/book/document/"
            + dataset['document_id'];
    // console.log( url );
    window.location.assign( url );
});

$("body").on("click", "a.bob-document-toggle", function(e){
    e.preventDefault();
    var that = this;
    // var id = $(this).attr("id");
    // console.log( $(that).parents("table").children("tbody") );
    if( $(that).children("div.bob-expanded").css("display") == "none" ){
        $(that).children("div.bob-expanded").css("display","block");
        $(that).parents("table").children("tbody").show();
        $(that).children("div.bob-collapsed").css("display","none");
    } else {
        $(that).children("div.bob-expanded").css("display","none");
        $(that).children("div.bob-collapsed").css("display","block");
        $(that).parents("table").children("tbody").hide();
    }
});

/** REFERENCE POPUPS **/
/* Note to Erik:
   In Bob, we run an AJAX request to get a list of all indexes,
   using underscore.js to make an object of them to use for popups:
    var bookletId = $("div#booklet_Booklet_ID").text();
    var bookId  = $("div#booklet_Book_ID").text();
    var send = { action : "get_indexes", Index_Type : "Reference", Book_ID : bookId, Booklet_ID : bookletId };
    $.when( $.get( "buildbook.ajax.php", send, function(rtn, status, xhr){
            references = rtn;
        }, 'json')
    ).done( function(){
        var refs = {};
        // This next collapses the nested 2-level collection into a single-level collection we can get by index.
        $.when(
            _.each(references,function(blk){
                _.each(blk,function(ref){
                    if(ref!==undefined) refs[ref["ID"]] = ref;
                })
            })
        ).done( function(){
            references = refs;
        });
    });
*/
/*    $("div.layoutDesign").on("click", "span.refClose", function(f){
        f.stopPropagation();
        $(this).parent().remove();
    });
    $("div.layoutDesign").on("click", "s.Reference", function(e){
        e.stopPropagation();
        $(".refBox").remove();
        var s = $(this).data("ref");
        var ref = references[s];
        ref.Definition = '<span class="refClose" style=""><img src="images/shared/checkmark_r.png"></span>' + ref.Definition;
        // console.log( ref );
        var isNumber = +s === +s;
        var id = "ref" + ( true === isNumber ? s : s.substr( 0, 2 ) );
        var div = $("<div></div>").attr("id",id).addClass("refBox").prop("title","Hit Escape to close").html( ref.Definition );
        if( $(this).next().length == 0 )
        {
            // alert( "End of container" );
            $(this).append( div );
        }
        else
        {
            var oldRef  = this;
            var thisRef = this;
            while( thisRef = $(thisRef).next() )
            {
                if( false === $(thisRef).hasClass("Reference") )
                {
                    // $(oldRef).after( div );
                    $(oldRef).append( div );
                    // console.log( [ oldRef, thisRef ] );
                    break;
                }
                else
                {
                    oldRef = thisRef;
                }
            }
            // $(thisRef).append( div );
        }
        // $(this).parent().prepend( div );
        $("body").one("keyup",function(e){ if(e.which==27) $("div#"+id).remove(); });
    });*/

/** FORM FIELDS **/
(function(){
/*
    .bob-form-mc
    .bob-form-sa
*/    
    $(".bob-form-mc").each(function(index, elm){

        $("ol li", elm).each(function(liIdx, li){
            var first8 = $(li).html().substring(0, 8);
            if(first8=='<s>*</s>'){
                $("s:first", li).hide();
            }
        });
       
    });
    
    $(".bob-form-sa").each(function(index, elm){
       
        var hide = false;
        var closingBrackets = 0;
        $("s", elm).each(function(sIdx, s){
            var firstChar = $(s).text().substring(0, 1);
            if(firstChar=='{'){
                hide = true;
            }
            if($(s).text()=='}'){
                closingBrackets++;
            }
            if(hide){
                $(s).addClass("bob-form-sa-blank");
                $(s).text($(s).text().replace('{',''));
                $(s).text($(s).text().replace('}',''));
            }
            if(closingBrackets==2){
                closingBrackets = 0;
                hide = false;
            }
        });
        
    });
    
    
})();

/** SENSITIVE CONTENT **/

$("body").on("click", "div.target", function(e){
    e.preventDefault();
    let target = $(this).data("target");
    if( $(this).hasClass("unclicked") )
    {
        $("div#"+target).find("img").css({opacity:"inherit","-webkit-filter":"none",filter:"none"});
        $(this).find("div.unhideblur").html("rehide the image");
        $(this).removeClass("unclicked").addClass("clicked");
    }
    else if( $(this).hasClass("clicked") )
    {
        $("div#"+target).find("img").css({opacity:"0.3","-webkit-filter":"blur(16px)",filter:"grayscale(100%) blur(16px)"});
        $(this).find("div.unhideblur").html("click to unhide the following image");
        $(this).removeClass("clicked").addClass("unclicked");
    }
});

(function() {
    let sensitives = $("div.sensitive");
    // console.log( sensitives );
    let msg = 'This image may be considered offensive, graphic or violent, which could be disturbing to some readers. Historical content in textbooks may sometimes reflect outdated, disrespectful, and/or biased language, viewpoints and opinions. These materials are presented for their historical significance and do not express the beliefs or opinions of the authors or BVT Publishing.<br><div class="w3-btn w3-block unhideblur" style="">click to unhide the following image</div>';
    $.each(sensitives, function(i, e){
        let id = $(e).attr("id");
        $("<div>").addClass("target unclicked").attr("data-target",id).html( msg ).insertBefore( $(e) );
    })
})();

/** APPLYING MIRROR-TEXT CSS **/
/*
## Add your custom CSS to the Book record (i.e., .mirror { position: relative; } .mirrored::after { content: attr(data-content); } )
## Put something like this in the block record:
setTimeout(function(){
   customCss( 'mirror', 'head2Variant' )
}, 500);
## The setTimeout is there because there needs to be time to load resources.
*/
function customCss( searchClass, inlineClass )
{
    // ## So your searchClass can be anything but the mirrored class will be the searchClass ending with 'ed'
    let afterClass = searchClass + 'ed'
    let mirrors = document.getElementsByClassName( searchClass )
    if( mirrors.length > 0 )
    {
        // console.log( 'Loading mirrorText.js' )
        for( node of mirrors )
        {
            let children = node.children
            let targets = Array.prototype.filter.call(children, function(element, index, children){
                var thisElemClass = element.className.trim()
                if( thisElemClass != '' ) {
                    var classNames = thisElemClass.split(' ')
                    if( classNames.indexOf(inlineClass) > -1 )
                    {
                        // let nodeid = randomString()
                        let nodetext = element.innerText.trim()
                        $(element)./* attr("id",nodeid). */attr("data-content",nodetext).addClass( afterClass )
                    }
                }
            })
        }
    }
}
