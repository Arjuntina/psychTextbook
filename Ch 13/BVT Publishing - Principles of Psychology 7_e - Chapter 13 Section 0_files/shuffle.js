/** 
    https://j11y.io/javascript/shuffling-the-dom/
    https://css-tricks.com/snippets/jquery/shuffle-dom-elements/ 
    
    ## Usage

    // Shuffle all list items within a list:
    $('ul#list li').shuffle();
     
    // Shuffle all DIVs within the document:
    $('div').shuffle();
     
    // Shuffle all <a>s and <em>s:
    $('a,em').shuffle();
**/
(function($){
 
    $.fn.shuffle = function() {
 
        var allElems = this.get(),
            getRandom = function(max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function(){
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
           });
 
        this.each(function(i){
            $(this).replaceWith($(shuffled[i]));
        });
 
        return $(shuffled);
 
    };
 
})(jQuery);