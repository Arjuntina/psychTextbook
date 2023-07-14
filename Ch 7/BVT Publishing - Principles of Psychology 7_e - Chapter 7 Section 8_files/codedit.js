const createUndoManager = () => {
	let history = [];
	let position = 0;
	return {
		value(){
			return history[position];
		},

		setValue(value){
			if (position < history.length - 1) {
				history = history.slice(0, position + 1);
			}
			history.push(value);
			position = history.length-1;
		},

		undo(){
			if (position > 0) {
				position -= 1;
			}
		},

		redo() {
			if (position < history.length - 1) {
				position += 1;
			}
		},
		
		reset(){
			position = 0;
			history = history.slice(0, 1);
		},
		
		undoable(){ 
			return position ? true : false; 
		},
		
		redoable(){ 
			return (position < history.length - 1) ? true : false; 
		},
		
		resetable(){ 
			return history.length > 1 ? true : false; 
		},

		// toString function to aid in illustrating
		toString(){
			return `Value: ${this.value().substring(0, 11)}, History: ${history.length}, Position: ${position}, undoable:${this.undoable()}, redoable:${this.redoable()}, resetable:${this.resetable()}`; 
		}
	}
}

function CodEdit(id){

	let htMax 			= 550,
		paneHt 			= window.innerHeight,
		editorOrigHt 	= '',
		currentTab 		= "HTML",
		
		editorMediaPath = '../../media',
		browseMediaPath = (editionId)=>`/editor/media/${editionId}`,

		editorMode 		= document.getElementsByClassName("codedit-mode-fullpage").length ? 'fullpage' : 'embed',
		editor 			= document.getElementById(id),
		paneWt 			= editor.querySelector(".codedit-textareacontainer").offsetWidth,
		editorPane 		= editor.querySelector(".codedit-textareacontainer"),
		editorParent 	= editor.parentElement,
		instructionsElm = editor.parentElement.parentElement.nextSibling,

		UndoManager 	= createUndoManager(),
		codeMirrorObj;
	
	if ((window.screen.availWidth <= 768 && window.innerHeight > window.innerWidth)){
		restack(true);
	}
	
	function importCode(newCode){
		let code = typeof newCode=='string' ? newCode : document.getElementById("textareaImport").value;
		let patt = /--([A-Za-z0-9]+):(show|hide|default)--(?:\\n)?(.*?)(?:\\n)?--\/(?:[A-Za-z0-9]+)--/gi;
		let matches = code.matchAll( patt );
		for( const match of matches ){
			if(match[1].toUpperCase()=='NAME'){ continue; }
			let label = match[1],
				tabStatus = match[2],
				content = match[3].replace(/\\n/gm,"\n"),
				elm = document.querySelector(`.codedit-display-${label}`);
			if(label==currentTab){
				codeMirrorObj.setValue(content);
				codeMirrorObj.setOption("mode",{name: getMode()});
			}
			if(elm && tabStatus=='show' && label!='HTML'){
				elm.click();
			}
			editor.querySelector(`.codedit-textarea${label.toUpperCase()}`).value = content;
		}
		reloadBrowser();
	}
	
	function getExportString(){
		let fullCode = [],
			embedMode = editorMode=="embed",
			tabs = editor.getElementsByClassName("codedit-textarea-elm"),
			name = embedMode ? editor.dataset.name : document.getElementById("codedit-name").value,
			type = embedMode ? editor.dataset.type : document.getElementById("codedit-type").value,
			edition = embedMode ? editor.dataset.edition : document.getElementById("codedit-edition").value;
			defaultTab = embedMode ? editor.dataset.defaultTab : document.getElementById("codedit-default-tab").value;
		Object.values(tabs).forEach(function(tab){
			let label = tab.getAttribute("data-label"),
				el = editor.querySelector(`.codedit-${label}btn`),
				chkbx = embedMode ? null : document.querySelector(`.codedit-display-${label}`),
				status = embedMode ? (el ? 'show' : 'hide') : (chkbx.checked ? 'show' : 'hide');
				if(defaultTab==label){
					status = 'default';
				}
			fullCode.push(`--${label}:${status}--`);
			fullCode.push(editor.querySelector(`.codedit-textarea${label.toUpperCase()}`).value);
			fullCode.push(`--/${label}--`);
		});
		fullCode.push('--NAME:hide--');
		fullCode.push(`${name}:${type}:${edition}`);
		fullCode.push('--/NAME--');
		return fullCode.join('').replace(/(\r\n|\n|\r)/gm, '\\n');
	}
	
	function exportCode(){
		let codeString = getExportString();
		Swal({
			title: "Export",
			html: `<textarea id="exportFullCode" style="width:100%;min-height:250px;">${codeString}</textarea>`,
			confirmButtonText: "Copy",
			showCloseButton: true
		}).then(function(val){
			let elm = document.getElementById("exportFullCode");
			elm.select();
			document.execCommand('copy');
			elm.remove();
		});
	}
	
	function setEditorSize(){
		let ht = (paneHt-125),
			wt = (paneWt-14),
			browserPane = editor.querySelector(".codedit-iframecontainer"),
			instructionsHdr = editor.querySelector(".codedit-fullpage-instructions-hdr"),
			instructionsPane = editor.querySelector(".codedit-fullpage-instructions");

		if(editorOrigHt==''){
			editorOrigHt = editorPane.offsetHeight;
		}

		editor.querySelector(".cdh-editor-header1").style.width = `${wt}px`;
		editor.querySelector(".cdh-editor-header2").style.width = `${wt}px`;
		editor.querySelector(".cdh-browser-header1").style.width = `${wt}px`;
		editor.querySelector(".cdh-browser-header2").style.width = `${wt}px`;

	/* FULLSCREEN */
		if(document.getElementById(id).classList.contains("fullScreen")){
			ht = (window.innerHeight - 120);
			wt = window.innerWidth;
			let fullWt = (wt-7),
				wtCol1 = (fullWt * 0.45),
				wtCol2 = (fullWt * 0.55),
				htRow1 = editorMode=='embed' ? (ht * 0.6) : ht;
				
			editor.querySelector(".cdh-editor-header1").style.width = (wtCol1-15) + "px";
			editor.querySelector(".cdh-editor-header2").style.width = (wtCol1-15) + "px";
			editor.querySelector(".cdh-browser-header1").style.width = (wtCol2-15) + "px";
			editor.querySelector(".cdh-browser-header2").style.width = (wtCol2-15) + "px";

			editorPane.style.width = `${wtCol1}px`;
			browserPane.style.width = `${wtCol2}px`;
			
			editorPane.style.height = `${htRow1}px`;
			browserPane.style.height = `${ht}px`;
			
			if(editorMode=='embed'){
				instructionsHdr.style.display = 'block';
				instructionsHdr.style.width = (wtCol1-15) + "px";
				instructionsHdr.style.height = "30px";
				
				instructionsPane.style.display = 'block';
				instructionsPane.style.top = (htRow1+169) + "px";
				instructionsPane.style.width = (wtCol1-15) + "px";
				instructionsPane.style.height = (ht-htRow1)-63 + "px";
				instructionsPane.innerHTML = instructionsElm.innerHTML;
				instructionsElm.classList.forEach((val)=>{
					instructionsPane.classList.add(val);
				});
			}
		} else {			
			if(editorMode=='embed'){
				ht = (editorOrigHt + 40);
				instructionsHdr.style.display = 'none';
				instructionsPane.style.display = 'none';
			}
			wt = (wt + 14);
			if(htMax>0 && ht>htMax) ht = htMax;
			editorPane.style.height = '';
			browserPane.style.height = '';
			
			editorPane.style.width = `${wt}px`;
			browserPane.style.width = `${wt}px`;
			
			editorPane.style.height = `${ht}px`;
			browserPane.style.height = `${ht}px`;
		}
		editor.querySelector(".codedit-active").click();
		editor.querySelector(`li.codedit-device-desktop a`).click();
	}
	
	function getMode(){
		switch(currentTab.substring(0, 2)){
			case "CS": mode = "css"; break;
			case "JS": mode = "javascript"; break;
			default: mode = "htmlmixed"; break;
		}
		return mode;
	}
	
	function activateTab(e){
		currentTab = this.value.toUpperCase();
		let prevTab = currentTab,
			mode = getMode();
		Object.values(editor.getElementsByClassName("codedit-btn")).forEach(function(btn){
			btn.classList.remove("codedit-active");
		});
		this.classList.add("codedit-active");
		if(editor.querySelector(`.codedit-textarea${currentTab}`)){
			let tabVal = editor.querySelector(".codedit-textarea" + currentTab).value;
			codeMirrorObj.setValue(tabVal);
		}
		codeMirrorObj.setOption("mode",{name: mode});
		if(editor.querySelector(".codedit-runbtn").style.display!='none'){
			Swal.fire({
				// position: 'top-end',
				type: 'success',
				title: 'Your edits has been saved',
				showConfirmButton: false,
				timer: 1500
			});
		}
		reloadBrowser(); // activateTab
	}

	function reloadBrowser(ignoreStorage){
		let fullCode, newCode, html = [], css = [], js = [];
		if(currentTab=='MEDIA'){
			fullCode = editor.querySelector(".codedit-textareaMEDIA").value;
			newCode = fullCode.replace(/\/m\/[0-9]{4}/g, editorMediaPath);
			editor.querySelector(".codedit-textareaMEDIA").value = newCode;
			codeMirrorObj.setValue(newCode);
			codeMirrorObj.setOption("mode",{name: "htmlmixed"});
			showPreview(fullCode);
		} else {
			Object.values(editor.getElementsByClassName("codedit-textarea-elm")).forEach(function(textarea){
				let label = textarea.getAttribute("data-label").toUpperCase();
				let val = editor.querySelector(".codedit-textarea" + label).value;
				switch(label.substring(0, 2)){
					case "CS": css.push(val); break;
					case "JS": js.push(val); break;
					case "ME": break;
					case "NA": break;
					default: 
						html.push(val); 
						let matches = val.match(/\<title\>([^\<]*)\<\/title\>/i);
						let title = matches ? matches[1] : 'New Tab';
						editor.querySelector("span.cdh-browser-title span").innerText = title;
					break;
				}
			});
			fullCode = html.join(" ");
			fullCode = fullCode.replace("<head>","<head>\n<style>"+ css.join("\n") +"</style>");
			fullCode = fullCode.replace("<head>","<head>\n<script>"+ js.join("\n") +"</script>");
			showPreview(fullCode);
		}
		if(ignoreStorage!==false){
			let curVal = getExportString();
			if(curVal!=UndoManager.value()){
				UndoManager.setValue(curVal);
				enableBrowserButtons();
			}
		}
		setSaveButtonVisibility(false);
	}
	
	function setSaveButtonVisibility(show){
		editor.querySelector(".codedit-runbtn").style.display = (show ? "block" : "none");
		if(show){
			editor.classList.add("codedit-active-save");
		} else {
			editor.classList.remove("codedit-active-save");
		}
	}

	function reset(){
		if(!this.classList.contains("enabled")) return;
		UndoManager.reset();
		postUndo();
	}

	function redo(){
		if(!this.classList.contains("enabled")) return;
		UndoManager.redo();
		postUndo();
	}
	
	function undo(){
		if(!this.classList.contains("enabled")) return;
		UndoManager.undo();
		postUndo();
	}
	
	function postUndo(){
		importCode(UndoManager.value(), true);
		// setSaveButtonVisibility(true);
		enableBrowserButtons();
	}
	
	function enableBrowserButtons(){
		let undoBtn = editor.querySelector(".cdh-browser-header2 button.codedit-undobtn");
		let redoBtn = editor.querySelector(".cdh-browser-header2 button.codedit-redobtn");
		let rsetBtn = editor.querySelector(".cdh-browser-header2 button.codedit-resetbtn");
		if(UndoManager.undoable())
			undoBtn.classList.add("enabled");
		else
			undoBtn.classList.remove("enabled");
		if(UndoManager.redoable())
			redoBtn.classList.add("enabled");
		else
			redoBtn.classList.remove("enabled");
		if(UndoManager.resetable())
			rsetBtn.classList.add("enabled");
		else
			rsetBtn.classList.remove("enabled");
	}

	function restack(horizontal) {
		if (!horizontal){
			editor.classList.remove("horizontal");
		} else {
			editor.classList.add("horizontal");
		}
		// fixDragBtn();
	}

	function showPreview(fullCode){
		let ifr = document.createElement("iframe"),
			editionId = editorMode=="embed" ? editor.dataset.edition : document.getElementById("codedit-edition").value;
		ifr.setAttribute("frameborder", "0");
		// ifr.setAttribute("id", "iframeResult");
		ifr.setAttribute("class", "codedit-iframeResult");
		ifr.setAttribute("name", "iframeResult");
		ifr.setAttribute("allowfullscreen", "true");

		editor.querySelector(".codedit-iframewrapper").innerHTML = "";
		editor.querySelector(".codedit-iframewrapper").appendChild(ifr);

		let ifrw = (ifr.contentWindow) ? ifr.contentWindow : (ifr.contentDocument.document) ? ifr.contentDocument.document : ifr.contentDocument;
		ifrw.document.open();
		ifrw.document.write(fullCode.replace(editorMediaPath,browseMediaPath(editionId)));
		ifrw.document.close();
		//23.02.2016: contentEditable is set to true, to fix text-selection (bug) in firefox.
		//(and back to false to prevent the content from being editable)
		//(To reproduce the error: Select text in the result window with, and without, the contentEditable statements below.)  
		if (ifrw.document.body && !ifrw.document.body.isContentEditable) {
			ifrw.document.body.contentEditable = true;
			ifrw.document.body.contentEditable = false;
		}
	}

	function updateEditorInfo(e){
		
		let val = e.target.value,
			id = e.target.id,
			classNm = id.replace('codedit','chc'),
			chapter, section,
			elms = document.getElementsByClassName(classNm);
		for (let i = 0; i < elms.length; i++) {
			elms[i].innerText = val;
		}
		if(id=="codedit-name"){
			let x = val.split(".");
			chapter = x.length>1 ? x[0] : null;
			section = x.length>2 ? x[1] : null;
			if(x.length>1){
				let chElms = document.getElementsByClassName("chc-exChap");
				for (let ci = 0; ci < chElms.length; ci++) {
					chElms[ci].innerText = chapter;
				}
			}
			if(x.length>2){
				let scElms = document.getElementsByClassName("chc-exSect");
				for (let si = 0; si < scElms.length; si++) {
					scElms[si].innerText = section;
				}
			}
		}
	}
	
	function initEditorFullpage(){
		document.querySelector("#IMPORTbtn").addEventListener("click", importCode);
		document.querySelector("button.codedit-exportBtn").addEventListener("click", exportCode);
		document.getElementById("codedit-edition").addEventListener("blur", updateEditorInfo);
		document.getElementById("codedit-name").addEventListener("blur", updateEditorInfo);
		document.getElementById("codedit-type").addEventListener("blur", updateEditorInfo);
		document.getElementById("codedit-default-tab").addEventListener("change", setDefaultTab);
		Object.values(document.getElementsByClassName("codedit-display")).forEach(function(chk){
			chk.addEventListener("click", toggleTabs);
		});
	}
	
	function setDefaultTab(){
		editor.querySelector(`.codedit-${this.value}btn`).click();
	}
	
	function toggleTabs(){
		editor.querySelector("button.codedit-" + this.value + "btn").style.display = this.checked ? "block" : "none";
		Object.values(editor.querySelectorAll(`.chc-${this.value.toLowerCase()}`)).forEach((elm)=>{elm.style.display = this.checked ? "block" : "none"});
		manageFileIncludes(this);
	}
	
	function manageFileIncludes(elm){
		let html = editor.querySelector(".codedit-textareaHTML").value,
			tab = elm.value,
			label = editor.querySelector(".codedit-header .chc-name").innerText,
			newHtmlValue,
			newHtml = [],
			skip = false;
		html.split("\n").forEach(function(ln){
			if(elm.checked){
				if(ln=='<head>'){
					newHtml.push(ln);
					if(tab=='CSS'){
						newHtml.push(`<link href="${label}.css" rel="stylesheet">`);
					} else if(tab=='JS'){
						newHtml.push(`<script src="${label}.js"></script>`);
					}
				} else {
					newHtml.push(ln);
				}
			} else {
				if(tab=='CSS' && ln.match("<link href=")){
					skip = true;
				} else if(tab=='JS' && ln.match("<script src=")){
					skip = true;
				}
				if(!skip){
					newHtml.push(ln);
				}
				skip = false;
			}
		});
		newHtmlValue = newHtml.join("\n");
		editor.querySelector(".codedit-textareaHTML").value = newHtmlValue;
		if(currentTab=='HTML'){
			codeMirrorObj.setValue(newHtmlValue);
			setSaveButtonVisibility(true);
		}
	}
	
	function initEditorEmbed(){
		// let defaultTab = editor.dataset.defaultTab;
		reloadBrowser(true);
		// if(defaultTab!='HTML'){
			// editor.querySelector(`.codedit-${defaultTab}btn`).click();
		// }
	}
	
	function toggleButtons(e){
		e.preventDefault();	
		
	/* DOWNLOAD FILES */
		if(this.classList.contains("codedit-help-btn")){
			Swal.fire({
				html: editor.querySelector(".codedit-help-template").innerHTML,
				customClass: "codedit-help-popup",
				confirmButtonText: "Close",
				onOpen: (res)=>{
					let popup = document.querySelector(".swal2-popup"),
						toggleBtn = popup.querySelector(".toggle-codedit-files"),
						container = popup.querySelector(".codedit-files-container");
					popup.querySelector("a.toggle-codedit-files").addEventListener("click", (e)=>{
						e.preventDefault();
						if(toggleBtn.innerText=="[+]"){
							toggleBtn.innerText = "[-]";
							container.style.display = "block";
						} else if(toggleBtn.innerText=="[-]"){
							toggleBtn.innerText = "[+]";
							container.style.display = "none";
						}
						return false;
					});
				}
			});
		}
		
	/* INSTRUCTIONS BUTTON */
		if(this.classList.contains("codedit-instructions-btn")){
			let arrowBtn = this.querySelector(".fa");
			if(arrowBtn.classList.contains("fa-arrow-down")){
				if(instructionsElm) {
					instructionsElm.style.height = "unset";
					instructionsElm.style.overflowY = "unset";
				}
				arrowBtn.classList.remove("fa-arrow-down");
				arrowBtn.classList.add("fa-arrow-up");
			} else {
				if(instructionsElm) {
					instructionsElm.style.height = "250px";
					instructionsElm.style.overflowY = "scroll";
				}
				arrowBtn.classList.add("fa-arrow-down");
				arrowBtn.classList.remove("fa-arrow-up");
			}
			return false;
		}
	
		return false;
	}

	function toggleDeviceResolution(e){
		e.preventDefault();
		let device = this.getAttribute("href").replace("#","");
		Object.values(editor.querySelectorAll("ul.codedit-device-options li")).forEach(li=>li.classList.remove("active"));
		editor.querySelector(".codedit-iframewrapper").classList.remove("mobile", "tablet", "desktop");
		editor.querySelector(`li.codedit-device-${device}`).classList.add("active");
		editor.querySelector(`li.codedit-device-${device} a`).blur();
		editor.querySelector(".codedit-iframewrapper").classList.add(device);
		let tearDown = device=='desktop' ? true : false;
		touchEmulator(tearDown);
		return false;
	}
	
	function touchEmulator(tearDown){
		const iframe = editor.querySelector('.codedit-iframeResult');
		const slider = iframe.contentWindow.document.body;
		const startDragging = (e)=>{
			mouseDown = true;
			startY = e.pageY - slider.offsetTop*3;
			scrollTop = slider.scrollTop;
		};
		const stopDragging = ()=>{ mouseDown = false; };
		let mouseDown = false, startY, scrollTop;
		if(!slider) return;
		if(tearDown){
			slider.style.overflow = "unset";
			// slider.classList.remove('mobile');
			slider.style.cursor = "default";
			slider.removeEventListener('mousedown', startDragging);
			slider.removeEventListener('mouseup', stopDragging);
			slider.removeEventListener('mouseleave', stopDragging);
		} else {
			slider.style.overflow = "hidden";
			// slider.classList.add('mobile');
			slider.style.cursor = "pointer";
			slider.addEventListener('mousemove', (e) => {
				e.preventDefault();
				if(!mouseDown) { return; }
				const y = e.pageY - slider.offsetTop;
				const scroll = y - startY;
				slider.scrollTop = scrollTop - scroll;
			});
			slider.addEventListener('mousedown', startDragging, false);
			slider.addEventListener('mouseup', stopDragging, false);
			slider.addEventListener('mouseleave', stopDragging, false);
		}
	}

	if (window.addEventListener) {
	
	/* DEVICE BUTTONS */
		Object.values(editor.querySelectorAll(".codedit-device-options a")).forEach(function(elm){
			elm.addEventListener("click", toggleDeviceResolution);
		});
		
	/* FOOTER BUTTONS */
		editor.querySelector(".codedit-instructions-btn").addEventListener("click", toggleButtons);
		editor.querySelector(".codedit-help-btn").addEventListener("click", toggleButtons);
		editor.querySelector("a.toggle-codedit-files").addEventListener("click", toggleButtons);
		
	/* FILE TABS */
		Object.values(editor.getElementsByClassName("codedit-btn")).forEach(function(btn){
			btn.addEventListener("click", activateTab);
			let tabLabel = btn.value.toUpperCase();
			if(editorMode=='fullpage'){
				let chk = document.querySelector(`.codedit-display-${tabLabel}`);
				if(chk && chk.checked){
					btn.style.display = "block";
				} else {
					btn.style.display = "none";
				}
			}
		});
		
	/* EDITOR BUTTONS */
		editor.querySelector("button.codedit-runbtn").addEventListener("click", reloadBrowser);
		editor.querySelector("button.codedit-resetbtn").addEventListener("click", reset);
		editor.querySelector("button.codedit-undobtn").addEventListener("click", undo);
		editor.querySelector("button.codedit-redobtn").addEventListener("click", redo);
		
		editor.querySelector("a.toggleFullPage").addEventListener("click", toggleFullPage);
		
	/* DRAG-BAR STUFF */
		/* editor.addEventListener("mousedown", function(e) {dragstart(e);});
		editor.addEventListener("touchstart", function(e) {dragstart(e);});
		window.addEventListener("mousemove", function(e) {dragmove(e);});
		window.addEventListener("touchmove", function(e) {dragmove(e);});
		window.addEventListener("mouseup", dragend);
		window.addEventListener("touchend", dragend);
		window.addEventListener("load", function(){
			fixDragBtn(editor);
		}); */
		
		setTimeout(function(){
			editor.querySelector(`.codedit-${editor.dataset.defaultTab}btn`).click();
			if(editorMode=='fullpage'){
				initEditorFullpage();
			} else {
				initEditorEmbed();
			}
			setEditorSize();
			UndoManager.setValue(getExportString());
		}, 100);
		
		window.addEventListener("resize", setEditorSize);
		
	}
	
	function toggleFullPage(e){
		e.preventDefault();
	/* MINIMIZE */
		if(document.getElementById("my-shell").style.display=="none"){
			// document.getElementById("booklet-footer-bar").style.display = "unset";
			document.getElementById("my-shell").style.display = "";
			this.querySelector(".fa").classList.add("fa-window-maximize");
			this.querySelector(".fa").classList.remove("fa-window-restore");
			editor.classList.remove("fullScreen");
			if(editorMode=='fullpage'){
				document.getElementById("codedit-details").insertAdjacentElement('afterend', editor);
			} else {
				editorParent.appendChild(editor);
			}
			editor.querySelector(".codedit-device-options").style.display = "none";
			editor.querySelector(".codedit-help-show").style.display = "block";
			reloadBrowser(true); // toggleFullPage
			editor.scrollIntoView();
	/* EXPAND */
		} else {
			document.querySelector("body").appendChild(editor);
			// document.getElementById("booklet-footer-bar").style.display = "none";
			document.getElementById("my-shell").style.display = "none";
			this.querySelector(".fa").classList.add("fa-window-restore");
			this.querySelector(".fa").classList.remove("fa-window-maximize");
			editor.classList.add("fullScreen");
			editor.querySelector(".codedit-device-options").style.display = "block";
			editor.querySelector(".codedit-help-show").style.display = "none";
			reloadBrowser(true); // toggleFullPage
		}
		setEditorSize();
		return false;
	}

	function colorcoding() {
		var ua = navigator.userAgent;
		//Opera Mini refreshes the page when trying to edit the textarea.
		if (ua && ua.toUpperCase().indexOf("OPERA MINI") > -1) { return false; }
		codeMirrorObj = CodeMirror.fromTextArea(editor.querySelector(".codedit-textareaCode"), {
			mode: "text/html",
			lineWrapping: true,
			smartIndent: false,
			htmlMode: true,
			autocorrect: false,      
			addModeClass: true,
			lineNumbers: true,
			gutter: true
    	});
		codeMirrorObj.on("keyup", detectEditorChange);
		codeMirrorObj.on("change", function (i,obj) {
			editor.querySelector(".codedit-textarea" + currentTab.toUpperCase()).value = i.getValue();
			codeMirrorObj.save();
		});
	}
	colorcoding();

	function detectEditorChange(){
		let current = getExportString(),
			isChanged = current!=UndoManager.value() ? true : false;
		setSaveButtonVisibility(isChanged);
	}

	function getStyleVal(elmnt,style) {
		if (window.getComputedStyle) {
			return window.getComputedStyle(elmnt,null).getPropertyValue(style);
		} else {
			return elmnt.currentStyle[style];
		}
	}

/* 
	let dragging = false;
	let dragbarElement = editor,
	let xbeforeResize = window.innerWidth;
	function fixDragBtn(){
		let textareawidth, leftpadding, dragleft, buttonwidth;
		let dragbarQryStr = "#" + id + " .codedit-dragbar";
		let textareawrapperQryStr = "#" + id + " .codedit-textareawrapper";
		let textareaQryStr = "#" + id + " .codedit-textarea";
		let iframecontainerQryStr = "#" + id + " .codedit-iframecontainer";
		let containertop = Number(getStyleVal(document.querySelector("#" + id + " .codedit-container"), "top").replace("px", ""));

		if (!editor.classList.contains("horizontal")) {
			document.querySelector(dragbarQryStr).style.display = 'block';
			document.querySelector(dragbarQryStr).style.width = "5px";
			textareasize = Number(getStyleVal(document.querySelector(textareawrapperQryStr), "width").replace("px", ""));
			leftpadding  = Number(getStyleVal(document.querySelector(textareaQryStr), "padding-left").replace("px", ""));
			buttonwidth  = Number(getStyleVal(document.querySelector(dragbarQryStr), "width").replace("px", ""));
			textareaheight = getStyleVal(document.querySelector(textareawrapperQryStr), "height");
			dragleft = textareasize + leftpadding + 20 + (leftpadding / 2) - (buttonwidth / 2);
			
			document.querySelector(dragbarQryStr).style.top = containertop + "px";
			document.querySelector(dragbarQryStr).style.left = dragleft + "px";
			document.querySelector(dragbarQryStr).style.height = textareaheight;
			document.querySelector(dragbarQryStr).style.cursor = "col-resize";
		} else {
			document.querySelector(dragbarQryStr).style.display = 'none';
			if (window.getComputedStyle) {
				textareaheight = window.getComputedStyle(document.querySelector(textareawrapperQryStr),null).getPropertyValue("height");
			}
		}
		document.querySelector(iframecontainerQryStr).style.height = (Number(textareaheight.replace("px","")) + 11) + "px";
	}

	// let dragbarElement;
	function dragstart(e) {
		e.preventDefault();
		/*** DRAGBAR IS NOT CURRENTLY WORKING CORRECTLY!!!! :( *** /
		// dragging = true;
	}

	function dragmove(e) {
		if(typeof dragbarElement=='undefined'){
			return;
		}
		let percentage, 
			containertop, 
			mainPercentage;
		if (dragging) {
			document.querySelector("#" + id + " .codedit-shield").style.display = "block";    
			if (!dragbarElement.classList.contains("horizontal")) {
				percentage = (e.pageX / window.innerWidth) * 100;
				if (percentage > 5 && percentage < 98) {
					mainPercentage = 100-percentage;
					document.querySelector("#" + id + " .codedit-textareacontainer").style.width = percentage + "%";
					document.querySelector("#" + id + " .codedit-iframecontainer").style.width = mainPercentage + "%";
					fixDragBtn(dragbarElement);
				}
			} else {
				containertop = Number(getStyleVal(document.querySelector("#" + id + " .codedit-container"), "top").replace("px", ""));
				percentage = ((e.pageY - containertop + 20) / (window.innerHeight - containertop + 20)) * 100;
				if (percentage > 5 && percentage < 98) {
					mainPercentage = 100-percentage;
					document.querySelector("#" + id + " .codedit-textareacontainer").style.height = percentage + "%";
					document.querySelector("#" + id + " .codedit-iframecontainer").style.height = mainPercentage + "%";
					fixDragBtn(dragbarElement);
				}
			}
		}
	}

	function dragend(e) {
		if(typeof dragbarElement=='undefined' || !e.target.attributes.length){
			return;
		}
		if(e.target.attributes[0].nodeValue=="codedit-shield"){
			e.target.style.display = "none";
		}
		dragging = false;
		let vend = navigator.vendor;
		if (id && codeMirrorObj && vend.indexOf("Apple") == -1) {
			codeMirrorObj.refresh();
		}
	}
*/
 
}

(function(){
	let placeholders = document.getElementsByClassName("code"),
		isAbook = document.getElementById("abook-page-container")
		ajaxUrl = isAbook ? 'editor/getAbookExample' : 'editor/getExample';
	if(!placeholders.length){
		return;
	}
	Object.values(placeholders).forEach(function(elm){
		let codeId = elm.innerText.replace('{code:','').replace('}',''),
			unique = (Math.random() * (100000000 - 100000) + 100000).toString().replace('.','');
		$.ajax({
			 url: ajaxUrl
			,data: { codeId : codeId, unique : unique }
			,type: 'post'
			,success: function(res){
				setTimeout(function(){
					elm.innerHTML = res;
					if(!isAbook){
						new CodEdit('editor-' + unique);
					}
				}, 300);
			}
		});
	});
})();