// ==UserScript==
// @name            3D Model Exporter Autoloader
// @author          rslavin
// @namespace       https://github.com/rslavin/3d-Model-Exporter/
// @description     Autoloader for the 3D Model Exporter Script
// @version	        1
// @include         *example.com/*
// @installURL      https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/3dModelExporter-autoloader.user.js
// @downloadURL     https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/3dModelExporter-autoloader.user.js
// @updateURL       https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/3dModelExporter-autoloader.user.js
// @run-at          document-end
// ==/UserScript==

/* 
 * This file is a Greasemonkey user script. To install it, you need 
 * the Firefox plugin "Greasemonkey" (URL: http://greasemonkey.mozdev.org/)
 * After you installed the extension, restart Firefox and revisit 
 * this script. Now you will see a new menu item "Install User Script"
 * in your tools menu.
 * 
 * To uninstall this script, go to your "Tools" menu and select 
 * "Manage User Scripts", then select this script from the list
 * and click uninstall :-)
 *
 * Creative Commons Attribution License (--> or Public Domain)
 * http://creativecommons.org/licenses/by/2.5/
*/

function addElements() {

    let xhr = new XMLHttpRequest;
    xhr.open("get", "https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/dist/exporter.min.js", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.text = xhr.responseText;
            document.body.appendChild(script)
        }
    };
    xhr.send(null);

}

addElements();
