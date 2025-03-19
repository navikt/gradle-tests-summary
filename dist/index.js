var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/balanced-match/index.js
var require_balanced_match = __commonJS((exports, module) => {
  module.exports = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp)
      a = maybeMatch(a, str);
    if (b instanceof RegExp)
      b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range;
  function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      if (a === b) {
        return [ai, bi];
      }
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
});

// node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS((exports, module) => {
  var balanced = require_balanced_match();
  module.exports = expandTop;
  var escSlash = "\x00SLASH" + Math.random() + "\x00";
  var escOpen = "\x00OPEN" + Math.random() + "\x00";
  var escClose = "\x00CLOSE" + Math.random() + "\x00";
  var escComma = "\x00COMMA" + Math.random() + "\x00";
  var escPeriod = "\x00PERIOD" + Math.random() + "\x00";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m)
      return [str];
    var pre = m.pre;
    var post = m.post.length ? expand(m.post, false) : [""];
    if (/\$$/.test(m.pre)) {
      for (var k = 0;k < post.length; k++) {
        var expansion = pre + "{" + m.body + "}" + post[k];
        expansions.push(expansion);
      }
    } else {
      var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
      var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
      var isSequence = isNumericSequence || isAlphaSequence;
      var isOptions = m.body.indexOf(",") >= 0;
      if (!isSequence && !isOptions) {
        if (m.post.match(/,.*\}/)) {
          str = m.pre + "{" + m.body + escClose + m.post;
          return expand(str);
        }
        return [str];
      }
      var n;
      if (isSequence) {
        n = m.body.split(/\.\./);
      } else {
        n = parseCommaParts(m.body);
        if (n.length === 1) {
          n = expand(n[0], false).map(embrace);
          if (n.length === 1) {
            return post.map(function(p) {
              return m.pre + n[0] + p;
            });
          }
        }
      }
      var N;
      if (isSequence) {
        var x = numeric(n[0]);
        var y = numeric(n[1]);
        var width = Math.max(n[0].length, n[1].length);
        var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
        var test = lte;
        var reverse = y < x;
        if (reverse) {
          incr *= -1;
          test = gte;
        }
        var pad = n.some(isPadded);
        N = [];
        for (var i = x;test(i, y); i += incr) {
          var c;
          if (isAlphaSequence) {
            c = String.fromCharCode(i);
            if (c === "\\")
              c = "";
          } else {
            c = String(i);
            if (pad) {
              var need = width - c.length;
              if (need > 0) {
                var z = new Array(need + 1).join("0");
                if (i < 0)
                  c = "-" + z + c.slice(1);
                else
                  c = z + c;
              }
            }
          }
          N.push(c);
        }
      } else {
        N = [];
        for (var j = 0;j < n.length; j++) {
          N.push.apply(N, expand(n[j], false));
        }
      }
      for (var j = 0;j < N.length; j++) {
        for (var k = 0;k < post.length; k++) {
          var expansion = pre + N[j] + post[k];
          if (!isTop || isSequence || expansion)
            expansions.push(expansion);
        }
      }
    }
    return expansions;
  }
});

// node_modules/xmldom/lib/entities.js
var require_entities = __commonJS((exports) => {
  exports.entityMap = {
    lt: "<",
    gt: ">",
    amp: "&",
    quot: '"',
    apos: "'",
    Agrave: "À",
    Aacute: "Á",
    Acirc: "Â",
    Atilde: "Ã",
    Auml: "Ä",
    Aring: "Å",
    AElig: "Æ",
    Ccedil: "Ç",
    Egrave: "È",
    Eacute: "É",
    Ecirc: "Ê",
    Euml: "Ë",
    Igrave: "Ì",
    Iacute: "Í",
    Icirc: "Î",
    Iuml: "Ï",
    ETH: "Ð",
    Ntilde: "Ñ",
    Ograve: "Ò",
    Oacute: "Ó",
    Ocirc: "Ô",
    Otilde: "Õ",
    Ouml: "Ö",
    Oslash: "Ø",
    Ugrave: "Ù",
    Uacute: "Ú",
    Ucirc: "Û",
    Uuml: "Ü",
    Yacute: "Ý",
    THORN: "Þ",
    szlig: "ß",
    agrave: "à",
    aacute: "á",
    acirc: "â",
    atilde: "ã",
    auml: "ä",
    aring: "å",
    aelig: "æ",
    ccedil: "ç",
    egrave: "è",
    eacute: "é",
    ecirc: "ê",
    euml: "ë",
    igrave: "ì",
    iacute: "í",
    icirc: "î",
    iuml: "ï",
    eth: "ð",
    ntilde: "ñ",
    ograve: "ò",
    oacute: "ó",
    ocirc: "ô",
    otilde: "õ",
    ouml: "ö",
    oslash: "ø",
    ugrave: "ù",
    uacute: "ú",
    ucirc: "û",
    uuml: "ü",
    yacute: "ý",
    thorn: "þ",
    yuml: "ÿ",
    nbsp: " ",
    iexcl: "¡",
    cent: "¢",
    pound: "£",
    curren: "¤",
    yen: "¥",
    brvbar: "¦",
    sect: "§",
    uml: "¨",
    copy: "©",
    ordf: "ª",
    laquo: "«",
    not: "¬",
    shy: "­­",
    reg: "®",
    macr: "¯",
    deg: "°",
    plusmn: "±",
    sup2: "²",
    sup3: "³",
    acute: "´",
    micro: "µ",
    para: "¶",
    middot: "·",
    cedil: "¸",
    sup1: "¹",
    ordm: "º",
    raquo: "»",
    frac14: "¼",
    frac12: "½",
    frac34: "¾",
    iquest: "¿",
    times: "×",
    divide: "÷",
    forall: "∀",
    part: "∂",
    exist: "∃",
    empty: "∅",
    nabla: "∇",
    isin: "∈",
    notin: "∉",
    ni: "∋",
    prod: "∏",
    sum: "∑",
    minus: "−",
    lowast: "∗",
    radic: "√",
    prop: "∝",
    infin: "∞",
    ang: "∠",
    and: "∧",
    or: "∨",
    cap: "∩",
    cup: "∪",
    int: "∫",
    there4: "∴",
    sim: "∼",
    cong: "≅",
    asymp: "≈",
    ne: "≠",
    equiv: "≡",
    le: "≤",
    ge: "≥",
    sub: "⊂",
    sup: "⊃",
    nsub: "⊄",
    sube: "⊆",
    supe: "⊇",
    oplus: "⊕",
    otimes: "⊗",
    perp: "⊥",
    sdot: "⋅",
    Alpha: "Α",
    Beta: "Β",
    Gamma: "Γ",
    Delta: "Δ",
    Epsilon: "Ε",
    Zeta: "Ζ",
    Eta: "Η",
    Theta: "Θ",
    Iota: "Ι",
    Kappa: "Κ",
    Lambda: "Λ",
    Mu: "Μ",
    Nu: "Ν",
    Xi: "Ξ",
    Omicron: "Ο",
    Pi: "Π",
    Rho: "Ρ",
    Sigma: "Σ",
    Tau: "Τ",
    Upsilon: "Υ",
    Phi: "Φ",
    Chi: "Χ",
    Psi: "Ψ",
    Omega: "Ω",
    alpha: "α",
    beta: "β",
    gamma: "γ",
    delta: "δ",
    epsilon: "ε",
    zeta: "ζ",
    eta: "η",
    theta: "θ",
    iota: "ι",
    kappa: "κ",
    lambda: "λ",
    mu: "μ",
    nu: "ν",
    xi: "ξ",
    omicron: "ο",
    pi: "π",
    rho: "ρ",
    sigmaf: "ς",
    sigma: "σ",
    tau: "τ",
    upsilon: "υ",
    phi: "φ",
    chi: "χ",
    psi: "ψ",
    omega: "ω",
    thetasym: "ϑ",
    upsih: "ϒ",
    piv: "ϖ",
    OElig: "Œ",
    oelig: "œ",
    Scaron: "Š",
    scaron: "š",
    Yuml: "Ÿ",
    fnof: "ƒ",
    circ: "ˆ",
    tilde: "˜",
    ensp: " ",
    emsp: " ",
    thinsp: " ",
    zwnj: "‌",
    zwj: "‍",
    lrm: "‎",
    rlm: "‏",
    ndash: "–",
    mdash: "—",
    lsquo: "‘",
    rsquo: "’",
    sbquo: "‚",
    ldquo: "“",
    rdquo: "”",
    bdquo: "„",
    dagger: "†",
    Dagger: "‡",
    bull: "•",
    hellip: "…",
    permil: "‰",
    prime: "′",
    Prime: "″",
    lsaquo: "‹",
    rsaquo: "›",
    oline: "‾",
    euro: "€",
    trade: "™",
    larr: "←",
    uarr: "↑",
    rarr: "→",
    darr: "↓",
    harr: "↔",
    crarr: "↵",
    lceil: "⌈",
    rceil: "⌉",
    lfloor: "⌊",
    rfloor: "⌋",
    loz: "◊",
    spades: "♠",
    clubs: "♣",
    hearts: "♥",
    diams: "♦"
  };
});

// node_modules/xmldom/lib/sax.js
var require_sax = __commonJS((exports) => {
  var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
  var nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
  var tagNamePattern = new RegExp("^" + nameStartChar.source + nameChar.source + "*(?::" + nameStartChar.source + nameChar.source + "*)?$");
  var S_TAG = 0;
  var S_ATTR = 1;
  var S_ATTR_SPACE = 2;
  var S_EQ = 3;
  var S_ATTR_NOQUOT_VALUE = 4;
  var S_ATTR_END = 5;
  var S_TAG_SPACE = 6;
  var S_TAG_CLOSE = 7;
  function ParseError(message, locator) {
    this.message = message;
    this.locator = locator;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, ParseError);
  }
  ParseError.prototype = new Error;
  ParseError.prototype.name = ParseError.name;
  function XMLReader() {}
  XMLReader.prototype = {
    parse: function(source, defaultNSMap, entityMap) {
      var domBuilder = this.domBuilder;
      domBuilder.startDocument();
      _copy(defaultNSMap, defaultNSMap = {});
      parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
      domBuilder.endDocument();
    }
  };
  function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
    function fixedFromCharCode(code) {
      if (code > 65535) {
        code -= 65536;
        var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
        return String.fromCharCode(surrogate1, surrogate2);
      } else {
        return String.fromCharCode(code);
      }
    }
    function entityReplacer(a2) {
      var k = a2.slice(1, -1);
      if (k in entityMap) {
        return entityMap[k];
      } else if (k.charAt(0) === "#") {
        return fixedFromCharCode(parseInt(k.substr(1).replace("x", "0x")));
      } else {
        errorHandler.error("entity not found:" + a2);
        return a2;
      }
    }
    function appendText(end2) {
      if (end2 > start) {
        var xt = source.substring(start, end2).replace(/&#?\w+;/g, entityReplacer);
        locator && position(start);
        domBuilder.characters(xt, 0, end2 - start);
        start = end2;
      }
    }
    function position(p, m) {
      while (p >= lineEnd && (m = linePattern.exec(source))) {
        lineStart = m.index;
        lineEnd = lineStart + m[0].length;
        locator.lineNumber++;
      }
      locator.columnNumber = p - lineStart + 1;
    }
    var lineStart = 0;
    var lineEnd = 0;
    var linePattern = /.*(?:\r\n?|\n)|.*$/g;
    var locator = domBuilder.locator;
    var parseStack = [{ currentNSMap: defaultNSMapCopy }];
    var closeMap = {};
    var start = 0;
    while (true) {
      try {
        var tagStart = source.indexOf("<", start);
        if (tagStart < 0) {
          if (!source.substr(start).match(/^\s*$/)) {
            var doc = domBuilder.doc;
            var text = doc.createTextNode(source.substr(start));
            doc.appendChild(text);
            domBuilder.currentElement = text;
          }
          return;
        }
        if (tagStart > start) {
          appendText(tagStart);
        }
        switch (source.charAt(tagStart + 1)) {
          case "/":
            var end = source.indexOf(">", tagStart + 3);
            var tagName = source.substring(tagStart + 2, end);
            var config = parseStack.pop();
            if (end < 0) {
              tagName = source.substring(tagStart + 2).replace(/[\s<].*/, "");
              errorHandler.error("end tag name: " + tagName + " is not complete:" + config.tagName);
              end = tagStart + 1 + tagName.length;
            } else if (tagName.match(/\s</)) {
              tagName = tagName.replace(/[\s<].*/, "");
              errorHandler.error("end tag name: " + tagName + " maybe not complete");
              end = tagStart + 1 + tagName.length;
            }
            var localNSMap = config.localNSMap;
            var endMatch = config.tagName == tagName;
            var endIgnoreCaseMach = endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase();
            if (endIgnoreCaseMach) {
              domBuilder.endElement(config.uri, config.localName, tagName);
              if (localNSMap) {
                for (var prefix in localNSMap) {
                  domBuilder.endPrefixMapping(prefix);
                }
              }
              if (!endMatch) {
                errorHandler.fatalError("end tag name: " + tagName + " is not match the current start tagName:" + config.tagName);
              }
            } else {
              parseStack.push(config);
            }
            end++;
            break;
          case "?":
            locator && position(tagStart);
            end = parseInstruction(source, tagStart, domBuilder);
            break;
          case "!":
            locator && position(tagStart);
            end = parseDCC(source, tagStart, domBuilder, errorHandler);
            break;
          default:
            locator && position(tagStart);
            var el = new ElementAttributes;
            var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
            var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler);
            var len = el.length;
            if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap)) {
              el.closed = true;
              if (!entityMap.nbsp) {
                errorHandler.warning("unclosed xml attribute");
              }
            }
            if (locator && len) {
              var locator2 = copyLocator(locator, {});
              for (var i = 0;i < len; i++) {
                var a = el[i];
                position(a.offset);
                a.locator = copyLocator(locator, {});
              }
              domBuilder.locator = locator2;
              if (appendElement(el, domBuilder, currentNSMap)) {
                parseStack.push(el);
              }
              domBuilder.locator = locator;
            } else {
              if (appendElement(el, domBuilder, currentNSMap)) {
                parseStack.push(el);
              }
            }
            if (el.uri === "http://www.w3.org/1999/xhtml" && !el.closed) {
              end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
            } else {
              end++;
            }
        }
      } catch (e) {
        if (e instanceof ParseError) {
          throw e;
        }
        errorHandler.error("element parse error: " + e);
        end = -1;
      }
      if (end > start) {
        start = end;
      } else {
        appendText(Math.max(tagStart, start) + 1);
      }
    }
  }
  function copyLocator(f, t) {
    t.lineNumber = f.lineNumber;
    t.columnNumber = f.columnNumber;
    return t;
  }
  function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
    function addAttribute(qname, value2, startIndex) {
      if (qname in el.attributeNames)
        errorHandler.fatalError("Attribute " + qname + " redefined");
      el.addValue(qname, value2, startIndex);
    }
    var attrName;
    var value;
    var p = ++start;
    var s = S_TAG;
    while (true) {
      var c = source.charAt(p);
      switch (c) {
        case "=":
          if (s === S_ATTR) {
            attrName = source.slice(start, p);
            s = S_EQ;
          } else if (s === S_ATTR_SPACE) {
            s = S_EQ;
          } else {
            throw new Error("attribute equal must after attrName");
          }
          break;
        case "'":
        case '"':
          if (s === S_EQ || s === S_ATTR) {
            if (s === S_ATTR) {
              errorHandler.warning('attribute value must after "="');
              attrName = source.slice(start, p);
            }
            start = p + 1;
            p = source.indexOf(c, start);
            if (p > 0) {
              value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
              addAttribute(attrName, value, start - 1);
              s = S_ATTR_END;
            } else {
              throw new Error("attribute value no end '" + c + "' match");
            }
          } else if (s == S_ATTR_NOQUOT_VALUE) {
            value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
            addAttribute(attrName, value, start);
            errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
            start = p + 1;
            s = S_ATTR_END;
          } else {
            throw new Error('attribute value must after "="');
          }
          break;
        case "/":
          switch (s) {
            case S_TAG:
              el.setTagName(source.slice(start, p));
            case S_ATTR_END:
            case S_TAG_SPACE:
            case S_TAG_CLOSE:
              s = S_TAG_CLOSE;
              el.closed = true;
            case S_ATTR_NOQUOT_VALUE:
            case S_ATTR:
            case S_ATTR_SPACE:
              break;
            default:
              throw new Error("attribute invalid close char('/')");
          }
          break;
        case "":
          errorHandler.error("unexpected end of input");
          if (s == S_TAG) {
            el.setTagName(source.slice(start, p));
          }
          return p;
        case ">":
          switch (s) {
            case S_TAG:
              el.setTagName(source.slice(start, p));
            case S_ATTR_END:
            case S_TAG_SPACE:
            case S_TAG_CLOSE:
              break;
            case S_ATTR_NOQUOT_VALUE:
            case S_ATTR:
              value = source.slice(start, p);
              if (value.slice(-1) === "/") {
                el.closed = true;
                value = value.slice(0, -1);
              }
            case S_ATTR_SPACE:
              if (s === S_ATTR_SPACE) {
                value = attrName;
              }
              if (s == S_ATTR_NOQUOT_VALUE) {
                errorHandler.warning('attribute "' + value + '" missed quot(")!');
                addAttribute(attrName, value.replace(/&#?\w+;/g, entityReplacer), start);
              } else {
                if (currentNSMap[""] !== "http://www.w3.org/1999/xhtml" || !value.match(/^(?:disabled|checked|selected)$/i)) {
                  errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                }
                addAttribute(value, value, start);
              }
              break;
            case S_EQ:
              throw new Error("attribute value missed!!");
          }
          return p;
        case "":
          c = " ";
        default:
          if (c <= " ") {
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
                s = S_TAG_SPACE;
                break;
              case S_ATTR:
                attrName = source.slice(start, p);
                s = S_ATTR_SPACE;
                break;
              case S_ATTR_NOQUOT_VALUE:
                var value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
                errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                addAttribute(attrName, value, start);
              case S_ATTR_END:
                s = S_TAG_SPACE;
                break;
            }
          } else {
            switch (s) {
              case S_ATTR_SPACE:
                var tagName = el.tagName;
                if (currentNSMap[""] !== "http://www.w3.org/1999/xhtml" || !attrName.match(/^(?:disabled|checked|selected)$/i)) {
                  errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                }
                addAttribute(attrName, attrName, start);
                start = p;
                s = S_ATTR;
                break;
              case S_ATTR_END:
                errorHandler.warning('attribute space is required"' + attrName + '"!!');
              case S_TAG_SPACE:
                s = S_ATTR;
                start = p;
                break;
              case S_EQ:
                s = S_ATTR_NOQUOT_VALUE;
                start = p;
                break;
              case S_TAG_CLOSE:
                throw new Error("elements closed character '/' and '>' must be connected to");
            }
          }
      }
      p++;
    }
  }
  function appendElement(el, domBuilder, currentNSMap) {
    var tagName = el.tagName;
    var localNSMap = null;
    var i = el.length;
    while (i--) {
      var a = el[i];
      var qName = a.qName;
      var value = a.value;
      var nsp = qName.indexOf(":");
      if (nsp > 0) {
        var prefix = a.prefix = qName.slice(0, nsp);
        var localName = qName.slice(nsp + 1);
        var nsPrefix = prefix === "xmlns" && localName;
      } else {
        localName = qName;
        prefix = null;
        nsPrefix = qName === "xmlns" && "";
      }
      a.localName = localName;
      if (nsPrefix !== false) {
        if (localNSMap == null) {
          localNSMap = {};
          _copy(currentNSMap, currentNSMap = {});
        }
        currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
        a.uri = "http://www.w3.org/2000/xmlns/";
        domBuilder.startPrefixMapping(nsPrefix, value);
      }
    }
    var i = el.length;
    while (i--) {
      a = el[i];
      var prefix = a.prefix;
      if (prefix) {
        if (prefix === "xml") {
          a.uri = "http://www.w3.org/XML/1998/namespace";
        }
        if (prefix !== "xmlns") {
          a.uri = currentNSMap[prefix || ""];
        }
      }
    }
    var nsp = tagName.indexOf(":");
    if (nsp > 0) {
      prefix = el.prefix = tagName.slice(0, nsp);
      localName = el.localName = tagName.slice(nsp + 1);
    } else {
      prefix = null;
      localName = el.localName = tagName;
    }
    var ns = el.uri = currentNSMap[prefix || ""];
    domBuilder.startElement(ns, localName, tagName, el);
    if (el.closed) {
      domBuilder.endElement(ns, localName, tagName);
      if (localNSMap) {
        for (prefix in localNSMap) {
          domBuilder.endPrefixMapping(prefix);
        }
      }
    } else {
      el.currentNSMap = currentNSMap;
      el.localNSMap = localNSMap;
      return true;
    }
  }
  function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
    if (/^(?:script|textarea)$/i.test(tagName)) {
      var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
      var text = source.substring(elStartEnd + 1, elEndStart);
      if (/[&<]/.test(text)) {
        if (/^script$/i.test(tagName)) {
          domBuilder.characters(text, 0, text.length);
          return elEndStart;
        }
        text = text.replace(/&#?\w+;/g, entityReplacer);
        domBuilder.characters(text, 0, text.length);
        return elEndStart;
      }
    }
    return elStartEnd + 1;
  }
  function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
    var pos = closeMap[tagName];
    if (pos == null) {
      pos = source.lastIndexOf("</" + tagName + ">");
      if (pos < elStartEnd) {
        pos = source.lastIndexOf("</" + tagName);
      }
      closeMap[tagName] = pos;
    }
    return pos < elStartEnd;
  }
  function _copy(source, target) {
    for (var n in source) {
      target[n] = source[n];
    }
  }
  function parseDCC(source, start, domBuilder, errorHandler) {
    var next = source.charAt(start + 2);
    switch (next) {
      case "-":
        if (source.charAt(start + 3) === "-") {
          var end = source.indexOf("-->", start + 4);
          if (end > start) {
            domBuilder.comment(source, start + 4, end - start - 4);
            return end + 3;
          } else {
            errorHandler.error("Unclosed comment");
            return -1;
          }
        } else {
          return -1;
        }
      default:
        if (source.substr(start + 3, 6) == "CDATA[") {
          var end = source.indexOf("]]>", start + 9);
          domBuilder.startCDATA();
          domBuilder.characters(source, start + 9, end - start - 9);
          domBuilder.endCDATA();
          return end + 3;
        }
        var matchs = split(source, start);
        var len = matchs.length;
        if (len > 1 && /!doctype/i.test(matchs[0][0])) {
          var name2 = matchs[1][0];
          var pubid = false;
          var sysid = false;
          if (len > 3) {
            if (/^public$/i.test(matchs[2][0])) {
              pubid = matchs[3][0];
              sysid = len > 4 && matchs[4][0];
            } else if (/^system$/i.test(matchs[2][0])) {
              sysid = matchs[3][0];
            }
          }
          var lastMatch = matchs[len - 1];
          domBuilder.startDTD(name2, pubid, sysid);
          domBuilder.endDTD();
          return lastMatch.index + lastMatch[0].length;
        }
    }
    return -1;
  }
  function parseInstruction(source, start, domBuilder) {
    var end = source.indexOf("?>", start);
    if (end) {
      var match2 = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
      if (match2) {
        var len = match2[0].length;
        domBuilder.processingInstruction(match2[1], match2[2]);
        return end + 2;
      } else {
        return -1;
      }
    }
    return -1;
  }
  function ElementAttributes() {
    this.attributeNames = {};
  }
  ElementAttributes.prototype = {
    setTagName: function(tagName) {
      if (!tagNamePattern.test(tagName)) {
        throw new Error("invalid tagName:" + tagName);
      }
      this.tagName = tagName;
    },
    addValue: function(qName, value, offset) {
      if (!tagNamePattern.test(qName)) {
        throw new Error("invalid attribute:" + qName);
      }
      this.attributeNames[qName] = this.length;
      this[this.length++] = { qName, value, offset };
    },
    length: 0,
    getLocalName: function(i) {
      return this[i].localName;
    },
    getLocator: function(i) {
      return this[i].locator;
    },
    getQName: function(i) {
      return this[i].qName;
    },
    getURI: function(i) {
      return this[i].uri;
    },
    getValue: function(i) {
      return this[i].value;
    }
  };
  function split(source, start) {
    var match2;
    var buf = [];
    var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
    reg.lastIndex = start;
    reg.exec(source);
    while (match2 = reg.exec(source)) {
      buf.push(match2);
      if (match2[1])
        return buf;
    }
  }
  exports.XMLReader = XMLReader;
  exports.ParseError = ParseError;
});

// node_modules/xmldom/lib/dom.js
var require_dom = __commonJS((exports) => {
  function copy(src, dest) {
    for (var p in src) {
      dest[p] = src[p];
    }
  }
  function _extends(Class, Super) {
    var pt = Class.prototype;
    if (!(pt instanceof Super)) {
      let t2 = function() {};
      var t = t2;
      t2.prototype = Super.prototype;
      t2 = new t2;
      copy(pt, t2);
      Class.prototype = pt = t2;
    }
    if (pt.constructor != Class) {
      if (typeof Class != "function") {
        console.error("unknow Class:" + Class);
      }
      pt.constructor = Class;
    }
  }
  var htmlns = "http://www.w3.org/1999/xhtml";
  var NodeType = {};
  var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
  var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
  var TEXT_NODE = NodeType.TEXT_NODE = 3;
  var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
  var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
  var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
  var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
  var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
  var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
  var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
  var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
  var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
  var ExceptionCode = {};
  var ExceptionMessage = {};
  var INDEX_SIZE_ERR = ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1);
  var DOMSTRING_SIZE_ERR = ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2);
  var HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3);
  var WRONG_DOCUMENT_ERR = ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4);
  var INVALID_CHARACTER_ERR = ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5);
  var NO_DATA_ALLOWED_ERR = ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6);
  var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7);
  var NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8);
  var NOT_SUPPORTED_ERR = ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9);
  var INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10);
  var INVALID_STATE_ERR = ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11);
  var SYNTAX_ERR = ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12);
  var INVALID_MODIFICATION_ERR = ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13);
  var NAMESPACE_ERR = ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14);
  var INVALID_ACCESS_ERR = ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);
  function DOMException(code, message) {
    if (message instanceof Error) {
      var error = message;
    } else {
      error = this;
      Error.call(this, ExceptionMessage[code]);
      this.message = ExceptionMessage[code];
      if (Error.captureStackTrace)
        Error.captureStackTrace(this, DOMException);
    }
    error.code = code;
    if (message)
      this.message = this.message + ": " + message;
    return error;
  }
  DOMException.prototype = Error.prototype;
  copy(ExceptionCode, DOMException);
  function NodeList() {}
  NodeList.prototype = {
    length: 0,
    item: function(index) {
      return this[index] || null;
    },
    toString: function(isHTML, nodeFilter) {
      for (var buf = [], i = 0;i < this.length; i++) {
        serializeToString(this[i], buf, isHTML, nodeFilter);
      }
      return buf.join("");
    }
  };
  function LiveNodeList(node, refresh) {
    this._node = node;
    this._refresh = refresh;
    _updateLiveList(this);
  }
  function _updateLiveList(list) {
    var inc = list._node._inc || list._node.ownerDocument._inc;
    if (list._inc != inc) {
      var ls = list._refresh(list._node);
      __set__(list, "length", ls.length);
      copy(ls, list);
      list._inc = inc;
    }
  }
  LiveNodeList.prototype.item = function(i) {
    _updateLiveList(this);
    return this[i];
  };
  _extends(LiveNodeList, NodeList);
  function NamedNodeMap() {}
  function _findNodeIndex(list, node) {
    var i = list.length;
    while (i--) {
      if (list[i] === node) {
        return i;
      }
    }
  }
  function _addNamedNode(el, list, newAttr, oldAttr) {
    if (oldAttr) {
      list[_findNodeIndex(list, oldAttr)] = newAttr;
    } else {
      list[list.length++] = newAttr;
    }
    if (el) {
      newAttr.ownerElement = el;
      var doc = el.ownerDocument;
      if (doc) {
        oldAttr && _onRemoveAttribute(doc, el, oldAttr);
        _onAddAttribute(doc, el, newAttr);
      }
    }
  }
  function _removeNamedNode(el, list, attr) {
    var i = _findNodeIndex(list, attr);
    if (i >= 0) {
      var lastIndex = list.length - 1;
      while (i < lastIndex) {
        list[i] = list[++i];
      }
      list.length = lastIndex;
      if (el) {
        var doc = el.ownerDocument;
        if (doc) {
          _onRemoveAttribute(doc, el, attr);
          attr.ownerElement = null;
        }
      }
    } else {
      throw DOMException(NOT_FOUND_ERR, new Error(el.tagName + "@" + attr));
    }
  }
  NamedNodeMap.prototype = {
    length: 0,
    item: NodeList.prototype.item,
    getNamedItem: function(key) {
      var i = this.length;
      while (i--) {
        var attr = this[i];
        if (attr.nodeName == key) {
          return attr;
        }
      }
    },
    setNamedItem: function(attr) {
      var el = attr.ownerElement;
      if (el && el != this._ownerElement) {
        throw new DOMException(INUSE_ATTRIBUTE_ERR);
      }
      var oldAttr = this.getNamedItem(attr.nodeName);
      _addNamedNode(this._ownerElement, this, attr, oldAttr);
      return oldAttr;
    },
    setNamedItemNS: function(attr) {
      var el = attr.ownerElement, oldAttr;
      if (el && el != this._ownerElement) {
        throw new DOMException(INUSE_ATTRIBUTE_ERR);
      }
      oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
      _addNamedNode(this._ownerElement, this, attr, oldAttr);
      return oldAttr;
    },
    removeNamedItem: function(key) {
      var attr = this.getNamedItem(key);
      _removeNamedNode(this._ownerElement, this, attr);
      return attr;
    },
    removeNamedItemNS: function(namespaceURI, localName) {
      var attr = this.getNamedItemNS(namespaceURI, localName);
      _removeNamedNode(this._ownerElement, this, attr);
      return attr;
    },
    getNamedItemNS: function(namespaceURI, localName) {
      var i = this.length;
      while (i--) {
        var node = this[i];
        if (node.localName == localName && node.namespaceURI == namespaceURI) {
          return node;
        }
      }
      return null;
    }
  };
  function DOMImplementation(features) {
    this._features = {};
    if (features) {
      for (var feature in features) {
        this._features = features[feature];
      }
    }
  }
  DOMImplementation.prototype = {
    hasFeature: function(feature, version) {
      var versions = this._features[feature.toLowerCase()];
      if (versions && (!version || (version in versions))) {
        return true;
      } else {
        return false;
      }
    },
    createDocument: function(namespaceURI, qualifiedName, doctype) {
      var doc = new Document;
      doc.implementation = this;
      doc.childNodes = new NodeList;
      doc.doctype = doctype;
      if (doctype) {
        doc.appendChild(doctype);
      }
      if (qualifiedName) {
        var root = doc.createElementNS(namespaceURI, qualifiedName);
        doc.appendChild(root);
      }
      return doc;
    },
    createDocumentType: function(qualifiedName, publicId, systemId) {
      var node = new DocumentType;
      node.name = qualifiedName;
      node.nodeName = qualifiedName;
      node.publicId = publicId;
      node.systemId = systemId;
      return node;
    }
  };
  function Node() {}
  Node.prototype = {
    firstChild: null,
    lastChild: null,
    previousSibling: null,
    nextSibling: null,
    attributes: null,
    parentNode: null,
    childNodes: null,
    ownerDocument: null,
    nodeValue: null,
    namespaceURI: null,
    prefix: null,
    localName: null,
    insertBefore: function(newChild, refChild) {
      return _insertBefore(this, newChild, refChild);
    },
    replaceChild: function(newChild, oldChild) {
      this.insertBefore(newChild, oldChild);
      if (oldChild) {
        this.removeChild(oldChild);
      }
    },
    removeChild: function(oldChild) {
      return _removeChild(this, oldChild);
    },
    appendChild: function(newChild) {
      return this.insertBefore(newChild, null);
    },
    hasChildNodes: function() {
      return this.firstChild != null;
    },
    cloneNode: function(deep) {
      return cloneNode(this.ownerDocument || this, this, deep);
    },
    normalize: function() {
      var child = this.firstChild;
      while (child) {
        var next = child.nextSibling;
        if (next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE) {
          this.removeChild(next);
          child.appendData(next.data);
        } else {
          child.normalize();
          child = next;
        }
      }
    },
    isSupported: function(feature, version) {
      return this.ownerDocument.implementation.hasFeature(feature, version);
    },
    hasAttributes: function() {
      return this.attributes.length > 0;
    },
    lookupPrefix: function(namespaceURI) {
      var el = this;
      while (el) {
        var map = el._nsMap;
        if (map) {
          for (var n in map) {
            if (map[n] == namespaceURI) {
              return n;
            }
          }
        }
        el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
      }
      return null;
    },
    lookupNamespaceURI: function(prefix) {
      var el = this;
      while (el) {
        var map = el._nsMap;
        if (map) {
          if (prefix in map) {
            return map[prefix];
          }
        }
        el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
      }
      return null;
    },
    isDefaultNamespace: function(namespaceURI) {
      var prefix = this.lookupPrefix(namespaceURI);
      return prefix == null;
    }
  };
  function _xmlEncoder(c) {
    return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
  }
  copy(NodeType, Node);
  copy(NodeType, Node.prototype);
  function _visitNode(node, callback) {
    if (callback(node)) {
      return true;
    }
    if (node = node.firstChild) {
      do {
        if (_visitNode(node, callback)) {
          return true;
        }
      } while (node = node.nextSibling);
    }
  }
  function Document() {}
  function _onAddAttribute(doc, el, newAttr) {
    doc && doc._inc++;
    var ns = newAttr.namespaceURI;
    if (ns == "http://www.w3.org/2000/xmlns/") {
      el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
    }
  }
  function _onRemoveAttribute(doc, el, newAttr, remove) {
    doc && doc._inc++;
    var ns = newAttr.namespaceURI;
    if (ns == "http://www.w3.org/2000/xmlns/") {
      delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
    }
  }
  function _onUpdateChild(doc, el, newChild) {
    if (doc && doc._inc) {
      doc._inc++;
      var cs = el.childNodes;
      if (newChild) {
        cs[cs.length++] = newChild;
      } else {
        var child = el.firstChild;
        var i = 0;
        while (child) {
          cs[i++] = child;
          child = child.nextSibling;
        }
        cs.length = i;
      }
    }
  }
  function _removeChild(parentNode, child) {
    var previous = child.previousSibling;
    var next = child.nextSibling;
    if (previous) {
      previous.nextSibling = next;
    } else {
      parentNode.firstChild = next;
    }
    if (next) {
      next.previousSibling = previous;
    } else {
      parentNode.lastChild = previous;
    }
    _onUpdateChild(parentNode.ownerDocument, parentNode);
    return child;
  }
  function _insertBefore(parentNode, newChild, nextChild) {
    var cp = newChild.parentNode;
    if (cp) {
      cp.removeChild(newChild);
    }
    if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
      var newFirst = newChild.firstChild;
      if (newFirst == null) {
        return newChild;
      }
      var newLast = newChild.lastChild;
    } else {
      newFirst = newLast = newChild;
    }
    var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;
    newFirst.previousSibling = pre;
    newLast.nextSibling = nextChild;
    if (pre) {
      pre.nextSibling = newFirst;
    } else {
      parentNode.firstChild = newFirst;
    }
    if (nextChild == null) {
      parentNode.lastChild = newLast;
    } else {
      nextChild.previousSibling = newLast;
    }
    do {
      newFirst.parentNode = parentNode;
    } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
    _onUpdateChild(parentNode.ownerDocument || parentNode, parentNode);
    if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
      newChild.firstChild = newChild.lastChild = null;
    }
    return newChild;
  }
  function _appendSingleChild(parentNode, newChild) {
    var cp = newChild.parentNode;
    if (cp) {
      var pre = parentNode.lastChild;
      cp.removeChild(newChild);
      var pre = parentNode.lastChild;
    }
    var pre = parentNode.lastChild;
    newChild.parentNode = parentNode;
    newChild.previousSibling = pre;
    newChild.nextSibling = null;
    if (pre) {
      pre.nextSibling = newChild;
    } else {
      parentNode.firstChild = newChild;
    }
    parentNode.lastChild = newChild;
    _onUpdateChild(parentNode.ownerDocument, parentNode, newChild);
    return newChild;
  }
  Document.prototype = {
    nodeName: "#document",
    nodeType: DOCUMENT_NODE,
    doctype: null,
    documentElement: null,
    _inc: 1,
    insertBefore: function(newChild, refChild) {
      if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
        var child = newChild.firstChild;
        while (child) {
          var next = child.nextSibling;
          this.insertBefore(child, refChild);
          child = next;
        }
        return newChild;
      }
      if (this.documentElement == null && newChild.nodeType == ELEMENT_NODE) {
        this.documentElement = newChild;
      }
      return _insertBefore(this, newChild, refChild), newChild.ownerDocument = this, newChild;
    },
    removeChild: function(oldChild) {
      if (this.documentElement == oldChild) {
        this.documentElement = null;
      }
      return _removeChild(this, oldChild);
    },
    importNode: function(importedNode, deep) {
      return importNode(this, importedNode, deep);
    },
    getElementById: function(id) {
      var rtv = null;
      _visitNode(this.documentElement, function(node) {
        if (node.nodeType == ELEMENT_NODE) {
          if (node.getAttribute("id") == id) {
            rtv = node;
            return true;
          }
        }
      });
      return rtv;
    },
    getElementsByClassName: function(className) {
      var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return new LiveNodeList(this, function(base) {
        var ls = [];
        _visitNode(base.documentElement, function(node) {
          if (node !== base && node.nodeType == ELEMENT_NODE) {
            if (pattern.test(node.getAttribute("class"))) {
              ls.push(node);
            }
          }
        });
        return ls;
      });
    },
    createElement: function(tagName) {
      var node = new Element;
      node.ownerDocument = this;
      node.nodeName = tagName;
      node.tagName = tagName;
      node.childNodes = new NodeList;
      var attrs = node.attributes = new NamedNodeMap;
      attrs._ownerElement = node;
      return node;
    },
    createDocumentFragment: function() {
      var node = new DocumentFragment;
      node.ownerDocument = this;
      node.childNodes = new NodeList;
      return node;
    },
    createTextNode: function(data) {
      var node = new Text;
      node.ownerDocument = this;
      node.appendData(data);
      return node;
    },
    createComment: function(data) {
      var node = new Comment;
      node.ownerDocument = this;
      node.appendData(data);
      return node;
    },
    createCDATASection: function(data) {
      var node = new CDATASection;
      node.ownerDocument = this;
      node.appendData(data);
      return node;
    },
    createProcessingInstruction: function(target, data) {
      var node = new ProcessingInstruction;
      node.ownerDocument = this;
      node.tagName = node.target = target;
      node.nodeValue = node.data = data;
      return node;
    },
    createAttribute: function(name2) {
      var node = new Attr;
      node.ownerDocument = this;
      node.name = name2;
      node.nodeName = name2;
      node.localName = name2;
      node.specified = true;
      return node;
    },
    createEntityReference: function(name2) {
      var node = new EntityReference;
      node.ownerDocument = this;
      node.nodeName = name2;
      return node;
    },
    createElementNS: function(namespaceURI, qualifiedName) {
      var node = new Element;
      var pl = qualifiedName.split(":");
      var attrs = node.attributes = new NamedNodeMap;
      node.childNodes = new NodeList;
      node.ownerDocument = this;
      node.nodeName = qualifiedName;
      node.tagName = qualifiedName;
      node.namespaceURI = namespaceURI;
      if (pl.length == 2) {
        node.prefix = pl[0];
        node.localName = pl[1];
      } else {
        node.localName = qualifiedName;
      }
      attrs._ownerElement = node;
      return node;
    },
    createAttributeNS: function(namespaceURI, qualifiedName) {
      var node = new Attr;
      var pl = qualifiedName.split(":");
      node.ownerDocument = this;
      node.nodeName = qualifiedName;
      node.name = qualifiedName;
      node.namespaceURI = namespaceURI;
      node.specified = true;
      if (pl.length == 2) {
        node.prefix = pl[0];
        node.localName = pl[1];
      } else {
        node.localName = qualifiedName;
      }
      return node;
    }
  };
  _extends(Document, Node);
  function Element() {
    this._nsMap = {};
  }
  Element.prototype = {
    nodeType: ELEMENT_NODE,
    hasAttribute: function(name2) {
      return this.getAttributeNode(name2) != null;
    },
    getAttribute: function(name2) {
      var attr = this.getAttributeNode(name2);
      return attr && attr.value || "";
    },
    getAttributeNode: function(name2) {
      return this.attributes.getNamedItem(name2);
    },
    setAttribute: function(name2, value) {
      var attr = this.ownerDocument.createAttribute(name2);
      attr.value = attr.nodeValue = "" + value;
      this.setAttributeNode(attr);
    },
    removeAttribute: function(name2) {
      var attr = this.getAttributeNode(name2);
      attr && this.removeAttributeNode(attr);
    },
    appendChild: function(newChild) {
      if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
        return this.insertBefore(newChild, null);
      } else {
        return _appendSingleChild(this, newChild);
      }
    },
    setAttributeNode: function(newAttr) {
      return this.attributes.setNamedItem(newAttr);
    },
    setAttributeNodeNS: function(newAttr) {
      return this.attributes.setNamedItemNS(newAttr);
    },
    removeAttributeNode: function(oldAttr) {
      return this.attributes.removeNamedItem(oldAttr.nodeName);
    },
    removeAttributeNS: function(namespaceURI, localName) {
      var old = this.getAttributeNodeNS(namespaceURI, localName);
      old && this.removeAttributeNode(old);
    },
    hasAttributeNS: function(namespaceURI, localName) {
      return this.getAttributeNodeNS(namespaceURI, localName) != null;
    },
    getAttributeNS: function(namespaceURI, localName) {
      var attr = this.getAttributeNodeNS(namespaceURI, localName);
      return attr && attr.value || "";
    },
    setAttributeNS: function(namespaceURI, qualifiedName, value) {
      var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
      attr.value = attr.nodeValue = "" + value;
      this.setAttributeNode(attr);
    },
    getAttributeNodeNS: function(namespaceURI, localName) {
      return this.attributes.getNamedItemNS(namespaceURI, localName);
    },
    getElementsByTagName: function(tagName) {
      return new LiveNodeList(this, function(base) {
        var ls = [];
        _visitNode(base, function(node) {
          if (node !== base && node.nodeType == ELEMENT_NODE && (tagName === "*" || node.tagName == tagName)) {
            ls.push(node);
          }
        });
        return ls;
      });
    },
    getElementsByTagNameNS: function(namespaceURI, localName) {
      return new LiveNodeList(this, function(base) {
        var ls = [];
        _visitNode(base, function(node) {
          if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
            ls.push(node);
          }
        });
        return ls;
      });
    }
  };
  Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
  Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
  _extends(Element, Node);
  function Attr() {}
  Attr.prototype.nodeType = ATTRIBUTE_NODE;
  _extends(Attr, Node);
  function CharacterData() {}
  CharacterData.prototype = {
    data: "",
    substringData: function(offset, count) {
      return this.data.substring(offset, offset + count);
    },
    appendData: function(text) {
      text = this.data + text;
      this.nodeValue = this.data = text;
      this.length = text.length;
    },
    insertData: function(offset, text) {
      this.replaceData(offset, 0, text);
    },
    appendChild: function(newChild) {
      throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
    },
    deleteData: function(offset, count) {
      this.replaceData(offset, count, "");
    },
    replaceData: function(offset, count, text) {
      var start = this.data.substring(0, offset);
      var end = this.data.substring(offset + count);
      text = start + text + end;
      this.nodeValue = this.data = text;
      this.length = text.length;
    }
  };
  _extends(CharacterData, Node);
  function Text() {}
  Text.prototype = {
    nodeName: "#text",
    nodeType: TEXT_NODE,
    splitText: function(offset) {
      var text = this.data;
      var newText = text.substring(offset);
      text = text.substring(0, offset);
      this.data = this.nodeValue = text;
      this.length = text.length;
      var newNode = this.ownerDocument.createTextNode(newText);
      if (this.parentNode) {
        this.parentNode.insertBefore(newNode, this.nextSibling);
      }
      return newNode;
    }
  };
  _extends(Text, CharacterData);
  function Comment() {}
  Comment.prototype = {
    nodeName: "#comment",
    nodeType: COMMENT_NODE
  };
  _extends(Comment, CharacterData);
  function CDATASection() {}
  CDATASection.prototype = {
    nodeName: "#cdata-section",
    nodeType: CDATA_SECTION_NODE
  };
  _extends(CDATASection, CharacterData);
  function DocumentType() {}
  DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
  _extends(DocumentType, Node);
  function Notation() {}
  Notation.prototype.nodeType = NOTATION_NODE;
  _extends(Notation, Node);
  function Entity() {}
  Entity.prototype.nodeType = ENTITY_NODE;
  _extends(Entity, Node);
  function EntityReference() {}
  EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
  _extends(EntityReference, Node);
  function DocumentFragment() {}
  DocumentFragment.prototype.nodeName = "#document-fragment";
  DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
  _extends(DocumentFragment, Node);
  function ProcessingInstruction() {}
  ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
  _extends(ProcessingInstruction, Node);
  function XMLSerializer() {}
  XMLSerializer.prototype.serializeToString = function(node, isHtml, nodeFilter) {
    return nodeSerializeToString.call(node, isHtml, nodeFilter);
  };
  Node.prototype.toString = nodeSerializeToString;
  function nodeSerializeToString(isHtml, nodeFilter) {
    var buf = [];
    var refNode = this.nodeType == 9 && this.documentElement || this;
    var prefix = refNode.prefix;
    var uri = refNode.namespaceURI;
    if (uri && prefix == null) {
      var prefix = refNode.lookupPrefix(uri);
      if (prefix == null) {
        var visibleNamespaces = [
          { namespace: uri, prefix: null }
        ];
      }
    }
    serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces);
    return buf.join("");
  }
  function needNamespaceDefine(node, isHTML, visibleNamespaces) {
    var prefix = node.prefix || "";
    var uri = node.namespaceURI;
    if (!prefix && !uri) {
      return false;
    }
    if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" || uri == "http://www.w3.org/2000/xmlns/") {
      return false;
    }
    var i = visibleNamespaces.length;
    while (i--) {
      var ns = visibleNamespaces[i];
      if (ns.prefix == prefix) {
        return ns.namespace != uri;
      }
    }
    return true;
  }
  function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces) {
    if (nodeFilter) {
      node = nodeFilter(node);
      if (node) {
        if (typeof node == "string") {
          buf.push(node);
          return;
        }
      } else {
        return;
      }
    }
    switch (node.nodeType) {
      case ELEMENT_NODE:
        if (!visibleNamespaces)
          visibleNamespaces = [];
        var startVisibleNamespaces = visibleNamespaces.length;
        var attrs = node.attributes;
        var len = attrs.length;
        var child = node.firstChild;
        var nodeName = node.tagName;
        isHTML = htmlns === node.namespaceURI || isHTML;
        buf.push("<", nodeName);
        for (var i = 0;i < len; i++) {
          var attr = attrs.item(i);
          if (attr.prefix == "xmlns") {
            visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
          } else if (attr.nodeName == "xmlns") {
            visibleNamespaces.push({ prefix: "", namespace: attr.value });
          }
        }
        for (var i = 0;i < len; i++) {
          var attr = attrs.item(i);
          if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
            var prefix = attr.prefix || "";
            var uri = attr.namespaceURI;
            var ns = prefix ? " xmlns:" + prefix : " xmlns";
            buf.push(ns, '="', uri, '"');
            visibleNamespaces.push({ prefix, namespace: uri });
          }
          serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
        }
        if (needNamespaceDefine(node, isHTML, visibleNamespaces)) {
          var prefix = node.prefix || "";
          var uri = node.namespaceURI;
          if (uri) {
            var ns = prefix ? " xmlns:" + prefix : " xmlns";
            buf.push(ns, '="', uri, '"');
            visibleNamespaces.push({ prefix, namespace: uri });
          }
        }
        if (child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
          buf.push(">");
          if (isHTML && /^script$/i.test(nodeName)) {
            while (child) {
              if (child.data) {
                buf.push(child.data);
              } else {
                serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces);
              }
              child = child.nextSibling;
            }
          } else {
            while (child) {
              serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces);
              child = child.nextSibling;
            }
          }
          buf.push("</", nodeName, ">");
        } else {
          buf.push("/>");
        }
        return;
      case DOCUMENT_NODE:
      case DOCUMENT_FRAGMENT_NODE:
        var child = node.firstChild;
        while (child) {
          serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces);
          child = child.nextSibling;
        }
        return;
      case ATTRIBUTE_NODE:
        return buf.push(" ", node.name, '="', node.value.replace(/[<&"]/g, _xmlEncoder), '"');
      case TEXT_NODE:
        return buf.push(node.data.replace(/[<&]/g, _xmlEncoder).replace(/]]>/g, "]]&gt;"));
      case CDATA_SECTION_NODE:
        return buf.push("<![CDATA[", node.data, "]]>");
      case COMMENT_NODE:
        return buf.push("<!--", node.data, "-->");
      case DOCUMENT_TYPE_NODE:
        var pubid = node.publicId;
        var sysid = node.systemId;
        buf.push("<!DOCTYPE ", node.name);
        if (pubid) {
          buf.push(" PUBLIC ", pubid);
          if (sysid && sysid != ".") {
            buf.push(" ", sysid);
          }
          buf.push(">");
        } else if (sysid && sysid != ".") {
          buf.push(" SYSTEM ", sysid, ">");
        } else {
          var sub = node.internalSubset;
          if (sub) {
            buf.push(" [", sub, "]");
          }
          buf.push(">");
        }
        return;
      case PROCESSING_INSTRUCTION_NODE:
        return buf.push("<?", node.target, " ", node.data, "?>");
      case ENTITY_REFERENCE_NODE:
        return buf.push("&", node.nodeName, ";");
      default:
        buf.push("??", node.nodeName);
    }
  }
  function importNode(doc, node, deep) {
    var node2;
    switch (node.nodeType) {
      case ELEMENT_NODE:
        node2 = node.cloneNode(false);
        node2.ownerDocument = doc;
      case DOCUMENT_FRAGMENT_NODE:
        break;
      case ATTRIBUTE_NODE:
        deep = true;
        break;
    }
    if (!node2) {
      node2 = node.cloneNode(false);
    }
    node2.ownerDocument = doc;
    node2.parentNode = null;
    if (deep) {
      var child = node.firstChild;
      while (child) {
        node2.appendChild(importNode(doc, child, deep));
        child = child.nextSibling;
      }
    }
    return node2;
  }
  function cloneNode(doc, node, deep) {
    var node2 = new node.constructor;
    for (var n in node) {
      var v = node[n];
      if (typeof v != "object") {
        if (v != node2[n]) {
          node2[n] = v;
        }
      }
    }
    if (node.childNodes) {
      node2.childNodes = new NodeList;
    }
    node2.ownerDocument = doc;
    switch (node2.nodeType) {
      case ELEMENT_NODE:
        var attrs = node.attributes;
        var attrs2 = node2.attributes = new NamedNodeMap;
        var len = attrs.length;
        attrs2._ownerElement = node2;
        for (var i = 0;i < len; i++) {
          node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
        }
        break;
        ;
      case ATTRIBUTE_NODE:
        deep = true;
    }
    if (deep) {
      var child = node.firstChild;
      while (child) {
        node2.appendChild(cloneNode(doc, child, deep));
        child = child.nextSibling;
      }
    }
    return node2;
  }
  function __set__(object, key, value) {
    object[key] = value;
  }
  try {
    if (Object.defineProperty) {
      let getTextContent2 = function(node) {
        switch (node.nodeType) {
          case ELEMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            var buf = [];
            node = node.firstChild;
            while (node) {
              if (node.nodeType !== 7 && node.nodeType !== 8) {
                buf.push(getTextContent2(node));
              }
              node = node.nextSibling;
            }
            return buf.join("");
          default:
            return node.nodeValue;
        }
      };
      getTextContent = getTextContent2;
      Object.defineProperty(LiveNodeList.prototype, "length", {
        get: function() {
          _updateLiveList(this);
          return this.$$length;
        }
      });
      Object.defineProperty(Node.prototype, "textContent", {
        get: function() {
          return getTextContent2(this);
        },
        set: function(data) {
          switch (this.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              while (this.firstChild) {
                this.removeChild(this.firstChild);
              }
              if (data || String(data)) {
                this.appendChild(this.ownerDocument.createTextNode(data));
              }
              break;
            default:
              this.data = data;
              this.value = data;
              this.nodeValue = data;
          }
        }
      });
      __set__ = function(object, key, value) {
        object["$$" + key] = value;
      };
    }
  } catch (e) {}
  var getTextContent;
  exports.Node = Node;
  exports.DOMException = DOMException;
  exports.DOMImplementation = DOMImplementation;
  exports.XMLSerializer = XMLSerializer;
});

// node_modules/xmldom/lib/dom-parser.js
var require_dom_parser = __commonJS((exports) => {
  function DOMParser(options) {
    this.options = options || { locator: {} };
  }
  DOMParser.prototype.parseFromString = function(source, mimeType) {
    var options = this.options;
    var sax2 = new XMLReader;
    var domBuilder = options.domBuilder || new DOMHandler;
    var errorHandler = options.errorHandler;
    var locator = options.locator;
    var defaultNSMap = options.xmlns || {};
    var isHTML = /\/x?html?$/.test(mimeType);
    var entityMap = isHTML ? htmlEntity.entityMap : { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
    if (locator) {
      domBuilder.setDocumentLocator(locator);
    }
    sax2.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator);
    sax2.domBuilder = options.domBuilder || domBuilder;
    if (isHTML) {
      defaultNSMap[""] = "http://www.w3.org/1999/xhtml";
    }
    defaultNSMap.xml = defaultNSMap.xml || "http://www.w3.org/XML/1998/namespace";
    if (source && typeof source === "string") {
      sax2.parse(source, defaultNSMap, entityMap);
    } else {
      sax2.errorHandler.error("invalid doc source");
    }
    return domBuilder.doc;
  };
  function buildErrorHandler(errorImpl, domBuilder, locator) {
    if (!errorImpl) {
      if (domBuilder instanceof DOMHandler) {
        return domBuilder;
      }
      errorImpl = domBuilder;
    }
    var errorHandler = {};
    var isCallback = errorImpl instanceof Function;
    locator = locator || {};
    function build(key) {
      var fn2 = errorImpl[key];
      if (!fn2 && isCallback) {
        fn2 = errorImpl.length == 2 ? function(msg) {
          errorImpl(key, msg);
        } : errorImpl;
      }
      errorHandler[key] = fn2 && function(msg) {
        fn2("[xmldom " + key + "]\t" + msg + _locator(locator));
      } || function() {};
    }
    build("warning");
    build("error");
    build("fatalError");
    return errorHandler;
  }
  function DOMHandler() {
    this.cdata = false;
  }
  function position(locator, node) {
    node.lineNumber = locator.lineNumber;
    node.columnNumber = locator.columnNumber;
  }
  DOMHandler.prototype = {
    startDocument: function() {
      this.doc = new DOMImplementation().createDocument(null, null, null);
      if (this.locator) {
        this.doc.documentURI = this.locator.systemId;
      }
    },
    startElement: function(namespaceURI, localName, qName, attrs) {
      var doc = this.doc;
      var el = doc.createElementNS(namespaceURI, qName || localName);
      var len = attrs.length;
      appendElement(this, el);
      this.currentElement = el;
      this.locator && position(this.locator, el);
      for (var i = 0;i < len; i++) {
        var namespaceURI = attrs.getURI(i);
        var value = attrs.getValue(i);
        var qName = attrs.getQName(i);
        var attr = doc.createAttributeNS(namespaceURI, qName);
        this.locator && position(attrs.getLocator(i), attr);
        attr.value = attr.nodeValue = value;
        el.setAttributeNode(attr);
      }
    },
    endElement: function(namespaceURI, localName, qName) {
      var current = this.currentElement;
      var tagName = current.tagName;
      this.currentElement = current.parentNode;
    },
    startPrefixMapping: function(prefix, uri) {},
    endPrefixMapping: function(prefix) {},
    processingInstruction: function(target, data) {
      var ins = this.doc.createProcessingInstruction(target, data);
      this.locator && position(this.locator, ins);
      appendElement(this, ins);
    },
    ignorableWhitespace: function(ch, start, length) {},
    characters: function(chars, start, length) {
      chars = _toString.apply(this, arguments);
      if (chars) {
        if (this.cdata) {
          var charNode = this.doc.createCDATASection(chars);
        } else {
          var charNode = this.doc.createTextNode(chars);
        }
        if (this.currentElement) {
          this.currentElement.appendChild(charNode);
        } else if (/^\s*$/.test(chars)) {
          this.doc.appendChild(charNode);
        }
        this.locator && position(this.locator, charNode);
      }
    },
    skippedEntity: function(name2) {},
    endDocument: function() {
      this.doc.normalize();
    },
    setDocumentLocator: function(locator) {
      if (this.locator = locator) {
        locator.lineNumber = 0;
      }
    },
    comment: function(chars, start, length) {
      chars = _toString.apply(this, arguments);
      var comm = this.doc.createComment(chars);
      this.locator && position(this.locator, comm);
      appendElement(this, comm);
    },
    startCDATA: function() {
      this.cdata = true;
    },
    endCDATA: function() {
      this.cdata = false;
    },
    startDTD: function(name2, publicId, systemId) {
      var impl = this.doc.implementation;
      if (impl && impl.createDocumentType) {
        var dt = impl.createDocumentType(name2, publicId, systemId);
        this.locator && position(this.locator, dt);
        appendElement(this, dt);
      }
    },
    warning: function(error) {
      console.warn("[xmldom warning]\t" + error, _locator(this.locator));
    },
    error: function(error) {
      console.error("[xmldom error]\t" + error, _locator(this.locator));
    },
    fatalError: function(error) {
      throw new ParseError(error, this.locator);
    }
  };
  function _locator(l) {
    if (l) {
      return `
@` + (l.systemId || "") + "#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
    }
  }
  function _toString(chars, start, length) {
    if (typeof chars == "string") {
      return chars.substr(start, length);
    } else {
      if (chars.length >= start + length || start) {
        return new java.lang.String(chars, start, length) + "";
      }
      return chars;
    }
  }
  "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(key) {
    DOMHandler.prototype[key] = function() {
      return null;
    };
  });
  function appendElement(hander, node) {
    if (!hander.currentElement) {
      hander.doc.appendChild(node);
    } else {
      hander.currentElement.appendChild(node);
    }
  }
  var htmlEntity = require_entities();
  var sax = require_sax();
  var XMLReader = sax.XMLReader;
  var ParseError = sax.ParseError;
  var DOMImplementation = exports.DOMImplementation = require_dom().DOMImplementation;
  exports.XMLSerializer = require_dom().XMLSerializer;
  exports.DOMParser = DOMParser;
  exports.__DOMHandler = DOMHandler;
});

// node_modules/xpath/xpath.js
var require_xpath = __commonJS((exports) => {
  var xpath = typeof exports === "undefined" ? {} : exports;
  (function(exports2) {
    var NAMESPACE_NODE_NODETYPE = "__namespace";
    var isNil = function(x) {
      return x === null || x === undefined;
    };
    var isValidNodeType = function(nodeType) {
      return nodeType === NAMESPACE_NODE_NODETYPE || Number.isInteger(nodeType) && nodeType >= 1 && nodeType <= 11;
    };
    var isNodeLike = function(value) {
      return value && isValidNodeType(value.nodeType) && typeof value.nodeName === "string";
    };
    function curry(func) {
      var slice = Array.prototype.slice, totalargs = func.length, partial = function(args, fn3) {
        return function() {
          return fn3.apply(this, args.concat(slice.call(arguments)));
        };
      }, fn2 = function() {
        var args = slice.call(arguments);
        return args.length < totalargs ? partial(args, fn2) : func.apply(this, slice.apply(arguments, [0, totalargs]));
      };
      return fn2;
    }
    var forEach = function(f, xs) {
      for (var i = 0;i < xs.length; i += 1) {
        f(xs[i], i, xs);
      }
    };
    var reduce = function(f, seed, xs) {
      var acc = seed;
      forEach(function(x, i) {
        acc = f(acc, x, i);
      }, xs);
      return acc;
    };
    var map = function(f, xs) {
      var mapped = new Array(xs.length);
      forEach(function(x, i) {
        mapped[i] = f(x);
      }, xs);
      return mapped;
    };
    var filter2 = function(f, xs) {
      var filtered = [];
      forEach(function(x, i) {
        if (f(x, i)) {
          filtered.push(x);
        }
      }, xs);
      return filtered;
    };
    var includes = function(values, value) {
      for (var i = 0;i < values.length; i += 1) {
        if (values[i] === value) {
          return true;
        }
      }
      return false;
    };
    function always(value) {
      return function() {
        return value;
      };
    }
    function toString(x) {
      return x.toString();
    }
    var join = function(s, xs) {
      return xs.join(s);
    };
    var wrap = function(pref, suf, str) {
      return pref + str + suf;
    };
    var prototypeConcat = Array.prototype.concat;
    var sortNodes = function(nodes, reverse) {
      var ns = new XNodeSet;
      ns.addArray(nodes);
      var sorted = ns.toArray();
      return reverse ? sorted.reverse() : sorted;
    };
    var MAX_ARGUMENT_LENGTH = 32767;
    function flatten(arr) {
      var result = [];
      for (var start = 0;start < arr.length; start += MAX_ARGUMENT_LENGTH) {
        var chunk = arr.slice(start, start + MAX_ARGUMENT_LENGTH);
        result = prototypeConcat.apply(result, chunk);
      }
      return result;
    }
    function assign(target, varArgs) {
      var to = Object(target);
      for (var index = 1;index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    }
    var NodeTypes = {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NAMESPACE_NODE: NAMESPACE_NODE_NODETYPE
    };
    XPathParser.prototype = new Object;
    XPathParser.prototype.constructor = XPathParser;
    XPathParser.superclass = Object.prototype;
    function XPathParser() {
      this.init();
    }
    XPathParser.prototype.init = function() {
      this.reduceActions = [];
      this.reduceActions[3] = function(rhs) {
        return new OrOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[5] = function(rhs) {
        return new AndOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[7] = function(rhs) {
        return new EqualsOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[8] = function(rhs) {
        return new NotEqualOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[10] = function(rhs) {
        return new LessThanOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[11] = function(rhs) {
        return new GreaterThanOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[12] = function(rhs) {
        return new LessThanOrEqualOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[13] = function(rhs) {
        return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[15] = function(rhs) {
        return new PlusOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[16] = function(rhs) {
        return new MinusOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[18] = function(rhs) {
        return new MultiplyOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[19] = function(rhs) {
        return new DivOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[20] = function(rhs) {
        return new ModOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[22] = function(rhs) {
        return new UnaryMinusOperation(rhs[1]);
      };
      this.reduceActions[24] = function(rhs) {
        return new BarOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[25] = function(rhs) {
        return new PathExpr(undefined, undefined, rhs[0]);
      };
      this.reduceActions[27] = function(rhs) {
        rhs[0].locationPath = rhs[2];
        return rhs[0];
      };
      this.reduceActions[28] = function(rhs) {
        rhs[0].locationPath = rhs[2];
        rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
        return rhs[0];
      };
      this.reduceActions[29] = function(rhs) {
        return new PathExpr(rhs[0], [], undefined);
      };
      this.reduceActions[30] = function(rhs) {
        if (Utilities.instance_of(rhs[0], PathExpr)) {
          if (rhs[0].filterPredicates == undefined) {
            rhs[0].filterPredicates = [];
          }
          rhs[0].filterPredicates.push(rhs[1]);
          return rhs[0];
        } else {
          return new PathExpr(rhs[0], [rhs[1]], undefined);
        }
      };
      this.reduceActions[32] = function(rhs) {
        return rhs[1];
      };
      this.reduceActions[33] = function(rhs) {
        return new XString(rhs[0]);
      };
      this.reduceActions[34] = function(rhs) {
        return new XNumber(rhs[0]);
      };
      this.reduceActions[36] = function(rhs) {
        return new FunctionCall(rhs[0], []);
      };
      this.reduceActions[37] = function(rhs) {
        return new FunctionCall(rhs[0], rhs[2]);
      };
      this.reduceActions[38] = function(rhs) {
        return [rhs[0]];
      };
      this.reduceActions[39] = function(rhs) {
        rhs[2].unshift(rhs[0]);
        return rhs[2];
      };
      this.reduceActions[43] = function(rhs) {
        return new LocationPath(true, []);
      };
      this.reduceActions[44] = function(rhs) {
        rhs[1].absolute = true;
        return rhs[1];
      };
      this.reduceActions[46] = function(rhs) {
        return new LocationPath(false, [rhs[0]]);
      };
      this.reduceActions[47] = function(rhs) {
        rhs[0].steps.push(rhs[2]);
        return rhs[0];
      };
      this.reduceActions[49] = function(rhs) {
        return new Step(rhs[0], rhs[1], []);
      };
      this.reduceActions[50] = function(rhs) {
        return new Step(Step.CHILD, rhs[0], []);
      };
      this.reduceActions[51] = function(rhs) {
        return new Step(rhs[0], rhs[1], rhs[2]);
      };
      this.reduceActions[52] = function(rhs) {
        return new Step(Step.CHILD, rhs[0], rhs[1]);
      };
      this.reduceActions[54] = function(rhs) {
        return [rhs[0]];
      };
      this.reduceActions[55] = function(rhs) {
        rhs[1].unshift(rhs[0]);
        return rhs[1];
      };
      this.reduceActions[56] = function(rhs) {
        if (rhs[0] == "ancestor") {
          return Step.ANCESTOR;
        } else if (rhs[0] == "ancestor-or-self") {
          return Step.ANCESTORORSELF;
        } else if (rhs[0] == "attribute") {
          return Step.ATTRIBUTE;
        } else if (rhs[0] == "child") {
          return Step.CHILD;
        } else if (rhs[0] == "descendant") {
          return Step.DESCENDANT;
        } else if (rhs[0] == "descendant-or-self") {
          return Step.DESCENDANTORSELF;
        } else if (rhs[0] == "following") {
          return Step.FOLLOWING;
        } else if (rhs[0] == "following-sibling") {
          return Step.FOLLOWINGSIBLING;
        } else if (rhs[0] == "namespace") {
          return Step.NAMESPACE;
        } else if (rhs[0] == "parent") {
          return Step.PARENT;
        } else if (rhs[0] == "preceding") {
          return Step.PRECEDING;
        } else if (rhs[0] == "preceding-sibling") {
          return Step.PRECEDINGSIBLING;
        } else if (rhs[0] == "self") {
          return Step.SELF;
        }
        return -1;
      };
      this.reduceActions[57] = function(rhs) {
        return Step.ATTRIBUTE;
      };
      this.reduceActions[59] = function(rhs) {
        if (rhs[0] == "comment") {
          return NodeTest.commentTest;
        } else if (rhs[0] == "text") {
          return NodeTest.textTest;
        } else if (rhs[0] == "processing-instruction") {
          return NodeTest.anyPiTest;
        } else if (rhs[0] == "node") {
          return NodeTest.nodeTest;
        }
        return new NodeTest(-1, undefined);
      };
      this.reduceActions[60] = function(rhs) {
        return new NodeTest.PITest(rhs[2]);
      };
      this.reduceActions[61] = function(rhs) {
        return rhs[1];
      };
      this.reduceActions[63] = function(rhs) {
        rhs[1].absolute = true;
        rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
        return rhs[1];
      };
      this.reduceActions[64] = function(rhs) {
        rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
        rhs[0].steps.push(rhs[2]);
        return rhs[0];
      };
      this.reduceActions[65] = function(rhs) {
        return new Step(Step.SELF, NodeTest.nodeTest, []);
      };
      this.reduceActions[66] = function(rhs) {
        return new Step(Step.PARENT, NodeTest.nodeTest, []);
      };
      this.reduceActions[67] = function(rhs) {
        return new VariableReference(rhs[1]);
      };
      this.reduceActions[68] = function(rhs) {
        return NodeTest.nameTestAny;
      };
      this.reduceActions[69] = function(rhs) {
        return new NodeTest.NameTestPrefixAny(rhs[0].split(":")[0]);
      };
      this.reduceActions[70] = function(rhs) {
        return new NodeTest.NameTestQName(rhs[0]);
      };
    };
    XPathParser.actionTable = [
      " s s        sssssssss    s ss  s  ss",
      "                 s                  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "                rrrrr               ",
      " s s        sssssssss    s ss  s  ss",
      "rs  rrrrrrrr s  sssssrrrrrr  rrs rs ",
      " s s        sssssssss    s ss  s  ss",
      "                            s       ",
      "                            s       ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "  s                                 ",
      "                            s       ",
      " s           s  sssss          s  s ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "a                                   ",
      "r       s                    rr  r  ",
      "r      sr                    rr  r  ",
      "r   s  rr            s       rr  r  ",
      "r   rssrr            rss     rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrrsss         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrrs  rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r  srrrrrrrr         rrrrrrs rr sr  ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "                sssss               ",
      "r  rrrrrrrrr         rrrrrrr rr sr  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             s      ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "              s                     ",
      "                             s      ",
      "                rrrrr               ",
      " s s        sssssssss    s sss s  ss",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss      ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s           s  sssss          s  s ",
      " s           s  sssss          s  s ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      " s           s  sssss          s  s ",
      " s           s  sssss          s  s ",
      "r  rrrrrrrrr         rrrrrrr rr sr  ",
      "r  rrrrrrrrr         rrrrrrr rr sr  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             s      ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             rr     ",
      "                             s      ",
      "                             rs     ",
      "r      sr                    rr  r  ",
      "r   s  rr            s       rr  r  ",
      "r   rssrr            rss     rr  r  ",
      "r   rssrr            rss     rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrrsss         rrrrr   rr  r  ",
      "r   rrrrrsss         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "                                 r  ",
      "                                 s  ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      " s s        sssssssss    s ss  s  ss",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             r      "
    ];
    XPathParser.actionTableNumber = [
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      "                 J                  ",
      "a  aaaaaaaaa         aaaaaaa aa  a  ",
      "                YYYYY               ",
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      `K1  KKKKKKKK .  +*)('KKKKKK  KK# K" `,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      "                            N       ",
      "                            O       ",
      "e  eeeeeeeee         eeeeeee ee ee  ",
      "f  fffffffff         fffffff ff ff  ",
      "d  ddddddddd         ddddddd dd dd  ",
      "B  BBBBBBBBB         BBBBBBB BB BB  ",
      "A  AAAAAAAAA         AAAAAAA AA AA  ",
      "  P                                 ",
      "                            Q       ",
      ` 1           .  +*)('          #  " `,
      "b  bbbbbbbbb         bbbbbbb bb  b  ",
      "                                    ",
      "!       S                    !!  !  ",
      '"      T"                    ""  "  ',
      "$   V  $$            U       $$  $  ",
      "&   &ZY&&            &XW     &&  &  ",
      ")   )))))            )))\\[   ))  )  ",
      ".   ....._^]         .....   ..  .  ",
      "1   11111111         11111   11  1  ",
      "5   55555555         55555`  55  5  ",
      "7   77777777         777777  77  7  ",
      "9   99999999         999999  99  9  ",
      ":  c::::::::         ::::::b :: a:  ",
      "I  fIIIIIIII         IIIIIIe II  I  ",
      "=  =========         ======= == ==  ",
      "?  ?????????         ??????? ?? ??  ",
      "C  CCCCCCCCC         CCCCCCC CC CC  ",
      "J   JJJJJJJJ         JJJJJJ  JJ  J  ",
      "M   MMMMMMMM         MMMMMM  MM  M  ",
      "N  NNNNNNNNN         NNNNNNN NN  N  ",
      "P  PPPPPPPPP         PPPPPPP PP  P  ",
      "                +*)('               ",
      "R  RRRRRRRRR         RRRRRRR RR aR  ",
      "U  UUUUUUUUU         UUUUUUU UU  U  ",
      "Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ",
      "c  ccccccccc         ccccccc cc cc  ",
      "                             j      ",
      "L  fLLLLLLLL         LLLLLLe LL  L  ",
      "6   66666666         66666   66  6  ",
      "              k                     ",
      "                             l      ",
      "                XXXXX               ",
      ` 1 0        /.-,+*)('    & %$m #  "!`,
      "_  f________         ______e __  _  ",
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('      %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1           .  +*)('          #  " `,
      ` 1           .  +*)('          #  " `,
      ">  >>>>>>>>>         >>>>>>> >> >>  ",
      ` 1           .  +*)('          #  " `,
      ` 1           .  +*)('          #  " `,
      "Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ",
      "V  VVVVVVVVV         VVVVVVV VV aV  ",
      "T  TTTTTTTTT         TTTTTTT TT  T  ",
      "@  @@@@@@@@@         @@@@@@@ @@ @@  ",
      "                                   ",
      "[  [[[[[[[[[         [[[[[[[ [[ [[  ",
      "D  DDDDDDDDD         DDDDDDD DD DD  ",
      "                             HH     ",
      "                                   ",
      "                             F     ",
      "#      T#                    ##  #  ",
      "%   V  %%            U       %%  %  ",
      "'   'ZY''            'XW     ''  '  ",
      "(   (ZY((            (XW     ((  (  ",
      "+   +++++            +++\\[   ++  +  ",
      "*   *****            ***\\[   **  *  ",
      "-   -----            ---\\[   --  -  ",
      ",   ,,,,,            ,,,\\[   ,,  ,  ",
      "0   00000_^]         00000   00  0  ",
      "/   /////_^]         /////   //  /  ",
      "2   22222222         22222   22  2  ",
      "3   33333333         33333   33  3  ",
      "4   44444444         44444   44  4  ",
      "8   88888888         888888  88  8  ",
      "                                 ^  ",
      "                                   ",
      ";  f;;;;;;;;         ;;;;;;e ;;  ;  ",
      "<  f<<<<<<<<         <<<<<<e <<  <  ",
      "O  OOOOOOOOO         OOOOOOO OO  O  ",
      "`  `````````         ``````` ``  `  ",
      "S  SSSSSSSSS         SSSSSSS SS  S  ",
      "W  WWWWWWWWW         WWWWWWW WW  W  ",
      "\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ",
      "E  EEEEEEEEE         EEEEEEE EE EE  ",
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      "]  ]]]]]]]]]         ]]]]]]] ]] ]]  ",
      "                             G      "
    ];
    XPathParser.gotoTable = [
      "3456789:;<=>?@ AB  CDEFGH IJ ",
      "                             ",
      "                             ",
      "                             ",
      "L456789:;<=>?@ AB  CDEFGH IJ ",
      "            M        EFGH IJ ",
      "       N;<=>?@ AB  CDEFGH IJ ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "            S        EFGH IJ ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "              e              ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                        h  J ",
      "              i          j   ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "o456789:;<=>?@ ABpqCDEFGH IJ ",
      "                             ",
      "  r6789:;<=>?@ AB  CDEFGH IJ ",
      "   s789:;<=>?@ AB  CDEFGH IJ ",
      "    t89:;<=>?@ AB  CDEFGH IJ ",
      "    u89:;<=>?@ AB  CDEFGH IJ ",
      "     v9:;<=>?@ AB  CDEFGH IJ ",
      "     w9:;<=>?@ AB  CDEFGH IJ ",
      "     x9:;<=>?@ AB  CDEFGH IJ ",
      "     y9:;<=>?@ AB  CDEFGH IJ ",
      "      z:;<=>?@ AB  CDEFGH IJ ",
      "      {:;<=>?@ AB  CDEFGH IJ ",
      "       |;<=>?@ AB  CDEFGH IJ ",
      "       };<=>?@ AB  CDEFGH IJ ",
      "       ~;<=>?@ AB  CDEFGH IJ ",
      "         =>?@ AB  CDEFGH IJ ",
      "456789:;<=>?@ AB  CDEFGH IJ",
      "                    EFGH IJ ",
      "                    EFGH IJ ",
      "                             ",
      "                      GH IJ ",
      "                      GH IJ ",
      "              i             ",
      "              i             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "o456789:;<=>?@ ABqCDEFGH IJ ",
      "                             ",
      "                             "
    ];
    XPathParser.productions = [
      [1, 1, 2],
      [2, 1, 3],
      [3, 1, 4],
      [3, 3, 3, -9, 4],
      [4, 1, 5],
      [4, 3, 4, -8, 5],
      [5, 1, 6],
      [5, 3, 5, -22, 6],
      [5, 3, 5, -5, 6],
      [6, 1, 7],
      [6, 3, 6, -23, 7],
      [6, 3, 6, -24, 7],
      [6, 3, 6, -6, 7],
      [6, 3, 6, -7, 7],
      [7, 1, 8],
      [7, 3, 7, -25, 8],
      [7, 3, 7, -26, 8],
      [8, 1, 9],
      [8, 3, 8, -12, 9],
      [8, 3, 8, -11, 9],
      [8, 3, 8, -10, 9],
      [9, 1, 10],
      [9, 2, -26, 9],
      [10, 1, 11],
      [10, 3, 10, -27, 11],
      [11, 1, 12],
      [11, 1, 13],
      [11, 3, 13, -28, 14],
      [11, 3, 13, -4, 14],
      [13, 1, 15],
      [13, 2, 13, 16],
      [15, 1, 17],
      [15, 3, -29, 2, -30],
      [15, 1, -15],
      [15, 1, -16],
      [15, 1, 18],
      [18, 3, -13, -29, -30],
      [18, 4, -13, -29, 19, -30],
      [19, 1, 20],
      [19, 3, 20, -31, 19],
      [20, 1, 2],
      [12, 1, 14],
      [12, 1, 21],
      [21, 1, -28],
      [21, 2, -28, 14],
      [21, 1, 22],
      [14, 1, 23],
      [14, 3, 14, -28, 23],
      [14, 1, 24],
      [23, 2, 25, 26],
      [23, 1, 26],
      [23, 3, 25, 26, 27],
      [23, 2, 26, 27],
      [23, 1, 28],
      [27, 1, 16],
      [27, 2, 16, 27],
      [25, 2, -14, -3],
      [25, 1, -32],
      [26, 1, 29],
      [26, 3, -20, -29, -30],
      [26, 4, -21, -29, -15, -30],
      [16, 3, -33, 30, -34],
      [30, 1, 2],
      [22, 2, -4, 14],
      [24, 3, 14, -4, 23],
      [28, 1, -35],
      [28, 1, -2],
      [17, 2, -36, -18],
      [29, 1, -17],
      [29, 1, -19],
      [29, 1, -18]
    ];
    XPathParser.DOUBLEDOT = 2;
    XPathParser.DOUBLECOLON = 3;
    XPathParser.DOUBLESLASH = 4;
    XPathParser.NOTEQUAL = 5;
    XPathParser.LESSTHANOREQUAL = 6;
    XPathParser.GREATERTHANOREQUAL = 7;
    XPathParser.AND = 8;
    XPathParser.OR = 9;
    XPathParser.MOD = 10;
    XPathParser.DIV = 11;
    XPathParser.MULTIPLYOPERATOR = 12;
    XPathParser.FUNCTIONNAME = 13;
    XPathParser.AXISNAME = 14;
    XPathParser.LITERAL = 15;
    XPathParser.NUMBER = 16;
    XPathParser.ASTERISKNAMETEST = 17;
    XPathParser.QNAME = 18;
    XPathParser.NCNAMECOLONASTERISK = 19;
    XPathParser.NODETYPE = 20;
    XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL = 21;
    XPathParser.EQUALS = 22;
    XPathParser.LESSTHAN = 23;
    XPathParser.GREATERTHAN = 24;
    XPathParser.PLUS = 25;
    XPathParser.MINUS = 26;
    XPathParser.BAR = 27;
    XPathParser.SLASH = 28;
    XPathParser.LEFTPARENTHESIS = 29;
    XPathParser.RIGHTPARENTHESIS = 30;
    XPathParser.COMMA = 31;
    XPathParser.AT = 32;
    XPathParser.LEFTBRACKET = 33;
    XPathParser.RIGHTBRACKET = 34;
    XPathParser.DOT = 35;
    XPathParser.DOLLAR = 36;
    XPathParser.prototype.tokenize = function(s1) {
      var types2 = [];
      var values = [];
      var s = s1 + "\x00";
      var pos = 0;
      var c = s.charAt(pos++);
      while (true) {
        while (c == " " || c == "\t" || c == "\r" || c == `
`) {
          c = s.charAt(pos++);
        }
        if (c == "\x00" || pos >= s.length) {
          break;
        }
        if (c == "(") {
          types2.push(XPathParser.LEFTPARENTHESIS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ")") {
          types2.push(XPathParser.RIGHTPARENTHESIS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "[") {
          types2.push(XPathParser.LEFTBRACKET);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "]") {
          types2.push(XPathParser.RIGHTBRACKET);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "@") {
          types2.push(XPathParser.AT);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ",") {
          types2.push(XPathParser.COMMA);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "|") {
          types2.push(XPathParser.BAR);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "+") {
          types2.push(XPathParser.PLUS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "-") {
          types2.push(XPathParser.MINUS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "=") {
          types2.push(XPathParser.EQUALS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "$") {
          types2.push(XPathParser.DOLLAR);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ".") {
          c = s.charAt(pos++);
          if (c == ".") {
            types2.push(XPathParser.DOUBLEDOT);
            values.push("..");
            c = s.charAt(pos++);
            continue;
          }
          if (c >= "0" && c <= "9") {
            var number = "." + c;
            c = s.charAt(pos++);
            while (c >= "0" && c <= "9") {
              number += c;
              c = s.charAt(pos++);
            }
            types2.push(XPathParser.NUMBER);
            values.push(number);
            continue;
          }
          types2.push(XPathParser.DOT);
          values.push(".");
          continue;
        }
        if (c == "'" || c == '"') {
          var delimiter = c;
          var literal = "";
          while (pos < s.length && (c = s.charAt(pos)) !== delimiter) {
            literal += c;
            pos += 1;
          }
          if (c !== delimiter) {
            throw XPathException.fromMessage("Unterminated string literal: " + delimiter + literal);
          }
          pos += 1;
          types2.push(XPathParser.LITERAL);
          values.push(literal);
          c = s.charAt(pos++);
          continue;
        }
        if (c >= "0" && c <= "9") {
          var number = c;
          c = s.charAt(pos++);
          while (c >= "0" && c <= "9") {
            number += c;
            c = s.charAt(pos++);
          }
          if (c == ".") {
            if (s.charAt(pos) >= "0" && s.charAt(pos) <= "9") {
              number += c;
              number += s.charAt(pos++);
              c = s.charAt(pos++);
              while (c >= "0" && c <= "9") {
                number += c;
                c = s.charAt(pos++);
              }
            }
          }
          types2.push(XPathParser.NUMBER);
          values.push(number);
          continue;
        }
        if (c == "*") {
          if (types2.length > 0) {
            var last = types2[types2.length - 1];
            if (last != XPathParser.AT && last != XPathParser.DOUBLECOLON && last != XPathParser.LEFTPARENTHESIS && last != XPathParser.LEFTBRACKET && last != XPathParser.AND && last != XPathParser.OR && last != XPathParser.MOD && last != XPathParser.DIV && last != XPathParser.MULTIPLYOPERATOR && last != XPathParser.SLASH && last != XPathParser.DOUBLESLASH && last != XPathParser.BAR && last != XPathParser.PLUS && last != XPathParser.MINUS && last != XPathParser.EQUALS && last != XPathParser.NOTEQUAL && last != XPathParser.LESSTHAN && last != XPathParser.LESSTHANOREQUAL && last != XPathParser.GREATERTHAN && last != XPathParser.GREATERTHANOREQUAL) {
              types2.push(XPathParser.MULTIPLYOPERATOR);
              values.push(c);
              c = s.charAt(pos++);
              continue;
            }
          }
          types2.push(XPathParser.ASTERISKNAMETEST);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ":") {
          if (s.charAt(pos) == ":") {
            types2.push(XPathParser.DOUBLECOLON);
            values.push("::");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
        }
        if (c == "/") {
          c = s.charAt(pos++);
          if (c == "/") {
            types2.push(XPathParser.DOUBLESLASH);
            values.push("//");
            c = s.charAt(pos++);
            continue;
          }
          types2.push(XPathParser.SLASH);
          values.push("/");
          continue;
        }
        if (c == "!") {
          if (s.charAt(pos) == "=") {
            types2.push(XPathParser.NOTEQUAL);
            values.push("!=");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
        }
        if (c == "<") {
          if (s.charAt(pos) == "=") {
            types2.push(XPathParser.LESSTHANOREQUAL);
            values.push("<=");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
          types2.push(XPathParser.LESSTHAN);
          values.push("<");
          c = s.charAt(pos++);
          continue;
        }
        if (c == ">") {
          if (s.charAt(pos) == "=") {
            types2.push(XPathParser.GREATERTHANOREQUAL);
            values.push(">=");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
          types2.push(XPathParser.GREATERTHAN);
          values.push(">");
          c = s.charAt(pos++);
          continue;
        }
        if (c == "_" || Utilities.isLetter(c.charCodeAt(0))) {
          var name2 = c;
          c = s.charAt(pos++);
          while (Utilities.isNCNameChar(c.charCodeAt(0))) {
            name2 += c;
            c = s.charAt(pos++);
          }
          if (types2.length > 0) {
            var last = types2[types2.length - 1];
            if (last != XPathParser.AT && last != XPathParser.DOUBLECOLON && last != XPathParser.LEFTPARENTHESIS && last != XPathParser.LEFTBRACKET && last != XPathParser.AND && last != XPathParser.OR && last != XPathParser.MOD && last != XPathParser.DIV && last != XPathParser.MULTIPLYOPERATOR && last != XPathParser.SLASH && last != XPathParser.DOUBLESLASH && last != XPathParser.BAR && last != XPathParser.PLUS && last != XPathParser.MINUS && last != XPathParser.EQUALS && last != XPathParser.NOTEQUAL && last != XPathParser.LESSTHAN && last != XPathParser.LESSTHANOREQUAL && last != XPathParser.GREATERTHAN && last != XPathParser.GREATERTHANOREQUAL) {
              if (name2 == "and") {
                types2.push(XPathParser.AND);
                values.push(name2);
                continue;
              }
              if (name2 == "or") {
                types2.push(XPathParser.OR);
                values.push(name2);
                continue;
              }
              if (name2 == "mod") {
                types2.push(XPathParser.MOD);
                values.push(name2);
                continue;
              }
              if (name2 == "div") {
                types2.push(XPathParser.DIV);
                values.push(name2);
                continue;
              }
            }
          }
          if (c == ":") {
            if (s.charAt(pos) == "*") {
              types2.push(XPathParser.NCNAMECOLONASTERISK);
              values.push(name2 + ":*");
              pos++;
              c = s.charAt(pos++);
              continue;
            }
            if (s.charAt(pos) == "_" || Utilities.isLetter(s.charCodeAt(pos))) {
              name2 += ":";
              c = s.charAt(pos++);
              while (Utilities.isNCNameChar(c.charCodeAt(0))) {
                name2 += c;
                c = s.charAt(pos++);
              }
              if (c == "(") {
                types2.push(XPathParser.FUNCTIONNAME);
                values.push(name2);
                continue;
              }
              types2.push(XPathParser.QNAME);
              values.push(name2);
              continue;
            }
            if (s.charAt(pos) == ":") {
              types2.push(XPathParser.AXISNAME);
              values.push(name2);
              continue;
            }
          }
          if (c == "(") {
            if (name2 == "comment" || name2 == "text" || name2 == "node") {
              types2.push(XPathParser.NODETYPE);
              values.push(name2);
              continue;
            }
            if (name2 == "processing-instruction") {
              if (s.charAt(pos) == ")") {
                types2.push(XPathParser.NODETYPE);
              } else {
                types2.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
              }
              values.push(name2);
              continue;
            }
            types2.push(XPathParser.FUNCTIONNAME);
            values.push(name2);
            continue;
          }
          types2.push(XPathParser.QNAME);
          values.push(name2);
          continue;
        }
        throw new Error("Unexpected character " + c);
      }
      types2.push(1);
      values.push("[EOF]");
      return [types2, values];
    };
    XPathParser.SHIFT = "s";
    XPathParser.REDUCE = "r";
    XPathParser.ACCEPT = "a";
    XPathParser.prototype.parse = function(s) {
      if (!s) {
        throw new Error("XPath expression unspecified.");
      }
      if (typeof s !== "string") {
        throw new Error("XPath expression must be a string.");
      }
      var types2;
      var values;
      var res = this.tokenize(s);
      if (res == undefined) {
        return;
      }
      types2 = res[0];
      values = res[1];
      var tokenPos = 0;
      var state = [];
      var tokenType = [];
      var tokenValue = [];
      var s;
      var a;
      var t;
      state.push(0);
      tokenType.push(1);
      tokenValue.push("_S");
      a = types2[tokenPos];
      t = values[tokenPos++];
      while (true) {
        s = state[state.length - 1];
        switch (XPathParser.actionTable[s].charAt(a - 1)) {
          case XPathParser.SHIFT:
            tokenType.push(-a);
            tokenValue.push(t);
            state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
            a = types2[tokenPos];
            t = values[tokenPos++];
            break;
          case XPathParser.REDUCE:
            var num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
            var rhs = [];
            for (var i = 0;i < num; i++) {
              tokenType.pop();
              rhs.unshift(tokenValue.pop());
              state.pop();
            }
            var s_ = state[state.length - 1];
            tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
            if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] == undefined) {
              tokenValue.push(rhs[0]);
            } else {
              tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
            }
            state.push(XPathParser.gotoTable[s_].charCodeAt(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2) - 33);
            break;
          case XPathParser.ACCEPT:
            return new XPath(tokenValue.pop());
          default:
            throw new Error("XPath parse error");
        }
      }
    };
    XPath.prototype = new Object;
    XPath.prototype.constructor = XPath;
    XPath.superclass = Object.prototype;
    function XPath(e) {
      this.expression = e;
    }
    XPath.prototype.toString = function() {
      return this.expression.toString();
    };
    function setIfUnset(obj, prop, value) {
      if (!(prop in obj)) {
        obj[prop] = value;
      }
    }
    XPath.prototype.evaluate = function(c) {
      var node = c.expressionContextNode;
      if (!(isNil(node) || isNodeLike(node))) {
        throw new Error("Context node does not appear to be a valid DOM node.");
      }
      c.contextNode = c.expressionContextNode;
      c.contextSize = 1;
      c.contextPosition = 1;
      if (c.isHtml) {
        setIfUnset(c, "caseInsensitive", true);
        setIfUnset(c, "allowAnyNamespaceForNoPrefix", true);
      }
      setIfUnset(c, "caseInsensitive", false);
      return this.expression.evaluate(c);
    };
    XPath.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace";
    XPath.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/";
    Expression.prototype = new Object;
    Expression.prototype.constructor = Expression;
    Expression.superclass = Object.prototype;
    function Expression() {}
    Expression.prototype.init = function() {};
    Expression.prototype.toString = function() {
      return "<Expression>";
    };
    Expression.prototype.evaluate = function(c) {
      throw new Error("Could not evaluate expression.");
    };
    UnaryOperation.prototype = new Expression;
    UnaryOperation.prototype.constructor = UnaryOperation;
    UnaryOperation.superclass = Expression.prototype;
    function UnaryOperation(rhs) {
      if (arguments.length > 0) {
        this.init(rhs);
      }
    }
    UnaryOperation.prototype.init = function(rhs) {
      this.rhs = rhs;
    };
    UnaryMinusOperation.prototype = new UnaryOperation;
    UnaryMinusOperation.prototype.constructor = UnaryMinusOperation;
    UnaryMinusOperation.superclass = UnaryOperation.prototype;
    function UnaryMinusOperation(rhs) {
      if (arguments.length > 0) {
        this.init(rhs);
      }
    }
    UnaryMinusOperation.prototype.init = function(rhs) {
      UnaryMinusOperation.superclass.init.call(this, rhs);
    };
    UnaryMinusOperation.prototype.evaluate = function(c) {
      return this.rhs.evaluate(c).number().negate();
    };
    UnaryMinusOperation.prototype.toString = function() {
      return "-" + this.rhs.toString();
    };
    BinaryOperation.prototype = new Expression;
    BinaryOperation.prototype.constructor = BinaryOperation;
    BinaryOperation.superclass = Expression.prototype;
    function BinaryOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    BinaryOperation.prototype.init = function(lhs, rhs) {
      this.lhs = lhs;
      this.rhs = rhs;
    };
    OrOperation.prototype = new BinaryOperation;
    OrOperation.prototype.constructor = OrOperation;
    OrOperation.superclass = BinaryOperation.prototype;
    function OrOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    OrOperation.prototype.init = function(lhs, rhs) {
      OrOperation.superclass.init.call(this, lhs, rhs);
    };
    OrOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
    };
    OrOperation.prototype.evaluate = function(c) {
      var b = this.lhs.evaluate(c).bool();
      if (b.booleanValue()) {
        return b;
      }
      return this.rhs.evaluate(c).bool();
    };
    AndOperation.prototype = new BinaryOperation;
    AndOperation.prototype.constructor = AndOperation;
    AndOperation.superclass = BinaryOperation.prototype;
    function AndOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    AndOperation.prototype.init = function(lhs, rhs) {
      AndOperation.superclass.init.call(this, lhs, rhs);
    };
    AndOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
    };
    AndOperation.prototype.evaluate = function(c) {
      var b = this.lhs.evaluate(c).bool();
      if (!b.booleanValue()) {
        return b;
      }
      return this.rhs.evaluate(c).bool();
    };
    EqualsOperation.prototype = new BinaryOperation;
    EqualsOperation.prototype.constructor = EqualsOperation;
    EqualsOperation.superclass = BinaryOperation.prototype;
    function EqualsOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    EqualsOperation.prototype.init = function(lhs, rhs) {
      EqualsOperation.superclass.init.call(this, lhs, rhs);
    };
    EqualsOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
    };
    EqualsOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
    };
    NotEqualOperation.prototype = new BinaryOperation;
    NotEqualOperation.prototype.constructor = NotEqualOperation;
    NotEqualOperation.superclass = BinaryOperation.prototype;
    function NotEqualOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    NotEqualOperation.prototype.init = function(lhs, rhs) {
      NotEqualOperation.superclass.init.call(this, lhs, rhs);
    };
    NotEqualOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
    };
    NotEqualOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
    };
    LessThanOperation.prototype = new BinaryOperation;
    LessThanOperation.prototype.constructor = LessThanOperation;
    LessThanOperation.superclass = BinaryOperation.prototype;
    function LessThanOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    LessThanOperation.prototype.init = function(lhs, rhs) {
      LessThanOperation.superclass.init.call(this, lhs, rhs);
    };
    LessThanOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
    };
    LessThanOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
    };
    GreaterThanOperation.prototype = new BinaryOperation;
    GreaterThanOperation.prototype.constructor = GreaterThanOperation;
    GreaterThanOperation.superclass = BinaryOperation.prototype;
    function GreaterThanOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    GreaterThanOperation.prototype.init = function(lhs, rhs) {
      GreaterThanOperation.superclass.init.call(this, lhs, rhs);
    };
    GreaterThanOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
    };
    GreaterThanOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
    };
    LessThanOrEqualOperation.prototype = new BinaryOperation;
    LessThanOrEqualOperation.prototype.constructor = LessThanOrEqualOperation;
    LessThanOrEqualOperation.superclass = BinaryOperation.prototype;
    function LessThanOrEqualOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    LessThanOrEqualOperation.prototype.init = function(lhs, rhs) {
      LessThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
    };
    LessThanOrEqualOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).lessthanorequal(this.rhs.evaluate(c));
    };
    LessThanOrEqualOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
    };
    GreaterThanOrEqualOperation.prototype = new BinaryOperation;
    GreaterThanOrEqualOperation.prototype.constructor = GreaterThanOrEqualOperation;
    GreaterThanOrEqualOperation.superclass = BinaryOperation.prototype;
    function GreaterThanOrEqualOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    GreaterThanOrEqualOperation.prototype.init = function(lhs, rhs) {
      GreaterThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
    };
    GreaterThanOrEqualOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
    };
    GreaterThanOrEqualOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
    };
    PlusOperation.prototype = new BinaryOperation;
    PlusOperation.prototype.constructor = PlusOperation;
    PlusOperation.superclass = BinaryOperation.prototype;
    function PlusOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    PlusOperation.prototype.init = function(lhs, rhs) {
      PlusOperation.superclass.init.call(this, lhs, rhs);
    };
    PlusOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().plus(this.rhs.evaluate(c).number());
    };
    PlusOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
    };
    MinusOperation.prototype = new BinaryOperation;
    MinusOperation.prototype.constructor = MinusOperation;
    MinusOperation.superclass = BinaryOperation.prototype;
    function MinusOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    MinusOperation.prototype.init = function(lhs, rhs) {
      MinusOperation.superclass.init.call(this, lhs, rhs);
    };
    MinusOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().minus(this.rhs.evaluate(c).number());
    };
    MinusOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
    };
    MultiplyOperation.prototype = new BinaryOperation;
    MultiplyOperation.prototype.constructor = MultiplyOperation;
    MultiplyOperation.superclass = BinaryOperation.prototype;
    function MultiplyOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    MultiplyOperation.prototype.init = function(lhs, rhs) {
      MultiplyOperation.superclass.init.call(this, lhs, rhs);
    };
    MultiplyOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().multiply(this.rhs.evaluate(c).number());
    };
    MultiplyOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
    };
    DivOperation.prototype = new BinaryOperation;
    DivOperation.prototype.constructor = DivOperation;
    DivOperation.superclass = BinaryOperation.prototype;
    function DivOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    DivOperation.prototype.init = function(lhs, rhs) {
      DivOperation.superclass.init.call(this, lhs, rhs);
    };
    DivOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().div(this.rhs.evaluate(c).number());
    };
    DivOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
    };
    ModOperation.prototype = new BinaryOperation;
    ModOperation.prototype.constructor = ModOperation;
    ModOperation.superclass = BinaryOperation.prototype;
    function ModOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    ModOperation.prototype.init = function(lhs, rhs) {
      ModOperation.superclass.init.call(this, lhs, rhs);
    };
    ModOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().mod(this.rhs.evaluate(c).number());
    };
    ModOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
    };
    BarOperation.prototype = new BinaryOperation;
    BarOperation.prototype.constructor = BarOperation;
    BarOperation.superclass = BinaryOperation.prototype;
    function BarOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    BarOperation.prototype.init = function(lhs, rhs) {
      BarOperation.superclass.init.call(this, lhs, rhs);
    };
    BarOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).nodeset().union(this.rhs.evaluate(c).nodeset());
    };
    BarOperation.prototype.toString = function() {
      return map(toString, [this.lhs, this.rhs]).join(" | ");
    };
    PathExpr.prototype = new Expression;
    PathExpr.prototype.constructor = PathExpr;
    PathExpr.superclass = Expression.prototype;
    function PathExpr(filter3, filterPreds, locpath) {
      if (arguments.length > 0) {
        this.init(filter3, filterPreds, locpath);
      }
    }
    PathExpr.prototype.init = function(filter3, filterPreds, locpath) {
      PathExpr.superclass.init.call(this);
      this.filter = filter3;
      this.filterPredicates = filterPreds;
      this.locationPath = locpath;
    };
    function findRoot(node) {
      while (node && node.parentNode) {
        node = node.parentNode;
      }
      return node;
    }
    var applyPredicates = function(predicates, c, nodes, reverse) {
      if (predicates.length === 0) {
        return nodes;
      }
      var ctx = c.extend({});
      return reduce(function(inNodes, pred) {
        ctx.contextSize = inNodes.length;
        return filter2(function(node, i) {
          ctx.contextNode = node;
          ctx.contextPosition = i + 1;
          return PathExpr.predicateMatches(pred, ctx);
        }, inNodes);
      }, sortNodes(nodes, reverse), predicates);
    };
    PathExpr.getRoot = function(xpc, nodes) {
      var firstNode = nodes[0];
      if (firstNode && firstNode.nodeType === NodeTypes.DOCUMENT_NODE) {
        return firstNode;
      }
      if (xpc.virtualRoot) {
        return xpc.virtualRoot;
      }
      if (!firstNode) {
        throw new Error("Context node not found when determining document root.");
      }
      var ownerDoc = firstNode.ownerDocument;
      if (ownerDoc) {
        return ownerDoc;
      }
      var n = firstNode;
      while (n.parentNode != null) {
        n = n.parentNode;
      }
      return n;
    };
    var getPrefixForNamespaceNode = function(attrNode) {
      var nm = String(attrNode.name);
      if (nm === "xmlns") {
        return "";
      }
      if (nm.substring(0, 6) === "xmlns:") {
        return nm.substring(6, nm.length);
      }
      return null;
    };
    PathExpr.applyStep = function(step, xpc, node) {
      if (!node) {
        throw new Error("Context node not found when evaluating XPath step: " + step);
      }
      var newNodes = [];
      xpc.contextNode = node;
      switch (step.axis) {
        case Step.ANCESTOR:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          var m;
          if (xpc.contextNode.nodeType == NodeTypes.ATTRIBUTE_NODE) {
            m = PathExpr.getOwnerElement(xpc.contextNode);
          } else {
            m = xpc.contextNode.parentNode;
          }
          while (m != null) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
            if (m === xpc.virtualRoot) {
              break;
            }
            m = m.parentNode;
          }
          break;
        case Step.ANCESTORORSELF:
          for (var m = xpc.contextNode;m != null; m = m.nodeType == NodeTypes.ATTRIBUTE_NODE ? PathExpr.getOwnerElement(m) : m.parentNode) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
            if (m === xpc.virtualRoot) {
              break;
            }
          }
          break;
        case Step.ATTRIBUTE:
          var nnm = xpc.contextNode.attributes;
          if (nnm != null) {
            for (var k = 0;k < nnm.length; k++) {
              var m = nnm.item(k);
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
            }
          }
          break;
        case Step.CHILD:
          for (var m = xpc.contextNode.firstChild;m != null; m = m.nextSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
          break;
        case Step.DESCENDANT:
          var st = [xpc.contextNode.firstChild];
          while (st.length > 0) {
            for (var m = st.pop();m != null; ) {
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
              if (m.firstChild != null) {
                st.push(m.nextSibling);
                m = m.firstChild;
              } else {
                m = m.nextSibling;
              }
            }
          }
          break;
        case Step.DESCENDANTORSELF:
          if (step.nodeTest.matches(xpc.contextNode, xpc)) {
            newNodes.push(xpc.contextNode);
          }
          var st = [xpc.contextNode.firstChild];
          while (st.length > 0) {
            for (var m = st.pop();m != null; ) {
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
              if (m.firstChild != null) {
                st.push(m.nextSibling);
                m = m.firstChild;
              } else {
                m = m.nextSibling;
              }
            }
          }
          break;
        case Step.FOLLOWING:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          var st = [];
          if (xpc.contextNode.firstChild != null) {
            st.unshift(xpc.contextNode.firstChild);
          } else {
            st.unshift(xpc.contextNode.nextSibling);
          }
          for (var m = xpc.contextNode.parentNode;m != null && m.nodeType != NodeTypes.DOCUMENT_NODE && m !== xpc.virtualRoot; m = m.parentNode) {
            st.unshift(m.nextSibling);
          }
          do {
            for (var m = st.pop();m != null; ) {
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
              if (m.firstChild != null) {
                st.push(m.nextSibling);
                m = m.firstChild;
              } else {
                m = m.nextSibling;
              }
            }
          } while (st.length > 0);
          break;
        case Step.FOLLOWINGSIBLING:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          for (var m = xpc.contextNode.nextSibling;m != null; m = m.nextSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
          break;
        case Step.NAMESPACE:
          var nodes = {};
          if (xpc.contextNode.nodeType == NodeTypes.ELEMENT_NODE) {
            nodes["xml"] = new XPathNamespace("xml", null, XPath.XML_NAMESPACE_URI, xpc.contextNode);
            for (var m = xpc.contextNode;m != null && m.nodeType == NodeTypes.ELEMENT_NODE; m = m.parentNode) {
              for (var k = 0;k < m.attributes.length; k++) {
                var attr = m.attributes.item(k);
                var pre = getPrefixForNamespaceNode(attr);
                if (pre != null && nodes[pre] == undefined) {
                  nodes[pre] = new XPathNamespace(pre, attr, attr.value, xpc.contextNode);
                }
              }
            }
            for (var pre in nodes) {
              var node = nodes[pre];
              if (step.nodeTest.matches(node, xpc)) {
                newNodes.push(node);
              }
            }
          }
          break;
        case Step.PARENT:
          m = null;
          if (xpc.contextNode !== xpc.virtualRoot) {
            if (xpc.contextNode.nodeType == NodeTypes.ATTRIBUTE_NODE) {
              m = PathExpr.getOwnerElement(xpc.contextNode);
            } else {
              m = xpc.contextNode.parentNode;
            }
          }
          if (m != null && step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
          break;
        case Step.PRECEDING:
          var st;
          if (xpc.virtualRoot != null) {
            st = [xpc.virtualRoot];
          } else {
            st = [findRoot(xpc.contextNode)];
          }
          outer:
            while (st.length > 0) {
              for (var m = st.pop();m != null; ) {
                if (m == xpc.contextNode) {
                  break outer;
                }
                if (step.nodeTest.matches(m, xpc)) {
                  newNodes.unshift(m);
                }
                if (m.firstChild != null) {
                  st.push(m.nextSibling);
                  m = m.firstChild;
                } else {
                  m = m.nextSibling;
                }
              }
            }
          break;
        case Step.PRECEDINGSIBLING:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          for (var m = xpc.contextNode.previousSibling;m != null; m = m.previousSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
          break;
        case Step.SELF:
          if (step.nodeTest.matches(xpc.contextNode, xpc)) {
            newNodes.push(xpc.contextNode);
          }
          break;
        default:
      }
      return newNodes;
    };
    function applyStepWithPredicates(step, xpc, node) {
      return applyPredicates(step.predicates, xpc, PathExpr.applyStep(step, xpc, node), includes(REVERSE_AXES, step.axis));
    }
    function applyStepToNodes(context, nodes, step) {
      return flatten(map(applyStepWithPredicates.bind(null, step, context), nodes));
    }
    PathExpr.applySteps = function(steps, xpc, nodes) {
      return reduce(applyStepToNodes.bind(null, xpc), nodes, steps);
    };
    PathExpr.prototype.applyFilter = function(c, xpc) {
      if (!this.filter) {
        return { nodes: [c.contextNode] };
      }
      var ns = this.filter.evaluate(c);
      if (!Utilities.instance_of(ns, XNodeSet)) {
        if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null) {
          throw new Error("Path expression filter must evaluate to a nodeset if predicates or location path are used");
        }
        return { nonNodes: ns };
      }
      return {
        nodes: applyPredicates(this.filterPredicates || [], xpc, ns.toUnsortedArray(), false)
      };
    };
    PathExpr.applyLocationPath = function(locationPath, xpc, nodes) {
      if (!locationPath) {
        return nodes;
      }
      var startNodes = locationPath.absolute ? [PathExpr.getRoot(xpc, nodes)] : nodes;
      return PathExpr.applySteps(locationPath.steps, xpc, startNodes);
    };
    PathExpr.prototype.evaluate = function(c) {
      var xpc = assign(new XPathContext, c);
      var filterResult = this.applyFilter(c, xpc);
      if ("nonNodes" in filterResult) {
        return filterResult.nonNodes;
      }
      var ns = new XNodeSet;
      ns.addArray(PathExpr.applyLocationPath(this.locationPath, xpc, filterResult.nodes));
      return ns;
    };
    PathExpr.predicateMatches = function(pred, c) {
      var res = pred.evaluate(c);
      return Utilities.instance_of(res, XNumber) ? c.contextPosition === res.numberValue() : res.booleanValue();
    };
    PathExpr.predicateString = function(predicate) {
      return wrap("[", "]", predicate.toString());
    };
    PathExpr.predicatesString = function(predicates) {
      return join("", map(PathExpr.predicateString, predicates));
    };
    PathExpr.prototype.toString = function() {
      if (this.filter != null) {
        var filterStr = toString(this.filter);
        if (Utilities.instance_of(this.filter, XString)) {
          return wrap("'", "'", filterStr);
        }
        if (this.filterPredicates != null && this.filterPredicates.length) {
          return wrap("(", ")", filterStr) + PathExpr.predicatesString(this.filterPredicates);
        }
        if (this.locationPath != null) {
          return filterStr + (this.locationPath.absolute ? "" : "/") + toString(this.locationPath);
        }
        return filterStr;
      }
      return toString(this.locationPath);
    };
    PathExpr.getOwnerElement = function(n) {
      if (n.ownerElement) {
        return n.ownerElement;
      }
      try {
        if (n.selectSingleNode) {
          return n.selectSingleNode("..");
        }
      } catch (e) {}
      var doc = n.nodeType == NodeTypes.DOCUMENT_NODE ? n : n.ownerDocument;
      var elts = doc.getElementsByTagName("*");
      for (var i = 0;i < elts.length; i++) {
        var elt = elts.item(i);
        var nnm = elt.attributes;
        for (var j = 0;j < nnm.length; j++) {
          var an = nnm.item(j);
          if (an === n) {
            return elt;
          }
        }
      }
      return null;
    };
    LocationPath.prototype = new Object;
    LocationPath.prototype.constructor = LocationPath;
    LocationPath.superclass = Object.prototype;
    function LocationPath(abs, steps) {
      if (arguments.length > 0) {
        this.init(abs, steps);
      }
    }
    LocationPath.prototype.init = function(abs, steps) {
      this.absolute = abs;
      this.steps = steps;
    };
    LocationPath.prototype.toString = function() {
      return (this.absolute ? "/" : "") + map(toString, this.steps).join("/");
    };
    Step.prototype = new Object;
    Step.prototype.constructor = Step;
    Step.superclass = Object.prototype;
    function Step(axis, nodetest, preds) {
      if (arguments.length > 0) {
        this.init(axis, nodetest, preds);
      }
    }
    Step.prototype.init = function(axis, nodetest, preds) {
      this.axis = axis;
      this.nodeTest = nodetest;
      this.predicates = preds;
    };
    Step.prototype.toString = function() {
      return Step.STEPNAMES[this.axis] + "::" + this.nodeTest.toString() + PathExpr.predicatesString(this.predicates);
    };
    Step.ANCESTOR = 0;
    Step.ANCESTORORSELF = 1;
    Step.ATTRIBUTE = 2;
    Step.CHILD = 3;
    Step.DESCENDANT = 4;
    Step.DESCENDANTORSELF = 5;
    Step.FOLLOWING = 6;
    Step.FOLLOWINGSIBLING = 7;
    Step.NAMESPACE = 8;
    Step.PARENT = 9;
    Step.PRECEDING = 10;
    Step.PRECEDINGSIBLING = 11;
    Step.SELF = 12;
    Step.STEPNAMES = reduce(function(acc, x) {
      return acc[x[0]] = x[1], acc;
    }, {}, [
      [Step.ANCESTOR, "ancestor"],
      [Step.ANCESTORORSELF, "ancestor-or-self"],
      [Step.ATTRIBUTE, "attribute"],
      [Step.CHILD, "child"],
      [Step.DESCENDANT, "descendant"],
      [Step.DESCENDANTORSELF, "descendant-or-self"],
      [Step.FOLLOWING, "following"],
      [Step.FOLLOWINGSIBLING, "following-sibling"],
      [Step.NAMESPACE, "namespace"],
      [Step.PARENT, "parent"],
      [Step.PRECEDING, "preceding"],
      [Step.PRECEDINGSIBLING, "preceding-sibling"],
      [Step.SELF, "self"]
    ]);
    var REVERSE_AXES = [
      Step.ANCESTOR,
      Step.ANCESTORORSELF,
      Step.PARENT,
      Step.PRECEDING,
      Step.PRECEDINGSIBLING
    ];
    NodeTest.prototype = new Object;
    NodeTest.prototype.constructor = NodeTest;
    NodeTest.superclass = Object.prototype;
    function NodeTest(type, value) {
      if (arguments.length > 0) {
        this.init(type, value);
      }
    }
    NodeTest.prototype.init = function(type, value) {
      this.type = type;
      this.value = value;
    };
    NodeTest.prototype.toString = function() {
      return "<unknown nodetest type>";
    };
    NodeTest.prototype.matches = function(n, xpc) {
      console.warn("unknown node test type");
    };
    NodeTest.NAMETESTANY = 0;
    NodeTest.NAMETESTPREFIXANY = 1;
    NodeTest.NAMETESTQNAME = 2;
    NodeTest.COMMENT = 3;
    NodeTest.TEXT = 4;
    NodeTest.PI = 5;
    NodeTest.NODE = 6;
    NodeTest.isNodeType = function(types2) {
      return function(node) {
        return includes(types2, node.nodeType);
      };
    };
    NodeTest.makeNodeTestType = function(type, members, ctor) {
      var newType = ctor || function() {};
      newType.prototype = new NodeTest(type);
      newType.prototype.constructor = newType;
      assign(newType.prototype, members);
      return newType;
    };
    NodeTest.makeNodeTypeTest = function(type, nodeTypes, stringVal) {
      return new (NodeTest.makeNodeTestType(type, {
        matches: NodeTest.isNodeType(nodeTypes),
        toString: always(stringVal)
      }));
    };
    NodeTest.hasPrefix = function(node) {
      return node.prefix || (node.nodeName || node.tagName).indexOf(":") !== -1;
    };
    NodeTest.isElementOrAttribute = NodeTest.isNodeType([1, 2]);
    NodeTest.nameSpaceMatches = function(prefix, xpc, n) {
      var nNamespace = n.namespaceURI || "";
      if (!prefix) {
        return !nNamespace || xpc.allowAnyNamespaceForNoPrefix && !NodeTest.hasPrefix(n);
      }
      var ns = xpc.namespaceResolver.getNamespace(prefix, xpc.expressionContextNode);
      if (ns == null) {
        throw new Error("Cannot resolve QName " + prefix);
      }
      return ns === nNamespace;
    };
    NodeTest.localNameMatches = function(localName, xpc, n) {
      var nLocalName = n.localName || n.nodeName;
      return xpc.caseInsensitive ? localName.toLowerCase() === nLocalName.toLowerCase() : localName === nLocalName;
    };
    NodeTest.NameTestPrefixAny = NodeTest.makeNodeTestType(NodeTest.NAMETESTPREFIXANY, {
      matches: function(n, xpc) {
        return NodeTest.isElementOrAttribute(n) && NodeTest.nameSpaceMatches(this.prefix, xpc, n);
      },
      toString: function() {
        return this.prefix + ":*";
      }
    }, function NameTestPrefixAny(prefix) {
      this.prefix = prefix;
    });
    NodeTest.NameTestQName = NodeTest.makeNodeTestType(NodeTest.NAMETESTQNAME, {
      matches: function(n, xpc) {
        return NodeTest.isNodeType([
          NodeTypes.ELEMENT_NODE,
          NodeTypes.ATTRIBUTE_NODE,
          NodeTypes.NAMESPACE_NODE
        ])(n) && NodeTest.nameSpaceMatches(this.prefix, xpc, n) && NodeTest.localNameMatches(this.localName, xpc, n);
      },
      toString: function() {
        return this.name;
      }
    }, function NameTestQName(name2) {
      var nameParts = name2.split(":");
      this.name = name2;
      this.prefix = nameParts.length > 1 ? nameParts[0] : null;
      this.localName = nameParts[nameParts.length > 1 ? 1 : 0];
    });
    NodeTest.PITest = NodeTest.makeNodeTestType(NodeTest.PI, {
      matches: function(n, xpc) {
        return NodeTest.isNodeType([NodeTypes.PROCESSING_INSTRUCTION_NODE])(n) && (n.target || n.nodeName) === this.name;
      },
      toString: function() {
        return wrap('processing-instruction("', '")', this.name);
      }
    }, function(name2) {
      this.name = name2;
    });
    NodeTest.nameTestAny = NodeTest.makeNodeTypeTest(NodeTest.NAMETESTANY, [
      NodeTypes.ELEMENT_NODE,
      NodeTypes.ATTRIBUTE_NODE,
      NodeTypes.NAMESPACE_NODE
    ], "*");
    NodeTest.textTest = NodeTest.makeNodeTypeTest(NodeTest.TEXT, [
      NodeTypes.TEXT_NODE,
      NodeTypes.CDATA_SECTION_NODE
    ], "text()");
    NodeTest.commentTest = NodeTest.makeNodeTypeTest(NodeTest.COMMENT, [NodeTypes.COMMENT_NODE], "comment()");
    NodeTest.nodeTest = NodeTest.makeNodeTypeTest(NodeTest.NODE, [
      NodeTypes.ELEMENT_NODE,
      NodeTypes.ATTRIBUTE_NODE,
      NodeTypes.TEXT_NODE,
      NodeTypes.CDATA_SECTION_NODE,
      NodeTypes.PROCESSING_INSTRUCTION_NODE,
      NodeTypes.COMMENT_NODE,
      NodeTypes.DOCUMENT_NODE
    ], "node()");
    NodeTest.anyPiTest = NodeTest.makeNodeTypeTest(NodeTest.PI, [NodeTypes.PROCESSING_INSTRUCTION_NODE], "processing-instruction()");
    VariableReference.prototype = new Expression;
    VariableReference.prototype.constructor = VariableReference;
    VariableReference.superclass = Expression.prototype;
    function VariableReference(v) {
      if (arguments.length > 0) {
        this.init(v);
      }
    }
    VariableReference.prototype.init = function(v) {
      this.variable = v;
    };
    VariableReference.prototype.toString = function() {
      return "$" + this.variable;
    };
    VariableReference.prototype.evaluate = function(c) {
      var parts = Utilities.resolveQName(this.variable, c.namespaceResolver, c.contextNode, false);
      if (parts[0] == null) {
        throw new Error("Cannot resolve QName " + fn);
      }
      var result = c.variableResolver.getVariable(parts[1], parts[0]);
      if (!result) {
        throw XPathException.fromMessage("Undeclared variable: " + this.toString());
      }
      return result;
    };
    FunctionCall.prototype = new Expression;
    FunctionCall.prototype.constructor = FunctionCall;
    FunctionCall.superclass = Expression.prototype;
    function FunctionCall(fn2, args) {
      if (arguments.length > 0) {
        this.init(fn2, args);
      }
    }
    FunctionCall.prototype.init = function(fn2, args) {
      this.functionName = fn2;
      this.arguments = args;
    };
    FunctionCall.prototype.toString = function() {
      var s = this.functionName + "(";
      for (var i = 0;i < this.arguments.length; i++) {
        if (i > 0) {
          s += ", ";
        }
        s += this.arguments[i].toString();
      }
      return s + ")";
    };
    FunctionCall.prototype.evaluate = function(c) {
      var f = FunctionResolver.getFunctionFromContext(this.functionName, c);
      if (!f) {
        throw new Error("Unknown function " + this.functionName);
      }
      var a = [c].concat(this.arguments);
      return f.apply(c.functionResolver.thisArg, a);
    };
    var Operators = new Object;
    Operators.equals = function(l, r) {
      return l.equals(r);
    };
    Operators.notequal = function(l, r) {
      return l.notequal(r);
    };
    Operators.lessthan = function(l, r) {
      return l.lessthan(r);
    };
    Operators.greaterthan = function(l, r) {
      return l.greaterthan(r);
    };
    Operators.lessthanorequal = function(l, r) {
      return l.lessthanorequal(r);
    };
    Operators.greaterthanorequal = function(l, r) {
      return l.greaterthanorequal(r);
    };
    XString.prototype = new Expression;
    XString.prototype.constructor = XString;
    XString.superclass = Expression.prototype;
    function XString(s) {
      if (arguments.length > 0) {
        this.init(s);
      }
    }
    XString.prototype.init = function(s) {
      this.str = String(s);
    };
    XString.prototype.toString = function() {
      return this.str;
    };
    XString.prototype.evaluate = function(c) {
      return this;
    };
    XString.prototype.string = function() {
      return this;
    };
    XString.prototype.number = function() {
      return new XNumber(this.str);
    };
    XString.prototype.bool = function() {
      return new XBoolean(this.str);
    };
    XString.prototype.nodeset = function() {
      throw new Error("Cannot convert string to nodeset");
    };
    XString.prototype.stringValue = function() {
      return this.str;
    };
    XString.prototype.numberValue = function() {
      return this.number().numberValue();
    };
    XString.prototype.booleanValue = function() {
      return this.bool().booleanValue();
    };
    XString.prototype.equals = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().equals(r);
      }
      if (Utilities.instance_of(r, XNumber)) {
        return this.number().equals(r);
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithString(this, Operators.equals);
      }
      return new XBoolean(this.str == r.str);
    };
    XString.prototype.notequal = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().notequal(r);
      }
      if (Utilities.instance_of(r, XNumber)) {
        return this.number().notequal(r);
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithString(this, Operators.notequal);
      }
      return new XBoolean(this.str != r.str);
    };
    XString.prototype.lessthan = function(r) {
      return this.number().lessthan(r);
    };
    XString.prototype.greaterthan = function(r) {
      return this.number().greaterthan(r);
    };
    XString.prototype.lessthanorequal = function(r) {
      return this.number().lessthanorequal(r);
    };
    XString.prototype.greaterthanorequal = function(r) {
      return this.number().greaterthanorequal(r);
    };
    XNumber.prototype = new Expression;
    XNumber.prototype.constructor = XNumber;
    XNumber.superclass = Expression.prototype;
    function XNumber(n) {
      if (arguments.length > 0) {
        this.init(n);
      }
    }
    XNumber.prototype.init = function(n) {
      this.num = typeof n === "string" ? this.parse(n) : Number(n);
    };
    XNumber.prototype.numberFormat = /^\s*-?[0-9]*\.?[0-9]+\s*$/;
    XNumber.prototype.parse = function(s) {
      return this.numberFormat.test(s) ? parseFloat(s) : Number.NaN;
    };
    function padSmallNumber(numberStr) {
      var parts = numberStr.split("e-");
      var base = parts[0].replace(".", "");
      var exponent = Number(parts[1]);
      for (var i = 0;i < exponent - 1; i += 1) {
        base = "0" + base;
      }
      return "0." + base;
    }
    function padLargeNumber(numberStr) {
      var parts = numberStr.split("e");
      var base = parts[0].replace(".", "");
      var exponent = Number(parts[1]);
      var zerosToAppend = exponent + 1 - base.length;
      for (var i = 0;i < zerosToAppend; i += 1) {
        base += "0";
      }
      return base;
    }
    XNumber.prototype.toString = function() {
      var strValue = this.num.toString();
      if (strValue.indexOf("e-") !== -1) {
        return padSmallNumber(strValue);
      }
      if (strValue.indexOf("e") !== -1) {
        return padLargeNumber(strValue);
      }
      return strValue;
    };
    XNumber.prototype.evaluate = function(c) {
      return this;
    };
    XNumber.prototype.string = function() {
      return new XString(this.toString());
    };
    XNumber.prototype.number = function() {
      return this;
    };
    XNumber.prototype.bool = function() {
      return new XBoolean(this.num);
    };
    XNumber.prototype.nodeset = function() {
      throw new Error("Cannot convert number to nodeset");
    };
    XNumber.prototype.stringValue = function() {
      return this.string().stringValue();
    };
    XNumber.prototype.numberValue = function() {
      return this.num;
    };
    XNumber.prototype.booleanValue = function() {
      return this.bool().booleanValue();
    };
    XNumber.prototype.negate = function() {
      return new XNumber(-this.num);
    };
    XNumber.prototype.equals = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().equals(r);
      }
      if (Utilities.instance_of(r, XString)) {
        return this.equals(r.number());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.equals);
      }
      return new XBoolean(this.num == r.num);
    };
    XNumber.prototype.notequal = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().notequal(r);
      }
      if (Utilities.instance_of(r, XString)) {
        return this.notequal(r.number());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.notequal);
      }
      return new XBoolean(this.num != r.num);
    };
    XNumber.prototype.lessthan = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.greaterthan);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.lessthan(r.number());
      }
      return new XBoolean(this.num < r.num);
    };
    XNumber.prototype.greaterthan = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.lessthan);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.greaterthan(r.number());
      }
      return new XBoolean(this.num > r.num);
    };
    XNumber.prototype.lessthanorequal = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.greaterthanorequal);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.lessthanorequal(r.number());
      }
      return new XBoolean(this.num <= r.num);
    };
    XNumber.prototype.greaterthanorequal = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.lessthanorequal);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.greaterthanorequal(r.number());
      }
      return new XBoolean(this.num >= r.num);
    };
    XNumber.prototype.plus = function(r) {
      return new XNumber(this.num + r.num);
    };
    XNumber.prototype.minus = function(r) {
      return new XNumber(this.num - r.num);
    };
    XNumber.prototype.multiply = function(r) {
      return new XNumber(this.num * r.num);
    };
    XNumber.prototype.div = function(r) {
      return new XNumber(this.num / r.num);
    };
    XNumber.prototype.mod = function(r) {
      return new XNumber(this.num % r.num);
    };
    XBoolean.prototype = new Expression;
    XBoolean.prototype.constructor = XBoolean;
    XBoolean.superclass = Expression.prototype;
    function XBoolean(b) {
      if (arguments.length > 0) {
        this.init(b);
      }
    }
    XBoolean.prototype.init = function(b) {
      this.b = Boolean(b);
    };
    XBoolean.prototype.toString = function() {
      return this.b.toString();
    };
    XBoolean.prototype.evaluate = function(c) {
      return this;
    };
    XBoolean.prototype.string = function() {
      return new XString(this.b);
    };
    XBoolean.prototype.number = function() {
      return new XNumber(this.b);
    };
    XBoolean.prototype.bool = function() {
      return this;
    };
    XBoolean.prototype.nodeset = function() {
      throw new Error("Cannot convert boolean to nodeset");
    };
    XBoolean.prototype.stringValue = function() {
      return this.string().stringValue();
    };
    XBoolean.prototype.numberValue = function() {
      return this.number().numberValue();
    };
    XBoolean.prototype.booleanValue = function() {
      return this.b;
    };
    XBoolean.prototype.not = function() {
      return new XBoolean(!this.b);
    };
    XBoolean.prototype.equals = function(r) {
      if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
        return this.equals(r.bool());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithBoolean(this, Operators.equals);
      }
      return new XBoolean(this.b == r.b);
    };
    XBoolean.prototype.notequal = function(r) {
      if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
        return this.notequal(r.bool());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithBoolean(this, Operators.notequal);
      }
      return new XBoolean(this.b != r.b);
    };
    XBoolean.prototype.lessthan = function(r) {
      return this.number().lessthan(r);
    };
    XBoolean.prototype.greaterthan = function(r) {
      return this.number().greaterthan(r);
    };
    XBoolean.prototype.lessthanorequal = function(r) {
      return this.number().lessthanorequal(r);
    };
    XBoolean.prototype.greaterthanorequal = function(r) {
      return this.number().greaterthanorequal(r);
    };
    XBoolean.true_ = new XBoolean(true);
    XBoolean.false_ = new XBoolean(false);
    AVLTree.prototype = new Object;
    AVLTree.prototype.constructor = AVLTree;
    AVLTree.superclass = Object.prototype;
    function AVLTree(n) {
      this.init(n);
    }
    AVLTree.prototype.init = function(n) {
      this.left = null;
      this.right = null;
      this.node = n;
      this.depth = 1;
    };
    AVLTree.prototype.balance = function() {
      var ldepth = this.left == null ? 0 : this.left.depth;
      var rdepth = this.right == null ? 0 : this.right.depth;
      if (ldepth > rdepth + 1) {
        var lldepth = this.left.left == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;
        if (lldepth < lrdepth) {
          this.left.rotateRR();
        }
        this.rotateLL();
      } else if (ldepth + 1 < rdepth) {
        var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
        var rldepth = this.right.left == null ? 0 : this.right.left.depth;
        if (rldepth > rrdepth) {
          this.right.rotateLL();
        }
        this.rotateRR();
      }
    };
    AVLTree.prototype.rotateLL = function() {
      var nodeBefore = this.node;
      var rightBefore = this.right;
      this.node = this.left.node;
      this.right = this.left;
      this.left = this.left.left;
      this.right.left = this.right.right;
      this.right.right = rightBefore;
      this.right.node = nodeBefore;
      this.right.updateInNewLocation();
      this.updateInNewLocation();
    };
    AVLTree.prototype.rotateRR = function() {
      var nodeBefore = this.node;
      var leftBefore = this.left;
      this.node = this.right.node;
      this.left = this.right;
      this.right = this.right.right;
      this.left.right = this.left.left;
      this.left.left = leftBefore;
      this.left.node = nodeBefore;
      this.left.updateInNewLocation();
      this.updateInNewLocation();
    };
    AVLTree.prototype.updateInNewLocation = function() {
      this.getDepthFromChildren();
    };
    AVLTree.prototype.getDepthFromChildren = function() {
      this.depth = this.node == null ? 0 : 1;
      if (this.left != null) {
        this.depth = this.left.depth + 1;
      }
      if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
      }
    };
    function nodeOrder(n1, n2) {
      if (n1 === n2) {
        return 0;
      }
      if (n1.compareDocumentPosition) {
        var cpos = n1.compareDocumentPosition(n2);
        if (cpos & 1) {
          return 1;
        }
        if (cpos & 10) {
          return 1;
        }
        if (cpos & 20) {
          return -1;
        }
        return 0;
      }
      var d1 = 0, d2 = 0;
      for (var m1 = n1;m1 != null; m1 = m1.parentNode || m1.ownerElement) {
        d1++;
      }
      for (var m2 = n2;m2 != null; m2 = m2.parentNode || m2.ownerElement) {
        d2++;
      }
      if (d1 > d2) {
        while (d1 > d2) {
          n1 = n1.parentNode || n1.ownerElement;
          d1--;
        }
        if (n1 === n2) {
          return 1;
        }
      } else if (d2 > d1) {
        while (d2 > d1) {
          n2 = n2.parentNode || n2.ownerElement;
          d2--;
        }
        if (n1 === n2) {
          return -1;
        }
      }
      var n1Par = n1.parentNode || n1.ownerElement, n2Par = n2.parentNode || n2.ownerElement;
      while (n1Par !== n2Par) {
        n1 = n1Par;
        n2 = n2Par;
        n1Par = n1.parentNode || n1.ownerElement;
        n2Par = n2.parentNode || n2.ownerElement;
      }
      var n1isAttr = isAttributeLike(n1);
      var n2isAttr = isAttributeLike(n2);
      if (n1isAttr && !n2isAttr) {
        return -1;
      }
      if (!n1isAttr && n2isAttr) {
        return 1;
      }
      if (n1.isXPathNamespace) {
        if (n1.nodeValue === XPath.XML_NAMESPACE_URI) {
          return -1;
        }
        if (!n2.isXPathNamespace) {
          return -1;
        }
        if (n2.nodeValue === XPath.XML_NAMESPACE_URI) {
          return 1;
        }
      } else if (n2.isXPathNamespace) {
        return 1;
      }
      if (n1Par) {
        var cn = n1isAttr ? n1Par.attributes : n1Par.childNodes;
        var len = cn.length;
        var n1Compare = n1.baseNode || n1;
        var n2Compare = n2.baseNode || n2;
        for (var i = 0;i < len; i += 1) {
          var n = cn[i];
          if (n === n1Compare) {
            return -1;
          }
          if (n === n2Compare) {
            return 1;
          }
        }
      }
      throw new Error("Unexpected: could not determine node order");
    }
    AVLTree.prototype.add = function(n) {
      if (n === this.node) {
        return false;
      }
      var o = nodeOrder(n, this.node);
      var ret = false;
      if (o == -1) {
        if (this.left == null) {
          this.left = new AVLTree(n);
          ret = true;
        } else {
          ret = this.left.add(n);
          if (ret) {
            this.balance();
          }
        }
      } else if (o == 1) {
        if (this.right == null) {
          this.right = new AVLTree(n);
          ret = true;
        } else {
          ret = this.right.add(n);
          if (ret) {
            this.balance();
          }
        }
      }
      if (ret) {
        this.getDepthFromChildren();
      }
      return ret;
    };
    XNodeSet.prototype = new Expression;
    XNodeSet.prototype.constructor = XNodeSet;
    XNodeSet.superclass = Expression.prototype;
    function XNodeSet() {
      this.init();
    }
    XNodeSet.prototype.init = function() {
      this.tree = null;
      this.nodes = [];
      this.size = 0;
    };
    XNodeSet.prototype.toString = function() {
      var p = this.first();
      if (p == null) {
        return "";
      }
      return this.stringForNode(p);
    };
    XNodeSet.prototype.evaluate = function(c) {
      return this;
    };
    XNodeSet.prototype.string = function() {
      return new XString(this.toString());
    };
    XNodeSet.prototype.stringValue = function() {
      return this.toString();
    };
    XNodeSet.prototype.number = function() {
      return new XNumber(this.string());
    };
    XNodeSet.prototype.numberValue = function() {
      return Number(this.string());
    };
    XNodeSet.prototype.bool = function() {
      return new XBoolean(this.booleanValue());
    };
    XNodeSet.prototype.booleanValue = function() {
      return !!this.size;
    };
    XNodeSet.prototype.nodeset = function() {
      return this;
    };
    XNodeSet.prototype.stringForNode = function(n) {
      if (n.nodeType == NodeTypes.DOCUMENT_NODE || n.nodeType == NodeTypes.ELEMENT_NODE || n.nodeType === NodeTypes.DOCUMENT_FRAGMENT_NODE) {
        return this.stringForContainerNode(n);
      }
      if (n.nodeType === NodeTypes.ATTRIBUTE_NODE) {
        return n.value || n.nodeValue;
      }
      if (n.isNamespaceNode) {
        return n.namespace;
      }
      return n.nodeValue;
    };
    XNodeSet.prototype.stringForContainerNode = function(n) {
      var s = "";
      for (var n2 = n.firstChild;n2 != null; n2 = n2.nextSibling) {
        var nt = n2.nodeType;
        if (nt === 1 || nt === 3 || nt === 4 || nt === 9 || nt === 11) {
          s += this.stringForNode(n2);
        }
      }
      return s;
    };
    XNodeSet.prototype.buildTree = function() {
      if (!this.tree && this.nodes.length) {
        this.tree = new AVLTree(this.nodes[0]);
        for (var i = 1;i < this.nodes.length; i += 1) {
          this.tree.add(this.nodes[i]);
        }
      }
      return this.tree;
    };
    XNodeSet.prototype.first = function() {
      var p = this.buildTree();
      if (p == null) {
        return null;
      }
      while (p.left != null) {
        p = p.left;
      }
      return p.node;
    };
    XNodeSet.prototype.add = function(n) {
      for (var i = 0;i < this.nodes.length; i += 1) {
        if (n === this.nodes[i]) {
          return;
        }
      }
      this.tree = null;
      this.nodes.push(n);
      this.size += 1;
    };
    XNodeSet.prototype.addArray = function(ns) {
      var self = this;
      forEach(function(x) {
        self.add(x);
      }, ns);
    };
    XNodeSet.prototype.toArray = function() {
      var a = [];
      this.toArrayRec(this.buildTree(), a);
      return a;
    };
    XNodeSet.prototype.toArrayRec = function(t, a) {
      if (t != null) {
        this.toArrayRec(t.left, a);
        a.push(t.node);
        this.toArrayRec(t.right, a);
      }
    };
    XNodeSet.prototype.toUnsortedArray = function() {
      return this.nodes.slice();
    };
    XNodeSet.prototype.compareWithString = function(r, o) {
      var a = this.toUnsortedArray();
      for (var i = 0;i < a.length; i++) {
        var n = a[i];
        var l = new XString(this.stringForNode(n));
        var res = o(l, r);
        if (res.booleanValue()) {
          return res;
        }
      }
      return new XBoolean(false);
    };
    XNodeSet.prototype.compareWithNumber = function(r, o) {
      var a = this.toUnsortedArray();
      for (var i = 0;i < a.length; i++) {
        var n = a[i];
        var l = new XNumber(this.stringForNode(n));
        var res = o(l, r);
        if (res.booleanValue()) {
          return res;
        }
      }
      return new XBoolean(false);
    };
    XNodeSet.prototype.compareWithBoolean = function(r, o) {
      return o(this.bool(), r);
    };
    XNodeSet.prototype.compareWithNodeSet = function(r, o) {
      var arr = this.toUnsortedArray();
      var oInvert = function(lop, rop) {
        return o(rop, lop);
      };
      for (var i = 0;i < arr.length; i++) {
        var l = new XString(this.stringForNode(arr[i]));
        var res = r.compareWithString(l, oInvert);
        if (res.booleanValue()) {
          return res;
        }
      }
      return new XBoolean(false);
    };
    XNodeSet.compareWith = curry(function(o, r) {
      if (Utilities.instance_of(r, XString)) {
        return this.compareWithString(r, o);
      }
      if (Utilities.instance_of(r, XNumber)) {
        return this.compareWithNumber(r, o);
      }
      if (Utilities.instance_of(r, XBoolean)) {
        return this.compareWithBoolean(r, o);
      }
      return this.compareWithNodeSet(r, o);
    });
    XNodeSet.prototype.equals = XNodeSet.compareWith(Operators.equals);
    XNodeSet.prototype.notequal = XNodeSet.compareWith(Operators.notequal);
    XNodeSet.prototype.lessthan = XNodeSet.compareWith(Operators.lessthan);
    XNodeSet.prototype.greaterthan = XNodeSet.compareWith(Operators.greaterthan);
    XNodeSet.prototype.lessthanorequal = XNodeSet.compareWith(Operators.lessthanorequal);
    XNodeSet.prototype.greaterthanorequal = XNodeSet.compareWith(Operators.greaterthanorequal);
    XNodeSet.prototype.union = function(r) {
      var ns = new XNodeSet;
      ns.addArray(this.toUnsortedArray());
      ns.addArray(r.toUnsortedArray());
      return ns;
    };
    XPathNamespace.prototype = new Object;
    XPathNamespace.prototype.constructor = XPathNamespace;
    XPathNamespace.superclass = Object.prototype;
    function XPathNamespace(pre, node, uri, p) {
      this.isXPathNamespace = true;
      this.baseNode = node;
      this.ownerDocument = p.ownerDocument;
      this.nodeName = pre;
      this.prefix = pre;
      this.localName = pre;
      this.namespaceURI = null;
      this.nodeValue = uri;
      this.ownerElement = p;
      this.nodeType = NodeTypes.NAMESPACE_NODE;
    }
    XPathNamespace.prototype.toString = function() {
      return '{ "' + this.prefix + '", "' + this.namespaceURI + '" }';
    };
    XPathContext.prototype = new Object;
    XPathContext.prototype.constructor = XPathContext;
    XPathContext.superclass = Object.prototype;
    function XPathContext(vr, nr, fr) {
      this.variableResolver = vr != null ? vr : new VariableResolver;
      this.namespaceResolver = nr != null ? nr : new NamespaceResolver;
      this.functionResolver = fr != null ? fr : new FunctionResolver;
    }
    XPathContext.prototype.extend = function(newProps) {
      return assign(new XPathContext, this, newProps);
    };
    VariableResolver.prototype = new Object;
    VariableResolver.prototype.constructor = VariableResolver;
    VariableResolver.superclass = Object.prototype;
    function VariableResolver() {}
    VariableResolver.prototype.getVariable = function(ln, ns) {
      return null;
    };
    FunctionResolver.prototype = new Object;
    FunctionResolver.prototype.constructor = FunctionResolver;
    FunctionResolver.superclass = Object.prototype;
    function FunctionResolver(thisArg) {
      this.thisArg = thisArg != null ? thisArg : Functions;
      this.functions = new Object;
      this.addStandardFunctions();
    }
    FunctionResolver.prototype.addStandardFunctions = function() {
      this.functions["{}last"] = Functions.last;
      this.functions["{}position"] = Functions.position;
      this.functions["{}count"] = Functions.count;
      this.functions["{}id"] = Functions.id;
      this.functions["{}local-name"] = Functions.localName;
      this.functions["{}namespace-uri"] = Functions.namespaceURI;
      this.functions["{}name"] = Functions.name;
      this.functions["{}string"] = Functions.string;
      this.functions["{}concat"] = Functions.concat;
      this.functions["{}starts-with"] = Functions.startsWith;
      this.functions["{}contains"] = Functions.contains;
      this.functions["{}substring-before"] = Functions.substringBefore;
      this.functions["{}substring-after"] = Functions.substringAfter;
      this.functions["{}substring"] = Functions.substring;
      this.functions["{}string-length"] = Functions.stringLength;
      this.functions["{}normalize-space"] = Functions.normalizeSpace;
      this.functions["{}translate"] = Functions.translate;
      this.functions["{}boolean"] = Functions.boolean_;
      this.functions["{}not"] = Functions.not;
      this.functions["{}true"] = Functions.true_;
      this.functions["{}false"] = Functions.false_;
      this.functions["{}lang"] = Functions.lang;
      this.functions["{}number"] = Functions.number;
      this.functions["{}sum"] = Functions.sum;
      this.functions["{}floor"] = Functions.floor;
      this.functions["{}ceiling"] = Functions.ceiling;
      this.functions["{}round"] = Functions.round;
    };
    FunctionResolver.prototype.addFunction = function(ns, ln, f) {
      this.functions["{" + ns + "}" + ln] = f;
    };
    FunctionResolver.getFunctionFromContext = function(qName, context) {
      var parts = Utilities.resolveQName(qName, context.namespaceResolver, context.contextNode, false);
      if (parts[0] === null) {
        throw new Error("Cannot resolve QName " + name);
      }
      return context.functionResolver.getFunction(parts[1], parts[0]);
    };
    FunctionResolver.prototype.getFunction = function(localName, namespace) {
      return this.functions["{" + namespace + "}" + localName];
    };
    NamespaceResolver.prototype = new Object;
    NamespaceResolver.prototype.constructor = NamespaceResolver;
    NamespaceResolver.superclass = Object.prototype;
    function NamespaceResolver() {}
    NamespaceResolver.prototype.getNamespace = function(prefix, n) {
      if (prefix == "xml") {
        return XPath.XML_NAMESPACE_URI;
      } else if (prefix == "xmlns") {
        return XPath.XMLNS_NAMESPACE_URI;
      }
      if (n.nodeType == NodeTypes.DOCUMENT_NODE) {
        n = n.documentElement;
      } else if (n.nodeType == NodeTypes.ATTRIBUTE_NODE) {
        n = PathExpr.getOwnerElement(n);
      } else if (n.nodeType != NodeTypes.ELEMENT_NODE) {
        n = n.parentNode;
      }
      while (n != null && n.nodeType == NodeTypes.ELEMENT_NODE) {
        var nnm = n.attributes;
        for (var i = 0;i < nnm.length; i++) {
          var a = nnm.item(i);
          var aname = a.name || a.nodeName;
          if (aname === "xmlns" && prefix === "" || aname === "xmlns:" + prefix) {
            return String(a.value || a.nodeValue);
          }
        }
        n = n.parentNode;
      }
      return null;
    };
    var Functions = new Object;
    Functions.last = function(c) {
      if (arguments.length != 1) {
        throw new Error("Function last expects ()");
      }
      return new XNumber(c.contextSize);
    };
    Functions.position = function(c) {
      if (arguments.length != 1) {
        throw new Error("Function position expects ()");
      }
      return new XNumber(c.contextPosition);
    };
    Functions.count = function() {
      var c = arguments[0];
      var ns;
      if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
        throw new Error("Function count expects (node-set)");
      }
      return new XNumber(ns.size);
    };
    Functions.id = function() {
      var c = arguments[0];
      var id;
      if (arguments.length != 2) {
        throw new Error("Function id expects (object)");
      }
      id = arguments[1].evaluate(c);
      if (Utilities.instance_of(id, XNodeSet)) {
        id = id.toArray().join(" ");
      } else {
        id = id.stringValue();
      }
      var ids = id.split(/[\x0d\x0a\x09\x20]+/);
      var count = 0;
      var ns = new XNodeSet;
      var doc = c.contextNode.nodeType == NodeTypes.DOCUMENT_NODE ? c.contextNode : c.contextNode.ownerDocument;
      for (var i = 0;i < ids.length; i++) {
        var n;
        if (doc.getElementById) {
          n = doc.getElementById(ids[i]);
        } else {
          n = Utilities.getElementById(doc, ids[i]);
        }
        if (n != null) {
          ns.add(n);
          count++;
        }
      }
      return ns;
    };
    Functions.localName = function(c, eNode) {
      var n;
      if (arguments.length == 1) {
        n = c.contextNode;
      } else if (arguments.length == 2) {
        n = eNode.evaluate(c).first();
      } else {
        throw new Error("Function local-name expects (node-set?)");
      }
      if (n == null) {
        return new XString("");
      }
      return new XString(n.localName || n.baseName || n.target || n.nodeName || "");
    };
    Functions.namespaceURI = function() {
      var c = arguments[0];
      var n;
      if (arguments.length == 1) {
        n = c.contextNode;
      } else if (arguments.length == 2) {
        n = arguments[1].evaluate(c).first();
      } else {
        throw new Error("Function namespace-uri expects (node-set?)");
      }
      if (n == null) {
        return new XString("");
      }
      return new XString(n.namespaceURI || "");
    };
    Functions.name = function() {
      var c = arguments[0];
      var n;
      if (arguments.length == 1) {
        n = c.contextNode;
      } else if (arguments.length == 2) {
        n = arguments[1].evaluate(c).first();
      } else {
        throw new Error("Function name expects (node-set?)");
      }
      if (n == null) {
        return new XString("");
      }
      if (n.nodeType == NodeTypes.ELEMENT_NODE) {
        return new XString(n.nodeName);
      } else if (n.nodeType == NodeTypes.ATTRIBUTE_NODE) {
        return new XString(n.name || n.nodeName);
      } else if (n.nodeType === NodeTypes.PROCESSING_INSTRUCTION_NODE) {
        return new XString(n.target || n.nodeName);
      } else if (n.localName == null) {
        return new XString("");
      } else {
        return new XString(n.localName);
      }
    };
    Functions.string = function() {
      var c = arguments[0];
      if (arguments.length == 1) {
        return new XString(XNodeSet.prototype.stringForNode(c.contextNode));
      } else if (arguments.length == 2) {
        return arguments[1].evaluate(c).string();
      }
      throw new Error("Function string expects (object?)");
    };
    Functions.concat = function(c) {
      if (arguments.length < 3) {
        throw new Error("Function concat expects (string, string[, string]*)");
      }
      var s = "";
      for (var i = 1;i < arguments.length; i++) {
        s += arguments[i].evaluate(c).stringValue();
      }
      return new XString(s);
    };
    Functions.startsWith = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function startsWith expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      return new XBoolean(s1.substring(0, s2.length) == s2);
    };
    Functions.contains = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function contains expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      return new XBoolean(s1.indexOf(s2) !== -1);
    };
    Functions.substringBefore = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function substring-before expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      return new XString(s1.substring(0, s1.indexOf(s2)));
    };
    Functions.substringAfter = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function substring-after expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      if (s2.length == 0) {
        return new XString(s1);
      }
      var i = s1.indexOf(s2);
      if (i == -1) {
        return new XString("");
      }
      return new XString(s1.substring(i + s2.length));
    };
    Functions.substring = function() {
      var c = arguments[0];
      if (!(arguments.length == 3 || arguments.length == 4)) {
        throw new Error("Function substring expects (string, number, number?)");
      }
      var s = arguments[1].evaluate(c).stringValue();
      var n1 = Math.round(arguments[2].evaluate(c).numberValue()) - 1;
      var n2 = arguments.length == 4 ? n1 + Math.round(arguments[3].evaluate(c).numberValue()) : undefined;
      return new XString(s.substring(n1, n2));
    };
    Functions.stringLength = function() {
      var c = arguments[0];
      var s;
      if (arguments.length == 1) {
        s = XNodeSet.prototype.stringForNode(c.contextNode);
      } else if (arguments.length == 2) {
        s = arguments[1].evaluate(c).stringValue();
      } else {
        throw new Error("Function string-length expects (string?)");
      }
      return new XNumber(s.length);
    };
    Functions.normalizeSpace = function() {
      var c = arguments[0];
      var s;
      if (arguments.length == 1) {
        s = XNodeSet.prototype.stringForNode(c.contextNode);
      } else if (arguments.length == 2) {
        s = arguments[1].evaluate(c).stringValue();
      } else {
        throw new Error("Function normalize-space expects (string?)");
      }
      var i = 0;
      var j = s.length - 1;
      while (Utilities.isSpace(s.charCodeAt(j))) {
        j--;
      }
      var t = "";
      while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
        i++;
      }
      while (i <= j) {
        if (Utilities.isSpace(s.charCodeAt(i))) {
          t += " ";
          while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
            i++;
          }
        } else {
          t += s.charAt(i);
          i++;
        }
      }
      return new XString(t);
    };
    Functions.translate = function(c, eValue, eFrom, eTo) {
      if (arguments.length != 4) {
        throw new Error("Function translate expects (string, string, string)");
      }
      var value = eValue.evaluate(c).stringValue();
      var from = eFrom.evaluate(c).stringValue();
      var to = eTo.evaluate(c).stringValue();
      var cMap = reduce(function(acc, ch, i) {
        if (!(ch in acc)) {
          acc[ch] = i > to.length ? "" : to[i];
        }
        return acc;
      }, {}, from);
      var t = join("", map(function(ch) {
        return ch in cMap ? cMap[ch] : ch;
      }, value));
      return new XString(t);
    };
    Functions.boolean_ = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function boolean expects (object)");
      }
      return arguments[1].evaluate(c).bool();
    };
    Functions.not = function(c, eValue) {
      if (arguments.length != 2) {
        throw new Error("Function not expects (object)");
      }
      return eValue.evaluate(c).bool().not();
    };
    Functions.true_ = function() {
      if (arguments.length != 1) {
        throw new Error("Function true expects ()");
      }
      return XBoolean.true_;
    };
    Functions.false_ = function() {
      if (arguments.length != 1) {
        throw new Error("Function false expects ()");
      }
      return XBoolean.false_;
    };
    Functions.lang = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function lang expects (string)");
      }
      var lang;
      for (var n = c.contextNode;n != null && n.nodeType != NodeTypes.DOCUMENT_NODE; n = n.parentNode) {
        var a = n.getAttributeNS(XPath.XML_NAMESPACE_URI, "lang");
        if (a != null) {
          lang = String(a);
          break;
        }
      }
      if (lang == null) {
        return XBoolean.false_;
      }
      var s = arguments[1].evaluate(c).stringValue();
      return new XBoolean(lang.substring(0, s.length) == s && (lang.length == s.length || lang.charAt(s.length) == "-"));
    };
    Functions.number = function() {
      var c = arguments[0];
      if (!(arguments.length == 1 || arguments.length == 2)) {
        throw new Error("Function number expects (object?)");
      }
      if (arguments.length == 1) {
        return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
      }
      return arguments[1].evaluate(c).number();
    };
    Functions.sum = function() {
      var c = arguments[0];
      var ns;
      if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
        throw new Error("Function sum expects (node-set)");
      }
      ns = ns.toUnsortedArray();
      var n = 0;
      for (var i = 0;i < ns.length; i++) {
        n += new XNumber(XNodeSet.prototype.stringForNode(ns[i])).numberValue();
      }
      return new XNumber(n);
    };
    Functions.floor = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function floor expects (number)");
      }
      return new XNumber(Math.floor(arguments[1].evaluate(c).numberValue()));
    };
    Functions.ceiling = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function ceiling expects (number)");
      }
      return new XNumber(Math.ceil(arguments[1].evaluate(c).numberValue()));
    };
    Functions.round = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function round expects (number)");
      }
      return new XNumber(Math.round(arguments[1].evaluate(c).numberValue()));
    };
    var Utilities = new Object;
    var isAttributeLike = function(val) {
      return val && (val.nodeType === NodeTypes.ATTRIBUTE_NODE || val.ownerElement || val.isXPathNamespace);
    };
    Utilities.splitQName = function(qn) {
      var i = qn.indexOf(":");
      if (i == -1) {
        return [null, qn];
      }
      return [qn.substring(0, i), qn.substring(i + 1)];
    };
    Utilities.resolveQName = function(qn, nr, n, useDefault) {
      var parts = Utilities.splitQName(qn);
      if (parts[0] != null) {
        parts[0] = nr.getNamespace(parts[0], n);
      } else {
        if (useDefault) {
          parts[0] = nr.getNamespace("", n);
          if (parts[0] == null) {
            parts[0] = "";
          }
        } else {
          parts[0] = "";
        }
      }
      return parts;
    };
    Utilities.isSpace = function(c) {
      return c == 9 || c == 13 || c == 10 || c == 32;
    };
    Utilities.isLetter = function(c) {
      return c >= 65 && c <= 90 || c >= 97 && c <= 122 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 255 || c >= 256 && c <= 305 || c >= 308 && c <= 318 || c >= 321 && c <= 328 || c >= 330 && c <= 382 || c >= 384 && c <= 451 || c >= 461 && c <= 496 || c >= 500 && c <= 501 || c >= 506 && c <= 535 || c >= 592 && c <= 680 || c >= 699 && c <= 705 || c == 902 || c >= 904 && c <= 906 || c == 908 || c >= 910 && c <= 929 || c >= 931 && c <= 974 || c >= 976 && c <= 982 || c == 986 || c == 988 || c == 990 || c == 992 || c >= 994 && c <= 1011 || c >= 1025 && c <= 1036 || c >= 1038 && c <= 1103 || c >= 1105 && c <= 1116 || c >= 1118 && c <= 1153 || c >= 1168 && c <= 1220 || c >= 1223 && c <= 1224 || c >= 1227 && c <= 1228 || c >= 1232 && c <= 1259 || c >= 1262 && c <= 1269 || c >= 1272 && c <= 1273 || c >= 1329 && c <= 1366 || c == 1369 || c >= 1377 && c <= 1414 || c >= 1488 && c <= 1514 || c >= 1520 && c <= 1522 || c >= 1569 && c <= 1594 || c >= 1601 && c <= 1610 || c >= 1649 && c <= 1719 || c >= 1722 && c <= 1726 || c >= 1728 && c <= 1742 || c >= 1744 && c <= 1747 || c == 1749 || c >= 1765 && c <= 1766 || c >= 2309 && c <= 2361 || c == 2365 || c >= 2392 && c <= 2401 || c >= 2437 && c <= 2444 || c >= 2447 && c <= 2448 || c >= 2451 && c <= 2472 || c >= 2474 && c <= 2480 || c == 2482 || c >= 2486 && c <= 2489 || c >= 2524 && c <= 2525 || c >= 2527 && c <= 2529 || c >= 2544 && c <= 2545 || c >= 2565 && c <= 2570 || c >= 2575 && c <= 2576 || c >= 2579 && c <= 2600 || c >= 2602 && c <= 2608 || c >= 2610 && c <= 2611 || c >= 2613 && c <= 2614 || c >= 2616 && c <= 2617 || c >= 2649 && c <= 2652 || c == 2654 || c >= 2674 && c <= 2676 || c >= 2693 && c <= 2699 || c == 2701 || c >= 2703 && c <= 2705 || c >= 2707 && c <= 2728 || c >= 2730 && c <= 2736 || c >= 2738 && c <= 2739 || c >= 2741 && c <= 2745 || c == 2749 || c == 2784 || c >= 2821 && c <= 2828 || c >= 2831 && c <= 2832 || c >= 2835 && c <= 2856 || c >= 2858 && c <= 2864 || c >= 2866 && c <= 2867 || c >= 2870 && c <= 2873 || c == 2877 || c >= 2908 && c <= 2909 || c >= 2911 && c <= 2913 || c >= 2949 && c <= 2954 || c >= 2958 && c <= 2960 || c >= 2962 && c <= 2965 || c >= 2969 && c <= 2970 || c == 2972 || c >= 2974 && c <= 2975 || c >= 2979 && c <= 2980 || c >= 2984 && c <= 2986 || c >= 2990 && c <= 2997 || c >= 2999 && c <= 3001 || c >= 3077 && c <= 3084 || c >= 3086 && c <= 3088 || c >= 3090 && c <= 3112 || c >= 3114 && c <= 3123 || c >= 3125 && c <= 3129 || c >= 3168 && c <= 3169 || c >= 3205 && c <= 3212 || c >= 3214 && c <= 3216 || c >= 3218 && c <= 3240 || c >= 3242 && c <= 3251 || c >= 3253 && c <= 3257 || c == 3294 || c >= 3296 && c <= 3297 || c >= 3333 && c <= 3340 || c >= 3342 && c <= 3344 || c >= 3346 && c <= 3368 || c >= 3370 && c <= 3385 || c >= 3424 && c <= 3425 || c >= 3585 && c <= 3630 || c == 3632 || c >= 3634 && c <= 3635 || c >= 3648 && c <= 3653 || c >= 3713 && c <= 3714 || c == 3716 || c >= 3719 && c <= 3720 || c == 3722 || c == 3725 || c >= 3732 && c <= 3735 || c >= 3737 && c <= 3743 || c >= 3745 && c <= 3747 || c == 3749 || c == 3751 || c >= 3754 && c <= 3755 || c >= 3757 && c <= 3758 || c == 3760 || c >= 3762 && c <= 3763 || c == 3773 || c >= 3776 && c <= 3780 || c >= 3904 && c <= 3911 || c >= 3913 && c <= 3945 || c >= 4256 && c <= 4293 || c >= 4304 && c <= 4342 || c == 4352 || c >= 4354 && c <= 4355 || c >= 4357 && c <= 4359 || c == 4361 || c >= 4363 && c <= 4364 || c >= 4366 && c <= 4370 || c == 4412 || c == 4414 || c == 4416 || c == 4428 || c == 4430 || c == 4432 || c >= 4436 && c <= 4437 || c == 4441 || c >= 4447 && c <= 4449 || c == 4451 || c == 4453 || c == 4455 || c == 4457 || c >= 4461 && c <= 4462 || c >= 4466 && c <= 4467 || c == 4469 || c == 4510 || c == 4520 || c == 4523 || c >= 4526 && c <= 4527 || c >= 4535 && c <= 4536 || c == 4538 || c >= 4540 && c <= 4546 || c == 4587 || c == 4592 || c == 4601 || c >= 7680 && c <= 7835 || c >= 7840 && c <= 7929 || c >= 7936 && c <= 7957 || c >= 7960 && c <= 7965 || c >= 7968 && c <= 8005 || c >= 8008 && c <= 8013 || c >= 8016 && c <= 8023 || c == 8025 || c == 8027 || c == 8029 || c >= 8031 && c <= 8061 || c >= 8064 && c <= 8116 || c >= 8118 && c <= 8124 || c == 8126 || c >= 8130 && c <= 8132 || c >= 8134 && c <= 8140 || c >= 8144 && c <= 8147 || c >= 8150 && c <= 8155 || c >= 8160 && c <= 8172 || c >= 8178 && c <= 8180 || c >= 8182 && c <= 8188 || c == 8486 || c >= 8490 && c <= 8491 || c == 8494 || c >= 8576 && c <= 8578 || c >= 12353 && c <= 12436 || c >= 12449 && c <= 12538 || c >= 12549 && c <= 12588 || c >= 44032 && c <= 55203 || c >= 19968 && c <= 40869 || c == 12295 || c >= 12321 && c <= 12329;
    };
    Utilities.isNCNameChar = function(c) {
      return c >= 48 && c <= 57 || c >= 1632 && c <= 1641 || c >= 1776 && c <= 1785 || c >= 2406 && c <= 2415 || c >= 2534 && c <= 2543 || c >= 2662 && c <= 2671 || c >= 2790 && c <= 2799 || c >= 2918 && c <= 2927 || c >= 3047 && c <= 3055 || c >= 3174 && c <= 3183 || c >= 3302 && c <= 3311 || c >= 3430 && c <= 3439 || c >= 3664 && c <= 3673 || c >= 3792 && c <= 3801 || c >= 3872 && c <= 3881 || c == 46 || c == 45 || c == 95 || Utilities.isLetter(c) || c >= 768 && c <= 837 || c >= 864 && c <= 865 || c >= 1155 && c <= 1158 || c >= 1425 && c <= 1441 || c >= 1443 && c <= 1465 || c >= 1467 && c <= 1469 || c == 1471 || c >= 1473 && c <= 1474 || c == 1476 || c >= 1611 && c <= 1618 || c == 1648 || c >= 1750 && c <= 1756 || c >= 1757 && c <= 1759 || c >= 1760 && c <= 1764 || c >= 1767 && c <= 1768 || c >= 1770 && c <= 1773 || c >= 2305 && c <= 2307 || c == 2364 || c >= 2366 && c <= 2380 || c == 2381 || c >= 2385 && c <= 2388 || c >= 2402 && c <= 2403 || c >= 2433 && c <= 2435 || c == 2492 || c == 2494 || c == 2495 || c >= 2496 && c <= 2500 || c >= 2503 && c <= 2504 || c >= 2507 && c <= 2509 || c == 2519 || c >= 2530 && c <= 2531 || c == 2562 || c == 2620 || c == 2622 || c == 2623 || c >= 2624 && c <= 2626 || c >= 2631 && c <= 2632 || c >= 2635 && c <= 2637 || c >= 2672 && c <= 2673 || c >= 2689 && c <= 2691 || c == 2748 || c >= 2750 && c <= 2757 || c >= 2759 && c <= 2761 || c >= 2763 && c <= 2765 || c >= 2817 && c <= 2819 || c == 2876 || c >= 2878 && c <= 2883 || c >= 2887 && c <= 2888 || c >= 2891 && c <= 2893 || c >= 2902 && c <= 2903 || c >= 2946 && c <= 2947 || c >= 3006 && c <= 3010 || c >= 3014 && c <= 3016 || c >= 3018 && c <= 3021 || c == 3031 || c >= 3073 && c <= 3075 || c >= 3134 && c <= 3140 || c >= 3142 && c <= 3144 || c >= 3146 && c <= 3149 || c >= 3157 && c <= 3158 || c >= 3202 && c <= 3203 || c >= 3262 && c <= 3268 || c >= 3270 && c <= 3272 || c >= 3274 && c <= 3277 || c >= 3285 && c <= 3286 || c >= 3330 && c <= 3331 || c >= 3390 && c <= 3395 || c >= 3398 && c <= 3400 || c >= 3402 && c <= 3405 || c == 3415 || c == 3633 || c >= 3636 && c <= 3642 || c >= 3655 && c <= 3662 || c == 3761 || c >= 3764 && c <= 3769 || c >= 3771 && c <= 3772 || c >= 3784 && c <= 3789 || c >= 3864 && c <= 3865 || c == 3893 || c == 3895 || c == 3897 || c == 3902 || c == 3903 || c >= 3953 && c <= 3972 || c >= 3974 && c <= 3979 || c >= 3984 && c <= 3989 || c == 3991 || c >= 3993 && c <= 4013 || c >= 4017 && c <= 4023 || c == 4025 || c >= 8400 && c <= 8412 || c == 8417 || c >= 12330 && c <= 12335 || c == 12441 || c == 12442 || c == 183 || c == 720 || c == 721 || c == 903 || c == 1600 || c == 3654 || c == 3782 || c == 12293 || c >= 12337 && c <= 12341 || c >= 12445 && c <= 12446 || c >= 12540 && c <= 12542;
    };
    Utilities.coalesceText = function(n) {
      for (var m = n.firstChild;m != null; m = m.nextSibling) {
        if (m.nodeType == NodeTypes.TEXT_NODE || m.nodeType == NodeTypes.CDATA_SECTION_NODE) {
          var s = m.nodeValue;
          var first = m;
          m = m.nextSibling;
          while (m != null && (m.nodeType == NodeTypes.TEXT_NODE || m.nodeType == NodeTypes.CDATA_SECTION_NODE)) {
            s += m.nodeValue;
            var del = m;
            m = m.nextSibling;
            del.parentNode.removeChild(del);
          }
          if (first.nodeType == NodeTypes.CDATA_SECTION_NODE) {
            var p = first.parentNode;
            if (first.nextSibling == null) {
              p.removeChild(first);
              p.appendChild(p.ownerDocument.createTextNode(s));
            } else {
              var next = first.nextSibling;
              p.removeChild(first);
              p.insertBefore(p.ownerDocument.createTextNode(s), next);
            }
          } else {
            first.nodeValue = s;
          }
          if (m == null) {
            break;
          }
        } else if (m.nodeType == NodeTypes.ELEMENT_NODE) {
          Utilities.coalesceText(m);
        }
      }
    };
    Utilities.instance_of = function(o, c) {
      while (o != null) {
        if (o.constructor === c) {
          return true;
        }
        if (o === Object) {
          return false;
        }
        o = o.constructor.superclass;
      }
      return false;
    };
    Utilities.getElementById = function(n, id) {
      if (n.nodeType == NodeTypes.ELEMENT_NODE) {
        if (n.getAttribute("id") == id || n.getAttributeNS(null, "id") == id) {
          return n;
        }
      }
      for (var m = n.firstChild;m != null; m = m.nextSibling) {
        var res = Utilities.getElementById(m, id);
        if (res != null) {
          return res;
        }
      }
      return null;
    };
    var XPathException = function() {
      function getMessage(code, exception) {
        var msg = exception ? ": " + exception.toString() : "";
        switch (code) {
          case XPathException2.INVALID_EXPRESSION_ERR:
            return "Invalid expression" + msg;
          case XPathException2.TYPE_ERR:
            return "Type error" + msg;
        }
        return null;
      }
      function XPathException2(code, error, message) {
        var err = Error.call(this, getMessage(code, error) || message);
        err.code = code;
        err.exception = error;
        return err;
      }
      XPathException2.prototype = Object.create(Error.prototype);
      XPathException2.prototype.constructor = XPathException2;
      XPathException2.superclass = Error;
      XPathException2.prototype.toString = function() {
        return this.message;
      };
      XPathException2.fromMessage = function(message, error) {
        return new XPathException2(null, error, message);
      };
      XPathException2.INVALID_EXPRESSION_ERR = 51;
      XPathException2.TYPE_ERR = 52;
      return XPathException2;
    }();
    XPathExpression.prototype = {};
    XPathExpression.prototype.constructor = XPathExpression;
    XPathExpression.superclass = Object.prototype;
    function XPathExpression(e, r, p) {
      this.xpath = p.parse(e);
      this.context = new XPathContext;
      this.context.namespaceResolver = new XPathNSResolverWrapper(r);
    }
    XPathExpression.getOwnerDocument = function(n) {
      return n.nodeType === NodeTypes.DOCUMENT_NODE ? n : n.ownerDocument;
    };
    XPathExpression.detectHtmlDom = function(n) {
      if (!n) {
        return false;
      }
      var doc = XPathExpression.getOwnerDocument(n);
      try {
        return doc.implementation.hasFeature("HTML", "2.0");
      } catch (e) {
        return true;
      }
    };
    XPathExpression.prototype.evaluate = function(n, t, res) {
      this.context.expressionContextNode = n;
      this.context.caseInsensitive = XPathExpression.detectHtmlDom(n);
      var result = this.xpath.evaluate(this.context);
      return new XPathResult(result, t);
    };
    XPathNSResolverWrapper.prototype = {};
    XPathNSResolverWrapper.prototype.constructor = XPathNSResolverWrapper;
    XPathNSResolverWrapper.superclass = Object.prototype;
    function XPathNSResolverWrapper(r) {
      this.xpathNSResolver = r;
    }
    XPathNSResolverWrapper.prototype.getNamespace = function(prefix, n) {
      if (this.xpathNSResolver == null) {
        return null;
      }
      return this.xpathNSResolver.lookupNamespaceURI(prefix);
    };
    NodeXPathNSResolver.prototype = {};
    NodeXPathNSResolver.prototype.constructor = NodeXPathNSResolver;
    NodeXPathNSResolver.superclass = Object.prototype;
    function NodeXPathNSResolver(n) {
      this.node = n;
      this.namespaceResolver = new NamespaceResolver;
    }
    NodeXPathNSResolver.prototype.lookupNamespaceURI = function(prefix) {
      return this.namespaceResolver.getNamespace(prefix, this.node);
    };
    XPathResult.prototype = {};
    XPathResult.prototype.constructor = XPathResult;
    XPathResult.superclass = Object.prototype;
    function XPathResult(v, t) {
      if (t == XPathResult.ANY_TYPE) {
        if (v.constructor === XString) {
          t = XPathResult.STRING_TYPE;
        } else if (v.constructor === XNumber) {
          t = XPathResult.NUMBER_TYPE;
        } else if (v.constructor === XBoolean) {
          t = XPathResult.BOOLEAN_TYPE;
        } else if (v.constructor === XNodeSet) {
          t = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
        }
      }
      this.resultType = t;
      switch (t) {
        case XPathResult.NUMBER_TYPE:
          this.numberValue = v.numberValue();
          return;
        case XPathResult.STRING_TYPE:
          this.stringValue = v.stringValue();
          return;
        case XPathResult.BOOLEAN_TYPE:
          this.booleanValue = v.booleanValue();
          return;
        case XPathResult.ANY_UNORDERED_NODE_TYPE:
        case XPathResult.FIRST_ORDERED_NODE_TYPE:
          if (v.constructor === XNodeSet) {
            this.singleNodeValue = v.first();
            return;
          }
          break;
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
        case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
          if (v.constructor === XNodeSet) {
            this.invalidIteratorState = false;
            this.nodes = v.toArray();
            this.iteratorIndex = 0;
            return;
          }
          break;
        case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
        case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
          if (v.constructor === XNodeSet) {
            this.nodes = v.toArray();
            this.snapshotLength = this.nodes.length;
            return;
          }
          break;
      }
      throw new XPathException(XPathException.TYPE_ERR);
    }
    XPathResult.prototype.iterateNext = function() {
      if (this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE && this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
        throw new XPathException(XPathException.TYPE_ERR);
      }
      return this.nodes[this.iteratorIndex++];
    };
    XPathResult.prototype.snapshotItem = function(i) {
      if (this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE && this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
        throw new XPathException(XPathException.TYPE_ERR);
      }
      return this.nodes[i];
    };
    XPathResult.ANY_TYPE = 0;
    XPathResult.NUMBER_TYPE = 1;
    XPathResult.STRING_TYPE = 2;
    XPathResult.BOOLEAN_TYPE = 3;
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE = 4;
    XPathResult.ORDERED_NODE_ITERATOR_TYPE = 5;
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7;
    XPathResult.ANY_UNORDERED_NODE_TYPE = 8;
    XPathResult.FIRST_ORDERED_NODE_TYPE = 9;
    function installDOM3XPathSupport(doc, p) {
      doc.createExpression = function(e, r) {
        try {
          return new XPathExpression(e, r, p);
        } catch (e2) {
          throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e2);
        }
      };
      doc.createNSResolver = function(n) {
        return new NodeXPathNSResolver(n);
      };
      doc.evaluate = function(e, cn, r, t, res) {
        if (t < 0 || t > 9) {
          throw { code: 0, toString: function() {
            return "Request type not supported";
          } };
        }
        return doc.createExpression(e, r, p).evaluate(cn, t, res);
      };
    }
    try {
      var shouldInstall = true;
      try {
        if (document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("XPath", null)) {
          shouldInstall = false;
        }
      } catch (e) {}
      if (shouldInstall) {
        installDOM3XPathSupport(document, new XPathParser);
      }
    } catch (e) {}
    installDOM3XPathSupport(exports2, new XPathParser);
    (function() {
      var parser = new XPathParser;
      var defaultNSResolver = new NamespaceResolver;
      var defaultFunctionResolver = new FunctionResolver;
      var defaultVariableResolver = new VariableResolver;
      function makeNSResolverFromFunction(func) {
        return {
          getNamespace: function(prefix, node) {
            var ns = func(prefix, node);
            return ns || defaultNSResolver.getNamespace(prefix, node);
          }
        };
      }
      function makeNSResolverFromObject(obj) {
        return makeNSResolverFromFunction(obj.getNamespace.bind(obj));
      }
      function makeNSResolverFromMap(map2) {
        return makeNSResolverFromFunction(function(prefix) {
          return map2[prefix];
        });
      }
      function makeNSResolver(resolver) {
        if (resolver && typeof resolver.getNamespace === "function") {
          return makeNSResolverFromObject(resolver);
        }
        if (typeof resolver === "function") {
          return makeNSResolverFromFunction(resolver);
        }
        if (typeof resolver === "object") {
          return makeNSResolverFromMap(resolver);
        }
        return defaultNSResolver;
      }
      function convertValue(value) {
        if (value === null || typeof value === "undefined" || value instanceof XString || value instanceof XBoolean || value instanceof XNumber || value instanceof XNodeSet) {
          return value;
        }
        switch (typeof value) {
          case "string":
            return new XString(value);
          case "boolean":
            return new XBoolean(value);
          case "number":
            return new XNumber(value);
        }
        var ns = new XNodeSet;
        ns.addArray([].concat(value));
        return ns;
      }
      function makeEvaluator(func) {
        return function(context) {
          var args = Array.prototype.slice.call(arguments, 1).map(function(arg) {
            return arg.evaluate(context);
          });
          var result = func.apply(this, [].concat(context, args));
          return convertValue(result);
        };
      }
      function makeFunctionResolverFromFunction(func) {
        return {
          getFunction: function(name2, namespace) {
            var found = func(name2, namespace);
            if (found) {
              return makeEvaluator(found);
            }
            return defaultFunctionResolver.getFunction(name2, namespace);
          }
        };
      }
      function makeFunctionResolverFromObject(obj) {
        return makeFunctionResolverFromFunction(obj.getFunction.bind(obj));
      }
      function makeFunctionResolverFromMap(map2) {
        return makeFunctionResolverFromFunction(function(name2) {
          return map2[name2];
        });
      }
      function makeFunctionResolver(resolver) {
        if (resolver && typeof resolver.getFunction === "function") {
          return makeFunctionResolverFromObject(resolver);
        }
        if (typeof resolver === "function") {
          return makeFunctionResolverFromFunction(resolver);
        }
        if (typeof resolver === "object") {
          return makeFunctionResolverFromMap(resolver);
        }
        return defaultFunctionResolver;
      }
      function makeVariableResolverFromFunction(func) {
        return {
          getVariable: function(name2, namespace) {
            var value = func(name2, namespace);
            return convertValue(value);
          }
        };
      }
      function makeVariableResolver(resolver) {
        if (resolver) {
          if (typeof resolver.getVariable === "function") {
            return makeVariableResolverFromFunction(resolver.getVariable.bind(resolver));
          }
          if (typeof resolver === "function") {
            return makeVariableResolverFromFunction(resolver);
          }
          if (typeof resolver === "object") {
            return makeVariableResolverFromFunction(function(name2) {
              return resolver[name2];
            });
          }
        }
        return defaultVariableResolver;
      }
      function copyIfPresent(prop, dest, source) {
        if (prop in source) {
          dest[prop] = source[prop];
        }
      }
      function makeContext(options) {
        var context = new XPathContext;
        if (options) {
          context.namespaceResolver = makeNSResolver(options.namespaces);
          context.functionResolver = makeFunctionResolver(options.functions);
          context.variableResolver = makeVariableResolver(options.variables);
          context.expressionContextNode = options.node;
          copyIfPresent("allowAnyNamespaceForNoPrefix", context, options);
          copyIfPresent("isHtml", context, options);
        } else {
          context.namespaceResolver = defaultNSResolver;
        }
        return context;
      }
      function evaluate(parsedExpression, options) {
        var context = makeContext(options);
        return parsedExpression.evaluate(context);
      }
      var evaluatorPrototype = {
        evaluate: function(options) {
          return evaluate(this.expression, options);
        },
        evaluateNumber: function(options) {
          return this.evaluate(options).numberValue();
        },
        evaluateString: function(options) {
          return this.evaluate(options).stringValue();
        },
        evaluateBoolean: function(options) {
          return this.evaluate(options).booleanValue();
        },
        evaluateNodeSet: function(options) {
          return this.evaluate(options).nodeset();
        },
        select: function(options) {
          return this.evaluateNodeSet(options).toArray();
        },
        select1: function(options) {
          return this.select(options)[0];
        }
      };
      function parse(xpath2) {
        var parsed = parser.parse(xpath2);
        return Object.create(evaluatorPrototype, {
          expression: {
            value: parsed
          }
        });
      }
      exports2.parse = parse;
    })();
    assign(exports2, {
      XPath,
      XPathParser,
      XPathResult,
      Step,
      PathExpr,
      NodeTest,
      LocationPath,
      OrOperation,
      AndOperation,
      BarOperation,
      EqualsOperation,
      NotEqualOperation,
      LessThanOperation,
      GreaterThanOperation,
      LessThanOrEqualOperation,
      GreaterThanOrEqualOperation,
      PlusOperation,
      MinusOperation,
      MultiplyOperation,
      DivOperation,
      ModOperation,
      UnaryMinusOperation,
      FunctionCall,
      VariableReference,
      XPathContext,
      XNodeSet,
      XBoolean,
      XString,
      XNumber,
      NamespaceResolver,
      FunctionResolver,
      VariableResolver,
      Utilities
    });
    exports2.select = function(e, doc, single) {
      return exports2.selectWithResolver(e, doc, null, single);
    };
    exports2.useNamespaces = function(mappings) {
      var resolver = {
        mappings: mappings || {},
        lookupNamespaceURI: function(prefix) {
          return this.mappings[prefix];
        }
      };
      return function(e, doc, single) {
        return exports2.selectWithResolver(e, doc, resolver, single);
      };
    };
    exports2.selectWithResolver = function(e, doc, resolver, single) {
      var expression = new XPathExpression(e, resolver, new XPathParser);
      var type = XPathResult.ANY_TYPE;
      var result = expression.evaluate(doc, type, null);
      if (result.resultType == XPathResult.STRING_TYPE) {
        result = result.stringValue;
      } else if (result.resultType == XPathResult.NUMBER_TYPE) {
        result = result.numberValue;
      } else if (result.resultType == XPathResult.BOOLEAN_TYPE) {
        result = result.booleanValue;
      } else {
        result = result.nodes;
        if (single) {
          result = result[0];
        }
      }
      return result;
    };
    exports2.select1 = function(e, doc) {
      return exports2.select(e, doc, true);
    };
    var isArrayOfNodes = function(value) {
      return Array.isArray(value) && value.every(isNodeLike);
    };
    var isNodeOfType = function(type) {
      return function(value) {
        return isNodeLike(value) && value.nodeType === type;
      };
    };
    assign(exports2, {
      isNodeLike,
      isArrayOfNodes,
      isElement: isNodeOfType(NodeTypes.ELEMENT_NODE),
      isAttribute: isNodeOfType(NodeTypes.ATTRIBUTE_NODE),
      isTextNode: isNodeOfType(NodeTypes.TEXT_NODE),
      isCDATASection: isNodeOfType(NodeTypes.CDATA_SECTION_NODE),
      isProcessingInstruction: isNodeOfType(NodeTypes.PROCESSING_INSTRUCTION_NODE),
      isComment: isNodeOfType(NodeTypes.COMMENT_NODE),
      isDocumentNode: isNodeOfType(NodeTypes.DOCUMENT_NODE),
      isDocumentTypeNode: isNodeOfType(NodeTypes.DOCUMENT_TYPE_NODE),
      isDocumentFragment: isNodeOfType(NodeTypes.DOCUMENT_FRAGMENT_NODE)
    });
  })(xpath);
});

// src/report-generator.ts
import * as fs from "node:fs";
import * as path2 from "node:path";

// node_modules/minimatch/dist/esm/index.js
var import_brace_expansion = __toESM(require_brace_expansion(), 1);

// node_modules/minimatch/dist/esm/assert-valid-pattern.js
var MAX_PATTERN_LENGTH = 1024 * 64;
var assertValidPattern = (pattern) => {
  if (typeof pattern !== "string") {
    throw new TypeError("invalid pattern");
  }
  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new TypeError("pattern is too long");
  }
};

// node_modules/minimatch/dist/esm/brace-expressions.js
var posixClasses = {
  "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
  "[:alpha:]": ["\\p{L}\\p{Nl}", true],
  "[:ascii:]": ["\\x" + "00-\\x" + "7f", false],
  "[:blank:]": ["\\p{Zs}\\t", true],
  "[:cntrl:]": ["\\p{Cc}", true],
  "[:digit:]": ["\\p{Nd}", true],
  "[:graph:]": ["\\p{Z}\\p{C}", true, true],
  "[:lower:]": ["\\p{Ll}", true],
  "[:print:]": ["\\p{C}", true],
  "[:punct:]": ["\\p{P}", true],
  "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
  "[:upper:]": ["\\p{Lu}", true],
  "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
  "[:xdigit:]": ["A-Fa-f0-9", false]
};
var braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
var regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var rangesToString = (ranges) => ranges.join("");
var parseClass = (glob, position) => {
  const pos = position;
  if (glob.charAt(pos) !== "[") {
    throw new Error("not in a brace expression");
  }
  const ranges = [];
  const negs = [];
  let i = pos + 1;
  let sawStart = false;
  let uflag = false;
  let escaping = false;
  let negate = false;
  let endPos = pos;
  let rangeStart = "";
  WHILE:
    while (i < glob.length) {
      const c = glob.charAt(i);
      if ((c === "!" || c === "^") && i === pos + 1) {
        negate = true;
        i++;
        continue;
      }
      if (c === "]" && sawStart && !escaping) {
        endPos = i + 1;
        break;
      }
      sawStart = true;
      if (c === "\\") {
        if (!escaping) {
          escaping = true;
          i++;
          continue;
        }
      }
      if (c === "[" && !escaping) {
        for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) {
          if (glob.startsWith(cls, i)) {
            if (rangeStart) {
              return ["$.", false, glob.length - pos, true];
            }
            i += cls.length;
            if (neg)
              negs.push(unip);
            else
              ranges.push(unip);
            uflag = uflag || u;
            continue WHILE;
          }
        }
      }
      escaping = false;
      if (rangeStart) {
        if (c > rangeStart) {
          ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
        } else if (c === rangeStart) {
          ranges.push(braceEscape(c));
        }
        rangeStart = "";
        i++;
        continue;
      }
      if (glob.startsWith("-]", i + 1)) {
        ranges.push(braceEscape(c + "-"));
        i += 2;
        continue;
      }
      if (glob.startsWith("-", i + 1)) {
        rangeStart = c;
        i += 2;
        continue;
      }
      ranges.push(braceEscape(c));
      i++;
    }
  if (endPos < i) {
    return ["", false, 0, false];
  }
  if (!ranges.length && !negs.length) {
    return ["$.", false, glob.length - pos, true];
  }
  if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) {
    const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
    return [regexpEscape(r), false, endPos - pos, false];
  }
  const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
  const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
  const comb = ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs;
  return [comb, uflag, endPos - pos, true];
};

// node_modules/minimatch/dist/esm/unescape.js
var unescape = (s, { windowsPathsNoEscape = false } = {}) => {
  return windowsPathsNoEscape ? s.replace(/\[([^\/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
};

// node_modules/minimatch/dist/esm/ast.js
var types = new Set(["!", "?", "+", "*", "@"]);
var isExtglobType = (c) => types.has(c);
var startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
var startNoDot = "(?!\\.)";
var addPatternStart = new Set(["[", "."]);
var justDots = new Set(["..", "."]);
var reSpecials = new Set("().*{}+?[]^$\\!");
var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var qmark = "[^/]";
var star = qmark + "*?";
var starNoEmpty = qmark + "+?";

class AST {
  type;
  #root;
  #hasMagic;
  #uflag = false;
  #parts = [];
  #parent;
  #parentIndex;
  #negs;
  #filledNegs = false;
  #options;
  #toString;
  #emptyExt = false;
  constructor(type, parent, options = {}) {
    this.type = type;
    if (type)
      this.#hasMagic = true;
    this.#parent = parent;
    this.#root = this.#parent ? this.#parent.#root : this;
    this.#options = this.#root === this ? options : this.#root.#options;
    this.#negs = this.#root === this ? [] : this.#root.#negs;
    if (type === "!" && !this.#root.#filledNegs)
      this.#negs.push(this);
    this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
  }
  get hasMagic() {
    if (this.#hasMagic !== undefined)
      return this.#hasMagic;
    for (const p of this.#parts) {
      if (typeof p === "string")
        continue;
      if (p.type || p.hasMagic)
        return this.#hasMagic = true;
    }
    return this.#hasMagic;
  }
  toString() {
    if (this.#toString !== undefined)
      return this.#toString;
    if (!this.type) {
      return this.#toString = this.#parts.map((p) => String(p)).join("");
    } else {
      return this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
    }
  }
  #fillNegs() {
    if (this !== this.#root)
      throw new Error("should only call on root");
    if (this.#filledNegs)
      return this;
    this.toString();
    this.#filledNegs = true;
    let n;
    while (n = this.#negs.pop()) {
      if (n.type !== "!")
        continue;
      let p = n;
      let pp = p.#parent;
      while (pp) {
        for (let i = p.#parentIndex + 1;!pp.type && i < pp.#parts.length; i++) {
          for (const part of n.#parts) {
            if (typeof part === "string") {
              throw new Error("string part in extglob AST??");
            }
            part.copyIn(pp.#parts[i]);
          }
        }
        p = pp;
        pp = p.#parent;
      }
    }
    return this;
  }
  push(...parts) {
    for (const p of parts) {
      if (p === "")
        continue;
      if (typeof p !== "string" && !(p instanceof AST && p.#parent === this)) {
        throw new Error("invalid part: " + p);
      }
      this.#parts.push(p);
    }
  }
  toJSON() {
    const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
    if (this.isStart() && !this.type)
      ret.unshift([]);
    if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) {
      ret.push({});
    }
    return ret;
  }
  isStart() {
    if (this.#root === this)
      return true;
    if (!this.#parent?.isStart())
      return false;
    if (this.#parentIndex === 0)
      return true;
    const p = this.#parent;
    for (let i = 0;i < this.#parentIndex; i++) {
      const pp = p.#parts[i];
      if (!(pp instanceof AST && pp.type === "!")) {
        return false;
      }
    }
    return true;
  }
  isEnd() {
    if (this.#root === this)
      return true;
    if (this.#parent?.type === "!")
      return true;
    if (!this.#parent?.isEnd())
      return false;
    if (!this.type)
      return this.#parent?.isEnd();
    const pl = this.#parent ? this.#parent.#parts.length : 0;
    return this.#parentIndex === pl - 1;
  }
  copyIn(part) {
    if (typeof part === "string")
      this.push(part);
    else
      this.push(part.clone(this));
  }
  clone(parent) {
    const c = new AST(this.type, parent);
    for (const p of this.#parts) {
      c.copyIn(p);
    }
    return c;
  }
  static #parseAST(str, ast, pos, opt) {
    let escaping = false;
    let inBrace = false;
    let braceStart = -1;
    let braceNeg = false;
    if (ast.type === null) {
      let i2 = pos;
      let acc2 = "";
      while (i2 < str.length) {
        const c = str.charAt(i2++);
        if (escaping || c === "\\") {
          escaping = !escaping;
          acc2 += c;
          continue;
        }
        if (inBrace) {
          if (i2 === braceStart + 1) {
            if (c === "^" || c === "!") {
              braceNeg = true;
            }
          } else if (c === "]" && !(i2 === braceStart + 2 && braceNeg)) {
            inBrace = false;
          }
          acc2 += c;
          continue;
        } else if (c === "[") {
          inBrace = true;
          braceStart = i2;
          braceNeg = false;
          acc2 += c;
          continue;
        }
        if (!opt.noext && isExtglobType(c) && str.charAt(i2) === "(") {
          ast.push(acc2);
          acc2 = "";
          const ext = new AST(c, ast);
          i2 = AST.#parseAST(str, ext, i2, opt);
          ast.push(ext);
          continue;
        }
        acc2 += c;
      }
      ast.push(acc2);
      return i2;
    }
    let i = pos + 1;
    let part = new AST(null, ast);
    const parts = [];
    let acc = "";
    while (i < str.length) {
      const c = str.charAt(i++);
      if (escaping || c === "\\") {
        escaping = !escaping;
        acc += c;
        continue;
      }
      if (inBrace) {
        if (i === braceStart + 1) {
          if (c === "^" || c === "!") {
            braceNeg = true;
          }
        } else if (c === "]" && !(i === braceStart + 2 && braceNeg)) {
          inBrace = false;
        }
        acc += c;
        continue;
      } else if (c === "[") {
        inBrace = true;
        braceStart = i;
        braceNeg = false;
        acc += c;
        continue;
      }
      if (isExtglobType(c) && str.charAt(i) === "(") {
        part.push(acc);
        acc = "";
        const ext = new AST(c, part);
        part.push(ext);
        i = AST.#parseAST(str, ext, i, opt);
        continue;
      }
      if (c === "|") {
        part.push(acc);
        acc = "";
        parts.push(part);
        part = new AST(null, ast);
        continue;
      }
      if (c === ")") {
        if (acc === "" && ast.#parts.length === 0) {
          ast.#emptyExt = true;
        }
        part.push(acc);
        acc = "";
        ast.push(...parts, part);
        return i;
      }
      acc += c;
    }
    ast.type = null;
    ast.#hasMagic = undefined;
    ast.#parts = [str.substring(pos - 1)];
    return i;
  }
  static fromGlob(pattern, options = {}) {
    const ast = new AST(null, undefined, options);
    AST.#parseAST(pattern, ast, 0, options);
    return ast;
  }
  toMMPattern() {
    if (this !== this.#root)
      return this.#root.toMMPattern();
    const glob = this.toString();
    const [re, body, hasMagic, uflag] = this.toRegExpSource();
    const anyMagic = hasMagic || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob.toUpperCase() !== glob.toLowerCase();
    if (!anyMagic) {
      return body;
    }
    const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
    return Object.assign(new RegExp(`^${re}$`, flags), {
      _src: re,
      _glob: glob
    });
  }
  get options() {
    return this.#options;
  }
  toRegExpSource(allowDot) {
    const dot = allowDot ?? !!this.#options.dot;
    if (this.#root === this)
      this.#fillNegs();
    if (!this.type) {
      const noEmpty = this.isStart() && this.isEnd();
      const src = this.#parts.map((p) => {
        const [re, _, hasMagic, uflag] = typeof p === "string" ? AST.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
        this.#hasMagic = this.#hasMagic || hasMagic;
        this.#uflag = this.#uflag || uflag;
        return re;
      }).join("");
      let start2 = "";
      if (this.isStart()) {
        if (typeof this.#parts[0] === "string") {
          const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
          if (!dotTravAllowed) {
            const aps = addPatternStart;
            const needNoTrav = dot && aps.has(src.charAt(0)) || src.startsWith("\\.") && aps.has(src.charAt(2)) || src.startsWith("\\.\\.") && aps.has(src.charAt(4));
            const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
            start2 = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
          }
        }
      }
      let end = "";
      if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") {
        end = "(?:$|\\/)";
      }
      const final2 = start2 + src + end;
      return [
        final2,
        unescape(src),
        this.#hasMagic = !!this.#hasMagic,
        this.#uflag
      ];
    }
    const repeated = this.type === "*" || this.type === "+";
    const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
    let body = this.#partsToRegExp(dot);
    if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
      const s = this.toString();
      this.#parts = [s];
      this.type = null;
      this.#hasMagic = undefined;
      return [s, unescape(this.toString()), false, false];
    }
    let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ? "" : this.#partsToRegExp(true);
    if (bodyDotAllowed === body) {
      bodyDotAllowed = "";
    }
    if (bodyDotAllowed) {
      body = `(?:${body})(?:${bodyDotAllowed})*?`;
    }
    let final = "";
    if (this.type === "!" && this.#emptyExt) {
      final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
    } else {
      const close = this.type === "!" ? "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + star + ")" : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
      final = start + body + close;
    }
    return [
      final,
      unescape(body),
      this.#hasMagic = !!this.#hasMagic,
      this.#uflag
    ];
  }
  #partsToRegExp(dot) {
    return this.#parts.map((p) => {
      if (typeof p === "string") {
        throw new Error("string type in extglob ast??");
      }
      const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
      this.#uflag = this.#uflag || uflag;
      return re;
    }).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
  }
  static #parseGlob(glob, hasMagic, noEmpty = false) {
    let escaping = false;
    let re = "";
    let uflag = false;
    for (let i = 0;i < glob.length; i++) {
      const c = glob.charAt(i);
      if (escaping) {
        escaping = false;
        re += (reSpecials.has(c) ? "\\" : "") + c;
        continue;
      }
      if (c === "\\") {
        if (i === glob.length - 1) {
          re += "\\\\";
        } else {
          escaping = true;
        }
        continue;
      }
      if (c === "[") {
        const [src, needUflag, consumed, magic] = parseClass(glob, i);
        if (consumed) {
          re += src;
          uflag = uflag || needUflag;
          i += consumed - 1;
          hasMagic = hasMagic || magic;
          continue;
        }
      }
      if (c === "*") {
        if (noEmpty && glob === "*")
          re += starNoEmpty;
        else
          re += star;
        hasMagic = true;
        continue;
      }
      if (c === "?") {
        re += qmark;
        hasMagic = true;
        continue;
      }
      re += regExpEscape(c);
    }
    return [re, unescape(glob), !!hasMagic, uflag];
  }
}

// node_modules/minimatch/dist/esm/escape.js
var escape = (s, { windowsPathsNoEscape = false } = {}) => {
  return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
};

// node_modules/minimatch/dist/esm/index.js
var minimatch = (p, pattern, options = {}) => {
  assertValidPattern(pattern);
  if (!options.nocomment && pattern.charAt(0) === "#") {
    return false;
  }
  return new Minimatch(pattern, options).match(p);
};
var starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
var starDotExtTest = (ext) => (f) => !f.startsWith(".") && f.endsWith(ext);
var starDotExtTestDot = (ext) => (f) => f.endsWith(ext);
var starDotExtTestNocase = (ext) => {
  ext = ext.toLowerCase();
  return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext);
};
var starDotExtTestNocaseDot = (ext) => {
  ext = ext.toLowerCase();
  return (f) => f.toLowerCase().endsWith(ext);
};
var starDotStarRE = /^\*+\.\*+$/;
var starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
var starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
var dotStarRE = /^\.\*+$/;
var dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
var starRE = /^\*+$/;
var starTest = (f) => f.length !== 0 && !f.startsWith(".");
var starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
var qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
var qmarksTestNocase = ([$0, ext = ""]) => {
  const noext = qmarksTestNoExt([$0]);
  if (!ext)
    return noext;
  ext = ext.toLowerCase();
  return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
var qmarksTestNocaseDot = ([$0, ext = ""]) => {
  const noext = qmarksTestNoExtDot([$0]);
  if (!ext)
    return noext;
  ext = ext.toLowerCase();
  return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
var qmarksTestDot = ([$0, ext = ""]) => {
  const noext = qmarksTestNoExtDot([$0]);
  return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
var qmarksTest = ([$0, ext = ""]) => {
  const noext = qmarksTestNoExt([$0]);
  return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
var qmarksTestNoExt = ([$0]) => {
  const len = $0.length;
  return (f) => f.length === len && !f.startsWith(".");
};
var qmarksTestNoExtDot = ([$0]) => {
  const len = $0.length;
  return (f) => f.length === len && f !== "." && f !== "..";
};
var defaultPlatform = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
var path = {
  win32: { sep: "\\" },
  posix: { sep: "/" }
};
var sep = defaultPlatform === "win32" ? path.win32.sep : path.posix.sep;
minimatch.sep = sep;
var GLOBSTAR = Symbol("globstar **");
minimatch.GLOBSTAR = GLOBSTAR;
var qmark2 = "[^/]";
var star2 = qmark2 + "*?";
var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
var filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
minimatch.filter = filter;
var ext = (a, b = {}) => Object.assign({}, a, b);
var defaults = (def) => {
  if (!def || typeof def !== "object" || !Object.keys(def).length) {
    return minimatch;
  }
  const orig = minimatch;
  const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
  return Object.assign(m, {
    Minimatch: class Minimatch extends orig.Minimatch {
      constructor(pattern, options = {}) {
        super(pattern, ext(def, options));
      }
      static defaults(options) {
        return orig.defaults(ext(def, options)).Minimatch;
      }
    },
    AST: class AST2 extends orig.AST {
      constructor(type, parent, options = {}) {
        super(type, parent, ext(def, options));
      }
      static fromGlob(pattern, options = {}) {
        return orig.AST.fromGlob(pattern, ext(def, options));
      }
    },
    unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
    escape: (s, options = {}) => orig.escape(s, ext(def, options)),
    filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
    defaults: (options) => orig.defaults(ext(def, options)),
    makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
    braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
    match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
    sep: orig.sep,
    GLOBSTAR
  });
};
minimatch.defaults = defaults;
var braceExpand = (pattern, options = {}) => {
  assertValidPattern(pattern);
  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
    return [pattern];
  }
  return import_brace_expansion.default(pattern);
};
minimatch.braceExpand = braceExpand;
var makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
var match = (list, pattern, options = {}) => {
  const mm = new Minimatch(pattern, options);
  list = list.filter((f) => mm.match(f));
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list;
};
minimatch.match = match;
var globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
var regExpEscape2 = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

class Minimatch {
  options;
  set;
  pattern;
  windowsPathsNoEscape;
  nonegate;
  negate;
  comment;
  empty;
  preserveMultipleSlashes;
  partial;
  globSet;
  globParts;
  nocase;
  isWindows;
  platform;
  windowsNoMagicRoot;
  regexp;
  constructor(pattern, options = {}) {
    assertValidPattern(pattern);
    options = options || {};
    this.options = options;
    this.pattern = pattern;
    this.platform = options.platform || defaultPlatform;
    this.isWindows = this.platform === "win32";
    this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
    if (this.windowsPathsNoEscape) {
      this.pattern = this.pattern.replace(/\\/g, "/");
    }
    this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
    this.regexp = null;
    this.negate = false;
    this.nonegate = !!options.nonegate;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.nocase = !!this.options.nocase;
    this.windowsNoMagicRoot = options.windowsNoMagicRoot !== undefined ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
    this.globSet = [];
    this.globParts = [];
    this.set = [];
    this.make();
  }
  hasMagic() {
    if (this.options.magicalBraces && this.set.length > 1) {
      return true;
    }
    for (const pattern of this.set) {
      for (const part of pattern) {
        if (typeof part !== "string")
          return true;
      }
    }
    return false;
  }
  debug(..._) {}
  make() {
    const pattern = this.pattern;
    const options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    this.globSet = [...new Set(this.braceExpand())];
    if (options.debug) {
      this.debug = (...args) => console.error(...args);
    }
    this.debug(this.pattern, this.globSet);
    const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
    this.globParts = this.preprocess(rawGlobParts);
    this.debug(this.pattern, this.globParts);
    let set = this.globParts.map((s, _, __) => {
      if (this.isWindows && this.windowsNoMagicRoot) {
        const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
        const isDrive = /^[a-z]:/i.test(s[0]);
        if (isUNC) {
          return [...s.slice(0, 4), ...s.slice(4).map((ss) => this.parse(ss))];
        } else if (isDrive) {
          return [s[0], ...s.slice(1).map((ss) => this.parse(ss))];
        }
      }
      return s.map((ss) => this.parse(ss));
    });
    this.debug(this.pattern, set);
    this.set = set.filter((s) => s.indexOf(false) === -1);
    if (this.isWindows) {
      for (let i = 0;i < this.set.length; i++) {
        const p = this.set[i];
        if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) {
          p[2] = "?";
        }
      }
    }
    this.debug(this.pattern, this.set);
  }
  preprocess(globParts) {
    if (this.options.noglobstar) {
      for (let i = 0;i < globParts.length; i++) {
        for (let j = 0;j < globParts[i].length; j++) {
          if (globParts[i][j] === "**") {
            globParts[i][j] = "*";
          }
        }
      }
    }
    const { optimizationLevel = 1 } = this.options;
    if (optimizationLevel >= 2) {
      globParts = this.firstPhasePreProcess(globParts);
      globParts = this.secondPhasePreProcess(globParts);
    } else if (optimizationLevel >= 1) {
      globParts = this.levelOneOptimize(globParts);
    } else {
      globParts = this.adjascentGlobstarOptimize(globParts);
    }
    return globParts;
  }
  adjascentGlobstarOptimize(globParts) {
    return globParts.map((parts) => {
      let gs = -1;
      while ((gs = parts.indexOf("**", gs + 1)) !== -1) {
        let i = gs;
        while (parts[i + 1] === "**") {
          i++;
        }
        if (i !== gs) {
          parts.splice(gs, i - gs);
        }
      }
      return parts;
    });
  }
  levelOneOptimize(globParts) {
    return globParts.map((parts) => {
      parts = parts.reduce((set, part) => {
        const prev = set[set.length - 1];
        if (part === "**" && prev === "**") {
          return set;
        }
        if (part === "..") {
          if (prev && prev !== ".." && prev !== "." && prev !== "**") {
            set.pop();
            return set;
          }
        }
        set.push(part);
        return set;
      }, []);
      return parts.length === 0 ? [""] : parts;
    });
  }
  levelTwoFileOptimize(parts) {
    if (!Array.isArray(parts)) {
      parts = this.slashSplit(parts);
    }
    let didSomething = false;
    do {
      didSomething = false;
      if (!this.preserveMultipleSlashes) {
        for (let i = 1;i < parts.length - 1; i++) {
          const p = parts[i];
          if (i === 1 && p === "" && parts[0] === "")
            continue;
          if (p === "." || p === "") {
            didSomething = true;
            parts.splice(i, 1);
            i--;
          }
        }
        if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
          didSomething = true;
          parts.pop();
        }
      }
      let dd = 0;
      while ((dd = parts.indexOf("..", dd + 1)) !== -1) {
        const p = parts[dd - 1];
        if (p && p !== "." && p !== ".." && p !== "**") {
          didSomething = true;
          parts.splice(dd - 1, 2);
          dd -= 2;
        }
      }
    } while (didSomething);
    return parts.length === 0 ? [""] : parts;
  }
  firstPhasePreProcess(globParts) {
    let didSomething = false;
    do {
      didSomething = false;
      for (let parts of globParts) {
        let gs = -1;
        while ((gs = parts.indexOf("**", gs + 1)) !== -1) {
          let gss = gs;
          while (parts[gss + 1] === "**") {
            gss++;
          }
          if (gss > gs) {
            parts.splice(gs + 1, gss - gs);
          }
          let next = parts[gs + 1];
          const p = parts[gs + 2];
          const p2 = parts[gs + 3];
          if (next !== "..")
            continue;
          if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") {
            continue;
          }
          didSomething = true;
          parts.splice(gs, 1);
          const other = parts.slice(0);
          other[gs] = "**";
          globParts.push(other);
          gs--;
        }
        if (!this.preserveMultipleSlashes) {
          for (let i = 1;i < parts.length - 1; i++) {
            const p = parts[i];
            if (i === 1 && p === "" && parts[0] === "")
              continue;
            if (p === "." || p === "") {
              didSomething = true;
              parts.splice(i, 1);
              i--;
            }
          }
          if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
            didSomething = true;
            parts.pop();
          }
        }
        let dd = 0;
        while ((dd = parts.indexOf("..", dd + 1)) !== -1) {
          const p = parts[dd - 1];
          if (p && p !== "." && p !== ".." && p !== "**") {
            didSomething = true;
            const needDot = dd === 1 && parts[dd + 1] === "**";
            const splin = needDot ? ["."] : [];
            parts.splice(dd - 1, 2, ...splin);
            if (parts.length === 0)
              parts.push("");
            dd -= 2;
          }
        }
      }
    } while (didSomething);
    return globParts;
  }
  secondPhasePreProcess(globParts) {
    for (let i = 0;i < globParts.length - 1; i++) {
      for (let j = i + 1;j < globParts.length; j++) {
        const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
        if (matched) {
          globParts[i] = [];
          globParts[j] = matched;
          break;
        }
      }
    }
    return globParts.filter((gs) => gs.length);
  }
  partsMatch(a, b, emptyGSMatch = false) {
    let ai = 0;
    let bi = 0;
    let result = [];
    let which = "";
    while (ai < a.length && bi < b.length) {
      if (a[ai] === b[bi]) {
        result.push(which === "b" ? b[bi] : a[ai]);
        ai++;
        bi++;
      } else if (emptyGSMatch && a[ai] === "**" && b[bi] === a[ai + 1]) {
        result.push(a[ai]);
        ai++;
      } else if (emptyGSMatch && b[bi] === "**" && a[ai] === b[bi + 1]) {
        result.push(b[bi]);
        bi++;
      } else if (a[ai] === "*" && b[bi] && (this.options.dot || !b[bi].startsWith(".")) && b[bi] !== "**") {
        if (which === "b")
          return false;
        which = "a";
        result.push(a[ai]);
        ai++;
        bi++;
      } else if (b[bi] === "*" && a[ai] && (this.options.dot || !a[ai].startsWith(".")) && a[ai] !== "**") {
        if (which === "a")
          return false;
        which = "b";
        result.push(b[bi]);
        ai++;
        bi++;
      } else {
        return false;
      }
    }
    return a.length === b.length && result;
  }
  parseNegate() {
    if (this.nonegate)
      return;
    const pattern = this.pattern;
    let negate = false;
    let negateOffset = 0;
    for (let i = 0;i < pattern.length && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.slice(negateOffset);
    this.negate = negate;
  }
  matchOne(file, pattern, partial = false) {
    const options = this.options;
    if (this.isWindows) {
      const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
      const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
      const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
      const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
      const fdi = fileUNC ? 3 : fileDrive ? 0 : undefined;
      const pdi = patternUNC ? 3 : patternDrive ? 0 : undefined;
      if (typeof fdi === "number" && typeof pdi === "number") {
        const [fd, pd] = [file[fdi], pattern[pdi]];
        if (fd.toLowerCase() === pd.toLowerCase()) {
          pattern[pdi] = fd;
          if (pdi > fdi) {
            pattern = pattern.slice(pdi);
          } else if (fdi > pdi) {
            file = file.slice(fdi);
          }
        }
      }
    }
    const { optimizationLevel = 1 } = this.options;
    if (optimizationLevel >= 2) {
      file = this.levelTwoFileOptimize(file);
    }
    this.debug("matchOne", this, { file, pattern });
    this.debug("matchOne", file.length, pattern.length);
    for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length;fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      var p = pattern[pi];
      var f = file[fi];
      this.debug(pattern, p, f);
      if (p === false) {
        return false;
      }
      if (p === GLOBSTAR) {
        this.debug("GLOBSTAR", [pattern, p, f]);
        var fr = fi;
        var pr = pi + 1;
        if (pr === pl) {
          this.debug("** at the end");
          for (;fi < fl; fi++) {
            if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
              return false;
          }
          return true;
        }
        while (fr < fl) {
          var swallowee = file[fr];
          this.debug(`
globstar while`, file, fr, pattern, pr, swallowee);
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug("globstar found match!", fr, fl, swallowee);
            return true;
          } else {
            if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
              this.debug("dot detected!", file, fr, pattern, pr);
              break;
            }
            this.debug("globstar swallow a segment, and continue");
            fr++;
          }
        }
        if (partial) {
          this.debug(`
>>> no match, partial?`, file, fr, pattern, pr);
          if (fr === fl) {
            return true;
          }
        }
        return false;
      }
      let hit;
      if (typeof p === "string") {
        hit = f === p;
        this.debug("string match", p, f, hit);
      } else {
        hit = p.test(f);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      return fi === fl - 1 && file[fi] === "";
    } else {
      throw new Error("wtf?");
    }
  }
  braceExpand() {
    return braceExpand(this.pattern, this.options);
  }
  parse(pattern) {
    assertValidPattern(pattern);
    const options = this.options;
    if (pattern === "**")
      return GLOBSTAR;
    if (pattern === "")
      return "";
    let m;
    let fastTest = null;
    if (m = pattern.match(starRE)) {
      fastTest = options.dot ? starTestDot : starTest;
    } else if (m = pattern.match(starDotExtRE)) {
      fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
    } else if (m = pattern.match(qmarksRE)) {
      fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
    } else if (m = pattern.match(starDotStarRE)) {
      fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
    } else if (m = pattern.match(dotStarRE)) {
      fastTest = dotStarTest;
    }
    const re = AST.fromGlob(pattern, this.options).toMMPattern();
    if (fastTest && typeof re === "object") {
      Reflect.defineProperty(re, "test", { value: fastTest });
    }
    return re;
  }
  makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    const set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    const options = this.options;
    const twoStar = options.noglobstar ? star2 : options.dot ? twoStarDot : twoStarNoDot;
    const flags = new Set(options.nocase ? ["i"] : []);
    let re = set.map((pattern) => {
      const pp = pattern.map((p) => {
        if (p instanceof RegExp) {
          for (const f of p.flags.split(""))
            flags.add(f);
        }
        return typeof p === "string" ? regExpEscape2(p) : p === GLOBSTAR ? GLOBSTAR : p._src;
      });
      pp.forEach((p, i) => {
        const next = pp[i + 1];
        const prev = pp[i - 1];
        if (p !== GLOBSTAR || prev === GLOBSTAR) {
          return;
        }
        if (prev === undefined) {
          if (next !== undefined && next !== GLOBSTAR) {
            pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
          } else {
            pp[i] = twoStar;
          }
        } else if (next === undefined) {
          pp[i - 1] = prev + "(?:\\/|" + twoStar + ")?";
        } else if (next !== GLOBSTAR) {
          pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
          pp[i + 1] = GLOBSTAR;
        }
      });
      return pp.filter((p) => p !== GLOBSTAR).join("/");
    }).join("|");
    const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
    re = "^" + open + re + close + "$";
    if (this.negate)
      re = "^(?!" + re + ").+$";
    try {
      this.regexp = new RegExp(re, [...flags].join(""));
    } catch (ex) {
      this.regexp = false;
    }
    return this.regexp;
  }
  slashSplit(p) {
    if (this.preserveMultipleSlashes) {
      return p.split("/");
    } else if (this.isWindows && /^\/\/[^\/]+/.test(p)) {
      return ["", ...p.split(/\/+/)];
    } else {
      return p.split(/\/+/);
    }
  }
  match(f, partial = this.partial) {
    this.debug("match", f, this.pattern);
    if (this.comment) {
      return false;
    }
    if (this.empty) {
      return f === "";
    }
    if (f === "/" && partial) {
      return true;
    }
    const options = this.options;
    if (this.isWindows) {
      f = f.split("\\").join("/");
    }
    const ff = this.slashSplit(f);
    this.debug(this.pattern, "split", ff);
    const set = this.set;
    this.debug(this.pattern, "set", set);
    let filename = ff[ff.length - 1];
    if (!filename) {
      for (let i = ff.length - 2;!filename && i >= 0; i--) {
        filename = ff[i];
      }
    }
    for (let i = 0;i < set.length; i++) {
      const pattern = set[i];
      let file = ff;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      const hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate) {
          return true;
        }
        return !this.negate;
      }
    }
    if (options.flipNegate) {
      return false;
    }
    return this.negate;
  }
  static defaults(def) {
    return minimatch.defaults(def).Minimatch;
  }
}
minimatch.AST = AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = escape;
minimatch.unescape = unescape;

// node_modules/glob/dist/esm/glob.js
import { fileURLToPath as fileURLToPath2 } from "node:url";

// node_modules/lru-cache/dist/esm/index.js
var perf = typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date;
var warned = new Set;
var PROCESS = typeof process === "object" && !!process ? process : {};
var emitWarning = (msg, type, code, fn2) => {
  typeof PROCESS.emitWarning === "function" ? PROCESS.emitWarning(msg, type, code, fn2) : console.error(`[${code}] ${type}: ${msg}`);
};
var AC = globalThis.AbortController;
var AS = globalThis.AbortSignal;
if (typeof AC === "undefined") {
  AS = class AbortSignal {
    onabort;
    _onabort = [];
    reason;
    aborted = false;
    addEventListener(_, fn2) {
      this._onabort.push(fn2);
    }
  };
  AC = class AbortController {
    constructor() {
      warnACPolyfill();
    }
    signal = new AS;
    abort(reason) {
      if (this.signal.aborted)
        return;
      this.signal.reason = reason;
      this.signal.aborted = true;
      for (const fn2 of this.signal._onabort) {
        fn2(reason);
      }
      this.signal.onabort?.(reason);
    }
  };
  let printACPolyfillWarning = PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1";
  const warnACPolyfill = () => {
    if (!printACPolyfillWarning)
      return;
    printACPolyfillWarning = false;
    emitWarning("AbortController is not defined. If using lru-cache in " + "node 14, load an AbortController polyfill from the " + "`node-abort-controller` package. A minimal polyfill is " + "provided for use by LRUCache.fetch(), but it should not be " + "relied upon in other contexts (eg, passing it to other APIs that " + "use AbortController/AbortSignal might have undesirable effects). " + "You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", warnACPolyfill);
  };
}
var shouldWarn = (code) => !warned.has(code);
var TYPE = Symbol("type");
var isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
var getUintArray = (max) => !isPosInt(max) ? null : max <= Math.pow(2, 8) ? Uint8Array : max <= Math.pow(2, 16) ? Uint16Array : max <= Math.pow(2, 32) ? Uint32Array : max <= Number.MAX_SAFE_INTEGER ? ZeroArray : null;

class ZeroArray extends Array {
  constructor(size) {
    super(size);
    this.fill(0);
  }
}

class Stack {
  heap;
  length;
  static #constructing = false;
  static create(max) {
    const HeapCls = getUintArray(max);
    if (!HeapCls)
      return [];
    Stack.#constructing = true;
    const s = new Stack(max, HeapCls);
    Stack.#constructing = false;
    return s;
  }
  constructor(max, HeapCls) {
    if (!Stack.#constructing) {
      throw new TypeError("instantiate Stack using Stack.create(n)");
    }
    this.heap = new HeapCls(max);
    this.length = 0;
  }
  push(n) {
    this.heap[this.length++] = n;
  }
  pop() {
    return this.heap[--this.length];
  }
}

class LRUCache {
  #max;
  #maxSize;
  #dispose;
  #disposeAfter;
  #fetchMethod;
  #memoMethod;
  ttl;
  ttlResolution;
  ttlAutopurge;
  updateAgeOnGet;
  updateAgeOnHas;
  allowStale;
  noDisposeOnSet;
  noUpdateTTL;
  maxEntrySize;
  sizeCalculation;
  noDeleteOnFetchRejection;
  noDeleteOnStaleGet;
  allowStaleOnFetchAbort;
  allowStaleOnFetchRejection;
  ignoreFetchAbort;
  #size;
  #calculatedSize;
  #keyMap;
  #keyList;
  #valList;
  #next;
  #prev;
  #head;
  #tail;
  #free;
  #disposed;
  #sizes;
  #starts;
  #ttls;
  #hasDispose;
  #hasFetchMethod;
  #hasDisposeAfter;
  static unsafeExposeInternals(c) {
    return {
      starts: c.#starts,
      ttls: c.#ttls,
      sizes: c.#sizes,
      keyMap: c.#keyMap,
      keyList: c.#keyList,
      valList: c.#valList,
      next: c.#next,
      prev: c.#prev,
      get head() {
        return c.#head;
      },
      get tail() {
        return c.#tail;
      },
      free: c.#free,
      isBackgroundFetch: (p) => c.#isBackgroundFetch(p),
      backgroundFetch: (k, index, options, context) => c.#backgroundFetch(k, index, options, context),
      moveToTail: (index) => c.#moveToTail(index),
      indexes: (options) => c.#indexes(options),
      rindexes: (options) => c.#rindexes(options),
      isStale: (index) => c.#isStale(index)
    };
  }
  get max() {
    return this.#max;
  }
  get maxSize() {
    return this.#maxSize;
  }
  get calculatedSize() {
    return this.#calculatedSize;
  }
  get size() {
    return this.#size;
  }
  get fetchMethod() {
    return this.#fetchMethod;
  }
  get memoMethod() {
    return this.#memoMethod;
  }
  get dispose() {
    return this.#dispose;
  }
  get disposeAfter() {
    return this.#disposeAfter;
  }
  constructor(options) {
    const { max = 0, ttl, ttlResolution = 1, ttlAutopurge, updateAgeOnGet, updateAgeOnHas, allowStale, dispose, disposeAfter, noDisposeOnSet, noUpdateTTL, maxSize = 0, maxEntrySize = 0, sizeCalculation, fetchMethod, memoMethod, noDeleteOnFetchRejection, noDeleteOnStaleGet, allowStaleOnFetchRejection, allowStaleOnFetchAbort, ignoreFetchAbort } = options;
    if (max !== 0 && !isPosInt(max)) {
      throw new TypeError("max option must be a nonnegative integer");
    }
    const UintArray = max ? getUintArray(max) : Array;
    if (!UintArray) {
      throw new Error("invalid max value: " + max);
    }
    this.#max = max;
    this.#maxSize = maxSize;
    this.maxEntrySize = maxEntrySize || this.#maxSize;
    this.sizeCalculation = sizeCalculation;
    if (this.sizeCalculation) {
      if (!this.#maxSize && !this.maxEntrySize) {
        throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
      }
      if (typeof this.sizeCalculation !== "function") {
        throw new TypeError("sizeCalculation set to non-function");
      }
    }
    if (memoMethod !== undefined && typeof memoMethod !== "function") {
      throw new TypeError("memoMethod must be a function if defined");
    }
    this.#memoMethod = memoMethod;
    if (fetchMethod !== undefined && typeof fetchMethod !== "function") {
      throw new TypeError("fetchMethod must be a function if specified");
    }
    this.#fetchMethod = fetchMethod;
    this.#hasFetchMethod = !!fetchMethod;
    this.#keyMap = new Map;
    this.#keyList = new Array(max).fill(undefined);
    this.#valList = new Array(max).fill(undefined);
    this.#next = new UintArray(max);
    this.#prev = new UintArray(max);
    this.#head = 0;
    this.#tail = 0;
    this.#free = Stack.create(max);
    this.#size = 0;
    this.#calculatedSize = 0;
    if (typeof dispose === "function") {
      this.#dispose = dispose;
    }
    if (typeof disposeAfter === "function") {
      this.#disposeAfter = disposeAfter;
      this.#disposed = [];
    } else {
      this.#disposeAfter = undefined;
      this.#disposed = undefined;
    }
    this.#hasDispose = !!this.#dispose;
    this.#hasDisposeAfter = !!this.#disposeAfter;
    this.noDisposeOnSet = !!noDisposeOnSet;
    this.noUpdateTTL = !!noUpdateTTL;
    this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
    this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
    this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
    this.ignoreFetchAbort = !!ignoreFetchAbort;
    if (this.maxEntrySize !== 0) {
      if (this.#maxSize !== 0) {
        if (!isPosInt(this.#maxSize)) {
          throw new TypeError("maxSize must be a positive integer if specified");
        }
      }
      if (!isPosInt(this.maxEntrySize)) {
        throw new TypeError("maxEntrySize must be a positive integer if specified");
      }
      this.#initializeSizeTracking();
    }
    this.allowStale = !!allowStale;
    this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
    this.updateAgeOnGet = !!updateAgeOnGet;
    this.updateAgeOnHas = !!updateAgeOnHas;
    this.ttlResolution = isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
    this.ttlAutopurge = !!ttlAutopurge;
    this.ttl = ttl || 0;
    if (this.ttl) {
      if (!isPosInt(this.ttl)) {
        throw new TypeError("ttl must be a positive integer if specified");
      }
      this.#initializeTTLTracking();
    }
    if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) {
      throw new TypeError("At least one of max, maxSize, or ttl is required");
    }
    if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
      const code = "LRU_CACHE_UNBOUNDED";
      if (shouldWarn(code)) {
        warned.add(code);
        const msg = "TTL caching without ttlAutopurge, max, or maxSize can " + "result in unbounded memory consumption.";
        emitWarning(msg, "UnboundedCacheWarning", code, LRUCache);
      }
    }
  }
  getRemainingTTL(key) {
    return this.#keyMap.has(key) ? Infinity : 0;
  }
  #initializeTTLTracking() {
    const ttls = new ZeroArray(this.#max);
    const starts = new ZeroArray(this.#max);
    this.#ttls = ttls;
    this.#starts = starts;
    this.#setItemTTL = (index, ttl, start = perf.now()) => {
      starts[index] = ttl !== 0 ? start : 0;
      ttls[index] = ttl;
      if (ttl !== 0 && this.ttlAutopurge) {
        const t = setTimeout(() => {
          if (this.#isStale(index)) {
            this.#delete(this.#keyList[index], "expire");
          }
        }, ttl + 1);
        if (t.unref) {
          t.unref();
        }
      }
    };
    this.#updateItemAge = (index) => {
      starts[index] = ttls[index] !== 0 ? perf.now() : 0;
    };
    this.#statusTTL = (status, index) => {
      if (ttls[index]) {
        const ttl = ttls[index];
        const start = starts[index];
        if (!ttl || !start)
          return;
        status.ttl = ttl;
        status.start = start;
        status.now = cachedNow || getNow();
        const age = status.now - start;
        status.remainingTTL = ttl - age;
      }
    };
    let cachedNow = 0;
    const getNow = () => {
      const n = perf.now();
      if (this.ttlResolution > 0) {
        cachedNow = n;
        const t = setTimeout(() => cachedNow = 0, this.ttlResolution);
        if (t.unref) {
          t.unref();
        }
      }
      return n;
    };
    this.getRemainingTTL = (key) => {
      const index = this.#keyMap.get(key);
      if (index === undefined) {
        return 0;
      }
      const ttl = ttls[index];
      const start = starts[index];
      if (!ttl || !start) {
        return Infinity;
      }
      const age = (cachedNow || getNow()) - start;
      return ttl - age;
    };
    this.#isStale = (index) => {
      const s = starts[index];
      const t = ttls[index];
      return !!t && !!s && (cachedNow || getNow()) - s > t;
    };
  }
  #updateItemAge = () => {};
  #statusTTL = () => {};
  #setItemTTL = () => {};
  #isStale = () => false;
  #initializeSizeTracking() {
    const sizes = new ZeroArray(this.#max);
    this.#calculatedSize = 0;
    this.#sizes = sizes;
    this.#removeItemSize = (index) => {
      this.#calculatedSize -= sizes[index];
      sizes[index] = 0;
    };
    this.#requireSize = (k, v, size, sizeCalculation) => {
      if (this.#isBackgroundFetch(v)) {
        return 0;
      }
      if (!isPosInt(size)) {
        if (sizeCalculation) {
          if (typeof sizeCalculation !== "function") {
            throw new TypeError("sizeCalculation must be a function");
          }
          size = sizeCalculation(v, k);
          if (!isPosInt(size)) {
            throw new TypeError("sizeCalculation return invalid (expect positive integer)");
          }
        } else {
          throw new TypeError("invalid size value (must be positive integer). " + "When maxSize or maxEntrySize is used, sizeCalculation " + "or size must be set.");
        }
      }
      return size;
    };
    this.#addItemSize = (index, size, status) => {
      sizes[index] = size;
      if (this.#maxSize) {
        const maxSize = this.#maxSize - sizes[index];
        while (this.#calculatedSize > maxSize) {
          this.#evict(true);
        }
      }
      this.#calculatedSize += sizes[index];
      if (status) {
        status.entrySize = size;
        status.totalCalculatedSize = this.#calculatedSize;
      }
    };
  }
  #removeItemSize = (_i) => {};
  #addItemSize = (_i, _s, _st) => {};
  #requireSize = (_k, _v, size, sizeCalculation) => {
    if (size || sizeCalculation) {
      throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
    }
    return 0;
  };
  *#indexes({ allowStale = this.allowStale } = {}) {
    if (this.#size) {
      for (let i = this.#tail;; ) {
        if (!this.#isValidIndex(i)) {
          break;
        }
        if (allowStale || !this.#isStale(i)) {
          yield i;
        }
        if (i === this.#head) {
          break;
        } else {
          i = this.#prev[i];
        }
      }
    }
  }
  *#rindexes({ allowStale = this.allowStale } = {}) {
    if (this.#size) {
      for (let i = this.#head;; ) {
        if (!this.#isValidIndex(i)) {
          break;
        }
        if (allowStale || !this.#isStale(i)) {
          yield i;
        }
        if (i === this.#tail) {
          break;
        } else {
          i = this.#next[i];
        }
      }
    }
  }
  #isValidIndex(index) {
    return index !== undefined && this.#keyMap.get(this.#keyList[index]) === index;
  }
  *entries() {
    for (const i of this.#indexes()) {
      if (this.#valList[i] !== undefined && this.#keyList[i] !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
        yield [this.#keyList[i], this.#valList[i]];
      }
    }
  }
  *rentries() {
    for (const i of this.#rindexes()) {
      if (this.#valList[i] !== undefined && this.#keyList[i] !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
        yield [this.#keyList[i], this.#valList[i]];
      }
    }
  }
  *keys() {
    for (const i of this.#indexes()) {
      const k = this.#keyList[i];
      if (k !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
        yield k;
      }
    }
  }
  *rkeys() {
    for (const i of this.#rindexes()) {
      const k = this.#keyList[i];
      if (k !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
        yield k;
      }
    }
  }
  *values() {
    for (const i of this.#indexes()) {
      const v = this.#valList[i];
      if (v !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
        yield this.#valList[i];
      }
    }
  }
  *rvalues() {
    for (const i of this.#rindexes()) {
      const v = this.#valList[i];
      if (v !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
        yield this.#valList[i];
      }
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  [Symbol.toStringTag] = "LRUCache";
  find(fn2, getOptions = {}) {
    for (const i of this.#indexes()) {
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === undefined)
        continue;
      if (fn2(value, this.#keyList[i], this)) {
        return this.get(this.#keyList[i], getOptions);
      }
    }
  }
  forEach(fn2, thisp = this) {
    for (const i of this.#indexes()) {
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === undefined)
        continue;
      fn2.call(thisp, value, this.#keyList[i], this);
    }
  }
  rforEach(fn2, thisp = this) {
    for (const i of this.#rindexes()) {
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === undefined)
        continue;
      fn2.call(thisp, value, this.#keyList[i], this);
    }
  }
  purgeStale() {
    let deleted = false;
    for (const i of this.#rindexes({ allowStale: true })) {
      if (this.#isStale(i)) {
        this.#delete(this.#keyList[i], "expire");
        deleted = true;
      }
    }
    return deleted;
  }
  info(key) {
    const i = this.#keyMap.get(key);
    if (i === undefined)
      return;
    const v = this.#valList[i];
    const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
    if (value === undefined)
      return;
    const entry = { value };
    if (this.#ttls && this.#starts) {
      const ttl = this.#ttls[i];
      const start = this.#starts[i];
      if (ttl && start) {
        const remain = ttl - (perf.now() - start);
        entry.ttl = remain;
        entry.start = Date.now();
      }
    }
    if (this.#sizes) {
      entry.size = this.#sizes[i];
    }
    return entry;
  }
  dump() {
    const arr = [];
    for (const i of this.#indexes({ allowStale: true })) {
      const key = this.#keyList[i];
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === undefined || key === undefined)
        continue;
      const entry = { value };
      if (this.#ttls && this.#starts) {
        entry.ttl = this.#ttls[i];
        const age = perf.now() - this.#starts[i];
        entry.start = Math.floor(Date.now() - age);
      }
      if (this.#sizes) {
        entry.size = this.#sizes[i];
      }
      arr.unshift([key, entry]);
    }
    return arr;
  }
  load(arr) {
    this.clear();
    for (const [key, entry] of arr) {
      if (entry.start) {
        const age = Date.now() - entry.start;
        entry.start = perf.now() - age;
      }
      this.set(key, entry.value, entry);
    }
  }
  set(k, v, setOptions = {}) {
    if (v === undefined) {
      this.delete(k);
      return this;
    }
    const { ttl = this.ttl, start, noDisposeOnSet = this.noDisposeOnSet, sizeCalculation = this.sizeCalculation, status } = setOptions;
    let { noUpdateTTL = this.noUpdateTTL } = setOptions;
    const size = this.#requireSize(k, v, setOptions.size || 0, sizeCalculation);
    if (this.maxEntrySize && size > this.maxEntrySize) {
      if (status) {
        status.set = "miss";
        status.maxEntrySizeExceeded = true;
      }
      this.#delete(k, "set");
      return this;
    }
    let index = this.#size === 0 ? undefined : this.#keyMap.get(k);
    if (index === undefined) {
      index = this.#size === 0 ? this.#tail : this.#free.length !== 0 ? this.#free.pop() : this.#size === this.#max ? this.#evict(false) : this.#size;
      this.#keyList[index] = k;
      this.#valList[index] = v;
      this.#keyMap.set(k, index);
      this.#next[this.#tail] = index;
      this.#prev[index] = this.#tail;
      this.#tail = index;
      this.#size++;
      this.#addItemSize(index, size, status);
      if (status)
        status.set = "add";
      noUpdateTTL = false;
    } else {
      this.#moveToTail(index);
      const oldVal = this.#valList[index];
      if (v !== oldVal) {
        if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
          oldVal.__abortController.abort(new Error("replaced"));
          const { __staleWhileFetching: s } = oldVal;
          if (s !== undefined && !noDisposeOnSet) {
            if (this.#hasDispose) {
              this.#dispose?.(s, k, "set");
            }
            if (this.#hasDisposeAfter) {
              this.#disposed?.push([s, k, "set"]);
            }
          }
        } else if (!noDisposeOnSet) {
          if (this.#hasDispose) {
            this.#dispose?.(oldVal, k, "set");
          }
          if (this.#hasDisposeAfter) {
            this.#disposed?.push([oldVal, k, "set"]);
          }
        }
        this.#removeItemSize(index);
        this.#addItemSize(index, size, status);
        this.#valList[index] = v;
        if (status) {
          status.set = "replace";
          const oldValue = oldVal && this.#isBackgroundFetch(oldVal) ? oldVal.__staleWhileFetching : oldVal;
          if (oldValue !== undefined)
            status.oldValue = oldValue;
        }
      } else if (status) {
        status.set = "update";
      }
    }
    if (ttl !== 0 && !this.#ttls) {
      this.#initializeTTLTracking();
    }
    if (this.#ttls) {
      if (!noUpdateTTL) {
        this.#setItemTTL(index, ttl, start);
      }
      if (status)
        this.#statusTTL(status, index);
    }
    if (!noDisposeOnSet && this.#hasDisposeAfter && this.#disposed) {
      const dt = this.#disposed;
      let task;
      while (task = dt?.shift()) {
        this.#disposeAfter?.(...task);
      }
    }
    return this;
  }
  pop() {
    try {
      while (this.#size) {
        const val = this.#valList[this.#head];
        this.#evict(true);
        if (this.#isBackgroundFetch(val)) {
          if (val.__staleWhileFetching) {
            return val.__staleWhileFetching;
          }
        } else if (val !== undefined) {
          return val;
        }
      }
    } finally {
      if (this.#hasDisposeAfter && this.#disposed) {
        const dt = this.#disposed;
        let task;
        while (task = dt?.shift()) {
          this.#disposeAfter?.(...task);
        }
      }
    }
  }
  #evict(free) {
    const head = this.#head;
    const k = this.#keyList[head];
    const v = this.#valList[head];
    if (this.#hasFetchMethod && this.#isBackgroundFetch(v)) {
      v.__abortController.abort(new Error("evicted"));
    } else if (this.#hasDispose || this.#hasDisposeAfter) {
      if (this.#hasDispose) {
        this.#dispose?.(v, k, "evict");
      }
      if (this.#hasDisposeAfter) {
        this.#disposed?.push([v, k, "evict"]);
      }
    }
    this.#removeItemSize(head);
    if (free) {
      this.#keyList[head] = undefined;
      this.#valList[head] = undefined;
      this.#free.push(head);
    }
    if (this.#size === 1) {
      this.#head = this.#tail = 0;
      this.#free.length = 0;
    } else {
      this.#head = this.#next[head];
    }
    this.#keyMap.delete(k);
    this.#size--;
    return head;
  }
  has(k, hasOptions = {}) {
    const { updateAgeOnHas = this.updateAgeOnHas, status } = hasOptions;
    const index = this.#keyMap.get(k);
    if (index !== undefined) {
      const v = this.#valList[index];
      if (this.#isBackgroundFetch(v) && v.__staleWhileFetching === undefined) {
        return false;
      }
      if (!this.#isStale(index)) {
        if (updateAgeOnHas) {
          this.#updateItemAge(index);
        }
        if (status) {
          status.has = "hit";
          this.#statusTTL(status, index);
        }
        return true;
      } else if (status) {
        status.has = "stale";
        this.#statusTTL(status, index);
      }
    } else if (status) {
      status.has = "miss";
    }
    return false;
  }
  peek(k, peekOptions = {}) {
    const { allowStale = this.allowStale } = peekOptions;
    const index = this.#keyMap.get(k);
    if (index === undefined || !allowStale && this.#isStale(index)) {
      return;
    }
    const v = this.#valList[index];
    return this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
  }
  #backgroundFetch(k, index, options, context) {
    const v = index === undefined ? undefined : this.#valList[index];
    if (this.#isBackgroundFetch(v)) {
      return v;
    }
    const ac = new AC;
    const { signal } = options;
    signal?.addEventListener("abort", () => ac.abort(signal.reason), {
      signal: ac.signal
    });
    const fetchOpts = {
      signal: ac.signal,
      options,
      context
    };
    const cb = (v2, updateCache = false) => {
      const { aborted } = ac.signal;
      const ignoreAbort = options.ignoreFetchAbort && v2 !== undefined;
      if (options.status) {
        if (aborted && !updateCache) {
          options.status.fetchAborted = true;
          options.status.fetchError = ac.signal.reason;
          if (ignoreAbort)
            options.status.fetchAbortIgnored = true;
        } else {
          options.status.fetchResolved = true;
        }
      }
      if (aborted && !ignoreAbort && !updateCache) {
        return fetchFail(ac.signal.reason);
      }
      const bf2 = p;
      if (this.#valList[index] === p) {
        if (v2 === undefined) {
          if (bf2.__staleWhileFetching) {
            this.#valList[index] = bf2.__staleWhileFetching;
          } else {
            this.#delete(k, "fetch");
          }
        } else {
          if (options.status)
            options.status.fetchUpdated = true;
          this.set(k, v2, fetchOpts.options);
        }
      }
      return v2;
    };
    const eb = (er) => {
      if (options.status) {
        options.status.fetchRejected = true;
        options.status.fetchError = er;
      }
      return fetchFail(er);
    };
    const fetchFail = (er) => {
      const { aborted } = ac.signal;
      const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
      const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
      const noDelete = allowStale || options.noDeleteOnFetchRejection;
      const bf2 = p;
      if (this.#valList[index] === p) {
        const del = !noDelete || bf2.__staleWhileFetching === undefined;
        if (del) {
          this.#delete(k, "fetch");
        } else if (!allowStaleAborted) {
          this.#valList[index] = bf2.__staleWhileFetching;
        }
      }
      if (allowStale) {
        if (options.status && bf2.__staleWhileFetching !== undefined) {
          options.status.returnedStale = true;
        }
        return bf2.__staleWhileFetching;
      } else if (bf2.__returned === bf2) {
        throw er;
      }
    };
    const pcall = (res, rej) => {
      const fmp = this.#fetchMethod?.(k, v, fetchOpts);
      if (fmp && fmp instanceof Promise) {
        fmp.then((v2) => res(v2 === undefined ? undefined : v2), rej);
      }
      ac.signal.addEventListener("abort", () => {
        if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
          res(undefined);
          if (options.allowStaleOnFetchAbort) {
            res = (v2) => cb(v2, true);
          }
        }
      });
    };
    if (options.status)
      options.status.fetchDispatched = true;
    const p = new Promise(pcall).then(cb, eb);
    const bf = Object.assign(p, {
      __abortController: ac,
      __staleWhileFetching: v,
      __returned: undefined
    });
    if (index === undefined) {
      this.set(k, bf, { ...fetchOpts.options, status: undefined });
      index = this.#keyMap.get(k);
    } else {
      this.#valList[index] = bf;
    }
    return bf;
  }
  #isBackgroundFetch(p) {
    if (!this.#hasFetchMethod)
      return false;
    const b = p;
    return !!b && b instanceof Promise && b.hasOwnProperty("__staleWhileFetching") && b.__abortController instanceof AC;
  }
  async fetch(k, fetchOptions = {}) {
    const {
      allowStale = this.allowStale,
      updateAgeOnGet = this.updateAgeOnGet,
      noDeleteOnStaleGet = this.noDeleteOnStaleGet,
      ttl = this.ttl,
      noDisposeOnSet = this.noDisposeOnSet,
      size = 0,
      sizeCalculation = this.sizeCalculation,
      noUpdateTTL = this.noUpdateTTL,
      noDeleteOnFetchRejection = this.noDeleteOnFetchRejection,
      allowStaleOnFetchRejection = this.allowStaleOnFetchRejection,
      ignoreFetchAbort = this.ignoreFetchAbort,
      allowStaleOnFetchAbort = this.allowStaleOnFetchAbort,
      context,
      forceRefresh = false,
      status,
      signal
    } = fetchOptions;
    if (!this.#hasFetchMethod) {
      if (status)
        status.fetch = "get";
      return this.get(k, {
        allowStale,
        updateAgeOnGet,
        noDeleteOnStaleGet,
        status
      });
    }
    const options = {
      allowStale,
      updateAgeOnGet,
      noDeleteOnStaleGet,
      ttl,
      noDisposeOnSet,
      size,
      sizeCalculation,
      noUpdateTTL,
      noDeleteOnFetchRejection,
      allowStaleOnFetchRejection,
      allowStaleOnFetchAbort,
      ignoreFetchAbort,
      status,
      signal
    };
    let index = this.#keyMap.get(k);
    if (index === undefined) {
      if (status)
        status.fetch = "miss";
      const p = this.#backgroundFetch(k, index, options, context);
      return p.__returned = p;
    } else {
      const v = this.#valList[index];
      if (this.#isBackgroundFetch(v)) {
        const stale = allowStale && v.__staleWhileFetching !== undefined;
        if (status) {
          status.fetch = "inflight";
          if (stale)
            status.returnedStale = true;
        }
        return stale ? v.__staleWhileFetching : v.__returned = v;
      }
      const isStale = this.#isStale(index);
      if (!forceRefresh && !isStale) {
        if (status)
          status.fetch = "hit";
        this.#moveToTail(index);
        if (updateAgeOnGet) {
          this.#updateItemAge(index);
        }
        if (status)
          this.#statusTTL(status, index);
        return v;
      }
      const p = this.#backgroundFetch(k, index, options, context);
      const hasStale = p.__staleWhileFetching !== undefined;
      const staleVal = hasStale && allowStale;
      if (status) {
        status.fetch = isStale ? "stale" : "refresh";
        if (staleVal && isStale)
          status.returnedStale = true;
      }
      return staleVal ? p.__staleWhileFetching : p.__returned = p;
    }
  }
  async forceFetch(k, fetchOptions = {}) {
    const v = await this.fetch(k, fetchOptions);
    if (v === undefined)
      throw new Error("fetch() returned undefined");
    return v;
  }
  memo(k, memoOptions = {}) {
    const memoMethod = this.#memoMethod;
    if (!memoMethod) {
      throw new Error("no memoMethod provided to constructor");
    }
    const { context, forceRefresh, ...options } = memoOptions;
    const v = this.get(k, options);
    if (!forceRefresh && v !== undefined)
      return v;
    const vv = memoMethod(k, v, {
      options,
      context
    });
    this.set(k, vv, options);
    return vv;
  }
  get(k, getOptions = {}) {
    const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, status } = getOptions;
    const index = this.#keyMap.get(k);
    if (index !== undefined) {
      const value = this.#valList[index];
      const fetching = this.#isBackgroundFetch(value);
      if (status)
        this.#statusTTL(status, index);
      if (this.#isStale(index)) {
        if (status)
          status.get = "stale";
        if (!fetching) {
          if (!noDeleteOnStaleGet) {
            this.#delete(k, "expire");
          }
          if (status && allowStale)
            status.returnedStale = true;
          return allowStale ? value : undefined;
        } else {
          if (status && allowStale && value.__staleWhileFetching !== undefined) {
            status.returnedStale = true;
          }
          return allowStale ? value.__staleWhileFetching : undefined;
        }
      } else {
        if (status)
          status.get = "hit";
        if (fetching) {
          return value.__staleWhileFetching;
        }
        this.#moveToTail(index);
        if (updateAgeOnGet) {
          this.#updateItemAge(index);
        }
        return value;
      }
    } else if (status) {
      status.get = "miss";
    }
  }
  #connect(p, n) {
    this.#prev[n] = p;
    this.#next[p] = n;
  }
  #moveToTail(index) {
    if (index !== this.#tail) {
      if (index === this.#head) {
        this.#head = this.#next[index];
      } else {
        this.#connect(this.#prev[index], this.#next[index]);
      }
      this.#connect(this.#tail, index);
      this.#tail = index;
    }
  }
  delete(k) {
    return this.#delete(k, "delete");
  }
  #delete(k, reason) {
    let deleted = false;
    if (this.#size !== 0) {
      const index = this.#keyMap.get(k);
      if (index !== undefined) {
        deleted = true;
        if (this.#size === 1) {
          this.#clear(reason);
        } else {
          this.#removeItemSize(index);
          const v = this.#valList[index];
          if (this.#isBackgroundFetch(v)) {
            v.__abortController.abort(new Error("deleted"));
          } else if (this.#hasDispose || this.#hasDisposeAfter) {
            if (this.#hasDispose) {
              this.#dispose?.(v, k, reason);
            }
            if (this.#hasDisposeAfter) {
              this.#disposed?.push([v, k, reason]);
            }
          }
          this.#keyMap.delete(k);
          this.#keyList[index] = undefined;
          this.#valList[index] = undefined;
          if (index === this.#tail) {
            this.#tail = this.#prev[index];
          } else if (index === this.#head) {
            this.#head = this.#next[index];
          } else {
            const pi = this.#prev[index];
            this.#next[pi] = this.#next[index];
            const ni = this.#next[index];
            this.#prev[ni] = this.#prev[index];
          }
          this.#size--;
          this.#free.push(index);
        }
      }
    }
    if (this.#hasDisposeAfter && this.#disposed?.length) {
      const dt = this.#disposed;
      let task;
      while (task = dt?.shift()) {
        this.#disposeAfter?.(...task);
      }
    }
    return deleted;
  }
  clear() {
    return this.#clear("delete");
  }
  #clear(reason) {
    for (const index of this.#rindexes({ allowStale: true })) {
      const v = this.#valList[index];
      if (this.#isBackgroundFetch(v)) {
        v.__abortController.abort(new Error("deleted"));
      } else {
        const k = this.#keyList[index];
        if (this.#hasDispose) {
          this.#dispose?.(v, k, reason);
        }
        if (this.#hasDisposeAfter) {
          this.#disposed?.push([v, k, reason]);
        }
      }
    }
    this.#keyMap.clear();
    this.#valList.fill(undefined);
    this.#keyList.fill(undefined);
    if (this.#ttls && this.#starts) {
      this.#ttls.fill(0);
      this.#starts.fill(0);
    }
    if (this.#sizes) {
      this.#sizes.fill(0);
    }
    this.#head = 0;
    this.#tail = 0;
    this.#free.length = 0;
    this.#calculatedSize = 0;
    this.#size = 0;
    if (this.#hasDisposeAfter && this.#disposed) {
      const dt = this.#disposed;
      let task;
      while (task = dt?.shift()) {
        this.#disposeAfter?.(...task);
      }
    }
  }
}

// node_modules/path-scurry/dist/esm/index.js
import { posix, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import { lstatSync, readdir as readdirCB, readdirSync, readlinkSync, realpathSync as rps } from "fs";
import * as actualFS from "node:fs";
import { lstat, readdir, readlink, realpath } from "node:fs/promises";

// node_modules/minipass/dist/esm/index.js
import { EventEmitter } from "node:events";
import Stream from "node:stream";
import { StringDecoder } from "node:string_decoder";
var proc = typeof process === "object" && process ? process : {
  stdout: null,
  stderr: null
};
var isStream = (s) => !!s && typeof s === "object" && (s instanceof Minipass || s instanceof Stream || isReadable(s) || isWritable(s));
var isReadable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter && typeof s.pipe === "function" && s.pipe !== Stream.Writable.prototype.pipe;
var isWritable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter && typeof s.write === "function" && typeof s.end === "function";
var EOF = Symbol("EOF");
var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
var EMITTED_END = Symbol("emittedEnd");
var EMITTING_END = Symbol("emittingEnd");
var EMITTED_ERROR = Symbol("emittedError");
var CLOSED = Symbol("closed");
var READ = Symbol("read");
var FLUSH = Symbol("flush");
var FLUSHCHUNK = Symbol("flushChunk");
var ENCODING = Symbol("encoding");
var DECODER = Symbol("decoder");
var FLOWING = Symbol("flowing");
var PAUSED = Symbol("paused");
var RESUME = Symbol("resume");
var BUFFER = Symbol("buffer");
var PIPES = Symbol("pipes");
var BUFFERLENGTH = Symbol("bufferLength");
var BUFFERPUSH = Symbol("bufferPush");
var BUFFERSHIFT = Symbol("bufferShift");
var OBJECTMODE = Symbol("objectMode");
var DESTROYED = Symbol("destroyed");
var ERROR = Symbol("error");
var EMITDATA = Symbol("emitData");
var EMITEND = Symbol("emitEnd");
var EMITEND2 = Symbol("emitEnd2");
var ASYNC = Symbol("async");
var ABORT = Symbol("abort");
var ABORTED = Symbol("aborted");
var SIGNAL = Symbol("signal");
var DATALISTENERS = Symbol("dataListeners");
var DISCARDED = Symbol("discarded");
var defer = (fn2) => Promise.resolve().then(fn2);
var nodefer = (fn2) => fn2();
var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
var isArrayBufferLike = (b) => b instanceof ArrayBuffer || !!b && typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);

class Pipe {
  src;
  dest;
  opts;
  ondrain;
  constructor(src, dest, opts) {
    this.src = src;
    this.dest = dest;
    this.opts = opts;
    this.ondrain = () => src[RESUME]();
    this.dest.on("drain", this.ondrain);
  }
  unpipe() {
    this.dest.removeListener("drain", this.ondrain);
  }
  proxyErrors(_er) {}
  end() {
    this.unpipe();
    if (this.opts.end)
      this.dest.end();
  }
}

class PipeProxyErrors extends Pipe {
  unpipe() {
    this.src.removeListener("error", this.proxyErrors);
    super.unpipe();
  }
  constructor(src, dest, opts) {
    super(src, dest, opts);
    this.proxyErrors = (er) => dest.emit("error", er);
    src.on("error", this.proxyErrors);
  }
}
var isObjectModeOptions = (o) => !!o.objectMode;
var isEncodingOptions = (o) => !o.objectMode && !!o.encoding && o.encoding !== "buffer";

class Minipass extends EventEmitter {
  [FLOWING] = false;
  [PAUSED] = false;
  [PIPES] = [];
  [BUFFER] = [];
  [OBJECTMODE];
  [ENCODING];
  [ASYNC];
  [DECODER];
  [EOF] = false;
  [EMITTED_END] = false;
  [EMITTING_END] = false;
  [CLOSED] = false;
  [EMITTED_ERROR] = null;
  [BUFFERLENGTH] = 0;
  [DESTROYED] = false;
  [SIGNAL];
  [ABORTED] = false;
  [DATALISTENERS] = 0;
  [DISCARDED] = false;
  writable = true;
  readable = true;
  constructor(...args) {
    const options = args[0] || {};
    super();
    if (options.objectMode && typeof options.encoding === "string") {
      throw new TypeError("Encoding and objectMode may not be used together");
    }
    if (isObjectModeOptions(options)) {
      this[OBJECTMODE] = true;
      this[ENCODING] = null;
    } else if (isEncodingOptions(options)) {
      this[ENCODING] = options.encoding;
      this[OBJECTMODE] = false;
    } else {
      this[OBJECTMODE] = false;
      this[ENCODING] = null;
    }
    this[ASYNC] = !!options.async;
    this[DECODER] = this[ENCODING] ? new StringDecoder(this[ENCODING]) : null;
    if (options && options.debugExposeBuffer === true) {
      Object.defineProperty(this, "buffer", { get: () => this[BUFFER] });
    }
    if (options && options.debugExposePipes === true) {
      Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
    }
    const { signal } = options;
    if (signal) {
      this[SIGNAL] = signal;
      if (signal.aborted) {
        this[ABORT]();
      } else {
        signal.addEventListener("abort", () => this[ABORT]());
      }
    }
  }
  get bufferLength() {
    return this[BUFFERLENGTH];
  }
  get encoding() {
    return this[ENCODING];
  }
  set encoding(_enc) {
    throw new Error("Encoding must be set at instantiation time");
  }
  setEncoding(_enc) {
    throw new Error("Encoding must be set at instantiation time");
  }
  get objectMode() {
    return this[OBJECTMODE];
  }
  set objectMode(_om) {
    throw new Error("objectMode must be set at instantiation time");
  }
  get ["async"]() {
    return this[ASYNC];
  }
  set ["async"](a) {
    this[ASYNC] = this[ASYNC] || !!a;
  }
  [ABORT]() {
    this[ABORTED] = true;
    this.emit("abort", this[SIGNAL]?.reason);
    this.destroy(this[SIGNAL]?.reason);
  }
  get aborted() {
    return this[ABORTED];
  }
  set aborted(_) {}
  write(chunk, encoding, cb) {
    if (this[ABORTED])
      return false;
    if (this[EOF])
      throw new Error("write after end");
    if (this[DESTROYED]) {
      this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
      return true;
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = "utf8";
    }
    if (!encoding)
      encoding = "utf8";
    const fn2 = this[ASYNC] ? defer : nodefer;
    if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
      if (isArrayBufferView(chunk)) {
        chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      } else if (isArrayBufferLike(chunk)) {
        chunk = Buffer.from(chunk);
      } else if (typeof chunk !== "string") {
        throw new Error("Non-contiguous data written to non-objectMode stream");
      }
    }
    if (this[OBJECTMODE]) {
      if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
        this[FLUSH](true);
      if (this[FLOWING])
        this.emit("data", chunk);
      else
        this[BUFFERPUSH](chunk);
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn2(cb);
      return this[FLOWING];
    }
    if (!chunk.length) {
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn2(cb);
      return this[FLOWING];
    }
    if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER]?.lastNeed)) {
      chunk = Buffer.from(chunk, encoding);
    }
    if (Buffer.isBuffer(chunk) && this[ENCODING]) {
      chunk = this[DECODER].write(chunk);
    }
    if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
      this[FLUSH](true);
    if (this[FLOWING])
      this.emit("data", chunk);
    else
      this[BUFFERPUSH](chunk);
    if (this[BUFFERLENGTH] !== 0)
      this.emit("readable");
    if (cb)
      fn2(cb);
    return this[FLOWING];
  }
  read(n) {
    if (this[DESTROYED])
      return null;
    this[DISCARDED] = false;
    if (this[BUFFERLENGTH] === 0 || n === 0 || n && n > this[BUFFERLENGTH]) {
      this[MAYBE_EMIT_END]();
      return null;
    }
    if (this[OBJECTMODE])
      n = null;
    if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
      this[BUFFER] = [
        this[ENCODING] ? this[BUFFER].join("") : Buffer.concat(this[BUFFER], this[BUFFERLENGTH])
      ];
    }
    const ret = this[READ](n || null, this[BUFFER][0]);
    this[MAYBE_EMIT_END]();
    return ret;
  }
  [READ](n, chunk) {
    if (this[OBJECTMODE])
      this[BUFFERSHIFT]();
    else {
      const c = chunk;
      if (n === c.length || n === null)
        this[BUFFERSHIFT]();
      else if (typeof c === "string") {
        this[BUFFER][0] = c.slice(n);
        chunk = c.slice(0, n);
        this[BUFFERLENGTH] -= n;
      } else {
        this[BUFFER][0] = c.subarray(n);
        chunk = c.subarray(0, n);
        this[BUFFERLENGTH] -= n;
      }
    }
    this.emit("data", chunk);
    if (!this[BUFFER].length && !this[EOF])
      this.emit("drain");
    return chunk;
  }
  end(chunk, encoding, cb) {
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = undefined;
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = "utf8";
    }
    if (chunk !== undefined)
      this.write(chunk, encoding);
    if (cb)
      this.once("end", cb);
    this[EOF] = true;
    this.writable = false;
    if (this[FLOWING] || !this[PAUSED])
      this[MAYBE_EMIT_END]();
    return this;
  }
  [RESUME]() {
    if (this[DESTROYED])
      return;
    if (!this[DATALISTENERS] && !this[PIPES].length) {
      this[DISCARDED] = true;
    }
    this[PAUSED] = false;
    this[FLOWING] = true;
    this.emit("resume");
    if (this[BUFFER].length)
      this[FLUSH]();
    else if (this[EOF])
      this[MAYBE_EMIT_END]();
    else
      this.emit("drain");
  }
  resume() {
    return this[RESUME]();
  }
  pause() {
    this[FLOWING] = false;
    this[PAUSED] = true;
    this[DISCARDED] = false;
  }
  get destroyed() {
    return this[DESTROYED];
  }
  get flowing() {
    return this[FLOWING];
  }
  get paused() {
    return this[PAUSED];
  }
  [BUFFERPUSH](chunk) {
    if (this[OBJECTMODE])
      this[BUFFERLENGTH] += 1;
    else
      this[BUFFERLENGTH] += chunk.length;
    this[BUFFER].push(chunk);
  }
  [BUFFERSHIFT]() {
    if (this[OBJECTMODE])
      this[BUFFERLENGTH] -= 1;
    else
      this[BUFFERLENGTH] -= this[BUFFER][0].length;
    return this[BUFFER].shift();
  }
  [FLUSH](noDrain = false) {
    do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
    if (!noDrain && !this[BUFFER].length && !this[EOF])
      this.emit("drain");
  }
  [FLUSHCHUNK](chunk) {
    this.emit("data", chunk);
    return this[FLOWING];
  }
  pipe(dest, opts) {
    if (this[DESTROYED])
      return dest;
    this[DISCARDED] = false;
    const ended = this[EMITTED_END];
    opts = opts || {};
    if (dest === proc.stdout || dest === proc.stderr)
      opts.end = false;
    else
      opts.end = opts.end !== false;
    opts.proxyErrors = !!opts.proxyErrors;
    if (ended) {
      if (opts.end)
        dest.end();
    } else {
      this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
      if (this[ASYNC])
        defer(() => this[RESUME]());
      else
        this[RESUME]();
    }
    return dest;
  }
  unpipe(dest) {
    const p = this[PIPES].find((p2) => p2.dest === dest);
    if (p) {
      if (this[PIPES].length === 1) {
        if (this[FLOWING] && this[DATALISTENERS] === 0) {
          this[FLOWING] = false;
        }
        this[PIPES] = [];
      } else
        this[PIPES].splice(this[PIPES].indexOf(p), 1);
      p.unpipe();
    }
  }
  addListener(ev, handler) {
    return this.on(ev, handler);
  }
  on(ev, handler) {
    const ret = super.on(ev, handler);
    if (ev === "data") {
      this[DISCARDED] = false;
      this[DATALISTENERS]++;
      if (!this[PIPES].length && !this[FLOWING]) {
        this[RESUME]();
      }
    } else if (ev === "readable" && this[BUFFERLENGTH] !== 0) {
      super.emit("readable");
    } else if (isEndish(ev) && this[EMITTED_END]) {
      super.emit(ev);
      this.removeAllListeners(ev);
    } else if (ev === "error" && this[EMITTED_ERROR]) {
      const h = handler;
      if (this[ASYNC])
        defer(() => h.call(this, this[EMITTED_ERROR]));
      else
        h.call(this, this[EMITTED_ERROR]);
    }
    return ret;
  }
  removeListener(ev, handler) {
    return this.off(ev, handler);
  }
  off(ev, handler) {
    const ret = super.off(ev, handler);
    if (ev === "data") {
      this[DATALISTENERS] = this.listeners("data").length;
      if (this[DATALISTENERS] === 0 && !this[DISCARDED] && !this[PIPES].length) {
        this[FLOWING] = false;
      }
    }
    return ret;
  }
  removeAllListeners(ev) {
    const ret = super.removeAllListeners(ev);
    if (ev === "data" || ev === undefined) {
      this[DATALISTENERS] = 0;
      if (!this[DISCARDED] && !this[PIPES].length) {
        this[FLOWING] = false;
      }
    }
    return ret;
  }
  get emittedEnd() {
    return this[EMITTED_END];
  }
  [MAYBE_EMIT_END]() {
    if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
      this[EMITTING_END] = true;
      this.emit("end");
      this.emit("prefinish");
      this.emit("finish");
      if (this[CLOSED])
        this.emit("close");
      this[EMITTING_END] = false;
    }
  }
  emit(ev, ...args) {
    const data = args[0];
    if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) {
      return false;
    } else if (ev === "data") {
      return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? (defer(() => this[EMITDATA](data)), true) : this[EMITDATA](data);
    } else if (ev === "end") {
      return this[EMITEND]();
    } else if (ev === "close") {
      this[CLOSED] = true;
      if (!this[EMITTED_END] && !this[DESTROYED])
        return false;
      const ret2 = super.emit("close");
      this.removeAllListeners("close");
      return ret2;
    } else if (ev === "error") {
      this[EMITTED_ERROR] = data;
      super.emit(ERROR, data);
      const ret2 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
      this[MAYBE_EMIT_END]();
      return ret2;
    } else if (ev === "resume") {
      const ret2 = super.emit("resume");
      this[MAYBE_EMIT_END]();
      return ret2;
    } else if (ev === "finish" || ev === "prefinish") {
      const ret2 = super.emit(ev);
      this.removeAllListeners(ev);
      return ret2;
    }
    const ret = super.emit(ev, ...args);
    this[MAYBE_EMIT_END]();
    return ret;
  }
  [EMITDATA](data) {
    for (const p of this[PIPES]) {
      if (p.dest.write(data) === false)
        this.pause();
    }
    const ret = this[DISCARDED] ? false : super.emit("data", data);
    this[MAYBE_EMIT_END]();
    return ret;
  }
  [EMITEND]() {
    if (this[EMITTED_END])
      return false;
    this[EMITTED_END] = true;
    this.readable = false;
    return this[ASYNC] ? (defer(() => this[EMITEND2]()), true) : this[EMITEND2]();
  }
  [EMITEND2]() {
    if (this[DECODER]) {
      const data = this[DECODER].end();
      if (data) {
        for (const p of this[PIPES]) {
          p.dest.write(data);
        }
        if (!this[DISCARDED])
          super.emit("data", data);
      }
    }
    for (const p of this[PIPES]) {
      p.end();
    }
    const ret = super.emit("end");
    this.removeAllListeners("end");
    return ret;
  }
  async collect() {
    const buf = Object.assign([], {
      dataLength: 0
    });
    if (!this[OBJECTMODE])
      buf.dataLength = 0;
    const p = this.promise();
    this.on("data", (c) => {
      buf.push(c);
      if (!this[OBJECTMODE])
        buf.dataLength += c.length;
    });
    await p;
    return buf;
  }
  async concat() {
    if (this[OBJECTMODE]) {
      throw new Error("cannot concat in objectMode");
    }
    const buf = await this.collect();
    return this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength);
  }
  async promise() {
    return new Promise((resolve, reject) => {
      this.on(DESTROYED, () => reject(new Error("stream destroyed")));
      this.on("error", (er) => reject(er));
      this.on("end", () => resolve());
    });
  }
  [Symbol.asyncIterator]() {
    this[DISCARDED] = false;
    let stopped = false;
    const stop = async () => {
      this.pause();
      stopped = true;
      return { value: undefined, done: true };
    };
    const next = () => {
      if (stopped)
        return stop();
      const res = this.read();
      if (res !== null)
        return Promise.resolve({ done: false, value: res });
      if (this[EOF])
        return stop();
      let resolve;
      let reject;
      const onerr = (er) => {
        this.off("data", ondata);
        this.off("end", onend);
        this.off(DESTROYED, ondestroy);
        stop();
        reject(er);
      };
      const ondata = (value) => {
        this.off("error", onerr);
        this.off("end", onend);
        this.off(DESTROYED, ondestroy);
        this.pause();
        resolve({ value, done: !!this[EOF] });
      };
      const onend = () => {
        this.off("error", onerr);
        this.off("data", ondata);
        this.off(DESTROYED, ondestroy);
        stop();
        resolve({ done: true, value: undefined });
      };
      const ondestroy = () => onerr(new Error("stream destroyed"));
      return new Promise((res2, rej) => {
        reject = rej;
        resolve = res2;
        this.once(DESTROYED, ondestroy);
        this.once("error", onerr);
        this.once("end", onend);
        this.once("data", ondata);
      });
    };
    return {
      next,
      throw: stop,
      return: stop,
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
  [Symbol.iterator]() {
    this[DISCARDED] = false;
    let stopped = false;
    const stop = () => {
      this.pause();
      this.off(ERROR, stop);
      this.off(DESTROYED, stop);
      this.off("end", stop);
      stopped = true;
      return { done: true, value: undefined };
    };
    const next = () => {
      if (stopped)
        return stop();
      const value = this.read();
      return value === null ? stop() : { done: false, value };
    };
    this.once("end", stop);
    this.once(ERROR, stop);
    this.once(DESTROYED, stop);
    return {
      next,
      throw: stop,
      return: stop,
      [Symbol.iterator]() {
        return this;
      }
    };
  }
  destroy(er) {
    if (this[DESTROYED]) {
      if (er)
        this.emit("error", er);
      else
        this.emit(DESTROYED);
      return this;
    }
    this[DESTROYED] = true;
    this[DISCARDED] = true;
    this[BUFFER].length = 0;
    this[BUFFERLENGTH] = 0;
    const wc = this;
    if (typeof wc.close === "function" && !this[CLOSED])
      wc.close();
    if (er)
      this.emit("error", er);
    else
      this.emit(DESTROYED);
    return this;
  }
  static get isStream() {
    return isStream;
  }
}

// node_modules/path-scurry/dist/esm/index.js
var realpathSync = rps.native;
var defaultFS = {
  lstatSync,
  readdir: readdirCB,
  readdirSync,
  readlinkSync,
  realpathSync,
  promises: {
    lstat,
    readdir,
    readlink,
    realpath
  }
};
var fsFromOption = (fsOption) => !fsOption || fsOption === defaultFS || fsOption === actualFS ? defaultFS : {
  ...defaultFS,
  ...fsOption,
  promises: {
    ...defaultFS.promises,
    ...fsOption.promises || {}
  }
};
var uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
var uncToDrive = (rootPath) => rootPath.replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
var eitherSep = /[\\\/]/;
var UNKNOWN = 0;
var IFIFO = 1;
var IFCHR = 2;
var IFDIR = 4;
var IFBLK = 6;
var IFREG = 8;
var IFLNK = 10;
var IFSOCK = 12;
var IFMT = 15;
var IFMT_UNKNOWN = ~IFMT;
var READDIR_CALLED = 16;
var LSTAT_CALLED = 32;
var ENOTDIR = 64;
var ENOENT = 128;
var ENOREADLINK = 256;
var ENOREALPATH = 512;
var ENOCHILD = ENOTDIR | ENOENT | ENOREALPATH;
var TYPEMASK = 1023;
var entToType = (s) => s.isFile() ? IFREG : s.isDirectory() ? IFDIR : s.isSymbolicLink() ? IFLNK : s.isCharacterDevice() ? IFCHR : s.isBlockDevice() ? IFBLK : s.isSocket() ? IFSOCK : s.isFIFO() ? IFIFO : UNKNOWN;
var normalizeCache = new Map;
var normalize = (s) => {
  const c = normalizeCache.get(s);
  if (c)
    return c;
  const n = s.normalize("NFKD");
  normalizeCache.set(s, n);
  return n;
};
var normalizeNocaseCache = new Map;
var normalizeNocase = (s) => {
  const c = normalizeNocaseCache.get(s);
  if (c)
    return c;
  const n = normalize(s.toLowerCase());
  normalizeNocaseCache.set(s, n);
  return n;
};

class ResolveCache extends LRUCache {
  constructor() {
    super({ max: 256 });
  }
}

class ChildrenCache extends LRUCache {
  constructor(maxSize = 16 * 1024) {
    super({
      maxSize,
      sizeCalculation: (a) => a.length + 1
    });
  }
}
var setAsCwd = Symbol("PathScurry setAsCwd");

class PathBase {
  name;
  root;
  roots;
  parent;
  nocase;
  isCWD = false;
  #fs;
  #dev;
  get dev() {
    return this.#dev;
  }
  #mode;
  get mode() {
    return this.#mode;
  }
  #nlink;
  get nlink() {
    return this.#nlink;
  }
  #uid;
  get uid() {
    return this.#uid;
  }
  #gid;
  get gid() {
    return this.#gid;
  }
  #rdev;
  get rdev() {
    return this.#rdev;
  }
  #blksize;
  get blksize() {
    return this.#blksize;
  }
  #ino;
  get ino() {
    return this.#ino;
  }
  #size;
  get size() {
    return this.#size;
  }
  #blocks;
  get blocks() {
    return this.#blocks;
  }
  #atimeMs;
  get atimeMs() {
    return this.#atimeMs;
  }
  #mtimeMs;
  get mtimeMs() {
    return this.#mtimeMs;
  }
  #ctimeMs;
  get ctimeMs() {
    return this.#ctimeMs;
  }
  #birthtimeMs;
  get birthtimeMs() {
    return this.#birthtimeMs;
  }
  #atime;
  get atime() {
    return this.#atime;
  }
  #mtime;
  get mtime() {
    return this.#mtime;
  }
  #ctime;
  get ctime() {
    return this.#ctime;
  }
  #birthtime;
  get birthtime() {
    return this.#birthtime;
  }
  #matchName;
  #depth;
  #fullpath;
  #fullpathPosix;
  #relative;
  #relativePosix;
  #type;
  #children;
  #linkTarget;
  #realpath;
  get parentPath() {
    return (this.parent || this).fullpath();
  }
  get path() {
    return this.parentPath;
  }
  constructor(name2, type = UNKNOWN, root, roots, nocase, children, opts) {
    this.name = name2;
    this.#matchName = nocase ? normalizeNocase(name2) : normalize(name2);
    this.#type = type & TYPEMASK;
    this.nocase = nocase;
    this.roots = roots;
    this.root = root || this;
    this.#children = children;
    this.#fullpath = opts.fullpath;
    this.#relative = opts.relative;
    this.#relativePosix = opts.relativePosix;
    this.parent = opts.parent;
    if (this.parent) {
      this.#fs = this.parent.#fs;
    } else {
      this.#fs = fsFromOption(opts.fs);
    }
  }
  depth() {
    if (this.#depth !== undefined)
      return this.#depth;
    if (!this.parent)
      return this.#depth = 0;
    return this.#depth = this.parent.depth() + 1;
  }
  childrenCache() {
    return this.#children;
  }
  resolve(path2) {
    if (!path2) {
      return this;
    }
    const rootPath = this.getRootString(path2);
    const dir = path2.substring(rootPath.length);
    const dirParts = dir.split(this.splitSep);
    const result = rootPath ? this.getRoot(rootPath).#resolveParts(dirParts) : this.#resolveParts(dirParts);
    return result;
  }
  #resolveParts(dirParts) {
    let p = this;
    for (const part of dirParts) {
      p = p.child(part);
    }
    return p;
  }
  children() {
    const cached = this.#children.get(this);
    if (cached) {
      return cached;
    }
    const children = Object.assign([], { provisional: 0 });
    this.#children.set(this, children);
    this.#type &= ~READDIR_CALLED;
    return children;
  }
  child(pathPart, opts) {
    if (pathPart === "" || pathPart === ".") {
      return this;
    }
    if (pathPart === "..") {
      return this.parent || this;
    }
    const children = this.children();
    const name2 = this.nocase ? normalizeNocase(pathPart) : normalize(pathPart);
    for (const p of children) {
      if (p.#matchName === name2) {
        return p;
      }
    }
    const s = this.parent ? this.sep : "";
    const fullpath = this.#fullpath ? this.#fullpath + s + pathPart : undefined;
    const pchild = this.newChild(pathPart, UNKNOWN, {
      ...opts,
      parent: this,
      fullpath
    });
    if (!this.canReaddir()) {
      pchild.#type |= ENOENT;
    }
    children.push(pchild);
    return pchild;
  }
  relative() {
    if (this.isCWD)
      return "";
    if (this.#relative !== undefined) {
      return this.#relative;
    }
    const name2 = this.name;
    const p = this.parent;
    if (!p) {
      return this.#relative = this.name;
    }
    const pv = p.relative();
    return pv + (!pv || !p.parent ? "" : this.sep) + name2;
  }
  relativePosix() {
    if (this.sep === "/")
      return this.relative();
    if (this.isCWD)
      return "";
    if (this.#relativePosix !== undefined)
      return this.#relativePosix;
    const name2 = this.name;
    const p = this.parent;
    if (!p) {
      return this.#relativePosix = this.fullpathPosix();
    }
    const pv = p.relativePosix();
    return pv + (!pv || !p.parent ? "" : "/") + name2;
  }
  fullpath() {
    if (this.#fullpath !== undefined) {
      return this.#fullpath;
    }
    const name2 = this.name;
    const p = this.parent;
    if (!p) {
      return this.#fullpath = this.name;
    }
    const pv = p.fullpath();
    const fp = pv + (!p.parent ? "" : this.sep) + name2;
    return this.#fullpath = fp;
  }
  fullpathPosix() {
    if (this.#fullpathPosix !== undefined)
      return this.#fullpathPosix;
    if (this.sep === "/")
      return this.#fullpathPosix = this.fullpath();
    if (!this.parent) {
      const p2 = this.fullpath().replace(/\\/g, "/");
      if (/^[a-z]:\//i.test(p2)) {
        return this.#fullpathPosix = `//?/${p2}`;
      } else {
        return this.#fullpathPosix = p2;
      }
    }
    const p = this.parent;
    const pfpp = p.fullpathPosix();
    const fpp = pfpp + (!pfpp || !p.parent ? "" : "/") + this.name;
    return this.#fullpathPosix = fpp;
  }
  isUnknown() {
    return (this.#type & IFMT) === UNKNOWN;
  }
  isType(type) {
    return this[`is${type}`]();
  }
  getType() {
    return this.isUnknown() ? "Unknown" : this.isDirectory() ? "Directory" : this.isFile() ? "File" : this.isSymbolicLink() ? "SymbolicLink" : this.isFIFO() ? "FIFO" : this.isCharacterDevice() ? "CharacterDevice" : this.isBlockDevice() ? "BlockDevice" : this.isSocket() ? "Socket" : "Unknown";
  }
  isFile() {
    return (this.#type & IFMT) === IFREG;
  }
  isDirectory() {
    return (this.#type & IFMT) === IFDIR;
  }
  isCharacterDevice() {
    return (this.#type & IFMT) === IFCHR;
  }
  isBlockDevice() {
    return (this.#type & IFMT) === IFBLK;
  }
  isFIFO() {
    return (this.#type & IFMT) === IFIFO;
  }
  isSocket() {
    return (this.#type & IFMT) === IFSOCK;
  }
  isSymbolicLink() {
    return (this.#type & IFLNK) === IFLNK;
  }
  lstatCached() {
    return this.#type & LSTAT_CALLED ? this : undefined;
  }
  readlinkCached() {
    return this.#linkTarget;
  }
  realpathCached() {
    return this.#realpath;
  }
  readdirCached() {
    const children = this.children();
    return children.slice(0, children.provisional);
  }
  canReadlink() {
    if (this.#linkTarget)
      return true;
    if (!this.parent)
      return false;
    const ifmt = this.#type & IFMT;
    return !(ifmt !== UNKNOWN && ifmt !== IFLNK || this.#type & ENOREADLINK || this.#type & ENOENT);
  }
  calledReaddir() {
    return !!(this.#type & READDIR_CALLED);
  }
  isENOENT() {
    return !!(this.#type & ENOENT);
  }
  isNamed(n) {
    return !this.nocase ? this.#matchName === normalize(n) : this.#matchName === normalizeNocase(n);
  }
  async readlink() {
    const target = this.#linkTarget;
    if (target) {
      return target;
    }
    if (!this.canReadlink()) {
      return;
    }
    if (!this.parent) {
      return;
    }
    try {
      const read = await this.#fs.promises.readlink(this.fullpath());
      const linkTarget = (await this.parent.realpath())?.resolve(read);
      if (linkTarget) {
        return this.#linkTarget = linkTarget;
      }
    } catch (er) {
      this.#readlinkFail(er.code);
      return;
    }
  }
  readlinkSync() {
    const target = this.#linkTarget;
    if (target) {
      return target;
    }
    if (!this.canReadlink()) {
      return;
    }
    if (!this.parent) {
      return;
    }
    try {
      const read = this.#fs.readlinkSync(this.fullpath());
      const linkTarget = this.parent.realpathSync()?.resolve(read);
      if (linkTarget) {
        return this.#linkTarget = linkTarget;
      }
    } catch (er) {
      this.#readlinkFail(er.code);
      return;
    }
  }
  #readdirSuccess(children) {
    this.#type |= READDIR_CALLED;
    for (let p = children.provisional;p < children.length; p++) {
      const c = children[p];
      if (c)
        c.#markENOENT();
    }
  }
  #markENOENT() {
    if (this.#type & ENOENT)
      return;
    this.#type = (this.#type | ENOENT) & IFMT_UNKNOWN;
    this.#markChildrenENOENT();
  }
  #markChildrenENOENT() {
    const children = this.children();
    children.provisional = 0;
    for (const p of children) {
      p.#markENOENT();
    }
  }
  #markENOREALPATH() {
    this.#type |= ENOREALPATH;
    this.#markENOTDIR();
  }
  #markENOTDIR() {
    if (this.#type & ENOTDIR)
      return;
    let t = this.#type;
    if ((t & IFMT) === IFDIR)
      t &= IFMT_UNKNOWN;
    this.#type = t | ENOTDIR;
    this.#markChildrenENOENT();
  }
  #readdirFail(code = "") {
    if (code === "ENOTDIR" || code === "EPERM") {
      this.#markENOTDIR();
    } else if (code === "ENOENT") {
      this.#markENOENT();
    } else {
      this.children().provisional = 0;
    }
  }
  #lstatFail(code = "") {
    if (code === "ENOTDIR") {
      const p = this.parent;
      p.#markENOTDIR();
    } else if (code === "ENOENT") {
      this.#markENOENT();
    }
  }
  #readlinkFail(code = "") {
    let ter = this.#type;
    ter |= ENOREADLINK;
    if (code === "ENOENT")
      ter |= ENOENT;
    if (code === "EINVAL" || code === "UNKNOWN") {
      ter &= IFMT_UNKNOWN;
    }
    this.#type = ter;
    if (code === "ENOTDIR" && this.parent) {
      this.parent.#markENOTDIR();
    }
  }
  #readdirAddChild(e, c) {
    return this.#readdirMaybePromoteChild(e, c) || this.#readdirAddNewChild(e, c);
  }
  #readdirAddNewChild(e, c) {
    const type = entToType(e);
    const child = this.newChild(e.name, type, { parent: this });
    const ifmt = child.#type & IFMT;
    if (ifmt !== IFDIR && ifmt !== IFLNK && ifmt !== UNKNOWN) {
      child.#type |= ENOTDIR;
    }
    c.unshift(child);
    c.provisional++;
    return child;
  }
  #readdirMaybePromoteChild(e, c) {
    for (let p = c.provisional;p < c.length; p++) {
      const pchild = c[p];
      const name2 = this.nocase ? normalizeNocase(e.name) : normalize(e.name);
      if (name2 !== pchild.#matchName) {
        continue;
      }
      return this.#readdirPromoteChild(e, pchild, p, c);
    }
  }
  #readdirPromoteChild(e, p, index, c) {
    const v = p.name;
    p.#type = p.#type & IFMT_UNKNOWN | entToType(e);
    if (v !== e.name)
      p.name = e.name;
    if (index !== c.provisional) {
      if (index === c.length - 1)
        c.pop();
      else
        c.splice(index, 1);
      c.unshift(p);
    }
    c.provisional++;
    return p;
  }
  async lstat() {
    if ((this.#type & ENOENT) === 0) {
      try {
        this.#applyStat(await this.#fs.promises.lstat(this.fullpath()));
        return this;
      } catch (er) {
        this.#lstatFail(er.code);
      }
    }
  }
  lstatSync() {
    if ((this.#type & ENOENT) === 0) {
      try {
        this.#applyStat(this.#fs.lstatSync(this.fullpath()));
        return this;
      } catch (er) {
        this.#lstatFail(er.code);
      }
    }
  }
  #applyStat(st) {
    const { atime, atimeMs, birthtime, birthtimeMs, blksize, blocks, ctime, ctimeMs, dev, gid, ino, mode, mtime, mtimeMs, nlink, rdev, size, uid } = st;
    this.#atime = atime;
    this.#atimeMs = atimeMs;
    this.#birthtime = birthtime;
    this.#birthtimeMs = birthtimeMs;
    this.#blksize = blksize;
    this.#blocks = blocks;
    this.#ctime = ctime;
    this.#ctimeMs = ctimeMs;
    this.#dev = dev;
    this.#gid = gid;
    this.#ino = ino;
    this.#mode = mode;
    this.#mtime = mtime;
    this.#mtimeMs = mtimeMs;
    this.#nlink = nlink;
    this.#rdev = rdev;
    this.#size = size;
    this.#uid = uid;
    const ifmt = entToType(st);
    this.#type = this.#type & IFMT_UNKNOWN | ifmt | LSTAT_CALLED;
    if (ifmt !== UNKNOWN && ifmt !== IFDIR && ifmt !== IFLNK) {
      this.#type |= ENOTDIR;
    }
  }
  #onReaddirCB = [];
  #readdirCBInFlight = false;
  #callOnReaddirCB(children) {
    this.#readdirCBInFlight = false;
    const cbs = this.#onReaddirCB.slice();
    this.#onReaddirCB.length = 0;
    cbs.forEach((cb) => cb(null, children));
  }
  readdirCB(cb, allowZalgo = false) {
    if (!this.canReaddir()) {
      if (allowZalgo)
        cb(null, []);
      else
        queueMicrotask(() => cb(null, []));
      return;
    }
    const children = this.children();
    if (this.calledReaddir()) {
      const c = children.slice(0, children.provisional);
      if (allowZalgo)
        cb(null, c);
      else
        queueMicrotask(() => cb(null, c));
      return;
    }
    this.#onReaddirCB.push(cb);
    if (this.#readdirCBInFlight) {
      return;
    }
    this.#readdirCBInFlight = true;
    const fullpath = this.fullpath();
    this.#fs.readdir(fullpath, { withFileTypes: true }, (er, entries) => {
      if (er) {
        this.#readdirFail(er.code);
        children.provisional = 0;
      } else {
        for (const e of entries) {
          this.#readdirAddChild(e, children);
        }
        this.#readdirSuccess(children);
      }
      this.#callOnReaddirCB(children.slice(0, children.provisional));
      return;
    });
  }
  #asyncReaddirInFlight;
  async readdir() {
    if (!this.canReaddir()) {
      return [];
    }
    const children = this.children();
    if (this.calledReaddir()) {
      return children.slice(0, children.provisional);
    }
    const fullpath = this.fullpath();
    if (this.#asyncReaddirInFlight) {
      await this.#asyncReaddirInFlight;
    } else {
      let resolve = () => {};
      this.#asyncReaddirInFlight = new Promise((res) => resolve = res);
      try {
        for (const e of await this.#fs.promises.readdir(fullpath, {
          withFileTypes: true
        })) {
          this.#readdirAddChild(e, children);
        }
        this.#readdirSuccess(children);
      } catch (er) {
        this.#readdirFail(er.code);
        children.provisional = 0;
      }
      this.#asyncReaddirInFlight = undefined;
      resolve();
    }
    return children.slice(0, children.provisional);
  }
  readdirSync() {
    if (!this.canReaddir()) {
      return [];
    }
    const children = this.children();
    if (this.calledReaddir()) {
      return children.slice(0, children.provisional);
    }
    const fullpath = this.fullpath();
    try {
      for (const e of this.#fs.readdirSync(fullpath, {
        withFileTypes: true
      })) {
        this.#readdirAddChild(e, children);
      }
      this.#readdirSuccess(children);
    } catch (er) {
      this.#readdirFail(er.code);
      children.provisional = 0;
    }
    return children.slice(0, children.provisional);
  }
  canReaddir() {
    if (this.#type & ENOCHILD)
      return false;
    const ifmt = IFMT & this.#type;
    if (!(ifmt === UNKNOWN || ifmt === IFDIR || ifmt === IFLNK)) {
      return false;
    }
    return true;
  }
  shouldWalk(dirs, walkFilter) {
    return (this.#type & IFDIR) === IFDIR && !(this.#type & ENOCHILD) && !dirs.has(this) && (!walkFilter || walkFilter(this));
  }
  async realpath() {
    if (this.#realpath)
      return this.#realpath;
    if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
      return;
    try {
      const rp = await this.#fs.promises.realpath(this.fullpath());
      return this.#realpath = this.resolve(rp);
    } catch (_) {
      this.#markENOREALPATH();
    }
  }
  realpathSync() {
    if (this.#realpath)
      return this.#realpath;
    if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
      return;
    try {
      const rp = this.#fs.realpathSync(this.fullpath());
      return this.#realpath = this.resolve(rp);
    } catch (_) {
      this.#markENOREALPATH();
    }
  }
  [setAsCwd](oldCwd) {
    if (oldCwd === this)
      return;
    oldCwd.isCWD = false;
    this.isCWD = true;
    const changed = new Set([]);
    let rp = [];
    let p = this;
    while (p && p.parent) {
      changed.add(p);
      p.#relative = rp.join(this.sep);
      p.#relativePosix = rp.join("/");
      p = p.parent;
      rp.push("..");
    }
    p = oldCwd;
    while (p && p.parent && !changed.has(p)) {
      p.#relative = undefined;
      p.#relativePosix = undefined;
      p = p.parent;
    }
  }
}

class PathWin32 extends PathBase {
  sep = "\\";
  splitSep = eitherSep;
  constructor(name2, type = UNKNOWN, root, roots, nocase, children, opts) {
    super(name2, type, root, roots, nocase, children, opts);
  }
  newChild(name2, type = UNKNOWN, opts = {}) {
    return new PathWin32(name2, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
  }
  getRootString(path2) {
    return win32.parse(path2).root;
  }
  getRoot(rootPath) {
    rootPath = uncToDrive(rootPath.toUpperCase());
    if (rootPath === this.root.name) {
      return this.root;
    }
    for (const [compare, root] of Object.entries(this.roots)) {
      if (this.sameRoot(rootPath, compare)) {
        return this.roots[rootPath] = root;
      }
    }
    return this.roots[rootPath] = new PathScurryWin32(rootPath, this).root;
  }
  sameRoot(rootPath, compare = this.root.name) {
    rootPath = rootPath.toUpperCase().replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
    return rootPath === compare;
  }
}

class PathPosix extends PathBase {
  splitSep = "/";
  sep = "/";
  constructor(name2, type = UNKNOWN, root, roots, nocase, children, opts) {
    super(name2, type, root, roots, nocase, children, opts);
  }
  getRootString(path2) {
    return path2.startsWith("/") ? "/" : "";
  }
  getRoot(_rootPath) {
    return this.root;
  }
  newChild(name2, type = UNKNOWN, opts = {}) {
    return new PathPosix(name2, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
  }
}

class PathScurryBase {
  root;
  rootPath;
  roots;
  cwd;
  #resolveCache;
  #resolvePosixCache;
  #children;
  nocase;
  #fs;
  constructor(cwd = process.cwd(), pathImpl, sep2, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS } = {}) {
    this.#fs = fsFromOption(fs);
    if (cwd instanceof URL || cwd.startsWith("file://")) {
      cwd = fileURLToPath(cwd);
    }
    const cwdPath = pathImpl.resolve(cwd);
    this.roots = Object.create(null);
    this.rootPath = this.parseRootPath(cwdPath);
    this.#resolveCache = new ResolveCache;
    this.#resolvePosixCache = new ResolveCache;
    this.#children = new ChildrenCache(childrenCacheSize);
    const split = cwdPath.substring(this.rootPath.length).split(sep2);
    if (split.length === 1 && !split[0]) {
      split.pop();
    }
    if (nocase === undefined) {
      throw new TypeError("must provide nocase setting to PathScurryBase ctor");
    }
    this.nocase = nocase;
    this.root = this.newRoot(this.#fs);
    this.roots[this.rootPath] = this.root;
    let prev = this.root;
    let len = split.length - 1;
    const joinSep = pathImpl.sep;
    let abs = this.rootPath;
    let sawFirst = false;
    for (const part of split) {
      const l = len--;
      prev = prev.child(part, {
        relative: new Array(l).fill("..").join(joinSep),
        relativePosix: new Array(l).fill("..").join("/"),
        fullpath: abs += (sawFirst ? "" : joinSep) + part
      });
      sawFirst = true;
    }
    this.cwd = prev;
  }
  depth(path2 = this.cwd) {
    if (typeof path2 === "string") {
      path2 = this.cwd.resolve(path2);
    }
    return path2.depth();
  }
  childrenCache() {
    return this.#children;
  }
  resolve(...paths) {
    let r = "";
    for (let i = paths.length - 1;i >= 0; i--) {
      const p = paths[i];
      if (!p || p === ".")
        continue;
      r = r ? `${p}/${r}` : p;
      if (this.isAbsolute(p)) {
        break;
      }
    }
    const cached = this.#resolveCache.get(r);
    if (cached !== undefined) {
      return cached;
    }
    const result = this.cwd.resolve(r).fullpath();
    this.#resolveCache.set(r, result);
    return result;
  }
  resolvePosix(...paths) {
    let r = "";
    for (let i = paths.length - 1;i >= 0; i--) {
      const p = paths[i];
      if (!p || p === ".")
        continue;
      r = r ? `${p}/${r}` : p;
      if (this.isAbsolute(p)) {
        break;
      }
    }
    const cached = this.#resolvePosixCache.get(r);
    if (cached !== undefined) {
      return cached;
    }
    const result = this.cwd.resolve(r).fullpathPosix();
    this.#resolvePosixCache.set(r, result);
    return result;
  }
  relative(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.relative();
  }
  relativePosix(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.relativePosix();
  }
  basename(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.name;
  }
  dirname(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return (entry.parent || entry).fullpath();
  }
  async readdir(entry = this.cwd, opts = {
    withFileTypes: true
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes } = opts;
    if (!entry.canReaddir()) {
      return [];
    } else {
      const p = await entry.readdir();
      return withFileTypes ? p : p.map((e) => e.name);
    }
  }
  readdirSync(entry = this.cwd, opts = {
    withFileTypes: true
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true } = opts;
    if (!entry.canReaddir()) {
      return [];
    } else if (withFileTypes) {
      return entry.readdirSync();
    } else {
      return entry.readdirSync().map((e) => e.name);
    }
  }
  async lstat(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.lstat();
  }
  lstatSync(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.lstatSync();
  }
  async readlink(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = await entry.readlink();
    return withFileTypes ? e : e?.fullpath();
  }
  readlinkSync(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = entry.readlinkSync();
    return withFileTypes ? e : e?.fullpath();
  }
  async realpath(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = await entry.realpath();
    return withFileTypes ? e : e?.fullpath();
  }
  realpathSync(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = entry.realpathSync();
    return withFileTypes ? e : e?.fullpath();
  }
  async walk(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = [];
    if (!filter2 || filter2(entry)) {
      results.push(withFileTypes ? entry : entry.fullpath());
    }
    const dirs = new Set;
    const walk = (dir, cb) => {
      dirs.add(dir);
      dir.readdirCB((er, entries) => {
        if (er) {
          return cb(er);
        }
        let len = entries.length;
        if (!len)
          return cb();
        const next = () => {
          if (--len === 0) {
            cb();
          }
        };
        for (const e of entries) {
          if (!filter2 || filter2(e)) {
            results.push(withFileTypes ? e : e.fullpath());
          }
          if (follow && e.isSymbolicLink()) {
            e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r).then((r) => r?.shouldWalk(dirs, walkFilter) ? walk(r, next) : next());
          } else {
            if (e.shouldWalk(dirs, walkFilter)) {
              walk(e, next);
            } else {
              next();
            }
          }
        }
      }, true);
    };
    const start = entry;
    return new Promise((res, rej) => {
      walk(start, (er) => {
        if (er)
          return rej(er);
        res(results);
      });
    });
  }
  walkSync(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = [];
    if (!filter2 || filter2(entry)) {
      results.push(withFileTypes ? entry : entry.fullpath());
    }
    const dirs = new Set([entry]);
    for (const dir of dirs) {
      const entries = dir.readdirSync();
      for (const e of entries) {
        if (!filter2 || filter2(e)) {
          results.push(withFileTypes ? e : e.fullpath());
        }
        let r = e;
        if (e.isSymbolicLink()) {
          if (!(follow && (r = e.realpathSync())))
            continue;
          if (r.isUnknown())
            r.lstatSync();
        }
        if (r.shouldWalk(dirs, walkFilter)) {
          dirs.add(r);
        }
      }
    }
    return results;
  }
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
  iterate(entry = this.cwd, options = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      options = entry;
      entry = this.cwd;
    }
    return this.stream(entry, options)[Symbol.asyncIterator]();
  }
  [Symbol.iterator]() {
    return this.iterateSync();
  }
  *iterateSync(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    if (!filter2 || filter2(entry)) {
      yield withFileTypes ? entry : entry.fullpath();
    }
    const dirs = new Set([entry]);
    for (const dir of dirs) {
      const entries = dir.readdirSync();
      for (const e of entries) {
        if (!filter2 || filter2(e)) {
          yield withFileTypes ? e : e.fullpath();
        }
        let r = e;
        if (e.isSymbolicLink()) {
          if (!(follow && (r = e.realpathSync())))
            continue;
          if (r.isUnknown())
            r.lstatSync();
        }
        if (r.shouldWalk(dirs, walkFilter)) {
          dirs.add(r);
        }
      }
    }
  }
  stream(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = new Minipass({ objectMode: true });
    if (!filter2 || filter2(entry)) {
      results.write(withFileTypes ? entry : entry.fullpath());
    }
    const dirs = new Set;
    const queue = [entry];
    let processing = 0;
    const process2 = () => {
      let paused = false;
      while (!paused) {
        const dir = queue.shift();
        if (!dir) {
          if (processing === 0)
            results.end();
          return;
        }
        processing++;
        dirs.add(dir);
        const onReaddir = (er, entries, didRealpaths = false) => {
          if (er)
            return results.emit("error", er);
          if (follow && !didRealpaths) {
            const promises = [];
            for (const e of entries) {
              if (e.isSymbolicLink()) {
                promises.push(e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r));
              }
            }
            if (promises.length) {
              Promise.all(promises).then(() => onReaddir(null, entries, true));
              return;
            }
          }
          for (const e of entries) {
            if (e && (!filter2 || filter2(e))) {
              if (!results.write(withFileTypes ? e : e.fullpath())) {
                paused = true;
              }
            }
          }
          processing--;
          for (const e of entries) {
            const r = e.realpathCached() || e;
            if (r.shouldWalk(dirs, walkFilter)) {
              queue.push(r);
            }
          }
          if (paused && !results.flowing) {
            results.once("drain", process2);
          } else if (!sync) {
            process2();
          }
        };
        let sync = true;
        dir.readdirCB(onReaddir, true);
        sync = false;
      }
    };
    process2();
    return results;
  }
  streamSync(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = new Minipass({ objectMode: true });
    const dirs = new Set;
    if (!filter2 || filter2(entry)) {
      results.write(withFileTypes ? entry : entry.fullpath());
    }
    const queue = [entry];
    let processing = 0;
    const process2 = () => {
      let paused = false;
      while (!paused) {
        const dir = queue.shift();
        if (!dir) {
          if (processing === 0)
            results.end();
          return;
        }
        processing++;
        dirs.add(dir);
        const entries = dir.readdirSync();
        for (const e of entries) {
          if (!filter2 || filter2(e)) {
            if (!results.write(withFileTypes ? e : e.fullpath())) {
              paused = true;
            }
          }
        }
        processing--;
        for (const e of entries) {
          let r = e;
          if (e.isSymbolicLink()) {
            if (!(follow && (r = e.realpathSync())))
              continue;
            if (r.isUnknown())
              r.lstatSync();
          }
          if (r.shouldWalk(dirs, walkFilter)) {
            queue.push(r);
          }
        }
      }
      if (paused && !results.flowing)
        results.once("drain", process2);
    };
    process2();
    return results;
  }
  chdir(path2 = this.cwd) {
    const oldCwd = this.cwd;
    this.cwd = typeof path2 === "string" ? this.cwd.resolve(path2) : path2;
    this.cwd[setAsCwd](oldCwd);
  }
}

class PathScurryWin32 extends PathScurryBase {
  sep = "\\";
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = true } = opts;
    super(cwd, win32, "\\", { ...opts, nocase });
    this.nocase = nocase;
    for (let p = this.cwd;p; p = p.parent) {
      p.nocase = this.nocase;
    }
  }
  parseRootPath(dir) {
    return win32.parse(dir).root.toUpperCase();
  }
  newRoot(fs) {
    return new PathWin32(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
  }
  isAbsolute(p) {
    return p.startsWith("/") || p.startsWith("\\") || /^[a-z]:(\/|\\)/i.test(p);
  }
}

class PathScurryPosix extends PathScurryBase {
  sep = "/";
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = false } = opts;
    super(cwd, posix, "/", { ...opts, nocase });
    this.nocase = nocase;
  }
  parseRootPath(_dir) {
    return "/";
  }
  newRoot(fs) {
    return new PathPosix(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
  }
  isAbsolute(p) {
    return p.startsWith("/");
  }
}

class PathScurryDarwin extends PathScurryPosix {
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = true } = opts;
    super(cwd, { ...opts, nocase });
  }
}
var Path = process.platform === "win32" ? PathWin32 : PathPosix;
var PathScurry = process.platform === "win32" ? PathScurryWin32 : process.platform === "darwin" ? PathScurryDarwin : PathScurryPosix;

// node_modules/glob/dist/esm/pattern.js
var isPatternList = (pl) => pl.length >= 1;
var isGlobList = (gl) => gl.length >= 1;

class Pattern {
  #patternList;
  #globList;
  #index;
  length;
  #platform;
  #rest;
  #globString;
  #isDrive;
  #isUNC;
  #isAbsolute;
  #followGlobstar = true;
  constructor(patternList, globList, index, platform) {
    if (!isPatternList(patternList)) {
      throw new TypeError("empty pattern list");
    }
    if (!isGlobList(globList)) {
      throw new TypeError("empty glob list");
    }
    if (globList.length !== patternList.length) {
      throw new TypeError("mismatched pattern list and glob list lengths");
    }
    this.length = patternList.length;
    if (index < 0 || index >= this.length) {
      throw new TypeError("index out of range");
    }
    this.#patternList = patternList;
    this.#globList = globList;
    this.#index = index;
    this.#platform = platform;
    if (this.#index === 0) {
      if (this.isUNC()) {
        const [p0, p1, p2, p3, ...prest] = this.#patternList;
        const [g0, g1, g2, g3, ...grest] = this.#globList;
        if (prest[0] === "") {
          prest.shift();
          grest.shift();
        }
        const p = [p0, p1, p2, p3, ""].join("/");
        const g = [g0, g1, g2, g3, ""].join("/");
        this.#patternList = [p, ...prest];
        this.#globList = [g, ...grest];
        this.length = this.#patternList.length;
      } else if (this.isDrive() || this.isAbsolute()) {
        const [p1, ...prest] = this.#patternList;
        const [g1, ...grest] = this.#globList;
        if (prest[0] === "") {
          prest.shift();
          grest.shift();
        }
        const p = p1 + "/";
        const g = g1 + "/";
        this.#patternList = [p, ...prest];
        this.#globList = [g, ...grest];
        this.length = this.#patternList.length;
      }
    }
  }
  pattern() {
    return this.#patternList[this.#index];
  }
  isString() {
    return typeof this.#patternList[this.#index] === "string";
  }
  isGlobstar() {
    return this.#patternList[this.#index] === GLOBSTAR;
  }
  isRegExp() {
    return this.#patternList[this.#index] instanceof RegExp;
  }
  globString() {
    return this.#globString = this.#globString || (this.#index === 0 ? this.isAbsolute() ? this.#globList[0] + this.#globList.slice(1).join("/") : this.#globList.join("/") : this.#globList.slice(this.#index).join("/"));
  }
  hasMore() {
    return this.length > this.#index + 1;
  }
  rest() {
    if (this.#rest !== undefined)
      return this.#rest;
    if (!this.hasMore())
      return this.#rest = null;
    this.#rest = new Pattern(this.#patternList, this.#globList, this.#index + 1, this.#platform);
    this.#rest.#isAbsolute = this.#isAbsolute;
    this.#rest.#isUNC = this.#isUNC;
    this.#rest.#isDrive = this.#isDrive;
    return this.#rest;
  }
  isUNC() {
    const pl = this.#patternList;
    return this.#isUNC !== undefined ? this.#isUNC : this.#isUNC = this.#platform === "win32" && this.#index === 0 && pl[0] === "" && pl[1] === "" && typeof pl[2] === "string" && !!pl[2] && typeof pl[3] === "string" && !!pl[3];
  }
  isDrive() {
    const pl = this.#patternList;
    return this.#isDrive !== undefined ? this.#isDrive : this.#isDrive = this.#platform === "win32" && this.#index === 0 && this.length > 1 && typeof pl[0] === "string" && /^[a-z]:$/i.test(pl[0]);
  }
  isAbsolute() {
    const pl = this.#patternList;
    return this.#isAbsolute !== undefined ? this.#isAbsolute : this.#isAbsolute = pl[0] === "" && pl.length > 1 || this.isDrive() || this.isUNC();
  }
  root() {
    const p = this.#patternList[0];
    return typeof p === "string" && this.isAbsolute() && this.#index === 0 ? p : "";
  }
  checkFollowGlobstar() {
    return !(this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar);
  }
  markFollowGlobstar() {
    if (this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar)
      return false;
    this.#followGlobstar = false;
    return true;
  }
}

// node_modules/glob/dist/esm/ignore.js
var defaultPlatform2 = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";

class Ignore {
  relative;
  relativeChildren;
  absolute;
  absoluteChildren;
  platform;
  mmopts;
  constructor(ignored, { nobrace, nocase, noext, noglobstar, platform = defaultPlatform2 }) {
    this.relative = [];
    this.absolute = [];
    this.relativeChildren = [];
    this.absoluteChildren = [];
    this.platform = platform;
    this.mmopts = {
      dot: true,
      nobrace,
      nocase,
      noext,
      noglobstar,
      optimizationLevel: 2,
      platform,
      nocomment: true,
      nonegate: true
    };
    for (const ign of ignored)
      this.add(ign);
  }
  add(ign) {
    const mm = new Minimatch(ign, this.mmopts);
    for (let i = 0;i < mm.set.length; i++) {
      const parsed = mm.set[i];
      const globParts = mm.globParts[i];
      if (!parsed || !globParts) {
        throw new Error("invalid pattern object");
      }
      while (parsed[0] === "." && globParts[0] === ".") {
        parsed.shift();
        globParts.shift();
      }
      const p = new Pattern(parsed, globParts, 0, this.platform);
      const m = new Minimatch(p.globString(), this.mmopts);
      const children = globParts[globParts.length - 1] === "**";
      const absolute = p.isAbsolute();
      if (absolute)
        this.absolute.push(m);
      else
        this.relative.push(m);
      if (children) {
        if (absolute)
          this.absoluteChildren.push(m);
        else
          this.relativeChildren.push(m);
      }
    }
  }
  ignored(p) {
    const fullpath = p.fullpath();
    const fullpaths = `${fullpath}/`;
    const relative = p.relative() || ".";
    const relatives = `${relative}/`;
    for (const m of this.relative) {
      if (m.match(relative) || m.match(relatives))
        return true;
    }
    for (const m of this.absolute) {
      if (m.match(fullpath) || m.match(fullpaths))
        return true;
    }
    return false;
  }
  childrenIgnored(p) {
    const fullpath = p.fullpath() + "/";
    const relative = (p.relative() || ".") + "/";
    for (const m of this.relativeChildren) {
      if (m.match(relative))
        return true;
    }
    for (const m of this.absoluteChildren) {
      if (m.match(fullpath))
        return true;
    }
    return false;
  }
}

// node_modules/glob/dist/esm/processor.js
class HasWalkedCache {
  store;
  constructor(store = new Map) {
    this.store = store;
  }
  copy() {
    return new HasWalkedCache(new Map(this.store));
  }
  hasWalked(target, pattern) {
    return this.store.get(target.fullpath())?.has(pattern.globString());
  }
  storeWalked(target, pattern) {
    const fullpath = target.fullpath();
    const cached = this.store.get(fullpath);
    if (cached)
      cached.add(pattern.globString());
    else
      this.store.set(fullpath, new Set([pattern.globString()]));
  }
}

class MatchRecord {
  store = new Map;
  add(target, absolute, ifDir) {
    const n = (absolute ? 2 : 0) | (ifDir ? 1 : 0);
    const current = this.store.get(target);
    this.store.set(target, current === undefined ? n : n & current);
  }
  entries() {
    return [...this.store.entries()].map(([path2, n]) => [
      path2,
      !!(n & 2),
      !!(n & 1)
    ]);
  }
}

class SubWalks {
  store = new Map;
  add(target, pattern) {
    if (!target.canReaddir()) {
      return;
    }
    const subs = this.store.get(target);
    if (subs) {
      if (!subs.find((p) => p.globString() === pattern.globString())) {
        subs.push(pattern);
      }
    } else
      this.store.set(target, [pattern]);
  }
  get(target) {
    const subs = this.store.get(target);
    if (!subs) {
      throw new Error("attempting to walk unknown path");
    }
    return subs;
  }
  entries() {
    return this.keys().map((k) => [k, this.store.get(k)]);
  }
  keys() {
    return [...this.store.keys()].filter((t) => t.canReaddir());
  }
}

class Processor {
  hasWalkedCache;
  matches = new MatchRecord;
  subwalks = new SubWalks;
  patterns;
  follow;
  dot;
  opts;
  constructor(opts, hasWalkedCache) {
    this.opts = opts;
    this.follow = !!opts.follow;
    this.dot = !!opts.dot;
    this.hasWalkedCache = hasWalkedCache ? hasWalkedCache.copy() : new HasWalkedCache;
  }
  processPatterns(target, patterns) {
    this.patterns = patterns;
    const processingSet = patterns.map((p) => [target, p]);
    for (let [t, pattern] of processingSet) {
      this.hasWalkedCache.storeWalked(t, pattern);
      const root = pattern.root();
      const absolute = pattern.isAbsolute() && this.opts.absolute !== false;
      if (root) {
        t = t.resolve(root === "/" && this.opts.root !== undefined ? this.opts.root : root);
        const rest2 = pattern.rest();
        if (!rest2) {
          this.matches.add(t, true, false);
          continue;
        } else {
          pattern = rest2;
        }
      }
      if (t.isENOENT())
        continue;
      let p;
      let rest;
      let changed = false;
      while (typeof (p = pattern.pattern()) === "string" && (rest = pattern.rest())) {
        const c = t.resolve(p);
        t = c;
        pattern = rest;
        changed = true;
      }
      p = pattern.pattern();
      rest = pattern.rest();
      if (changed) {
        if (this.hasWalkedCache.hasWalked(t, pattern))
          continue;
        this.hasWalkedCache.storeWalked(t, pattern);
      }
      if (typeof p === "string") {
        const ifDir = p === ".." || p === "" || p === ".";
        this.matches.add(t.resolve(p), absolute, ifDir);
        continue;
      } else if (p === GLOBSTAR) {
        if (!t.isSymbolicLink() || this.follow || pattern.checkFollowGlobstar()) {
          this.subwalks.add(t, pattern);
        }
        const rp = rest?.pattern();
        const rrest = rest?.rest();
        if (!rest || (rp === "" || rp === ".") && !rrest) {
          this.matches.add(t, absolute, rp === "" || rp === ".");
        } else {
          if (rp === "..") {
            const tp = t.parent || t;
            if (!rrest)
              this.matches.add(tp, absolute, true);
            else if (!this.hasWalkedCache.hasWalked(tp, rrest)) {
              this.subwalks.add(tp, rrest);
            }
          }
        }
      } else if (p instanceof RegExp) {
        this.subwalks.add(t, pattern);
      }
    }
    return this;
  }
  subwalkTargets() {
    return this.subwalks.keys();
  }
  child() {
    return new Processor(this.opts, this.hasWalkedCache);
  }
  filterEntries(parent, entries) {
    const patterns = this.subwalks.get(parent);
    const results = this.child();
    for (const e of entries) {
      for (const pattern of patterns) {
        const absolute = pattern.isAbsolute();
        const p = pattern.pattern();
        const rest = pattern.rest();
        if (p === GLOBSTAR) {
          results.testGlobstar(e, pattern, rest, absolute);
        } else if (p instanceof RegExp) {
          results.testRegExp(e, p, rest, absolute);
        } else {
          results.testString(e, p, rest, absolute);
        }
      }
    }
    return results;
  }
  testGlobstar(e, pattern, rest, absolute) {
    if (this.dot || !e.name.startsWith(".")) {
      if (!pattern.hasMore()) {
        this.matches.add(e, absolute, false);
      }
      if (e.canReaddir()) {
        if (this.follow || !e.isSymbolicLink()) {
          this.subwalks.add(e, pattern);
        } else if (e.isSymbolicLink()) {
          if (rest && pattern.checkFollowGlobstar()) {
            this.subwalks.add(e, rest);
          } else if (pattern.markFollowGlobstar()) {
            this.subwalks.add(e, pattern);
          }
        }
      }
    }
    if (rest) {
      const rp = rest.pattern();
      if (typeof rp === "string" && rp !== ".." && rp !== "" && rp !== ".") {
        this.testString(e, rp, rest.rest(), absolute);
      } else if (rp === "..") {
        const ep = e.parent || e;
        this.subwalks.add(ep, rest);
      } else if (rp instanceof RegExp) {
        this.testRegExp(e, rp, rest.rest(), absolute);
      }
    }
  }
  testRegExp(e, p, rest, absolute) {
    if (!p.test(e.name))
      return;
    if (!rest) {
      this.matches.add(e, absolute, false);
    } else {
      this.subwalks.add(e, rest);
    }
  }
  testString(e, p, rest, absolute) {
    if (!e.isNamed(p))
      return;
    if (!rest) {
      this.matches.add(e, absolute, false);
    } else {
      this.subwalks.add(e, rest);
    }
  }
}

// node_modules/glob/dist/esm/walker.js
var makeIgnore = (ignore, opts) => typeof ignore === "string" ? new Ignore([ignore], opts) : Array.isArray(ignore) ? new Ignore(ignore, opts) : ignore;

class GlobUtil {
  path;
  patterns;
  opts;
  seen = new Set;
  paused = false;
  aborted = false;
  #onResume = [];
  #ignore;
  #sep;
  signal;
  maxDepth;
  includeChildMatches;
  constructor(patterns, path2, opts) {
    this.patterns = patterns;
    this.path = path2;
    this.opts = opts;
    this.#sep = !opts.posix && opts.platform === "win32" ? "\\" : "/";
    this.includeChildMatches = opts.includeChildMatches !== false;
    if (opts.ignore || !this.includeChildMatches) {
      this.#ignore = makeIgnore(opts.ignore ?? [], opts);
      if (!this.includeChildMatches && typeof this.#ignore.add !== "function") {
        const m = "cannot ignore child matches, ignore lacks add() method.";
        throw new Error(m);
      }
    }
    this.maxDepth = opts.maxDepth || Infinity;
    if (opts.signal) {
      this.signal = opts.signal;
      this.signal.addEventListener("abort", () => {
        this.#onResume.length = 0;
      });
    }
  }
  #ignored(path2) {
    return this.seen.has(path2) || !!this.#ignore?.ignored?.(path2);
  }
  #childrenIgnored(path2) {
    return !!this.#ignore?.childrenIgnored?.(path2);
  }
  pause() {
    this.paused = true;
  }
  resume() {
    if (this.signal?.aborted)
      return;
    this.paused = false;
    let fn2 = undefined;
    while (!this.paused && (fn2 = this.#onResume.shift())) {
      fn2();
    }
  }
  onResume(fn2) {
    if (this.signal?.aborted)
      return;
    if (!this.paused) {
      fn2();
    } else {
      this.#onResume.push(fn2);
    }
  }
  async matchCheck(e, ifDir) {
    if (ifDir && this.opts.nodir)
      return;
    let rpc;
    if (this.opts.realpath) {
      rpc = e.realpathCached() || await e.realpath();
      if (!rpc)
        return;
      e = rpc;
    }
    const needStat = e.isUnknown() || this.opts.stat;
    const s = needStat ? await e.lstat() : e;
    if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
      const target = await s.realpath();
      if (target && (target.isUnknown() || this.opts.stat)) {
        await target.lstat();
      }
    }
    return this.matchCheckTest(s, ifDir);
  }
  matchCheckTest(e, ifDir) {
    return e && (this.maxDepth === Infinity || e.depth() <= this.maxDepth) && (!ifDir || e.canReaddir()) && (!this.opts.nodir || !e.isDirectory()) && (!this.opts.nodir || !this.opts.follow || !e.isSymbolicLink() || !e.realpathCached()?.isDirectory()) && !this.#ignored(e) ? e : undefined;
  }
  matchCheckSync(e, ifDir) {
    if (ifDir && this.opts.nodir)
      return;
    let rpc;
    if (this.opts.realpath) {
      rpc = e.realpathCached() || e.realpathSync();
      if (!rpc)
        return;
      e = rpc;
    }
    const needStat = e.isUnknown() || this.opts.stat;
    const s = needStat ? e.lstatSync() : e;
    if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
      const target = s.realpathSync();
      if (target && (target?.isUnknown() || this.opts.stat)) {
        target.lstatSync();
      }
    }
    return this.matchCheckTest(s, ifDir);
  }
  matchFinish(e, absolute) {
    if (this.#ignored(e))
      return;
    if (!this.includeChildMatches && this.#ignore?.add) {
      const ign = `${e.relativePosix()}/**`;
      this.#ignore.add(ign);
    }
    const abs = this.opts.absolute === undefined ? absolute : this.opts.absolute;
    this.seen.add(e);
    const mark = this.opts.mark && e.isDirectory() ? this.#sep : "";
    if (this.opts.withFileTypes) {
      this.matchEmit(e);
    } else if (abs) {
      const abs2 = this.opts.posix ? e.fullpathPosix() : e.fullpath();
      this.matchEmit(abs2 + mark);
    } else {
      const rel = this.opts.posix ? e.relativePosix() : e.relative();
      const pre = this.opts.dotRelative && !rel.startsWith(".." + this.#sep) ? "." + this.#sep : "";
      this.matchEmit(!rel ? "." + mark : pre + rel + mark);
    }
  }
  async match(e, absolute, ifDir) {
    const p = await this.matchCheck(e, ifDir);
    if (p)
      this.matchFinish(p, absolute);
  }
  matchSync(e, absolute, ifDir) {
    const p = this.matchCheckSync(e, ifDir);
    if (p)
      this.matchFinish(p, absolute);
  }
  walkCB(target, patterns, cb) {
    if (this.signal?.aborted)
      cb();
    this.walkCB2(target, patterns, new Processor(this.opts), cb);
  }
  walkCB2(target, patterns, processor, cb) {
    if (this.#childrenIgnored(target))
      return cb();
    if (this.signal?.aborted)
      cb();
    if (this.paused) {
      this.onResume(() => this.walkCB2(target, patterns, processor, cb));
      return;
    }
    processor.processPatterns(target, patterns);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      tasks++;
      this.match(m, absolute, ifDir).then(() => next());
    }
    for (const t of processor.subwalkTargets()) {
      if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
        continue;
      }
      tasks++;
      const childrenCached = t.readdirCached();
      if (t.calledReaddir())
        this.walkCB3(t, childrenCached, processor, next);
      else {
        t.readdirCB((_, entries) => this.walkCB3(t, entries, processor, next), true);
      }
    }
    next();
  }
  walkCB3(target, entries, processor, cb) {
    processor = processor.filterEntries(target, entries);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      tasks++;
      this.match(m, absolute, ifDir).then(() => next());
    }
    for (const [target2, patterns] of processor.subwalks.entries()) {
      tasks++;
      this.walkCB2(target2, patterns, processor.child(), next);
    }
    next();
  }
  walkCBSync(target, patterns, cb) {
    if (this.signal?.aborted)
      cb();
    this.walkCB2Sync(target, patterns, new Processor(this.opts), cb);
  }
  walkCB2Sync(target, patterns, processor, cb) {
    if (this.#childrenIgnored(target))
      return cb();
    if (this.signal?.aborted)
      cb();
    if (this.paused) {
      this.onResume(() => this.walkCB2Sync(target, patterns, processor, cb));
      return;
    }
    processor.processPatterns(target, patterns);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      this.matchSync(m, absolute, ifDir);
    }
    for (const t of processor.subwalkTargets()) {
      if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
        continue;
      }
      tasks++;
      const children = t.readdirSync();
      this.walkCB3Sync(t, children, processor, next);
    }
    next();
  }
  walkCB3Sync(target, entries, processor, cb) {
    processor = processor.filterEntries(target, entries);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      this.matchSync(m, absolute, ifDir);
    }
    for (const [target2, patterns] of processor.subwalks.entries()) {
      tasks++;
      this.walkCB2Sync(target2, patterns, processor.child(), next);
    }
    next();
  }
}

class GlobWalker extends GlobUtil {
  matches = new Set;
  constructor(patterns, path2, opts) {
    super(patterns, path2, opts);
  }
  matchEmit(e) {
    this.matches.add(e);
  }
  async walk() {
    if (this.signal?.aborted)
      throw this.signal.reason;
    if (this.path.isUnknown()) {
      await this.path.lstat();
    }
    await new Promise((res, rej) => {
      this.walkCB(this.path, this.patterns, () => {
        if (this.signal?.aborted) {
          rej(this.signal.reason);
        } else {
          res(this.matches);
        }
      });
    });
    return this.matches;
  }
  walkSync() {
    if (this.signal?.aborted)
      throw this.signal.reason;
    if (this.path.isUnknown()) {
      this.path.lstatSync();
    }
    this.walkCBSync(this.path, this.patterns, () => {
      if (this.signal?.aborted)
        throw this.signal.reason;
    });
    return this.matches;
  }
}

class GlobStream extends GlobUtil {
  results;
  constructor(patterns, path2, opts) {
    super(patterns, path2, opts);
    this.results = new Minipass({
      signal: this.signal,
      objectMode: true
    });
    this.results.on("drain", () => this.resume());
    this.results.on("resume", () => this.resume());
  }
  matchEmit(e) {
    this.results.write(e);
    if (!this.results.flowing)
      this.pause();
  }
  stream() {
    const target = this.path;
    if (target.isUnknown()) {
      target.lstat().then(() => {
        this.walkCB(target, this.patterns, () => this.results.end());
      });
    } else {
      this.walkCB(target, this.patterns, () => this.results.end());
    }
    return this.results;
  }
  streamSync() {
    if (this.path.isUnknown()) {
      this.path.lstatSync();
    }
    this.walkCBSync(this.path, this.patterns, () => this.results.end());
    return this.results;
  }
}

// node_modules/glob/dist/esm/glob.js
var defaultPlatform3 = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";

class Glob {
  absolute;
  cwd;
  root;
  dot;
  dotRelative;
  follow;
  ignore;
  magicalBraces;
  mark;
  matchBase;
  maxDepth;
  nobrace;
  nocase;
  nodir;
  noext;
  noglobstar;
  pattern;
  platform;
  realpath;
  scurry;
  stat;
  signal;
  windowsPathsNoEscape;
  withFileTypes;
  includeChildMatches;
  opts;
  patterns;
  constructor(pattern, opts) {
    if (!opts)
      throw new TypeError("glob options required");
    this.withFileTypes = !!opts.withFileTypes;
    this.signal = opts.signal;
    this.follow = !!opts.follow;
    this.dot = !!opts.dot;
    this.dotRelative = !!opts.dotRelative;
    this.nodir = !!opts.nodir;
    this.mark = !!opts.mark;
    if (!opts.cwd) {
      this.cwd = "";
    } else if (opts.cwd instanceof URL || opts.cwd.startsWith("file://")) {
      opts.cwd = fileURLToPath2(opts.cwd);
    }
    this.cwd = opts.cwd || "";
    this.root = opts.root;
    this.magicalBraces = !!opts.magicalBraces;
    this.nobrace = !!opts.nobrace;
    this.noext = !!opts.noext;
    this.realpath = !!opts.realpath;
    this.absolute = opts.absolute;
    this.includeChildMatches = opts.includeChildMatches !== false;
    this.noglobstar = !!opts.noglobstar;
    this.matchBase = !!opts.matchBase;
    this.maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : Infinity;
    this.stat = !!opts.stat;
    this.ignore = opts.ignore;
    if (this.withFileTypes && this.absolute !== undefined) {
      throw new Error("cannot set absolute and withFileTypes:true");
    }
    if (typeof pattern === "string") {
      pattern = [pattern];
    }
    this.windowsPathsNoEscape = !!opts.windowsPathsNoEscape || opts.allowWindowsEscape === false;
    if (this.windowsPathsNoEscape) {
      pattern = pattern.map((p) => p.replace(/\\/g, "/"));
    }
    if (this.matchBase) {
      if (opts.noglobstar) {
        throw new TypeError("base matching requires globstar");
      }
      pattern = pattern.map((p) => p.includes("/") ? p : `./**/${p}`);
    }
    this.pattern = pattern;
    this.platform = opts.platform || defaultPlatform3;
    this.opts = { ...opts, platform: this.platform };
    if (opts.scurry) {
      this.scurry = opts.scurry;
      if (opts.nocase !== undefined && opts.nocase !== opts.scurry.nocase) {
        throw new Error("nocase option contradicts provided scurry option");
      }
    } else {
      const Scurry = opts.platform === "win32" ? PathScurryWin32 : opts.platform === "darwin" ? PathScurryDarwin : opts.platform ? PathScurryPosix : PathScurry;
      this.scurry = new Scurry(this.cwd, {
        nocase: opts.nocase,
        fs: opts.fs
      });
    }
    this.nocase = this.scurry.nocase;
    const nocaseMagicOnly = this.platform === "darwin" || this.platform === "win32";
    const mmo = {
      ...opts,
      dot: this.dot,
      matchBase: this.matchBase,
      nobrace: this.nobrace,
      nocase: this.nocase,
      nocaseMagicOnly,
      nocomment: true,
      noext: this.noext,
      nonegate: true,
      optimizationLevel: 2,
      platform: this.platform,
      windowsPathsNoEscape: this.windowsPathsNoEscape,
      debug: !!this.opts.debug
    };
    const mms = this.pattern.map((p) => new Minimatch(p, mmo));
    const [matchSet, globParts] = mms.reduce((set, m) => {
      set[0].push(...m.set);
      set[1].push(...m.globParts);
      return set;
    }, [[], []]);
    this.patterns = matchSet.map((set, i) => {
      const g = globParts[i];
      if (!g)
        throw new Error("invalid pattern object");
      return new Pattern(set, g, 0, this.platform);
    });
  }
  async walk() {
    return [
      ...await new GlobWalker(this.patterns, this.scurry.cwd, {
        ...this.opts,
        maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
        platform: this.platform,
        nocase: this.nocase,
        includeChildMatches: this.includeChildMatches
      }).walk()
    ];
  }
  walkSync() {
    return [
      ...new GlobWalker(this.patterns, this.scurry.cwd, {
        ...this.opts,
        maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
        platform: this.platform,
        nocase: this.nocase,
        includeChildMatches: this.includeChildMatches
      }).walkSync()
    ];
  }
  stream() {
    return new GlobStream(this.patterns, this.scurry.cwd, {
      ...this.opts,
      maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
      platform: this.platform,
      nocase: this.nocase,
      includeChildMatches: this.includeChildMatches
    }).stream();
  }
  streamSync() {
    return new GlobStream(this.patterns, this.scurry.cwd, {
      ...this.opts,
      maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
      platform: this.platform,
      nocase: this.nocase,
      includeChildMatches: this.includeChildMatches
    }).streamSync();
  }
  iterateSync() {
    return this.streamSync()[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterateSync();
  }
  iterate() {
    return this.stream()[Symbol.asyncIterator]();
  }
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
}

// node_modules/glob/dist/esm/has-magic.js
var hasMagic = (pattern, options = {}) => {
  if (!Array.isArray(pattern)) {
    pattern = [pattern];
  }
  for (const p of pattern) {
    if (new Minimatch(p, options).hasMagic())
      return true;
  }
  return false;
};

// node_modules/glob/dist/esm/index.js
function globStreamSync(pattern, options = {}) {
  return new Glob(pattern, options).streamSync();
}
function globStream(pattern, options = {}) {
  return new Glob(pattern, options).stream();
}
function globSync(pattern, options = {}) {
  return new Glob(pattern, options).walkSync();
}
async function glob_(pattern, options = {}) {
  return new Glob(pattern, options).walk();
}
function globIterateSync(pattern, options = {}) {
  return new Glob(pattern, options).iterateSync();
}
function globIterate(pattern, options = {}) {
  return new Glob(pattern, options).iterate();
}
var streamSync = globStreamSync;
var stream = Object.assign(globStream, { sync: globStreamSync });
var iterateSync = globIterateSync;
var iterate = Object.assign(globIterate, {
  sync: globIterateSync
});
var sync = Object.assign(globSync, {
  stream: globStreamSync,
  iterate: globIterateSync
});
var glob = Object.assign(glob_, {
  glob: glob_,
  globSync,
  sync,
  globStream,
  stream,
  globStreamSync,
  streamSync,
  globIterate,
  iterate,
  globIterateSync,
  iterateSync,
  Glob,
  hasMagic,
  escape,
  unescape
});
glob.glob = glob;

// src/report-generator.ts
var import_xmldom = __toESM(require_dom_parser(), 1);
var xpath = __toESM(require_xpath(), 1);
var COUNT_XPATHS = {
  tests: "//testcase",
  passed: "//testcase[not(*)]",
  skipped: "//testcase[skipped]",
  failures: "//testcase[failure]",
  errors: "//testcase[error]"
};

class ReportGenerator {
  pathPrefix;
  constructor(pathPrefix) {
    this.pathPrefix = pathPrefix;
  }
  generateReport(out) {
    const testFiles = sync(`${this.pathPrefix}**/{TEST,test}-*.xml`);
    const grouped = this.groupBySubproject(testFiles);
    const subprojects = Object.keys(grouped);
    const subprojectWidth = Math.max("Subproject".length, ...subprojects.map((p) => p.length));
    this.printHeaders(out, subprojectWidth);
    for (const [group, testResults] of Object.entries(grouped)) {
      this.process(out, group, testResults, subprojectWidth);
    }
  }
  groupBySubproject(files) {
    return files.reduce((acc, file) => {
      const relativePath = file.slice(this.pathPrefix.length);
      const group = relativePath.split(path2.sep)[0];
      acc[group] = acc[group] || [];
      acc[group].push(file);
      return acc;
    }, {});
  }
  process(out, group, testResults, subprojectWidth) {
    const docs = testResults.map((file) => {
      const content = fs.readFileSync(file, "utf-8");
      return new import_xmldom.DOMParser({
        errorHandler: (level, msg) => {
          if (level === "fatalError" || process.env.VERBOSE === "true") {
            console.error(msg);
          }
        }
      }).parseFromString(content, "text/xml");
    });
    this.printGroup(out, group, this.counts(docs), subprojectWidth);
  }
  counts(docs) {
    return Object.fromEntries(Object.entries(COUNT_XPATHS).map(([key, xpathQuery]) => [key, this.count(docs, xpathQuery)]));
  }
  count(docs, xpathQuery) {
    return docs.reduce((sum, doc) => sum + xpath.select("count(" + xpathQuery + ")", doc), 0);
  }
  printHeaders(out, subprojectWidth) {
    const subprojectCol = "Subproject".padEnd(subprojectWidth);
    out.write(`| ${subprojectCol} | Status | Tests | Passed | Skipped | Failures | Errors |
`);
    out.write(`|-${"-".repeat(subprojectWidth)}-|:------:|:-----:|:------:|:-------:|:--------:|:------:|
`);
  }
  printGroup(out, group, counts, subprojectWidth) {
    const status = counts.failures === 0 && counts.errors === 0 ? " ✅ " : " ❌ ";
    const paddedGroup = group.padEnd(subprojectWidth);
    const formatNumber = (num, headerWidth) => num.toString().padStart(headerWidth, " ");
    const stats = [
      paddedGroup,
      status.padStart(5).padEnd(3),
      formatNumber(counts.tests, 5),
      formatNumber(counts.passed, 6),
      formatNumber(counts.skipped, 7),
      formatNumber(counts.failures, 8),
      formatNumber(counts.errors, 6)
    ];
    out.write(`| ${stats.join(" | ")} |
`);
  }
}

// src/index.ts
import * as fs2 from "fs";
var pathPrefix = process.env.GITHUB_WORKSPACE ? `${process.env.GITHUB_WORKSPACE}/` : fs2.existsSync("/github/workspace") ? "/github/workspace/" : "";
var reportGenerator = new ReportGenerator(pathPrefix);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs2.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "");
  const out = fs2.createWriteStream(process.env.GITHUB_STEP_SUMMARY, { flags: "a" });
  reportGenerator.generateReport(out);
  out.end();
} else {
  reportGenerator.generateReport(process.stdout);
}
