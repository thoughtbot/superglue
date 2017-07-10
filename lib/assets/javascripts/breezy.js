(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
};

var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
};

var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
  return callback(window.confirm(message));
}; // eslint-disable-line no-alert

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = window.navigator.userAgent;

  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

  return window.history && 'pushState' in window.history;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
};
},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.locationsAreEqual = exports.createLocation = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _resolvePathname = require('resolve-pathname');

var _resolvePathname2 = _interopRequireDefault(_resolvePathname);

var _valueEqual = require('value-equal');

var _valueEqual2 = _interopRequireDefault(_valueEqual);

var _PathUtils = require('./PathUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
  var location = void 0;
  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = (0, _PathUtils.parsePath)(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);

    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
};

var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
};
},{"./PathUtils":3,"resolve-pathname":13,"value-equal":15}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
};

var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
};

var hasBasename = exports.hasBasename = function hasBasename(path, prefix) {
  return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
};

var stripBasename = exports.stripBasename = function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
};

var stripTrailingSlash = exports.stripTrailingSlash = function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
};

var parsePath = exports.parsePath = function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';

  var hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
};

var createPath = exports.createPath = function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;


  var path = pathname || '/';

  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;

  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

  return path;
};
},{}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = require('./LocationUtils');

var _PathUtils = require('./PathUtils');

var _createTransitionManager = require('./createTransitionManager');

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = require('./DOMUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

var getHistoryState = function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
};

/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function createBrowserHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Browser history needs a DOM');

  var globalHistory = window.history;
  var canUseHistory = (0, _DOMUtils.supportsHistory)();
  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();

  var _props$forceRefresh = props.forceRefresh,
      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
      _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$keyLength = props.keyLength,
      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var getDOMLocation = function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;


    var path = pathname + search + hash;

    (0, _warning2.default)(!basename || (0, _PathUtils.hasBasename)(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');

    if (basename) path = (0, _PathUtils.stripBasename)(path, basename);

    return (0, _LocationUtils.createLocation)(path, state, key);
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var handlePopState = function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;

    handlePop(getDOMLocation(event.state));
  };

  var handleHashChange = function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  };

  var forceNextPop = false;

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allKeys.indexOf(fromLocation.key);

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key];

  // Public interface

  var createHref = function createHref(location) {
    return basename + (0, _PathUtils.createPath)(location);
  };

  var push = function push(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.pushState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

          nextKeys.push(location.key);
          allKeys = nextKeys;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');

        window.location.href = href;
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.replaceState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);

          if (prevIndex !== -1) allKeys[prevIndex] = location.key;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');

        window.location.replace(href);
      }
    });
  };

  var go = function go(n) {
    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createBrowserHistory;
},{"./DOMUtils":1,"./LocationUtils":2,"./PathUtils":3,"./createTransitionManager":7,"invariant":9,"warning":16}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = require('./LocationUtils');

var _PathUtils = require('./PathUtils');

var _createTransitionManager = require('./createTransitionManager');

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = require('./DOMUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HashChangeEvent = 'hashchange';

var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + (0, _PathUtils.stripLeadingSlash)(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: _PathUtils.stripLeadingSlash,
    decodePath: _PathUtils.addLeadingSlash
  },
  slash: {
    encodePath: _PathUtils.addLeadingSlash,
    decodePath: _PathUtils.addLeadingSlash
  }
};

var getHashPath = function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
};

var pushHashPath = function pushHashPath(path) {
  return window.location.hash = path;
};

var replaceHashPath = function replaceHashPath(path) {
  var hashIndex = window.location.href.indexOf('#');

  window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
};

