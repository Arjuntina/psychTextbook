function parseParams(params)
{
    // This function parses query strings (k1=v1&k2=v2...) into an associative object.
    var rtn = {};
    var vars = params.split("&");
    for( var i=0; i < vars.length; i++ )
    {
        var pair = vars[i].split("=");
        rtn[pair[0]] = pair[1];
    }
    return rtn;
}

function applyListener(elm, group)
{
    // This function creates wrapper divs for collapsible content.
    var data = $(elm).data();
    var dataSet = data['dataset'];
    dataSet = parseParams( dataSet );
    var header = 'Show';
    if( "undefined" != typeof dataSet['header'] )
        header = dataSet['header'];
    var headerBar = '<div class="collapsitronVonHeadenBar headenBar' + group + ' hided">' + header + '<span id="showHideH' + group + '" style="float:right;">Show +</span></div>';
    // Plop the header bar in before the current element (which is first in the group)
    $(elm).before( headerBar );
    // Make the listeners
    $("div.headenBar" + group).on("click",function(){
        if( $(this).hasClass( "hided" ) ) {
            $(this).removeClass( "hided" ).addClass( "showed" );
            $("span#showHideH" + group).text( "Hide -" );
            $("."+group).show();
            $("div.footenBar" + group).show();
        } else {
            $(this).removeClass( "showed" ).addClass( "hided" );
            $("span#showHideH" + group).text( "Show +" );
            $("."+group).hide();
            $("div.footenBar" + group).hide();
        }
        // Add a listener to the footer
        $("div.footenBar" + group).on("click",function(){
            $("div.headenBar" + group).trigger("click");
        });
    });
    return elm;
}

(function(){
    
    // Find all elements in the page with class 'collapsitron'
    var coll = document.getElementsByClassName('collapsitron');
    // console.log( coll );
    if( coll.length > 0 )
    {
        var grp = 0;
        // Loop through the elements
        // We assume collapsible elements are contiguous. Non-contiguous regions may have unexpected behavior.
        for( k = 0; k < coll.length; k++ )
        {
            var v = coll.item(k);
            var classes = v.className.replace("  "," ").split( " " );
            // console.log( classes );
            // Because of the way the renderer works, the group identifier is always the last class
            var belongsTo = classes.pop();
            if( k == 0 )
            {
                // First in list; set the group and create the header bar and listener
                grp = belongsTo;
                applyListener( $(v), grp );
            }
            else
            {
                if( grp != belongsTo ){
                    // New group
                    var footerBar = '<div class="collapsitronVonFootenBar footenBar' + grp + '"><span id="showHideF' + grp + '" style="float:right;">Hide -</span></div>';
                    var prevV = coll.item(k-1);
                    $(prevV).after( footerBar );
                    var grp = belongsTo;
                    applyListener( $(v), grp );
                }
            }
            $(v).hide();
        }
        // Must have one last footer bar
        var footerBar = '<div class="collapsitronVonFootenBar footenBar' + grp + '"><span id="showHideF' + grp + '" style="float:right;">Hide -</span></div>';
        $(v).after( footerBar );
    }
    
})();