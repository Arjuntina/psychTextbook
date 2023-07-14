var duration = 0.5; //second
var steps = 40;
var startChapter, scrollSection;

/* function chapters(partID) {
// console.log(['sections', chapterID]);
	var x = document.getElementsByClassName("chapterBlock");
	for (i = 0; i < x.length; i++) {
        var currentState = window.getComputedStyle(x[i], null).getPropertyValue("max-height");
        if (currentState != "0px") {
            var currentPartNumber = i + 1;
            var currentChapterBlockID = "s" + currentPartNumber;
            var oldBlock = document.getElementById(currentChapterBlockID);
            slide(currentChapterBlockID,'maxHeight','0');
        }
	}
	
	//scroll new chaoter to second from top
	var newPartNumber = partID.substring(1, 4) * 1;
	var tocList = document.getElementById("tocList");
	var currentScrollTop = tocList.scrollTop;
	//currentScrollTopValue = currentScrollTop.match(/\d+/)[0] * 1;
	var currentScrollInteger = Math.floor(currentScrollTop);
	// newScrollTop = (newPartNumber - 2) * 80 + 1;
	var newScrollTop = (newPartNumber - 2) * 40 + 1;

	scroll("tocList",'scrollTop',currentScrollInteger,newScrollTop);
	
	var newChapterBlockID = "s" + partID.substring(1, 4);
	var startBlock = document.getElementById(newChapterBlockID);
	var startChapterDivs = startBlock ? startBlock.getElementsByClassName("tocLine") : '';
	var sectionCount = startChapterDivs.length;
	var maxHeightValue = sectionCount * 80;
	
	setTimeout(function(){
		slide(newChapterBlockID, 'maxHeight', maxHeightValue);
	}, 200);
	
	var z = "	max-height: 220px";
} */

function sections(chapterID) {
// console.log(['sections', chapterID]);
	var x = document.getElementsByClassName("sectionBlock");
	for (i = 0; i < x.length; i++) {
        var currentState = window.getComputedStyle(x[i], null).getPropertyValue("max-height");
        if (currentState != "0px") {
            var currentChapterNumber = i + 1;
            var currentSectionBlockID = "s" + currentChapterNumber;
            var oldBlock = document.getElementById(currentSectionBlockID);
            slide(currentSectionBlockID,'maxHeight','0');
        }
	}
	
	//scroll new chaoter to second from top
	var newChapterNumber = chapterID.substring(1, 4) * 1;
	var tocList = document.getElementById("tocList");
	var currentScrollTop = tocList.scrollTop;
	//currentScrollTopValue = currentScrollTop.match(/\d+/)[0] * 1;
	var currentScrollInteger = Math.floor(currentScrollTop);
	// newScrollTop = (newChapterNumber - 2) * 80 + 1;
	var newScrollTop = (newChapterNumber - 2) * 40 + 1;

	scroll("tocList",'scrollTop',currentScrollInteger,newScrollTop);
	
	var newSectionBlockID = "s" + chapterID.substring(1, 4);
	var startBlock = document.getElementById(newSectionBlockID);
	var startSectionDivs = startBlock ? startBlock.getElementsByClassName("tocLine") : '';
	var sectionCount = startSectionDivs.length;
	var maxHeightValue = sectionCount * 80;
	
	setTimeout(function(){
		slide(newSectionBlockID, 'maxHeight', maxHeightValue);
	}, 200);
	
	var z = "	max-height: 220px";
}

/*
function sequence() {
	slide('text1','height','0');
	
	setTimeout(function(){
		slide('div2','top','0');
	}, 500);
	
	setTimeout(function(){
		slide('text2','height','auto');
	}, 500);
}
*/

function slide(elementID, styleProperty, newValue) { 
	var currentElement = document.getElementById(elementID);
    if(!currentElement) return;
	var currentStyles = window.getComputedStyle(currentElement, null);
	var currentValue = currentStyles[styleProperty];
	var currentNumValue = (currentValue.match(/\d+/)[0] * 1); //" * 1" forces string to number
	var propertyUnits = currentValue.match(/[a-zA-Z]+/)[0];
	if (newValue == "auto") { // a numerical height of a div must be computed
		newValue = currentElement.scrollHeight;
	}
	var stepCount;
	var timeIncrement = duration / steps * 1000; //miliseconds
	var stepSize = (newValue - currentNumValue) / steps;
	var transitionValue = currentNumValue;
	for (n=1;n<=steps;n++) {
		setTimeout(function(){
            transitionValue = transitionValue + stepSize;
			currentElement.style[styleProperty] = transitionValue+propertyUnits; 
		}, timeIncrement*n);
	}
	
}

function scroll(elementID, styleProperty, currentValue, newValue) {
	var currentElement = document.getElementById('myToc');
	var currentNumValue = currentValue;
	var propertyUnits = "px";
	var stepCount;
	var timeIncrement = duration / steps * 1000; //miliseconds
	var stepSize = (newValue - currentNumValue) / steps;
	var transitionValue = currentNumValue;
	for (n=1;n<=steps;n++) {
		setTimeout(function(){
            transitionValue = transitionValue + stepSize;
			currentElement.scrollTop = transitionValue; 
            // console.log('transitionValue:' + transitionValue);
		}, timeIncrement * n);
	}
}

(function(){
    
    $("#myapp-header").on('click', function(){
        if($("#myToc").is(":visible")){
            $("#myTocCloseBtn").trigger("click");
        }
    });
    
})();

/* 
function scrollToChapter(scrollNumber,scrollSection) {
// console.log(['scrollToChapter()', scrollNumber,scrollSection]);
	//jump to chapter - 1
	var tocList = document.getElementById("tocList");
	scrollTop = (scrollNumber - 2) * 80 + 1;
	scroll("tocList",'scrollTop',0,scrollTop);

	//slide section block open
	startChapter = scrollNumber; 
	var startSectionBlockID = "s" + startChapter;
	var startBlock = document.getElementById(startSectionBlockID);
	var startSectionDivs = startBlock.getElementsByClassName("tocLine")
	if (scrollSection > 0) {
		var startSectionDiv = startSectionDivs[scrollSection-1];
		//console.log(startSectionDiv);
		startSectionDiv.style.backgroundColor = "#dff";
	}
	
	sectionCount = startSectionDivs.length;
	maxHeightValue = sectionCount * 80;
	setTimeout(function(){
		slide(startSectionBlockID,'maxHeight',maxHeightValue);
	}, 500);

	//scroll to selected section "scrollSection" - 1
	var scrollSectionTop = (scrollSection -2) * 80 + 1;
	//startBlock.scrollTop = scrollSectionTop;

} */

/* function loadNav(chapter, section) {
// console.log(['loadNav()', chapter, section]);
	
	if (document.getElementById("closer").style.display == "none") {
		var screenHeight = document.documentElement.clientHeight - 152;
		slide('tocList','height',screenHeight);
		document.getElementById("closer").style.display = "block";
		setTimeout(function(){
			scrollToChapter(chapter,section);
		}, 500);
	}
	else {
		slide('tocList','height','0');
		document.getElementById("closer").style.display = "none";
	}
} */

// function loaded() {
	// document.getElementById("closer").style.display = "none";
// }