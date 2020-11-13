// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"assets/js/canvas.js":[function(require,module,exports) {
window.onload = function () {
  var followMouse = false,
      // whether or not to "follow the mouse"
  polygonData = [],
      // array to hold data objects, one for each point
  lastMousePos = Point(window.innerWidth * .5, window.innerHeight * .5),
      // where the mouse was last, assume the mouse starts at the center
  canvas = document.getElementById("canvas"),
      // our <canvas> tag in the index.html DOM
  ctx = canvas.getContext("2d"),
      // query the DOM once for these elements by using pointer variables
  oscillate = document.querySelector('input[name="oscillate"]'),
      fillPolygons = document.querySelector('input[name="fill_polygons"]'),
      oscillationRange = document.querySelector('input[name="osc_range"]'),
      oscillationFrequency = document.querySelector('input[name="osc_freq"]'),
      drawNonPoly = document.querySelector('input[name="draw_non_poly"]'),
      compmode = document.getElementById('compmode'),
      followMouseCheckbox = document.querySelector('input[name="follow_mouse"]');
  checkUrlParams();

  function Point(x, y) {
    // used to store coordinates
    return {
      x: x,
      y: y
    };
  }

  function Polygon(fill, points, tick) {
    // data object for polygons
    tick = typeof tick !== 'undefined' ? tick : 0; // a number incremented each step. the Math.sin() of this value will be used to create our oscillation effect https://codepen.io/jpdevries/pen/BjLOeY

    return {
      points: points,
      fill: fill,
      tick: tick,
      step: function step() {
        // each step increment the tick by the current frequency
        this.tick += parseFloat(oscillationFrequency.value);
      }
    };
  }

  document.body.onmousemove = function (e) {
    // whenever the mouse is moved
    lastMousePos = Point(e.pageX, e.pageY); // store the current mouse position
  };

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.onresize = function () {
    handleResize(); // keep the canvas full screen
  };

  handleResize();

  (function () {
    // for each <polygon> in the source SVG extract points, fill and then remove
    var polygons = document.querySelectorAll('#wolf polygon');

    for (var i = 0; i < polygons.length; i++) {
      var polygon = polygons[i],
          points = polygon.getAttribute('points').trim(),
          fill = polygon.getAttribute('fill');
      polygon.remove(); // remove the shape from the SVG

      polygonData.push(Polygon(fill, points)); // create a Polygon and store it. We'll loop through all these to draw them on each step()
    }
  })();

  var source = createImageOfNonPolygonalShapes(); // create an image of the remaining non-polygonal shapes

  function step(timestamp) {
    // for each step through the animation
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

    ctx.globalCompositeOperation = compmode.value; // update the "blend mode"

    for (var i = 0; i < polygonData.length; i++) {
      // for each polygon
      var polygon = polygonData[i];
      drawShape(ctx, polygon); // draw the shape onto the <canvas>

      polygon.step();
    }

    if (drawNonPoly.checked) ctx.drawImage(source, window.innerWidth / 2 - 522 / 2, window.innerHeight / 2 - 620 / 2); // draw non-polygonal shapes and center them on <canvas>

    window.requestAnimationFrame(step); // keep the animation running
  }

  window.requestAnimationFrame(step); // start the animation

  function drawShape(ctx, polygon) {
    // draw the polygon data to a <canvas> context
    var points = polygon.points.split(' '),
        strokeStyle = polygon.fill,
        fillStyle = polygon.fill;

    if (followMouseCheckbox.checked) {
      // "follow the mouse" if we should
      points[0] = lastMousePos.x + ',' + lastMousePos.y;
    }

    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();

    for (var i = 0; i < points.length; i++) {
      // for each point in the polygon
      var point = points[i],
          x = parseFloat(point.split(',')[0]),
          y = parseFloat(point.split(',')[1]);

      if (oscillate.checked) {
        // apply oscillation effect using a sin wave
        if (i == 1) {
          x += Math.sin(polygon.tick) * oscillationRange.value; // second point in polygon moves horizontally
        } else if (i == 2) {
          y += Math.sin(polygon.tick) * oscillationRange.value; // third point in polygol moves vertically
        }
      }

      if (i !== 0 || !followMouseCheckbox.checked) {
        // adjust coordinates for stage size
        x += (window.innerWidth - 522) / 2;
        y += (window.innerHeight - 620) / 2;
      }

      if (i < 1) {
        ctx.moveTo(x, y); // move to the position of the first point
      } else {
        ctx.lineTo(x, y); // draw lines to the rest
      }
    }

    ctx.closePath(); // close the path and set the fill style

    if (fillPolygons.checked) ctx.fill(); // fill the path or
    else ctx.stroke(); // stroke the path
  }

  function createImageOfNonPolygonalShapes() {
    // takes the remaining <svg> data from our #wolf element and prepare it for being drawn to the canvas
    var source = new Image();
    var DOMURL = window.URL || window.webkitURL || window;
    var data = document.querySelector("#wolf").outerHTML;
    var svgData = new XMLSerializer().serializeToString(document.querySelector("#wolf"));
    var blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8"
    });
    var domURL = self.URL || self.webkitURL || self;
    var url = domURL.createObjectURL(blob);
    source.width = '522';
    source.height = '620';
    source.addEventListener('load', function () {
      ctx.drawImage(source, window.innerWidth / 2 - 522 / 2, window.innerHeight / 2 - 620 / 2);
      domURL.revokeObjectURL(url);
    });
    source.src = url;
    return source;
  }

  function checkUrlParams() {
    var elements = document.querySelectorAll('[data-url-param]');

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var key = element.getAttribute('data-url-param');

      if ($_GET(key) !== null) {
        if (element.type == "checkbox") {
          element.checked = $_GET(key) == "1" ? true : false;
        } else {
          element.value = $_GET(key);
        }
      }
    }
  }
};

function $_GET(param) {
  // http://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
  var vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
  function (m, key, value) {
    // callback
    vars[key] = value !== undefined ? value : '';
  });

  if (param) {
    return vars[param] ? vars[param] : null;
  }

  return vars;
}
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56339" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","assets/js/canvas.js"], null)
//# sourceMappingURL=/canvas.01f6231d.js.map