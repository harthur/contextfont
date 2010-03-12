contextfontFace = {

 allStyleSheets : function(doc) {
    var ss = [];
    for(var i = 0; i < doc.styleSheets.length; i++)
      ss = ss.concat(this.getStyleSheets(doc.styleSheets[i]));
    return ss;
  },

  getStyleSheets : function(stylesheet) {
    if(!stylesheet) // Firefox protects against @import statement loops
      return [];
    var ss = [stylesheet];
    var rules = stylesheet.cssRules;
    for(var j = 0; j < rules.length; j++) {
      if(rules[j].type == CSSRule.IMPORT_RULE)
        ss = ss.concat(this.getStyleSheets(rules[j].styleSheet));
    }
    return ss;
  },

  getffRules : function(doc, fontFamily) {
    var stylesheets = this.allStyleSheets(doc);
    var ffRules = [];
    for(var i = 0; i < stylesheets.length; i++) {
      var rules = stylesheets[i].cssRules;
      for(var j = 0; j < rules.length; j++) {
        var rule = rules[j];
        if(rule.type == CSSRule.FONT_FACE_RULE) {
          var ffFamily = rule.style.getPropertyValue("font-family");
          if(this.sameFamily(ffFamily, fontFamily))
            ffRules.push(rule);
        }
      }
    }
    return ffRules;
  },

  getffUrls : function(doc, fontFamily) {
    var rules = this.getffRules(doc, fontFamily);
    return rules.map(function(rule) {
         return contextfontFace.getUrl(rule.style.getPropertyValue("src")) });
  },

  getffUrl : function(doc, fontFamily, computed) {
    var rules = this.getffRules(doc, fontFamily);
    alert(rules.length + " rules for font-family " + fontFamily);
    var src = '';
    for(var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if(this.isMatching(rule, computed))
        src = rule.style.getPropertyValue("src");
      if(this.isExact(rule, computed))
        return this.getUrl(rule.style.getPropertyValue("src")); 
    }
    return this.getUrl(src);
  },

  getUrl : function(propertyValue) {
    var urlExp = /url\(\"?\'?(.+?)\"?\'?\)/;
    matches = urlExp.exec(propertyValue);
    if(matches)
      return matches[1];
  },

  getLocals : function(propertyValue) {
    var localExp = /local\(\"?\'?(.+?)\"?\'?\)/g;
    var locals = [];
    while((matches = localExp.exec(propertyValue)) != null)
      locals.push(matches[1]);
    return locals;
  },

  /* NOT IN USE */
  isMatching : function(rule, computed) {
    var ffWeight = rule.style.getPropertyValue("font-weight");
    var ffStyle = rule.style.getPropertyValue("font-style");

    var weight = computed.fontWeight;
    var style = computed.fontStyle;

    return this.matchingWeight(ffWeight, weight) 
      && this.matchingStyle(ffStyle, style);
  },

  isExact : function(rule, computed) {
    var ffWeight = rule.style.getPropertyValue("font-weight");
    var ffStyle = rule.style.getPropertyValue("font-style");

    var weight = computed.fontWeight;
    var style = computed.fontStyle;
    
    return this.sameWeight(ffWeight, weight) 
      && this.sameStyle(ffStyle, style);
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
    if(computedWeight == 'bolder' && fontWeight == 'bold')
      return true;
    // bolder, lighter

    return false;
  },

  matchingWeight : function(fontWeight, computedWeight) {
    return this.sameWeight(fontWeight, computedWeight)
     || !fontWeight;
  },

  sameStyle : function(fontStyle, computedFontStyle) {
    if(fontStyle == computedFontStyle)
      return true;
    if(computedFontStyle == 'normal' && !fontStyle)
      return true;
    return false;
  },
 
  matchingStyle : function(fontStyle, computedFontStyle) {
     return this.sameStyle(fontStyle, computedFontStyle)
     || !fontStyle;
  },
}
