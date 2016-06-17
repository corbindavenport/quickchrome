/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

function findURL(url){
	var img = document.createElement('img');
	img.src = url; // Set string url
	url = img.src; // Get qualified url
	img.src = null; // No server request
	return url;
}

function injectPlayer(object, id, url, width, height, cssclass, cssstyles, name) {
	// Replace embed with HTML5 video player
	var oldembed = $(object).prop('outerHTML').toString();
	if ((url.endsWith('.mp4')) || (url.endsWith('.mp3')) || (url.endsWith('.m4a')) || (url.endsWith('.wav')) || (url.endsWith('.avi'))) {
		$(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="nopluginlogo"></div>This page is trying to load plugin content here. You can try to load the content with NoPlugin, but it might not work.<br /><br /><button type="button" id="button' + id + '">Show content</button></div><video class="nopluginvideo" id="video' + id + '" controls width="' + width + '" height="' + height + '"><source src="' + url + '"><!-- Original embed code: ' + oldembed + ' --></video>');
		$("video[id$='video" + id + "']").css("display", "none");
	} else {
		$(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content"><div class="nopluginlogo"></div>This page is trying to load plugin content here. Click to open it in your media player.<br /><br /><button type="button" title="' + url + '">Open content</button><a href="https://github.com/corbindavenport/noplugin/wiki/Why-cant-noplugin-play-a-video%3F" target="_blank">More info</a></div><!-- Original embed code: ' + oldembed + ' --></div>');
		$(document).on('click', 'button[title="' + url + '"]', function(){
			// Pass URL to background.js for browser to download and open video
			chrome.runtime.sendMessage({method: "saveVideo", key: url}, function(response) {
				$('button[title="' + url + '"]').prop("disabled",true);
				$('button[title="' + url + '"]').html("Downloading video...");
			})
		});
	}
	console.log("[NoPlugin] Replaced plugin embed for " + url);
	$(document).on('click', "#button" + id, function() {
		$("video[id$='video" + id + "']").css("display", "block");
		$("div[id$='alert" + id + "']").css("display", "none");
	});
	// Show warning for NoPlugin
	if ($(".NoPlugin-popup").length) {
		// The popup was already created by another instance, so don't do it again
	} else {
		$("body").append('<!-- Begin NoPlugin popup --><style>body {margin-top: 37px !important;}</style><div class="noplugin-popup"><span class="noplugin-message">NoPlugin loaded plugin content on this page.</span><a href="https://github.com/corbindavenport/noplugin/wiki/Report-a-page-broken" target="_blank">Not working?</a></div>');
	}
}

function replaceEmbed(object) {
	// Create ID for player
	var id = String(Math.floor((Math.random() * 1000000) + 1));
	// Find video source of object
	var url = findURL(object.attr("src"));
	// Find attributes of object
	if (object.is("[width]")) {
		var width = $(object).attr("width");
	} else {
		var width = object.width();
	}
	if (object.is("[height]")) {
		var height = $(object).attr("height");
	} else {
		var height = object.height();
	}
	if (object.is("[class]")) {
		var cssclass = $(object).attr("class");
	} else {
		var cssclass = "";
	}
	if (object.is("[style]")) {
		var cssstyles = $(object).attr("style");
	} else {
		var cssstyles = "";
	}
	if (object.is("[name]")) {
		var name = $(object).attr("name");
	} else {
		var name = "";
	}
	injectPlayer(object, id, url, width, height, cssclass, cssstyles, name);
}

function replaceObject(object) {
	// Create ID for player
	var id = String(Math.floor((Math.random() * 1000000) + 1));
	// Find video source of object
	if (object.is("[data]")) {
		var url = findURL($(object).attr("data"));
	} else if (object.find("param[name$='src']").length) {
		var url = findURL($(object).find("param[name$='src']").val());
	} else {
		return;
	}
	// Find attributes of object
	if (object.is("[width]")) {
		var width = $(object).attr("width");
	} else {
		var width = object.width();
	}
	if (object.is("[height]")) {
		var height = $(object).attr("height");
	} else {
		var height = object.height();
	}
	if (object.is("[class]")) {
		var cssclass = $(object).attr("class");
	} else {
		var cssclass = "";
	}
	if (object.is("[style]")) {
		var cssstyles = $(object).attr("style");
	} else {
		var cssstyles = "";
	}
	if (object.is("[name]")) {
		var name = $(object).attr("name");
	} else {
		var name = "";
	}
	injectPlayer(object, id, url, width, height, cssclass, cssstyles, name);
}

function reloadDOM() {
	// MIME types from www.freeformatter.com/mime-types-list.html
	// QuickTime Player
	$("object[type='video/quicktime'],object[codebase='http://www.apple.com/qtactivex/qtplugin.cab'],object[classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B']").each(function() {
		replaceObject($(this));
	});
	$("embed[type='video/quicktime'],embed[src$='.mov']").each(function() {
		replaceEmbed($(this));
	});
	// RealPlayer
	$("object[type='application/vnd.rn-realmedia'],object[type='audio/x-pn-realaudio'],object[type='audio/x-pn-realaudio-plugin'],object[classid='clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA']").each(function() {
		replaceObject($(this));
	});
	$("embed[type='application/vnd.rn-realmedia'],embed[type='audio/x-pn-realaudio'],embed[type='audio/x-pn-realaudio-plugin'],embed[classid='clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA'],embed[src$='.ram'],embed[src$='.rmp'],embed[src$='.rm']").each(function() {
		replaceEmbed($(this));
	});
}

// Initialize tooltips for initial page load
$( document ).ready(function() {
	reloadDOM();
});

// Initialize tooltips every time DOM is modified
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		console.log("[NoPlugin] DOM change detected, looking for embeds again");
		reloadDOM();
	});
});

var observerConfig = {
	attributes: true,
	childList: true,
	characterData: true
};

observer.observe(document, observerConfig);