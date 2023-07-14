
/** notes.js **/
(function($){
    
    var noteBook = {};
    
    function load()
    {
		$("#addNoteBtn").on('click', addNote);
		$("#reportAProblem").on('click', addProblemNote);
		$("#booklet-container").on('click', ".bookNote", openNote);
		$("body").on('click', ".removeNoteBtn", deleteNote);
		loadNotes(false);
    }
    
    function deleteNote(e)
    {
        e.preventDefault;
        var link = this;
        swal({
            text: "Are you sure that you want to delete this note?",
            confirmButtonText: "Yes",
            showCancelButton: true
        }).then(function(result){
            if(result.value){
                $.fn.datar({
                    url : '/book/notes/delete',
                    data : { noteId : $(link).data("noteId") },
                    type : "post",
                    success: function(response){
                        swal({
                            position: 'right',
                            type: 'success',
                            title: 'Your note update has been removed',
                            showConfirmButton: false,
                            timer: 2000
                        });
                        reloadNotes();
                    },
                    dataType : 'json'
                }, function(){}, function(){});
            }
        });
        return false;
    }
    
    function openNote()
    {
        var noteBookIndex = $(this).data("noteIndex");
        var noteObj = noteBook[noteBookIndex];
        var note = noteObj['Note'];
		if(noteObj['Is_Instructor_Note']==1){
			swal("Your instructor wrote the following.", note);
			return false;
		}
        swal({
            input: 'textarea',
            inputValue: note,
            confirmButtonText: "Save",
            cancelButtonText: "Close",
            html: $('<a>')
                .attr("data-note-id",noteObj['ID'])
                .attr("href","#delete-note")
                .addClass('fa fa-trash removeNoteBtn')
                .text(''),
            showCancelButton: true
        }).then(function(result){
            if(result.value){
                $.fn.datar({
                    url : '/book/notes/edit',
                    data : { 
                        notes : result.value, 
                        noteId : noteObj['ID'] 
                    },
                    type : "post",
                    success: function(response){
                        reloadNotes();
                        swal({
                            position: 'right',
                            type: 'success',
                            title: 'Your note update has been saved',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    },
                    dataType : 'json'
                }, function(){}, function(){});
            }
        });
    }
    
    function distributeNotes(notes)
    {
        var cnt = notes.length;
        for(i=0; i<cnt; i++){
            var nt = notes[i];
            var idx = parseInt(nt['Node_Index'])+1;
            var $block = $("#block_" + nt['Block_ID']);
            var $blocks = $("#block_" + nt['Block_ID'] + " s");
            var node = $blocks[idx];
            var noteBookIndex = nt['Block_ID'] + ':' + idx;
            var footnoteId = i+1;
			var isInstructorNote = nt['Is_Instructor_Note']=='1' ? 1 : 0;
            noteBook[noteBookIndex] = nt;
            $block.append('<div class="w3-panel my-note bookNote bookNote' + (nt.Type=='Note' ? 'Note' : 'Problem') + ' ' + (isInstructorNote?'bookNoteInstructor':'bookNoteStudent') + '" data-note-index="' + noteBookIndex + '" data-is-instructor-note="' + isInstructorNote + '"><i class="fa fa-sticky-note-o" aria-hidden="true"></i> [' + footnoteId + '] ' + (nt.Type=='Note' ? '' : nt.Type+': ') + nt['Note'] + '</div>');
            $(node).before('<i data-note-index="' + noteBookIndex + '" data-is-instructor-note="' + isInstructorNote + '" class="bookNote bookNote' + (nt.Type=='Note' ? 'Note' : 'Problem') + ' ' + (isInstructorNote?'bookNoteInstructor':'bookNoteStudent') + ' fa" aria-hidden="true">[' + footnoteId + ']</i>');
        }
    }
    
    function loadNotes(initalLoad)
    {
        if(initalLoad){
            var notes = window['_notes'][0];
            distributeNotes(notes);
        } else {
            var $bc = $("#booklet-container");
            var bookId = $bc.data('book-id');
            var bookletId = $bc.data('booklet-id');
            $(".my-note").remove();
            $.fn.datar({
                url : '/book/notes',
                data : {
					bookId : bookId, 
					bookletId : bookletId,
					instructorId : $("#booklet-container").data("instructorId"),
					instructorUserId : $("#booklet-container").data("instructorUserId")
				},
                type : "post",
                success: function(notes){
                    distributeNotes(notes);
                },
                dataType : 'json'
            }, function(){}, function(){});
        }
    }
    
    function clearNotes()
    {
        noteBook = {};
        $(".bookNote").remove();
    }
    
    function reloadNotes()
    {
        clearNotes();
        loadNotes(false);
    }
    
    function addNote(e)
    {
        e.preventDefault;
        // var an = selection.anchorNode;
        var an = window['_sel_'].anchorNode;
        var block = $(an).parents('.block');
        var blockId = $(block[0]).attr("id");
        var index = $("s", block[0]).index(an);
        var $bc = $("#booklet-container");
        var userId = $bc.data('user-id');
        var bookId = $bc.data('book-id');
        var bookletId = $bc.data('booklet-id');
		swal({
            input: 'textarea',
            confirmButtonText: "Add Note",
            inputPlaceholder: 'Type your notes here',
            showCancelButton: true
        }).then(function(result){
            if(result.value){
                $.fn.datar({
                    url : '/book/notes/add',
                    data : { 
                        notes : result.value, 
                        index : index, 
                        userId : userId, 
                        bookId : bookId, 
                        blockId : blockId, 
                        bookletId : bookletId,
						type : 'Note'
                    },
                    type : "post",
                    success: function(response){
                        reloadNotes();
                        swal({
                            position: 'right',
                            type: 'success',
                            title: 'Your new note has been saved',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    },
                    dataType : 'json'
                }, function(){}, function(){});
            }
        });
        return false;
    }
    
    function addProblemNote(e)
    {
        e.preventDefault;
        // var an = selection.anchorNode;
        var an = window['_sel_'].anchorNode;
        var block = $(an).parents('.block');
        var blockId = $(block[0]).attr("id");
        var index = $("s", block[0]).index(an);
        var $bc = $("#booklet-container");
        var userId = $bc.data('user-id');
        var bookId = $bc.data('book-id');
        var bookletId = $bc.data('booklet-id');
		var html = [];
		html.push('<label><input type="radio" id="swal2-type-confusing" name="swal2-type" value="Confusing"> Confusing</label> &nbsp;');
		html.push('<label><input type="radio" id="swal2-type-error" name="swal2-type" value="Error" checked> Error</label>');
		html.push('<textarea id="swal2-problem-note" class="swal2-textarea" style="display: flex;" placeholder="Describe your problem here"></textarea>');
		swal({
			html : html.join(''),
            // input: 'textarea',
            // inputPlaceholder: 'Describe your problem here',
            confirmButtonText: "Report a problem",
            showCancelButton: true
        }).then(function(result){
            if(result.value){
                $.fn.datar({
                    url : '/book/notes/add',
                    data : { 
                        notes : $("#swal2-problem-note").val(), //result.value, 
                        index : index, 
                        userId : userId, 
                        bookId : bookId, 
                        blockId : blockId, 
                        bookletId : bookletId,
						type : $("input[name=swal2-type]:checked").val()
                    },
                    type : "post",
                    success: function(response){
                        reloadNotes();
                        swal({
                            position: 'right',
                            type: 'success',
                            title: 'Your new note has been saved',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    },
                    dataType : 'json'
                }, function(){}, function(){});
            } else {
				$.fn.datar({
                    url : '/highlight/remove',
                    data : { 
                        node : index, 
                        userId : userId, 
                        blockId : blockId, 
                    },
                    type : "post",
                    success: function(response){
						
						// Need to increment index when previous notes exist in the block.
						var tmpI = parseInt(index+1);
						var i;
						do {
							style = $("#" + blockId + " s:nth-child(" + tmpI + ")").attr("style");
							if(style==undefined){
								tmpI++;
							}
						}
						while(style==undefined);
						i = tmpI;
						
						// Loop through highlighted nodes until we hit a node without highlighting.
						do {
							var nextNodeHasStyle = false;
							var nd = $("#" + blockId + " s:nth-child(" + i + ")");
							$(nd).removeAttr("style");
							i++;
							nextNodeHasStyle = $("#" + blockId + " s:nth-child(" + i + ")").attr("style")==style ? true : false;
						}
						while(nextNodeHasStyle);
					},
                    dataType : 'json'
                }, function(){}, function(){});
			}
        });
        return false;
    }
    
    load();
    
})(jQuery);