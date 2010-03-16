contextfont = {
  onLoad : function(event) {
    var contextMenu = document.getElementById("contentAreaContextMenu");
    contextMenu.addEventListener("popupshowing", function (e){ contextfont.menuShowing(e); }, false);
  },

  getFontSize : function(element) {
    var doc = element.ownerDocument;
    var style = doc.defaultView.getComputedStyle(element, null);
    var size = parseInt(style.fontSize);
    return size + "px";
  },

  getFontFamily : function(element) {
    // create canvas in owner doc to get @font-face fonts
    var doc = element.ownerDocument;
    var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    var context = canvas.getContext("2d");
 
    var style = doc.defaultView.getComputedStyle(element, null);
    var fonts = style.fontFamily.split(',');

    if(!context.measureText)
      return style.fontFamily;
 
    for(var i = 0; i < fonts.length; i++)
      if(contextfont.testFont(fonts[i], context))
        return fonts[i];
    return "serif";
  },
 
  testFont : function(font, context) {
    var testString = "abcdefghijklmnopqrstuvwxyz";
 
    context.font = "400px serif";
    var defaultWidth = context.measureText(testString).width;
 
    context.font = "400px " + font;
    var fontWidth = context.measureText(testString).width;
 
    if(defaultWidth == fontWidth)
      return false;
    return true;
  },

  normalizedWeight : function(weight) {
    if(weight == '400')
      return '';
    if(weight == '700')
      return 'bold';
    return weight;
  },

  normalizedStyle : function(style) {
    if(style == 'normal')
      return '';
    return style;
  },

  normalizedVariant : function(variant) {
    if(variant == 'normal')
      return '';
    return variant;
  },

  identity : function(item) {
    return item;
  },

  isUrl : function(url) {
    return url.match(/(\:\/\/)|(www\.)/);
  },

  isAbsolute : function(url) {
    return url.match(/^\/.+/);
  },

  dirName : function(url) {
    var matches = url.match(/^(.*\/)(.*)$/);
    if(matches)
      return matches[1];
    return url;
  },

  baseName : function(path) {
    var matches = path.match(/^(?:.*)\/(.+)$/);
    if(matches)
      return matches[1];
    return path;
  },

  extension : function(path) {
    var matches = path.match(/^(?:.*)\.(.+)$/);
    if(matches)
      return matches[1];
    return path;
  },

  prePath : function(url) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]  
                    .getService(Components.interfaces.nsIIOService);  
    return ioService.newURI(url, null, null).prePath;  
  },

  downloadFont : function(url) {
    gBrowser.loadURI(url);
  },

  menuShowing : function(event) {
    var separator = document.getElementById("context-contextfont-separator");
    var font = document.getElementById("context-contextfont-font");
    var download = document.getElementById("context-contextfont-download");
    var dlMenu = document.getElementById("context-contextfont-downloads");

    if(!getBrowserSelection()) {
      separator.hidden = true;
      font.hidden = true;
      download.hidden = true;
      dlMenu.hidden = true;
      return;
    }
    separator.hidden = false;
    font.hidden = false;
 
    var selection = content.getSelection();
    var elem = selection.focusNode;  // just use node at end of selection
    if(elem.nodeType != Node.ELEMENT_NODE)
      elem = elem.parentNode;

    var doc = elem.ownerDocument;
    var computed = doc.defaultView.getComputedStyle(elem, null);
    var family = this.getFontFamily(elem);
    
    var label = [this.getFontSize(elem),
      this.normalizedWeight(computed.fontWeight),
      this.normalizedStyle(computed.fontStyle),
      this.normalizedVariant(computed.fontVariant),
      family];
    label = label.filter(this.identity);
    font.label = label.join(" ");
    
    var urls = contextfontFace.getffUrls(doc, family);
    var matching = contextfontFace.getMatchingUrls(doc, family, computed);
    this.urls = urls;
    this.matching = matching;

    if(urls.length == 1) {
      download.hidden = false;
      download.value = urls[0];
      var strings = document.getElementById("contextfont-strings");
      download.label = strings.getString("download") + " " + this.baseName(urls[0]);
      download.setAttribute("oncommand", "contextfont.downloadFont('" + urls[0] + "')");
    }
    else
      download.hidden = true;

    if(urls.length > 1)
      dlMenu.hidden = false;
    else
      dlMenu.hidden = true;
  },
   
  downloadShowing : function() {
    urlsMenu = document.getElementById("context-contextfont-urls");
    while(urlsMenu.firstChild)
      urlsMenu.removeChild(urlsMenu.firstChild);

    for(var i = 0; i < this.urls.length; i++) {
      var menuitem = document.createElement("menuitem");
      var url = this.urls[i];

      if(this.matching.indexOf(url) != -1) 
        menuitem.style.fontWeight = "bold";
      menuitem.setAttribute("label", this.baseName(url));
      menuitem.setAttribute("oncommand", "contextfont.downloadFont('" + url + "')");
      urlsMenu.appendChild(menuitem);
    }
  }
};

window.addEventListener("load", contextfont.onLoad, false);
