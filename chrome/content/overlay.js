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

  getFont : function(element) {
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

  allFontFaces : function(doc) {
    var fontFaces = {};
    for(var i = 0; i < doc.styleSheets.length; i++) {
      var rules = doc.styleSheets[i].cssRules;
      for(var j = 0; j < rules.length; j++) {
        var rule = rules[j];
        if(rule.type == CSSRule.FONT_FACE_RULE) {
          var fontFamily = rule.style.getPropertyValue("font-family");
          var src = rule.style.getPropertyValue("src");
          var weight = rule.style.getPropertyValue("font-weight");
          var style = rule.style.getPropertyValue("font-style");
          fontFaces[fontFamily] = src;
        }
      }
    }
    return fontFaces;
  },

  getFontFaceSrc : function(doc, fontFamily, fontWeight, fontStyle) {
    for(var i = 0; i < doc.styleSheets.length; i++) {
      var rules = doc.styleSheets[i].cssRules;
      for(var j = 0; j < rules.length; j++) {
        var rule = rules[j];
        if(rule.type == CSSRule.FONT_FACE_RULE) {

          var ffFamily = rule.style.getPropertyValue("font-family");
          var ffSrc = rule.style.getPropertyValue("src");
          var ffWeight = rule.style.getPropertyValue("font-weight");
          var ffStyle = rule.style.getPropertyValue("font-style");

          if(contextfont.sameFamily(ffFamily, fontFamily)
             && contextfont.sameWeight(ffWeight, fontWeight) 
             && contextfont.sameStyle(ffStyle, fontStyle))
            return ffSrc;
        }
      }
    }
  },
   
  sameFamily : function(fontFamily, computedFamily) {
    return fontFamily.replace(/['"]/g, '') ==
      computedFamily.replace(/['"]/g, '');
  },

  sameWeight : function(fontWeight, computedWeight) {
    if(fontWeight == computedWeight)
      return true;

    if(computedWeight == '400'
       && (fontWeight == '' || fontWeight == 'normal'))
      return true;
    if(computedWeight == '700' && fontWeight == 'bold')
      return true;
    // bolder, lighter

    return false;
  },

  sameStyle : function(fontStyle, computedFontStyle) {
    if(fontStyle == computedFontStyle)
      return true;
    if(computedFontStyle == 'normal' && !fontStyle)
      return true;
    return false;
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
    var menuitem = document.getElementById("context-contextfont");
    if(!getBrowserSelection()) {
      menuitem.hidden = true;
      return;
    }
    var selection = content.getSelection();
    var elem = selection.focusNode;         // use getRangeAt to get all nodes
    if(elem.nodeType != Node.ELEMENT_NODE)
      elem = elem.parentNode;

    var doc = elem.ownerDocument;
    var style = doc.defaultView.getComputedStyle(elem, null);

    var fontSize = contextfont.getFontSize(elem);
    var fontFamily = contextfont.getFont(elem);
    var fontWeight = style.fontWeight; //contextfont.getFontWeight(elem);
    var fontStyle = style.fontStyle; //contextfont.getFontStyle(elem);
    var src = contextfont.getFontFaceSrc(doc, fontFamily, fontWeight, fontStyle);
    
    var menuitem = document.getElementById("context-contextfont");
    menuitem.hidden = false;
    menuitem.label = fontSize + " ";
    var weight = contextfont.normalizedWeight(fontWeight);
    if(weight)
      menuitem.label += weight + " ";
    var fontStyle = contextfont.normalizedStyle(fontStyle);
    if(fontStyle)
      menuitem.label += fontStyle + " ";
    menuitem.label += fontFamily + " ";
    if(src)
      menuitem.label += src;
  }
};

window.addEventListener("load", contextfont.onLoad, false);
