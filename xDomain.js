/*!
*jQuery .xDomain() plugin
*http://github.com/chrisyz/xdomain
*http://chrisyz.com
*
*Copyright 2011, Christopher Young-Zawada
*Licenced under the MIT License
*
*Includes base64 decoding code by Ntt.CC
*http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html
*/
$(function(){
	$.extend({
		xDomain: function(url,callback){
			//set your host URL here.  That's all you need to for front-end setup.
			var host = "http:/path.to.your.remote.server.com/whatever/xdomain.php";

			//adds "http://" to the front of your request if it doesn't exist
			function prependFileName(file) {
				if(!(file.match(/^.+?:\/\//))) {
						file = "http://"+file;
					}
				return file;
			}
			
			//place the request to your host via ajax
			function getJsonData(url) {
				//append the url with a JSONp callback
				url = url+'&_callback=?';
				//run the ajax
				var ajax = $.ajax({
					url: url,
					dataType: "jsonp",
					success: function(data) {
						return data;
					},
					error: function(data) {
						//if there is a serious error, throw a status code and return false
						throw "Error - request failed. Status: "+data.status;
						return false;
					}
				});
				//return this function as a promise (jQuery 1.5+)
				return ajax;
			}
			
			//base64 is slightly modified code from (c) by Ntt.CC -  http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html
			function decodeB64(input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;
				var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

				// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
				var base64test = /[^A-Za-z0-9\+\/\=]/g;
				if (base64test.exec(input)) {
					alert("There were invalid base64 characters in the input text.\n" +
						  "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
						  "Expect errors in decoding.");
				}
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

				do {
					enc1 = keyStr.indexOf(input.charAt(i++));
					enc2 = keyStr.indexOf(input.charAt(i++));
					enc3 = keyStr.indexOf(input.charAt(i++));
					enc4 = keyStr.indexOf(input.charAt(i++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					output = output + String.fromCharCode(chr1);

					if (enc3 != 64) {
					   output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
					   output = output + String.fromCharCode(chr3);
					}

					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";

				} while (i < input.length);

				return unescape(output);
			}
			//prepend the URL if it DNE
			url = host+'?uri='+prependFileName(url);
			//create a promise for the function to return the value
			var def = new jQuery.Deferred();
			//add a callback to getting the json data
			$.when(getJsonData(url)).done(function(data){
				//if the document returned isn't empty
				if(data.data) {
					//decode the b64 data
					data = decodeB64(data.data);
					//run a callback if one exists
					if(callback){callback(data)}
					//resolve the promise with the data
					def.resolve(data);
				} else {
					//warn that the data wasn't available at the endpoint
					console.warn("Request failed.  Please make sure that your endpoint URL is correct and try again.");
					//resolve with false
					def.resolve(false);
				}
			});
			//return the promise as your object
			return $.when(def);
		} 
		
	});
	
	
});