var createHashHistory = function createHashHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Hash history needs a DOM');

  var globalHistory = window.history;
  var canGoWithoutReload = (0, _DOMUtils.supportsGoWithoutReloadUsingHash)();

  var _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$hashType = props.hashType,
      hashType = _props$hashType === undefined ? 'slash' : _props$hashType;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var _HashPathCoders$hashT = HashPathCoders[hashType],
      encodePath = _HashPathCoders$hashT.encodePath,
      decodePath = _HashPathCoders$hashT.decodePath;


  var getDOMLocation = function getDOMLocation() {
    var path = decodePath(getHashPath());

    (0, _warning2.default)(!basename || (0, _PathUtils.hasBasename)(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');

    if (basename) path = (0, _PathUtils.stripBasename)(path, basename);

    return (0, _LocationUtils.createLocation)(path);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var forceNextPop = false;
  var ignorePath = null;

  var handleHashChange = function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;

      if (!forceNextPop && (0, _LocationUtils.locationsAreEqual)(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === (0, _PathUtils.createPath)(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;

      handlePop(location);
    }
  };

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(toLocation));

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(fromLocation));

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  // Ensure the hash is encoded properly before doing anything else.
  var path = getHashPath();
  var encodedPath = encodePath(path);

  if (path !== encodedPath) replaceHashPath(encodedPath);

  var initialLocation = getDOMLocation();
  var allPaths = [(0, _PathUtils.createPath)(initialLocation)];

  // Public interface

  var createHref = function createHref(location) {
    return '#' + encodePath(basename + (0, _PathUtils.createPath)(location));
  };

  var push = function push(path, state) {
    (0, _warning2.default)(state === undefined, 'Hash history cannot push state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var path = (0, _PathUtils.createPath)(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);

        var prevIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(history.location));
        var nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

        nextPaths.push(path);
        allPaths = nextPaths;

        setState({ action: action, location: location });
      } else {
        (0, _warning2.default)(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');

        setState();
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(state === undefined, 'Hash history cannot replace state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var path = (0, _PathUtils.createPath)(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf((0, _PathUtils.createPath)(history.location));

      if (prevIndex !== -1) allPaths[prevIndex] = path;

      setState({ action: action, location: location });
    });
  };

  var go = function go(n) {
    (0, _warning2.default)(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');

    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createHashHistory;
},{"./DOMUtils":1,"./LocationUtils":2,"./PathUtils":3,"./createTransitionManager":7,"invariant":9,"warning":16}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _PathUtils = require('./PathUtils');

var _LocationUtils = require('./LocationUtils');

var _createTransitionManager = require('./createTransitionManager');

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clamp = function clamp(n, lowerBound, upperBound) {
  return Math.min(Math.max(n, lowerBound), upperBound);
};

/**
 * Creates a history object that stores locations in memory.
 */
var createMemoryHistory = function createMemoryHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var getUserConfirmation = props.getUserConfirmation,
      _props$initialEntries = props.initialEntries,
      initialEntries = _props$initialEntries === undefined ? ['/'] : _props$initialEntries,
      _props$initialIndex = props.initialIndex,
      initialIndex = _props$initialIndex === undefined ? 0 : _props$initialIndex,
      _props$keyLength = props.keyLength,
      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;


  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = history.entries.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  };

  var index = clamp(initialIndex, 0, initialEntries.length - 1);
  var entries = initialEntries.map(function (entry) {
    return typeof entry === 'string' ? (0, _LocationUtils.createLocation)(entry, undefined, createKey()) : (0, _LocationUtils.createLocation)(entry, undefined, entry.key || createKey());
  });

  // Public interface

  var createHref = _PathUtils.createPath;

  var push = function push(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var prevIndex = history.index;
      var nextIndex = prevIndex + 1;

      var nextEntries = history.entries.slice(0);
      if (nextEntries.length > nextIndex) {
        nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
      } else {
        nextEntries.push(location);
      }

      setState({
        action: action,
        location: location,
        index: nextIndex,
        entries: nextEntries
      });
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      history.entries[history.index] = location;

      setState({ action: action, location: location });
    });
  };

  var go = function go(n) {
    var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);

    var action = 'POP';
    var location = history.entries[nextIndex];

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (ok) {
        setState({
          action: action,
          location: location,
          index: nextIndex
        });
      } else {
        // Mimic the behavior of DOM histories by
        // causing a render after a cancelled POP.
        setState();
      }
    });
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var canGo = function canGo(n) {
    var nextIndex = history.index + n;
    return nextIndex >= 0 && nextIndex < history.entries.length;
  };

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    return transitionManager.setPrompt(prompt);
  };

  var listen = function listen(listener) {
    return transitionManager.appendListener(listener);
  };

  var history = {
    length: entries.length,
    action: 'POP',
    location: entries[index],
    index: index,
    entries: entries,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    canGo: canGo,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createMemoryHistory;
},{"./LocationUtils":2,"./PathUtils":3,"./createTransitionManager":7,"warning":16}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createTransitionManager = function createTransitionManager() {
  var prompt = null;

  var setPrompt = function setPrompt(nextPrompt) {
    (0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time');

    prompt = nextPrompt;

    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          (0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message');

          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  };

  var listeners = [];

  var appendListener = function appendListener(fn) {
    var isActive = true;

    var listener = function listener() {
      if (isActive) fn.apply(undefined, arguments);
    };

    listeners.push(listener);

    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var notifyListeners = function notifyListeners() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(undefined, args);
    });
  };

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
};

