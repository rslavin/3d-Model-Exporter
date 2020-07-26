# 3D Model Exporter

Uses three.js to export 3D models from web pages. This tool is meant purely for academic purposes in cases where explicit permission to export models has been acquired.


## Installation 

This tool can be either run directly in the browser console or loaded automatically with Greasemonkey or similar tools.

### Browser Console

While on the page from which you wish to export, paste hte following into the console.

```
var xhr=new XMLHttpRequest;xhr.open("get","https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/dist/exporter.min.js",true);xhr.onreadystatechange=function(){if(xhr.readyState==4){var script=document.createElement("script");script.type="text/javascript";script.text=xhr.responseText;document.body.appendChild(script)}};xhr.send(null);
```

### Greasemonkey

With Greasemonkey installed, click the link below to load the script. Replace the `@match` pattern with an appropriate pattern for the web page you'd like to load this tool on.

[https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/3dModelExporter-autoloader.user.js](https://raw.githubusercontent.com/rslavin/3d-Model-Exporter/master/3dModelExporter-autoloader.user.js)

### Usage

Once loaded, a menu will load in the first element on the page with a class name ending in ``container``.
The menu will have two dropdown menus, one for model quality and one for the model's base quality (since some bases 
look better without smoothing). Once the quality is selected for both, click either the .stl or .obj save button to 
export the model.
