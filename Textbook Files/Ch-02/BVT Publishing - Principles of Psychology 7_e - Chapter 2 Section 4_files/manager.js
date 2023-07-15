
	var files = [
		'/vendors/tinymce/js/tinymce/tinymce.min.js',
		'/vendors/tinymce/js/tinymce/jquery.tinymce.min.js',
		'js/views/context2.js',
		'js/views/highlights2.js',
		'js/views/flashcards2.js',
		'js/views/advanced.flashcards.js',
		'js/views/comprehension2.js',
		'js/views/homework2.js',
		'js/views/notes2.js',
		'js/views/search2.js',
		'js/views/slides2.js',
		'js/views/summary2.js',
		'js/views/videos2.js',
		'js/views/form2.js',
		'js/views/custom2.js',
		'vendors/codemirror/codemirror.js',
		'vendors/codemirror/codemirror_jsx.js',
		'js/lib/codedit.js'
	];
	function loadNextFile(){
		if(!files.length){
			return;
		}
		var file = files.shift();
		Promise.all([load.js(file+'?v='+resourceVersion)]).then(function(path){
			loadNextFile();	
		});
	}
	loadNextFile();
	