exports.default = createTransitionManager;
},{"warning":16}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.createPath = exports.parsePath = exports.locationsAreEqual = exports.createLocation = exports.createMemoryHistory = exports.createHashHistory = exports.createBrowserHistory = undefined;

var _LocationUtils = require('./LocationUtils');

Object.defineProperty(exports, 'createLocation', {
  enumerable: true,
  get: function get() {
    return _LocationUtils.createLocation;
  }
});
Object.defineProperty(exports, 'locationsAreEqual', {
  enumerable: true,
  get: function get() {
    return _LocationUtils.locationsAreEqual;
  }
});

var _PathUtils = require('./PathUtils');

Object.defineProperty(exports, 'parsePath', {
  enumerable: true,
  get: function get() {
    return _PathUtils.parsePath;
  }
});
Object.defineProperty(exports, 'createPath', {
  enumerable: true,
  get: function get() {
    return _PathUtils.createPath;
  }
});

var _createBrowserHistory2 = require('./createBrowserHistory');

var _createBrowserHistory3 = _interopRequireDefault(_createBrowserHistory2);

var _createHashHistory2 = require('./createHashHistory');

var _createHashHistory3 = _interopRequireDefault(_createHashHistory2);

var _createMemoryHistory2 = require('./createMemoryHistory');

var _createMemoryHistory3 = _interopRequireDefault(_createMemoryHistory2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createBrowserHistory = _createBrowserHistory3.default;
exports.createHashHistory = _createHashHistory3.default;
exports.createMemoryHistory = _createMemoryHistory3.default;
},{"./LocationUtils":2,"./PathUtils":3,"./createBrowserHistory":4,"./createHashHistory":5,"./createMemoryHistory":6}],9:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":10}],10:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],11:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String} The decoded string.
 * @api private
 */
function decode(input) {
  return decodeURIComponent(input.replace(/\+/g, ' '));
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?&]+)=?([^&]*)/g
    , result = {}
    , part;

  //
  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
  // the lastIndex property so we can continue executing this loop until we've
  // parsed all results.
  //
  for (;
    part = parser.exec(query);
    result[decode(part[1])] = decode(part[2])
  );

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = [];

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (var key in obj) {
    if (has.call(obj, key)) {
      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;

},{}],12:[function(require,module,exports){
'use strict';

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
module.exports = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

},{}],13:[function(require,module,exports){
'use strict';

var isAbsolute = function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
};

// About 1.5x faster than the two-arg version of Array#splice()
var spliceOne = function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }list.pop();
};

// This implementation is based heavily on node's url.parse
var resolvePathname = function resolvePathname(to) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];

  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';

  var hasTrailingSlash = void 0;
  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;
  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) {
    fromParts.unshift('..');
  }if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');

  var result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result;
};

