(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ComponentUrl, uniqueId;

uniqueId = function() {
  return new Date().getTime().toString(36);
};

ComponentUrl = (function() {
  function ComponentUrl(original) {
    this.original = original != null ? original : document.location.href;
    if (this.original.constructor === ComponentUrl) {
      return this.original;
    }
    this._parse();
  }

  ComponentUrl.prototype.withoutHash = function() {
    return this.href.replace(this.hash, '').replace('#', '');
  };

  ComponentUrl.prototype.withoutHashForIE10compatibility = function() {
    return this.withoutHash();
  };

  ComponentUrl.prototype.hasNoHash = function() {
    return this.hash.length === 0;
  };

  ComponentUrl.prototype.crossOrigin = function() {
    return this.origin !== (new ComponentUrl).origin;
  };

  ComponentUrl.prototype.formatForXHR = function(options) {
    if (options == null) {
      options = {};
    }
    return (options.cache ? this.withMimeBust() : this.withAntiCacheParam()).withoutHashForIE10compatibility();
  };

  ComponentUrl.prototype.withMimeBust = function() {
    return new ComponentUrl(/([?&])__=[^&]*/.test(this.absolute) ? this.absolute : new ComponentUrl(this.withoutHash() + (/\?/.test(this.absolute) ? "&" : "?") + "__=0" + this.hash));
  };

  ComponentUrl.prototype.withAntiCacheParam = function() {
    return new ComponentUrl(/([?&])_=[^&]*/.test(this.absolute) ? this.absolute.replace(/([?&])_=[^&]*/, "$1_=" + (uniqueId())) : new ComponentUrl(this.withoutHash() + (/\?/.test(this.absolute) ? "&" : "?") + ("_=" + (uniqueId())) + this.hash));
  };

  ComponentUrl.prototype._parse = function() {
    var ref;
    (this.link != null ? this.link : this.link = document.createElement('a')).href = this.original;
    ref = this.link, this.href = ref.href, this.protocol = ref.protocol, this.host = ref.host, this.hostname = ref.hostname, this.port = ref.port, this.pathname = ref.pathname, this.search = ref.search, this.hash = ref.hash;
    if (this.protocol === ':') {
      this.protocol = document.location.protocol;
    }
    if (this.protocol === '') {
      this.protocol = document.location.protocol;
    }
    if (this.port === '') {
      this.port = document.location.port;
    }
    if (this.hostname === '') {
      this.hostname = document.location.hostname;
    }
    if (this.pathname === '') {
      this.pathname = '/';
    }
    this.origin = [this.protocol, '//', this.hostname].join('');
    if (this.port.length !== 0) {
      this.origin += ":" + this.port;
    }
    this.relative = [this.pathname, this.search, this.hash].join('');
    return this.absolute = this.href;
  };

  return ComponentUrl;

})();

module.exports = ComponentUrl;


},{}],2:[function(require,module,exports){
var CSRFToken, ComponentUrl, Controller, DoublyLinkedList, EVENTS, PAGE_CACHE_SIZE, ParallelQueue, ProgressBar, Snapshot, Utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ParallelQueue = require('./parallel_queue.coffee');

ComponentUrl = require('./component_url.coffee');

ProgressBar = require('./progress_bar.coffee');

Snapshot = require('./snapshot.coffee');

DoublyLinkedList = require('./doubly_linked_list.coffee');

Utils = require('./utils.coffee');

CSRFToken = require('./csrf_token.coffee');

EVENTS = require('./events.coffee');

PAGE_CACHE_SIZE = 20;

Controller = (function() {
  function Controller(history) {
    this.createRequest = bind(this.createRequest, this);
    this.onAsyncError = bind(this.onAsyncError, this);
    this.onProgress = bind(this.onProgress, this);
    this.onLoad = bind(this.onLoad, this);
    this.onLoadEnd = bind(this.onLoadEnd, this);
    this.cache = bind(this.cache, this);
    this.pageChangePrevented = bind(this.pageChangePrevented, this);
    this.replace = bind(this.replace, this);
    this.restore = bind(this.restore, this);
    this.disableRequestCaching = bind(this.disableRequestCaching, this);
    this.enableTransitionCache = bind(this.enableTransitionCache, this);
    this.request = bind(this.request, this);
    this.currentPage = bind(this.currentPage, this);
    this.atomCache = {};
    this.history = new Snapshot(this, history);
    this.transitionCacheEnabled = false;
    this.requestCachingEnabled = true;
    this.progressBar = new ProgressBar('html');
    this.pq = new ParallelQueue;
    this.http = null;
    this.history.rememberCurrentUrlAndState();
  }

  Controller.prototype.currentPage = function() {
    return this.history.currentPage;
  };

  Controller.prototype.request = function(url, options) {
    var ref, ref1, req, restorePoint;
    if (options == null) {
      options = {};
    }
    options = Utils.reverseMerge(options, {
      pushState: true
    });
    url = new ComponentUrl(url);
    if (this.pageChangePrevented(url.absolute, options.target)) {
      return;
    }
    if (url.crossOrigin()) {
      this.onCrossOriginRequest(url);
      return;
    }
    this.history.cacheCurrentPage();
    if ((this.progressBar != null) && !options.async) {
      if ((ref = this.progressBar) != null) {
        ref.start();
      }
    }
    restorePoint = this.history.transitionCacheFor(url.absolute);
    if (this.transitionCacheEnabled && restorePoint && restorePoint.transition_cache) {
      this.history.reflectNewUrl(url);
      this.restore(restorePoint);
      options.showProgressBar = false;
    }
    if (options.cacheRequest == null) {
      options.cacheRequest = this.requestCachingEnabled;
    }
    if (options.showProgressBar == null) {
      options.showProgressBar = true;
    }
    Utils.triggerEvent(EVENTS.FETCH, {
      url: url.absolute
    }, options.target);
    if (options.async) {
      options.showProgressBar = false;
      req = this.createRequest(url, options);
      req.onError = function() {
        return Utils.triggerEvent(EVENTS.ERROR, null, options.target);
      };
      this.pq.push(req);
      return req.send(options.payload);
    } else {
      this.pq.drain();
      if ((ref1 = this.http) != null) {
        ref1.abort();
      }
      this.http = this.createRequest(url, options);
      return this.http.send(options.payload);
    }
  };

  Controller.prototype.enableTransitionCache = function(enable) {
    if (enable == null) {
      enable = true;
    }
    return this.transitionCacheEnabled = enable;
  };

  Controller.prototype.disableRequestCaching = function(disable) {
    if (disable == null) {
      disable = true;
    }
    this.requestCachingEnabled = !disable;
    return disable;
  };

  Controller.prototype.restore = function(cachedPage, options) {
    var ref, ref1;
    if (options == null) {
      options = {};
    }
    if ((ref = this.http) != null) {
      ref.abort();
    }
    this.history.changePage(cachedPage, options);
    if ((ref1 = this.progressBar) != null) {
      ref1.done();
    }
    Utils.triggerEvent(EVENTS.RESTORE);
    return Utils.triggerEvent(EVENTS.LOAD, cachedPage);
  };

  Controller.prototype.replace = function(nextPage, options) {
    if (options == null) {
      options = {};
    }
    Utils.withDefaults(nextPage, this.history.currentBrowserState);
    this.history.changePage(nextPage, options);
    return Utils.triggerEvent(EVENTS.LOAD, this.currentPage());
  };

  Controller.prototype.pageChangePrevented = function(url, target) {
    return !Utils.triggerEvent(EVENTS.BEFORE_CHANGE, {
      url: url
    }, target);
  };

  Controller.prototype.cache = function(key, value) {
    var base;
    if (value === null) {
      return this.atomCache[key];
    }
    return (base = this.atomCache)[key] || (base[key] = value);
  };

  Controller.prototype.onLoadEnd = function() {
    return this.http = null;
  };

  Controller.prototype.onLoad = function(xhr, url, options) {
    var nextPage, ref, ref1, ref2;
    Utils.triggerEvent(EVENTS.RECEIVE, {
      url: url.absolute
    }, options.target);
    nextPage = this.processResponse(xhr);
    if (xhr.status === 0) {
      return;
    }
    if (nextPage) {
      if (options.async && url.pathname !== this.currentPage().pathname) {
        if (!options.ignoreSamePathConstraint) {
          if ((ref = this.progressBar) != null) {
            ref.done();
          }
          Utils.warn("Async response path is different from current page path");
          return;
        }
      }
      if (options.pushState) {
        this.history.reflectNewUrl(url);
      }
      Utils.withDefaults(nextPage, this.history.currentBrowserState);
      if (nextPage.action !== 'graft') {
        this.history.changePage(nextPage, options);
        Utils.triggerEvent(EVENTS.LOAD, this.currentPage());
      } else {
        this.history.graftByKeypath("data." + nextPage.path, nextPage.data);
      }
      if (options.showProgressBar) {
        if ((ref1 = this.progressBar) != null) {
          ref1.done();
        }
      }
      return this.history.constrainPageCacheTo();
    } else {
      if (options.async) {
        return this.onAsyncError(xhr, url, options);
      } else {
        if ((ref2 = this.progressBar) != null) {
          ref2.done();
        }
        return this.onSyncError(xhr, url, options);
      }
    }
  };

  Controller.prototype.onProgress = function(event) {
    return this.progressBar.advanceFromEvent(event);
  };

  Controller.prototype.onAsyncError = function(xhr, url, options) {
    return Utils.triggerEvent(EVENTS.ERROR, xhr, options.target);
  };

  Controller.prototype.createRequest = function(url, opts) {
    var csrfToken, jsAccept, requestMethod, xhr;
    jsAccept = 'text/javascript, application/x-javascript, application/javascript';
    requestMethod = opts.requestMethod || 'GET';
    xhr = new XMLHttpRequest;
    xhr.open(requestMethod, url.formatForXHR({
      cache: opts.cacheRequest
    }), true);
    xhr.setRequestHeader('Accept', jsAccept);
    xhr.setRequestHeader('X-XHR-Referer', this.getRefererUrl());
    if (opts.silent) {
      xhr.setRequestHeader('X-Silent', opts.silent);
    }
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    if (opts.contentType) {
      xhr.setRequestHeader('Content-Type', opts.contentType);
    }
    csrfToken = CSRFToken.get().token;
    if (csrfToken) {
      xhr.setRequestHeader('X-CSRF-Token', csrfToken);
    }
    if (!opts.silent) {
      xhr.onload = (function(_this) {
        return function() {
          var actualUrl, redirectedUrl, self;
          self =  this ;
          redirectedUrl = self.getResponseHeader('X-XHR-Redirected-To');
          actualUrl = redirectedUrl || url;
          return _this.onLoad(self, actualUrl, opts);
        };
      })(this);
    } else {
      xhr.onload = (function(_this) {
        return function() {
          var ref;
          return (ref = _this.progressBar) != null ? ref.done() : void 0;
        };
      })(this);
    }
    if (this.progressBar && opts.showProgressBar) {
      xhr.onprogress = this.onProgress;
    }
    xhr.onloadend = this.onLoadEnd;
    xhr.onerror = (function(_this) {
      return function() {
        return _this.onSyncError(xhr, url, options);
      };
    })(this);
    return xhr;
  };

  Controller.prototype.processResponse = function(xhr) {
    if (this.hasValidResponse(xhr)) {
      return this.responseContent(xhr);
    }
  };

  Controller.prototype.hasValidResponse = function(xhr) {
    return !this.clientOrServerError(xhr) && this.validContent(xhr) && !this.downloadingFile(xhr);
  };

  Controller.prototype.responseContent = function(xhr) {
    return new Function("'use strict'; return " + xhr.responseText)();
  };

  Controller.prototype.clientOrServerError = function(xhr) {
    var ref;
    return (400 <= (ref = xhr.status) && ref < 600);
  };

  Controller.prototype.validContent = function(xhr) {
    var contentType, jsContent;
    contentType = xhr.getResponseHeader('Content-Type');
    jsContent = /^(?:text\/javascript|application\/x-javascript|application\/javascript)(?:;|$)/;
    return (contentType != null) && contentType.match(jsContent);
  };

  Controller.prototype.downloadingFile = function(xhr) {
    var disposition;
    return ((disposition = xhr.getResponseHeader('Content-Disposition')) != null) && disposition.match(/^attachment/);
  };

  return Controller;

})();

module.exports = Controller;


},{"./component_url.coffee":1,"./csrf_token.coffee":3,"./doubly_linked_list.coffee":4,"./events.coffee":5,"./parallel_queue.coffee":7,"./progress_bar.coffee":8,"./snapshot.coffee":10,"./utils.coffee":11}],3:[function(require,module,exports){
var CSRFToken;

CSRFToken = (function() {
  function CSRFToken() {}

  CSRFToken.get = function(doc) {
    var tag;
    if (doc == null) {
      doc = document;
    }
    return {
      node: tag = doc.querySelector('meta[name="csrf-token"]'),
      token: tag != null ? typeof tag.getAttribute === "function" ? tag.getAttribute('content') : void 0 : void 0
    };
  };

  CSRFToken.update = function(latest) {
    var current;
    current = this.get();
    if ((current.token != null) && (latest != null) && current.token !== latest) {
      return current.node.setAttribute('content', latest);
    }
  };

  return CSRFToken;

})();

module.exports = CSRFToken;


},{}],4:[function(require,module,exports){
var DoublyLinkedList;

DoublyLinkedList = (function() {
  function DoublyLinkedList() {
    this.head = this.tail = null;
    this.length = 0;
  }

  DoublyLinkedList.prototype.createNode = function(obj) {
    return {
      prev: null,
      element: obj,
      next: null
    };
  };

  DoublyLinkedList.prototype.push = function(obj) {
    var ele;
    if (this.tail) {
      ele = this.createNode(obj);
      ele.prev = this.tail;
      this.tail = this.tail.next = ele;
      return this.length += 1;
    } else {
      this.head = this.tail = this.createNode(obj);
      return this.length += 1;
    }
  };

  DoublyLinkedList.prototype.pop = function() {
    var element;
    if (this.tail) {
      element = this.tail;
      this.tail = element.prev;
      element.prev = null;
      if (this.tail) {
        this.tail.next = null;
      }
      if (this.head === element) {
        this.head = null;
      }
      this.length -= 1;
      return element.element;
    } else {
      return null;
    }
  };

  DoublyLinkedList.prototype.shift = function() {
    var element;
    if (this.head) {
      element = this.head;
      this.head = element.next;
      element.next = null;
      if (this.head) {
        this.head.prev = null;
      }
      if (this.tail === element) {
        this.tail = null;
      }
      this.length -= 1;
      return element.element;
    } else {
      return null;
    }
  };

  DoublyLinkedList.prototype.unshift = function(obj) {
    var ele;
    if (this.head) {
      ele = this.createNode(obj);
      ele.next = this.head;
      this.head = this.head.prev = ele;
      return this.length += 1;
    } else {
      this.head = this.tail = this.createNode(obj);
      return this.length += 1;
    }
  };

  return DoublyLinkedList;

})();

module.exports = DoublyLinkedList;


},{}],5:[function(require,module,exports){
var EVENTS;

EVENTS = {
  BEFORE_CHANGE: 'breezy:click',
  ERROR: 'breezy:request-error',
  FETCH: 'breezy:request-start',
  RECEIVE: 'breezy:request-end',
  LOAD: 'breezy:load',
  RESTORE: 'breezy:restore'
};

module.exports = EVENTS;


},{}],6:[function(require,module,exports){
var CSRFToken, ComponentUrl, Controller, DoublyLinkedList, EVENTS, ParallelQueue, ProgressBarAPI, Remote, Snapshot, Utils, browserSupportsCustomEvents, controller, initializeBreezy, platform, progressBar, remoteHandler, setup, visit;

ComponentUrl = require('./component_url.coffee');

Controller = require('./controller.coffee');

CSRFToken = require('./csrf_token.coffee');

DoublyLinkedList = require('./doubly_linked_list.coffee');

ParallelQueue = require('./parallel_queue.coffee');

Remote = require('./remote.coffee');

Snapshot = require('./snapshot.coffee');

Utils = require('./utils.coffee');

EVENTS = require('./events.coffee');

controller = new Controller(window.history);

progressBar = controller.progressBar;

controller.onSyncError = function(xhr, url, options) {
  var crossOriginRedirectUrl;
  crossOriginRedirectUrl = function(xhr) {
    var crossOrigin, redirect;
    redirect = xhr.getResponseHeader('Location');
    crossOrigin = (new ComponentUrl(redirect)).crossOrigin();
    if ((redirect != null) && crossOrigin) {
      return redirect;
    }
  };
  return document.location.href = crossOriginRedirectUrl(xhr) || url.absolute;
};

controller.onCrossOriginRequest = function(url) {
  return document.location.href = url.absolute;
};

controller.getRefererUrl = function() {
  return document.location.href;
};

ProgressBarAPI = {
  enable: function() {
    return progressBar.install();
  },
  disable: function() {
    return progressBar.uninstall();
  },
  setDelay: function(value) {
    return progressBar.setDelay(value);
  },
  start: function(options) {
    return progressBar.start(options);
  },
  advanceTo: function(value) {
    return progressBar.advanceTo(value);
  },
  done: function() {
    return progressBar.done();
  }
};

remoteHandler = function(ev) {
  var remote, target;
  target = ev.target;
  remote = new Remote(target);
  if (!remote.isValid()) {
    return;
  }
  ev.preventDefault();
  return controller.request(remote.httpUrl, remote.toOptions());
};

browserSupportsCustomEvents = document.addEventListener && document.createEvent;

initializeBreezy = function() {
  ProgressBarAPI.enable();
  window.addEventListener('hashchange', controller.history.rememberCurrentUrlAndState, false);
  window.addEventListener('popstate', controller.history.onHistoryChange, false);
  Utils.documentListenerForLinks('click', remoteHandler);
  return document.addEventListener("submit", remoteHandler);
};

if (Utils.browserSupportsBreezy()) {
  visit = controller.request;
  initializeBreezy();
} else {
  visit = function(url) {
    if (url == null) {
      url = document.location.href;
    }
    return document.location.href = url;
  };
}

setup = function(obj) {
  obj.controller = controller;
  obj.graftByKeypath = controller.history.graftByKeypath;
  obj.visit = visit;
  obj.replace = controller.replace;
  obj.cache = controller.cache;
  obj.pagesCached = controller.history.pagesCached;
  obj.enableTransitionCache = controller.enableTransitionCache;
  obj.disableRequestCaching = controller.disableRequestCaching;
  obj.ProgressBar = ProgressBarAPI;
  obj.supported = Utils.browserSupportsBreezy();
  obj.EVENTS = Utils.clone(EVENTS);
  obj.currentPage = controller.currentPage;
  obj.ComponentUrl = ComponentUrl;
  obj.Controller = Controller;
  obj.DoublyLinkedList = DoublyLinkedList;
  obj.ParallelQueue = ParallelQueue;
  obj.Remote = Remote;
  obj.Snapshot = Snapshot;
  obj.Utils = Utils;
  obj.Grafter = Utils.Grafter;
  obj.CSRFToken = CSRFToken;
  return obj;
};

platform = typeof window !== "undefined" && window !== null ? window : exports;

platform.Breezy = setup({});


},{"./component_url.coffee":1,"./controller.coffee":2,"./csrf_token.coffee":3,"./doubly_linked_list.coffee":4,"./events.coffee":5,"./parallel_queue.coffee":7,"./remote.coffee":9,"./snapshot.coffee":10,"./utils.coffee":11}],7:[function(require,module,exports){
var DoublyLinkedList, ParallelQueue;

DoublyLinkedList = require('./doubly_linked_list.coffee');

ParallelQueue = (function() {
  function ParallelQueue() {
    this.dll = new DoublyLinkedList;
    this.active = true;
  }

  ParallelQueue.prototype.push = function(xhr) {
    this.dll.push(xhr);
    xhr._originalOnLoad = xhr.onload.bind(xhr);
    return xhr.onload = (function(_this) {
      return function() {
        var node, qxhr, results;
        if (_this.active) {
          xhr._isDone = true;
          node = _this.dll.head;
          results = [];
          while (node) {
            qxhr = node.element;
            if (!qxhr._isDone) {
              results.push(node = null);
            } else {
              node = node.next;
              _this.dll.shift();
              results.push(qxhr._originalOnLoad());
            }
          }
          return results;
        }
      };
    })(this);
  };

  ParallelQueue.prototype.drain = function() {
    var node, qxhr;
    this.active = false;
    node = this.dll.head;
    while (node) {
      qxhr = node.element;
      qxhr.abort();
      qxhr._isDone = true;
      node = node.next;
    }
    this.dll = new DoublyLinkedList;
    return this.active = true;
  };

  return ParallelQueue;

})();

module.exports = ParallelQueue;


},{"./doubly_linked_list.coffee":4}],8:[function(require,module,exports){
var ProgressBar,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ProgressBar = (function() {
  var className, originalOpacity;

  className = 'breezy-progress-bar';

  originalOpacity = 0.99;

  function ProgressBar(elementSelector) {
    this.elementSelector = elementSelector;
    this._trickle = bind(this._trickle, this);
    this._reset = bind(this._reset, this);
    this.setDelay = bind(this.setDelay, this);
    this.advanceFromEvent = bind(this.advanceFromEvent, this);
    this.value = 0;
    this.content = '';
    this.speed = 300;
    this.opacity = originalOpacity;
    this.delay = 400;
    this.active = null;
    this.install();
  }

  ProgressBar.prototype.install = function() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.element = document.querySelector(this.elementSelector);
    this.element.classList.add(className);
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    return this._updateStyle();
  };

  ProgressBar.prototype.uninstall = function() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.element.classList.remove(className);
    return document.head.removeChild(this.styleElement);
  };

  ProgressBar.prototype.start = function(arg) {
    var delay;
    delay = (arg != null ? arg : {}).delay;
    clearTimeout(this.displayTimeout);
    if (this.delay) {
      this.display = false;
      this.displayTimeout = setTimeout((function(_this) {
        return function() {
          return _this.display = true;
        };
      })(this), this.delay);
    } else {
      this.display = true;
    }
    if (this.value > 0) {
      this._reset();
      this._reflow();
    }
    return this.advanceTo(5);
  };

  ProgressBar.prototype.advanceTo = function(value) {
    var ref;
    if ((value > (ref = this.value) && ref <= 100)) {
      this.value = value;
      this._updateStyle();
      if (this.value === 100) {
        return this._stopTrickle();
      } else if (this.value > 0) {
        return this._startTrickle();
      }
    }
  };

  ProgressBar.prototype.advanceFromEvent = function(event) {
    var percent;
    percent = event.lengthComputable ? event.loaded / event.total * 100 : this.value + (100 - this.value) / 10;
    return this.advanceTo(percent);
  };

  ProgressBar.prototype.done = function() {
    if (this.value > 0) {
      this.advanceTo(100);
      return this._finish();
    }
  };

  ProgressBar.prototype.setDelay = function(milliseconds) {
    return this.delay = milliseconds;
  };

  ProgressBar.prototype._finish = function() {
    this.fadeTimer = setTimeout((function(_this) {
      return function() {
        _this.opacity = 0;
        return _this._updateStyle();
      };
    })(this), this.speed / 2);
    return this.resetTimer = setTimeout(this._reset, this.speed);
  };

  ProgressBar.prototype._reflow = function() {
    return this.element.offsetHeight;
  };

  ProgressBar.prototype._reset = function() {
    this._stopTimers();
    this.value = 0;
    this.opacity = originalOpacity;
    return this._withSpeed(0, (function(_this) {
      return function() {
        return _this._updateStyle(true);
      };
    })(this));
  };

  ProgressBar.prototype._stopTimers = function() {
    this._stopTrickle();
    clearTimeout(this.fadeTimer);
    return clearTimeout(this.resetTimer);
  };

  ProgressBar.prototype._startTrickle = function() {
    if (this.trickleTimer) {
      return;
    }
    return this.trickleTimer = setTimeout(this._trickle, this.speed);
  };

  ProgressBar.prototype._stopTrickle = function() {
    clearTimeout(this.trickleTimer);
    return delete this.trickleTimer;
  };

  ProgressBar.prototype._trickle = function() {
    this.advanceTo(this.value + Math.random() / 2);
    return this.trickleTimer = setTimeout(this._trickle, this.speed);
  };

  ProgressBar.prototype._withSpeed = function(speed, fn) {
    var originalSpeed, result;
    originalSpeed = this.speed;
    this.speed = speed;
    result = fn();
    this.speed = originalSpeed;
    return result;
  };

  ProgressBar.prototype._updateStyle = function(forceRepaint) {
    if (forceRepaint == null) {
      forceRepaint = false;
    }
    if (forceRepaint) {
      this._changeContentToForceRepaint();
    }
    return this.styleElement.textContent = this._createCSSRule();
  };

  ProgressBar.prototype._changeContentToForceRepaint = function() {
    return this.content = this.content === '' ? ' ' : '';
  };

  ProgressBar.prototype._createCSSRule = function() {
    return this.elementSelector + "." + className + "::before {\n  content: '" + this.content + "';\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 2000;\n  background-color: #0076ff;\n  height: 3px;\n  opacity: " + this.opacity + ";\n  width: " + (this.display ? this.value : 0) + "%;\n  transition: width " + this.speed + "ms ease-out, opacity " + (this.speed / 2) + "ms ease-in;\n  transform: translate3d(0,0,0);\n}";
  };

  return ProgressBar;

})();

