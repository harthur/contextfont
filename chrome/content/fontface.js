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
      var stylesheet = stylesheets[i];
      var rules = stylesheet.cssRules;
      for(var j = 0; j < rules.length; j++) {
        var rule = rules[j];
        if(rule.type == CSSRule.FONT_FACE_RULE) {
          var ffFamily = rule.style.getPropertyValue("font-family");
          if(this.sameFamily(ffFamily, fontFamily)) {
            var href = stylesheet.href;
            rule.href = href ? href : content.location.href; // so we can resolve the src
            ffRules.push(rule);
          }
        }
      }
    }
    return ffRules;
  },

  getffUrls : function(doc, fontFamily) {
    var rules = this.getffRules(doc, fontFamily);
    var urls = rules.map(function(rule) {
         return contextfontFace.getResolvedUrls(rule).filter(contextfont.identity)});
    var urls = urls.reduce(function(a,b) {return a.concat(b)}, []);
    return urls;
  },

  getMatchingUrls : function(doc, fontFamily, computed) {
    var rules = this.getffRules(doc, fontFamily);
    var matching;
    for(var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if(this.isMatching(rule, computed))
        matching = rule;
      if(this.isExact(rule, computed))
        return this.getResolvedUrls(rule); 
    }
    if(matching)
      return this.getResolvedUrls(matching);
  },

  getUrls : function(rule) {
    var src = rule.style.getPropertyValue("src");
    var urlExp = /url\(\"?\'?(.+?)\"?\'?\)/g;
    var urls = [];
    while(matches = urlExp.exec(src)) {
      var url = matches[1];
      if(!/^data\:/.test(url)) // we don't to data urls
        urls.push(url);
    }
    return urls;
  },

  getResolvedUrls : function(rule) {
    var paths = this.getUrls(rule);
    var href = rule.href;
    return paths.map(function(path) { return contextfontFace.getResolvedUrl(href, path); })
  },

  getResolvedUrl : function(href, path) {
    if(contextfont.isAbsolute(path))
      return contextfont.prePath(href) + path;
    if(contextfont.isUrl(path))
      return url;
    return contextfont.dirName(href) + path;
  },

  getLocals : function(propertyValue) {
    var localExp = /local\(\"?\'?(.+?)\"?\'?\)/g;
    var locals = [];
    while((matches = localExp.exec(propertyValue)) != null)
      locals.push(matches[1]);
    return locals;
  },

  formatSupported : function(rule) {
    /* var src = rule.style.getPropertyValue("src");
    var matches = src.match(/format\(\"?\'?(.+?)\"?\'?\)/);
    if(matches)
      var format = matches[1];
    else */
   
    // assumes font file has a standard extension like .otf or .woff
    var urls = this.getUrls(rule);
    for(var i = 0; i < urls.length; i++) {
      var format = contextfont.extension(urls[i]);
      if(["woff", "otf", "ttf"].indexOf(format) != -1)
        return true;
    }
    return false;
  },

  /* THIS PART SUCKS! */
  isMatching : function(rule, computed) {
    var ffWeight = rule.style.getPropertyValue("font-weight");
    var ffStyle = rule.style.getPropertyValue("font-style");

    var weight = computed.fontWeight;
    var style = computed.fontStyle;

    return this.formatSupported(rule) 
      && this.matchingWeight(ffWeight, weight) 
      && this.matchingStyle(ffStyle, style);
  },

  isExact : function(rule, computed) {
    var ffWeight = rule.style.getPropertyValue("font-weight");
    var ffStyle = rule.style.getPropertyValue("font-style");

    var weight = computed.fontWeight;
    var style = computed.fontStyle;
    
    return this.formatSupported(rule)
      && this.sameWeight(ffWeight, weight) 
      && this.sameStyle(ffStyle, style);
  },
   
  sameFamily : function(fontFamily, computedFamily) {
    return fontFamily.replace(/['"]/g, '') ==
      computedFamily.replace(/['"]/g, '');
  },

  sameWeight : function(fontWeight, computedWeight) {
    if(fontWeight == computedWeight)
      return true;
    if(computedWeight == 400
       && (!fontWeight || fontWeight == 'normal'))
      return true;
    if(computedWeight == 700  && fontWeight == 'bold')
      return true;
    if(computedWeight == 'bolder' && fontWeight == 'bold')
      return true;
    return false;
  },

  matchingWeight : function(fontWeight, computedWeight) {
    return this.sameWeight(fontWeight, computedWeight)
     || (computedWeight > 400 && fontWeight == 'bold')
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