module.exports = resolvePathname;
},{}],14:[function(require,module,exports){
(function (global){
'use strict';

var required = require('requires-port')
  , qs = require('querystringify')
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @api public
 */
function lolcation(loc) {
  loc = loc || global.location || {};

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new URL(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new URL(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @return {ProtocolExtract} Extracted information.
 * @api private
 */
function extractProtocol(address) {
  var match = protocolre.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: !!match[2],
    rest: match[3]
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @api private
 */
function resolve(relative, base) {
  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} location Location defaults for relative paths.
 * @param {Boolean|Function} parser Parser for the query string.
 * @api public
 */
function URL(address, location, parser) {
  if (!(this instanceof URL)) {
    return new URL(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (!extracted.slashes) instructions[2] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];
    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL}
 * @api public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
      url.pathname = value.length && value.charAt(0) !== '/' ? '/' + value : value;

      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String}
 * @api public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

URL.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
URL.extractProtocol = extractProtocol;
URL.location = lolcation;
URL.qs = qs;

module.exports = URL;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"querystringify":11,"requires-port":12}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var valueEqual = function valueEqual(a, b) {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
    return valueEqual(item, b[index]);
  });

  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);

  if (aType !== bType) return false;

  if (aType === 'object') {
    var aValue = a.valueOf();
    var bValue = b.valueOf();

    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(function (key) {
      return valueEqual(a[key], b[key]);
    });
  }

  return false;
};

exports.default = valueEqual;
},{}],16:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (process.env.NODE_ENV !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))
},{"_process":10}],17:[function(require,module,exports){
var ComponentUrl, parse, uniqueId;

parse = require('url-parse');

uniqueId = function() {
  return new Date().getTime().toString(36);
};

ComponentUrl = (function() {
  function ComponentUrl(original) {
    var ref;
    this.original = original;
    if (((ref = this.original) != null ? ref.constructor : void 0) === ComponentUrl) {
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
    if (typeof window !== "undefined" && window !== null) {
      return this.origin !== (new ComponentUrl(document.location.href)).origin;
    } else {
      return false;
    }
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
    ref = parse(this.original), this.href = ref.href, this.protocol = ref.protocol, this.host = ref.host, this.hostname = ref.hostname, this.port = ref.port, this.pathname = ref.pathname, this.query = ref.query, this.hash = ref.hash;
    this.origin = [this.protocol, '//', this.hostname].join('');
    if (this.port.length !== 0) {
      this.origin += ":" + this.port;
    }
    this.pathToHash = [this.pathname, this.query, this.hash].join('');
    return this.absolute = this.href;
  };

  return ComponentUrl;

})();

module.exports = ComponentUrl;


},{"url-parse":14}],18:[function(require,module,exports){
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
    debugger;
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


},{"./component_url.coffee":17,"./csrf_token.coffee":19,"./doubly_linked_list.coffee":20,"./events.coffee":21,"./parallel_queue.coffee":23,"./progress_bar.coffee":24,"./snapshot.coffee":26,"./utils.coffee":27}],19:[function(require,module,exports){
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


},{}],20:[function(require,module,exports){
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


},{}],21:[function(require,module,exports){
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


},{}],22:[function(require,module,exports){
var CSRFToken, ComponentUrl, Controller, DoublyLinkedList, EVENTS, History, ParallelQueue, ProgressBarAPI, Remote, Snapshot, Utils, browserSupportsCustomEvents, controller, history, initializeBreezy, platform, progressBar, remoteHandler, setup, visit;

ComponentUrl = require('./component_url.coffee');

Controller = require('./controller.coffee');

CSRFToken = require('./csrf_token.coffee');

DoublyLinkedList = require('./doubly_linked_list.coffee');

ParallelQueue = require('./parallel_queue.coffee');

Remote = require('./remote.coffee');

Snapshot = require('./snapshot.coffee');

Utils = require('./utils.coffee');

EVENTS = require('./events.coffee');

History = require('history');

if (typeof window !== "undefined" && window !== null) {
  history = History.createBrowserHistory();
} else {
  history = History.createMemoryHistory();
}

controller = new Controller(history);

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
  history.listen(controller.history.onHistoryChange);
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


},{"./component_url.coffee":17,"./controller.coffee":18,"./csrf_token.coffee":19,"./doubly_linked_list.coffee":20,"./events.coffee":21,"./parallel_queue.coffee":23,"./remote.coffee":25,"./snapshot.coffee":26,"./utils.coffee":27,"history":8}],23:[function(require,module,exports){
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


},{"./doubly_linked_list.coffee":20}],24:[function(require,module,exports){
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


},{}],25:[function(require,module,exports){
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


},{}],26:[function(require,module,exports){
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

  Snapshot.prototype.onHistoryChange = function(location, action) {
    var newUrl, previousUrl, ref, restorePoint;
    if (action === 'POP' && ((ref = location.state) != null ? ref.breezy : void 0) && location.state.url !== this.currentBrowserState.url) {
      previousUrl = new ComponentUrl(this.currentBrowserState.url);
      newUrl = new ComponentUrl(location.state.url);
      if (restorePoint = this.pageCache[newUrl.absolute]) {
        this.cacheCurrentPage();
        this.currentPage = restorePoint;
        return this.controller.restore(this.currentPage);
      } else {
        return this.controller.request(location.state.url);
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
      url: currentUrl.pathToHash,
      pathname: currentUrl.pathToHash,
      transition_cache: true
    });
    return this.pageCache[currentUrl.absolute] = this.currentPage;
  };

  Snapshot.prototype.rememberCurrentUrlAndState = function() {
    this.history.replace(this.currentComponentUrl().pathname, {
      breezy: true,
      url: this.currentComponentUrl().href
    });
    return this.currentBrowserState = this.history.location.state;
  };

  Snapshot.prototype.removeParamFromUrl = function(url, parameter) {
    return url.replace(new RegExp('^([^#]*\?)(([^#]*)&)?' + parameter + '(\=[^&#]*)?(&|#|$)'), '$1$3$5').replace(/^([^#]*)((\?)&|\?(#|$))/, '$1$3$4');
  };

  Snapshot.prototype.currentComponentUrl = function() {
    if (typeof window !== "undefined" && window !== null) {
      return new ComponentUrl(document.location.href);
    }
  };

  Snapshot.prototype.reflectNewUrl = function(url) {
    var fullUrl, preservedHash;
    if ((url = new ComponentUrl(url)).absolute !== this.currentComponentUrl().href) {
      preservedHash = url.hasNoHash() ? this.currentComponentUrl().hash : '';
      fullUrl = url.pathname + preservedHash;
      fullUrl = this.removeParamFromUrl(fullUrl, '_breezy_filter');
      fullUrl = this.removeParamFromUrl(fullUrl, '__');
      return this.history.push(fullUrl, {
        breezy: true,
        url: url.absolute + preservedHash
      });
    }
  };

  Snapshot.prototype.updateCurrentBrowserState = function() {
    return this.currentBrowserState = this.history.location.state;
  };

  Snapshot.prototype.refreshBrowserForNewAssets = function() {
    return document.location.reload();
  };

  Snapshot.prototype.changePage = function(nextPage, options) {
    if (this.currentPage && this.assetsChanged(nextPage)) {
      this.refreshBrowserForNewAssets();
      return;
    }
    this.currentPage = nextPage;
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


},{"./component_url.coffee":17,"./csrf_token.coffee":19,"./events.coffee":21,"./utils.coffee":27}],27:[function(require,module,exports){
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
      url: currentUrl.pathToHash,
      pathname: currentUrl.pathname,
      cachedAt: new Date().getTime(),
      assets: [],
      data: {},
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


},{"./component_url.coffee":17}]},{},[22]);