module.exports = ProgressBar;


},{}],9:[function(require,module,exports){
var Remote,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Remote = (function() {
  var FALLBACK_FORM_METHOD, FALLBACK_LINK_METHOD, SUPPORTED_METHODS;

  SUPPORTED_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'];

  FALLBACK_LINK_METHOD = 'GET';

  FALLBACK_FORM_METHOD = 'POST';

  function Remote(target, opts) {
    if (opts == null) {
      opts = {};
    }
    this.isValidForm = bind(this.isValidForm, this);
    this.isValidLink = bind(this.isValidLink, this);
    this.isValid = bind(this.isValid, this);
    this.setPayload = bind(this.setPayload, this);
    this.setRequestType = bind(this.setRequestType, this);
    this.toOptions = bind(this.toOptions, this);
    this.target = target;
    this.payload = '';
    this.contentType = null;
    this.setRequestType(target);
    this.async = this.getBZAttribute(target, 'bz-remote-async') || false;
    this.pushState = !(this.getBZAttribute(target, 'bz-push-state') === 'false');
    this.httpUrl = target.getAttribute('href') || target.getAttribute('action');
    this.silent = this.getBZAttribute(target, 'bz-silent') || false;
    this.setPayload(target);
  }

  Remote.prototype.toOptions = function() {
    return {
      requestMethod: this.actualRequestType,
      payload: this.payload,
      contentType: this.contentType,
      silent: this.silent,
      target: this.target,
      async: this.async,
      pushState: this.pushState
    };
  };

  Remote.prototype.setRequestType = function(target) {
    var formActionMethod, ref, ref1;
    if (target.tagName === 'A') {
      this.httpRequestType = this.getBZAttribute(target, 'bz-remote');
      if (this.httpRequestType == null) {
        this.httpRequestType = '';
      }
      this.httpRequestType = this.httpRequestType.toUpperCase();
      if (ref = this.httpRequestType, indexOf.call(SUPPORTED_METHODS, ref) < 0) {
        this.httpRequestType = FALLBACK_LINK_METHOD;
      }
    }
    if (target.tagName === 'FORM') {
      formActionMethod = target.getAttribute('method');
      this.httpRequestType = formActionMethod || this.getBZAttribute(target, 'bz-remote');
      if (this.httpRequestType == null) {
        this.httpRequestType = '';
      }
      this.httpRequestType = this.httpRequestType.toUpperCase();
      if (ref1 = this.httpRequestType, indexOf.call(SUPPORTED_METHODS, ref1) < 0) {
        this.httpRequestType = FALLBACK_FORM_METHOD;
      }
    }
    return this.actualRequestType = this.httpRequestType === 'GET' ? 'GET' : 'POST';
  };

  Remote.prototype.setPayload = function(target) {
    var ref;
    if (target.tagName === 'FORM') {
      this.payload = this.nativeEncodeForm(target);
    }
    if (!(this.payload instanceof FormData)) {
      if (this.payload.indexOf("_method") === -1 && this.httpRequestType && this.actualRequestType !== 'GET') {
        this.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
        return this.payload = this.formAppend(this.payload, "_method", this.httpRequestType);
      }
    } else {
      if (!target.querySelector('[name=_method]') && ((ref = this.httpRequestType) !== 'GET' && ref !== 'POST')) {
        return this.payload.append("_method", this.httpRequestType);
      }
    }
  };

  Remote.prototype.isValid = function() {
    return this.isValidLink() || this.isValidForm();
  };

  Remote.prototype.isValidLink = function() {
    if (this.target.tagName !== 'A') {
      return false;
    }
    return this.hasBZAttribute(this.target, 'bz-remote');
  };

  Remote.prototype.isValidForm = function() {
    if (this.target.tagName !== 'FORM') {
      return false;
    }
    return this.hasBZAttribute(this.target, 'bz-remote') && (this.target.getAttribute('action') != null);
  };

  Remote.prototype.formAppend = function(uriEncoded, key, value) {
    if (uriEncoded.length) {
      uriEncoded += "&";
    }
    return uriEncoded += (encodeURIComponent(key)) + "=" + (encodeURIComponent(value));
  };

  Remote.prototype.formDataAppend = function(formData, input) {
    var file, i, len, ref;
    if (input.type === 'file') {
      ref = input.files;
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        formData.append(input.name, file);
      }
    } else {
      formData.append(input.name, input.value);
    }
    return formData;
  };

  Remote.prototype.nativeEncodeForm = function(form) {
    var formData;
    formData = new FormData;
    this.iterateOverFormInputs(form, (function(_this) {
      return function(input) {
        return formData = _this.formDataAppend(formData, input);
      };
    })(this));
    return formData;
  };

  Remote.prototype.iterateOverFormInputs = function(form, callback) {
    var i, input, inputEnabled, inputs, len, radioOrCheck, results;
    inputs = this.enabledInputs(form);
    results = [];
    for (i = 0, len = inputs.length; i < len; i++) {
      input = inputs[i];
      inputEnabled = !input.disabled;
      radioOrCheck = input.type === 'checkbox' || input.type === 'radio';
      if (inputEnabled && input.name) {
        if ((radioOrCheck && input.checked) || !radioOrCheck) {
          results.push(callback(input));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Remote.prototype.enabledInputs = function(form) {
    var disabledInputs, disabledNodes, enabledInputs, i, input, inputs, j, len, len1, node, selector;
    selector = "input:not([type='reset']):not([type='button']):not([type='submit']):not([type='image']), select, textarea";
    inputs = Array.prototype.slice.call(form.querySelectorAll(selector));
    disabledNodes = Array.prototype.slice.call(this.querySelectorAllBZAttribute(form, 'bz-remote-noserialize'));
    if (!disabledNodes.length) {
      return inputs;
    }
    disabledInputs = disabledNodes;
    for (i = 0, len = disabledNodes.length; i < len; i++) {
      node = disabledNodes[i];
      disabledInputs = disabledInputs.concat(Array.prototype.slice.call(node.querySelectorAll(selector)));
    }
    enabledInputs = [];
    for (j = 0, len1 = inputs.length; j < len1; j++) {
      input = inputs[j];
      if (disabledInputs.indexOf(input) < 0) {
        enabledInputs.push(input);
      }
    }
    return enabledInputs;
  };

  Remote.prototype.bzAttribute = function(attr) {
    var bzAttr;
    return bzAttr = attr.slice(0, 3) === 'bz-' ? "data-" + attr : "data-bz-" + attr;
  };

  Remote.prototype.getBZAttribute = function(node, attr) {
    var bzAttr;
    bzAttr = this.bzAttribute(attr);
    return node.getAttribute(bzAttr) || node.getAttribute(attr);
  };

  Remote.prototype.querySelectorAllBZAttribute = function(node, attr, value) {
    var bzAttr;
    if (value == null) {
      value = null;
    }
    bzAttr = this.bzAttribute(attr);
    if (value) {
      return node.querySelectorAll("[" + bzAttr + "=" + value + "], [" + attr + "=" + value + "]");
    } else {
      return node.querySelectorAll("[" + bzAttr + "], [" + attr + "]");
    }
  };

  Remote.prototype.hasBZAttribute = function(node, attr) {
    var bzAttr;
    bzAttr = this.bzAttribute(attr);
    return (node.getAttribute(bzAttr) != null) || (node.getAttribute(attr) != null);
  };

  return Remote;

})();

module.exports = Remote;


},{}],10:[function(require,module,exports){
var CSRFToken, ComponentUrl, EVENTS, Snapshot, Utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ComponentUrl = require('./component_url.coffee');

CSRFToken = require('./csrf_token.coffee');

Utils = require('./utils.coffee');

EVENTS = require('./events.coffee');

Snapshot = (function() {
  function Snapshot(controller, history) {
    this.controller = controller;
    this.history = history;
    this.graftByKeypath = bind(this.graftByKeypath, this);
    this.assetsChanged = bind(this.assetsChanged, this);
    this.changePage = bind(this.changePage, this);
    this.refreshBrowserForNewAssets = bind(this.refreshBrowserForNewAssets, this);
    this.updateBrowserTitle = bind(this.updateBrowserTitle, this);
    this.updateCurrentBrowserState = bind(this.updateCurrentBrowserState, this);
    this.reflectNewUrl = bind(this.reflectNewUrl, this);
    this.currentComponentUrl = bind(this.currentComponentUrl, this);
    this.removeParamFromUrl = bind(this.removeParamFromUrl, this);
    this.rememberCurrentUrlAndState = bind(this.rememberCurrentUrlAndState, this);
    this.cacheCurrentPage = bind(this.cacheCurrentPage, this);
    this.pagesCached = bind(this.pagesCached, this);
    this.transitionCacheFor = bind(this.transitionCacheFor, this);
    this.constrainPageCacheTo = bind(this.constrainPageCacheTo, this);
    this.onHistoryChange = bind(this.onHistoryChange, this);
    this.pageCache = {};
    this.currentBrowserState = null;
    this.pageCacheSize = 10;
    this.currentPage = null;
    this.loadedAssets = null;
  }

  Snapshot.prototype.onHistoryChange = function(event) {
    var newUrl, previousUrl, ref, restorePoint;
    if (((ref = event.state) != null ? ref.breezy : void 0) && event.state.url !== this.currentBrowserState.url) {
      previousUrl = new ComponentUrl(this.currentBrowserState.url);
      newUrl = new ComponentUrl(event.state.url);
      if (restorePoint = this.pageCache[newUrl.absolute]) {
        this.cacheCurrentPage();
        this.currentPage = restorePoint;
        return this.controller.restore(this.currentPage);
      } else {
        return this.controller.request(event.target.location.href);
      }
    }
  };

  Snapshot.prototype.constrainPageCacheTo = function(limit) {
    var cacheTimesRecentFirst, i, key, len, pageCacheKeys, results;
    if (limit == null) {
      limit = this.pageCacheSize;
    }
    pageCacheKeys = Object.keys(this.pageCache);
    cacheTimesRecentFirst = pageCacheKeys.map((function(_this) {
      return function(url) {
        return _this.pageCache[url].cachedAt;
      };
    })(this)).sort(function(a, b) {
      return b - a;
    });
    results = [];
    for (i = 0, len = pageCacheKeys.length; i < len; i++) {
      key = pageCacheKeys[i];
      if (this.pageCache[key].cachedAt <= cacheTimesRecentFirst[limit]) {
        results.push(delete this.pageCache[key]);
      }
    }
    return results;
  };

  Snapshot.prototype.transitionCacheFor = function(url) {
    var cachedPage;
    if (url === this.currentBrowserState.url) {
      return;
    }
    cachedPage = this.pageCache[url];
    if (cachedPage && !cachedPage.transitionCacheDisabled) {
      return cachedPage;
    }
  };

  Snapshot.prototype.pagesCached = function(size) {
    if (size == null) {
      size = this.pageCacheSize;
    }
    if (/^[\d]+$/.test(size)) {
      return this.pageCacheSize = parseInt(size);
    }
  };

  Snapshot.prototype.cacheCurrentPage = function() {
    var currentUrl;
    if (!this.currentPage) {
      return;
    }
    currentUrl = new ComponentUrl(this.currentBrowserState.url);
    Utils.merge(this.currentPage, {
      cachedAt: new Date().getTime(),
      positionY: window.pageYOffset,
      positionX: window.pageXOffset,
      url: currentUrl.relative,
      pathname: currentUrl.pathname,
      transition_cache: true
    });
    return this.pageCache[currentUrl.absolute] = this.currentPage;
  };

  Snapshot.prototype.rememberCurrentUrlAndState = function() {
    this.history.replaceState({
      breezy: true,
      url: this.currentComponentUrl().href
    }, '', this.currentComponentUrl().href);
    return this.currentBrowserState = this.history.state;
  };

  Snapshot.prototype.removeParamFromUrl = function(url, parameter) {
    return url.replace(new RegExp('^([^#]*\?)(([^#]*)&)?' + parameter + '(\=[^&#]*)?(&|#|$)'), '$1$3$5').replace(/^([^#]*)((\?)&|\?(#|$))/, '$1$3$4');
  };

  Snapshot.prototype.currentComponentUrl = function() {
    return new ComponentUrl;
  };

  Snapshot.prototype.reflectNewUrl = function(url) {
    var fullUrl, preservedHash;
    if ((url = new ComponentUrl(url)).absolute !== this.currentComponentUrl().href) {
      preservedHash = url.hasNoHash() ? this.currentComponentUrl().hash : '';
      fullUrl = url.absolute + preservedHash;
      fullUrl = this.removeParamFromUrl(fullUrl, '_breezy_filter');
      fullUrl = this.removeParamFromUrl(fullUrl, '__');
      return this.history.pushState({
        breezy: true,
        url: url.absolute + preservedHash
      }, '', fullUrl);
    }
  };

  Snapshot.prototype.updateCurrentBrowserState = function() {
    return this.currentBrowserState = this.history.state;
  };

  Snapshot.prototype.updateBrowserTitle = function() {
    if (this.currentPage.title !== false) {
      return document.title = this.currentPage.title;
    }
  };

  Snapshot.prototype.refreshBrowserForNewAssets = function() {
    return document.location.reload();
  };

  Snapshot.prototype.changePage = function(nextPage, options) {
    var ref;
    if (this.currentPage && this.assetsChanged(nextPage)) {
      this.refreshBrowserForNewAssets();
      return;
    }
    this.currentPage = nextPage;
    this.currentPage.title = (ref = options.title) != null ? ref : this.currentPage.title;
    this.updateBrowserTitle();
    if (this.currentPage.csrf_token != null) {
      CSRFToken.update(this.currentPage.csrf_token);
    }
    return this.updateCurrentBrowserState();
  };

  Snapshot.prototype.assetsChanged = function(nextPage) {
    var fetchedAssets;
    this.loadedAssets || (this.loadedAssets = this.currentPage.assets);
    fetchedAssets = nextPage.assets;
    return fetchedAssets.length !== this.loadedAssets.length || Utils.intersection(fetchedAssets, this.loadedAssets).length !== this.loadedAssets.length;
  };

  Snapshot.prototype.graftByKeypath = function(keypath, node, opts) {
    var i, k, len, ref, v;
    if (opts == null) {
      opts = {};
    }
    ref = this.pageCache;
    for (v = i = 0, len = ref.length; i < len; v = ++i) {
      k = ref[v];
      this.history.pageCache[k] = Utils.graftByKeypath(keypath, node, v, opts);
    }
    this.currentPage = Utils.graftByKeypath(keypath, node, this.currentPage, opts);
    return Utils.triggerEvent(EVENTS.LOAD, this.currentPage);
  };

  return Snapshot;

})();

module.exports = Snapshot;


},{"./component_url.coffee":1,"./csrf_token.coffee":3,"./events.coffee":5,"./utils.coffee":11}],11:[function(require,module,exports){
var ComponentUrl, Grafter, browserIsBuggy, browserSupportsBreezy, browserSupportsPushState, clone, documentListenerForLinks, intersection, isArray, isObject, merge, popCookie, requestMethodIsSafe, reverseMerge, triggerEvent, warn, withDefaults,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ComponentUrl = require('./component_url.coffee');

warn = function() {
  return console.warn.apply(this, arguments);
};

reverseMerge = function(dest, obj) {
  var k, v;
  for (k in obj) {
    v = obj[k];
    if (!dest.hasOwnProperty(k)) {
      dest[k] = v;
    }
  }
  return dest;
};

merge = function(dest, obj) {
  var k, v;
  for (k in obj) {
    v = obj[k];
    dest[k] = v;
  }
  return dest;
};

clone = function(original) {
  var copy, key, value;
  if ((original == null) || typeof original !== 'object') {
    return original;
  }
  copy = new original.constructor();
  for (key in original) {
    value = original[key];
    copy[key] = clone(value);
  }
  return copy;
};

withDefaults = (function(_this) {
  return function(page, state) {
    var currentUrl;
    currentUrl = new ComponentUrl(state.url);
    return reverseMerge(page, {
      url: currentUrl.relative,
      pathname: currentUrl.pathname,
      cachedAt: new Date().getTime(),
      assets: [],
      data: {},
      title: '',
      positionY: 0,
      positionX: 0,
      csrf_token: null
    });
  };
})(this);

browserIsBuggy = function() {
  var ua;
  ua = navigator.userAgent;
  return (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1;
};

browserSupportsPushState = function() {
  return window.history && 'pushState' in window.history && 'state' in window.history;
};

popCookie = function(name) {
  var ref, value;
  value = ((ref = document.cookie.match(new RegExp(name + "=(\\w+)"))) != null ? ref[1].toUpperCase() : void 0) || '';
  document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/';
  return value;
};

requestMethodIsSafe = function() {
  var ref;
  return (ref = popCookie('request_method')) === 'GET' || ref === '';
};

browserSupportsBreezy = function() {
  return browserSupportsPushState() && !browserIsBuggy() && requestMethodIsSafe();
};

intersection = function(a, b) {
  var i, len, ref, results, value;
  if (a.length > b.length) {
    ref = [b, a], a = ref[0], b = ref[1];
  }
  results = [];
  for (i = 0, len = a.length; i < len; i++) {
    value = a[i];
    if (indexOf.call(b, value) >= 0) {
      results.push(value);
    }
  }
  return results;
};

triggerEvent = (function(_this) {
  return function(name, data, target) {
    var event;
    if (target == null) {
      target = document;
    }
    event = document.createEvent('Events');
    if (data) {
      event.data = data;
    }
    event.initEvent(name, true, true);
    return target.dispatchEvent(event);
  };
})(this);

documentListenerForLinks = function(eventType, handler) {
  return document.addEventListener(eventType, function(ev) {
    var isNodeDisabled, target;
    target = ev.target;
    while (target !== document && (target != null)) {
      if (target.nodeName === "A") {
        isNodeDisabled = target.getAttribute('disabled');
        if (target.getAttribute('disabled')) {
          ev.preventDefault();
        }
        if (!isNodeDisabled) {
          handler(ev);
          return;
        }
      }
      target = target.parentNode;
    }
  });
};

isObject = function(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
};

isArray = function(val) {
  return Object.prototype.toString.call(val) === '[object Array]';
};

Grafter = (function() {
  function Grafter() {
    this.current_path = [];
  }

  Grafter.prototype.graftByKeypath = function(path, leaf, obj, opts) {
    var attr, child, copy, found, head, i, id, index, j, key, len, len1, node, ref, remaining, value;
    if (opts == null) {
      opts = {};
    }
    if (typeof path === "string") {
      path = path.split('.');
      return this.graftByKeypath(path, leaf, obj, opts);
    }
    head = path[0];
    this.current_path.push(head);
    if (obj != null) {
      child = obj[head];
    }
    remaining = path.slice(1);
    if (path.length === 0) {
      if (opts.type === 'add' && isArray(obj)) {
        copy = [];
        for (i = 0, len = obj.length; i < len; i++) {
          child = obj[i];
          copy.push(child);
        }
        copy.push(leaf);
        return copy;
      } else {
        return leaf;
      }
    }
    if (isObject(obj)) {
      copy = {};
      found = false;
      for (key in obj) {
        value = obj[key];
        if (key === head) {
          node = this.graftByKeypath(remaining, leaf, child, opts);
          if (child !== node) {
            found = true;
          }
          copy[key] = node;
        } else {
          copy[key] = value;
        }
      }
      if (found) {
        this.current_path.pop();
        return copy;
      } else {
        warn("Could not find key " + head + " in keypath " + (this.current_path.join('.')));
        return obj;
      }
    } else if (isArray(obj)) {
      ref = head.split('='), attr = ref[0], id = ref[1];
      found = false;
      if (id === void 0) {
        index = parseInt(attr);
        child = obj[index];
        node = this.graftByKeypath(remaining, leaf, child, opts);
        if (child !== node) {
          found = true;
        }
        copy = obj.slice(0, index);
        copy.push(node);
        copy = copy.concat(obj.slice(index + 1, obj.length));
      } else {
        id = parseInt(id) || 0;
        copy = [];
        for (j = 0, len1 = obj.length; j < len1; j++) {
          child = obj[j];
          if (child[attr] === id) {
            node = this.graftByKeypath(remaining, leaf, child, opts);
            if (child !== node) {
              found = true;
            }
            copy.push(node);
          } else {
            copy.push(child);
          }
        }
      }
      if (found) {
        this.current_path.pop();
        return copy;
      } else {
        warn("Could not find key " + head + " in keypath " + (this.current_path.join('.')));
        return obj;
      }
    } else {
      return obj;
    }
  };

  return Grafter;

})();

module.exports = {
  warn: warn,
  graftByKeypath: function() {
    var grafter;
    grafter = new Grafter;
    return grafter.graftByKeypath.apply(grafter, arguments);
  },
  documentListenerForLinks: documentListenerForLinks,
  reverseMerge: reverseMerge,
  merge: merge,
  clone: clone,
  withDefaults: withDefaults,
  browserSupportsBreezy: browserSupportsBreezy,
  intersection: intersection,
  triggerEvent: triggerEvent,
  Grafter: Grafter
};


},{"./component_url.coffee":1}]},{},[6]);
