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


  menuShowing : function(event) {
    var separator = document.getElementById("context-contextfont-separator");
    var font = document.getElementById("context-contextfont-font");
    var fontface = document.getElementById("context-contextfont-fontface");
    var download = document.getElementById("context-contextfont-download");
    fontface.hidden = true;
    download.hidden = true;

    if(!getBrowserSelection()) {
      separator.hidden = true;
      font.hidden = true;
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

    var size = this.getFontSize(elem);
    var family = this.getFontFamily(elem);
    
    font.label = size + " ";
    var weight = this.normalizedWeight(computed.fontWeight);
    if(weight)
      font.label += weight + " ";

    var style = this.normalizedStyle(computed.fontStyle);
    if(style)
      font.label += style + " ";
    font.label += family + " ";

    var urls = contextfontFace.getffUrls(doc, family);
    var url = contextfontFace.getffUrl(doc, family, computed);
    if(urls) {
      download.hidden = false;
      download.label = "<" + url + "> " + urls.join(" ");
    }
  }
};

window.addEventListener("load", contextfont.onLoad, false);
