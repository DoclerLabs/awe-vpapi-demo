//
// router.js
//
// Routing can be done in various ways, e.g. using a framework.
// When using React, we recommend react-router.
// You can omit routing in JavaScript too and use backend routing instead.
//
// In this demo, we use the History API and a set of custom functions.
// Further reading:
//   - https://developer.mozilla.org/en-US/docs/Web/API/History
//


/**
 * The base path for routing. See `setBaseRoutingPath`.
 * @internal
 */
var baseRoutingPath = '/';


/**
 * Stores route handlers registered with `registerRouteHandler`.
 * @internal
 */
var handlers = [];


/**
 * Sets the base path to use for routing.
 * @param {string} path The base path.
 * @returns {void}
 */
function setBaseRoutingPath(path) {
	// normalize falsy values and whitespace strings
	if (!path || path.trim() === '') {
		path = '';
	}

	// ensure the path ends with a slash
	if (path[path.length - 1] !== '/') {
		path += '/';
	}

	// update the path
	baseRoutingPath = path;
}


/**
 * Returns a regular expression used to match paths against `baseRoutingPath`.
 * @internal
 * @returns {RegExp} The `baseRoutingPath` as a regular expression.
 */
function getBaseRoutingPathRegex() {
	return new RegExp('^' + baseRoutingPath + '?');
}


/**
 * Prepends the `baseRoutingPath` to the given path.
 * @internal
 * @param {string} path The path to prepend `baseRoutingPath` to.
 * @returns {string} The full path.
 */
function prependBaseRoutingPath(path) {
	return (
		baseRoutingPath +
		// Since the base routing path always ends with a slash, we need to remove
		// any leading slashes in the path we append. This avoids duplicate slashes
		// in the URL.
		(path || '').replace(/^\/+/, '')
	);
}


/**
 * Removes the `baseRoutingPath` from a given path.
 * @internal
 * @param {string} path The path to remove `baseRoutingPath` from.
 * @returns {string} The given path, without the `baseRoutingPath`.
 */
function removeBaseRoutingPath(path) {
	// Remove the base routing path and all leading slashes.
	// We append a leading slash in the next step. This ensures there's exactly
	// one leading slash in the path.
	path = path.replace(getBaseRoutingPathRegex(), '').replace(/^\/+/, '');
	return '/' + path;
}


/**
 * Registers a handler for a certain site path.
 * The handler function will be called by `renderRouteAtPath`.
 * @param {string | RegExp | Function} matcher Checks if a route matches a URL path.
 * @param {Function} handler The route handler function.
 * @returns {void}
 */
function registerRouteHandler(matcher, handler) {
	// store the route handler so we can use it later on
	handlers.push({
		handlerFunction: handler,
		/**
		 * This will be called by `findRouteHandlerForPath` to check if this
		 * handler can handle a URL path.
		 * @return {boolean}
		 */
		canHandlePath: function(path) {
			// If the matcher is a function, call it and return it's result.
			// Cast the result to boolean to ensure type consistency.
			if (typeof matcher === 'function') {
				return !!matcher(path);
			}
			// If the matcher is a string, return `true` if it matches the
			// current path exactly, `false` if not.
			else if (typeof matcher === 'string') {
				return path === matcher;
			}
			// If the matcher is neither a function nor a string, it must be
			// a RegExp. Evaluate it against the path.
			else {
				return matcher.test(path);
			}
		},
		parseRouteParts: function(path) {
			if (matcher instanceof RegExp) {
				return path.match(matcher);
			} else {
				return [path, path];
			}
		}
	});
}


/**
 * Finds a route handler for a certain site path.
 * @internal
 * @param {string} path The URL path to route to, e.g. `/` or `/tag/{tagName}`.
 * @return {Function} A route handler function
 */
function findRouteHandlerForPath(path) {
	// return the first handler that can handle this path
	var handler = arrayFind(handlers, function(handler) {
		return handler.canHandlePath(path);
	});

	if (!handler) {
		return undefined;
	} else {
		return handler;
	}
}


/**
 * Renders the route for a certain site path.
 * @param {string} path The URL path to route to, e.g. `/` or `/tag/{tagName}`.
 * @return {void}
 */
function renderRouteAtPath(path) {
	path = removeBaseRoutingPath(path);

	// try to find the matching handler
	var handler = findRouteHandlerForPath(path);

	if (!handler) {
		console.error('Routing failed: No route handler for path "' + path + '"');
	}

	handler.handlerFunction.apply(undefined, handler.parseRouteParts(path));
}


/**
 * Renders the route for the path currently in the browser's URL bar.
 * @return {void}
 */
function navigateToCurrentPath() {
	renderRouteAtPath(window.location.pathname);
}


/**
 * Updates the current browser URL, then renders the route for a certain site path.
 * @param {string} path The URL path to update to, e.g. `/` or `/tag/{tagName}`.
 * @return {void}
 */
function navigateToRoute(path, title) {
	// make sure the base path is contained in the path we use as the new history entry
	var displayedPath = path;

	// update the history entry and path displayed in the browser URL bar
	window.history.pushState({}, title, displayedPath);

	// actually render the path's route
	navigateToCurrentPath();
}


/**
 * Binds all links on the page to routes registered with `registerRouteHandler`,
 * provided the linked URL is registered as a route.
 * @param {JQueryElement | string} container The DOM element to search for links. Optional,
 *                                           defaults to `body`.
 * @returns {void}
 */
function bindRouteLinks(container) {
	// find all links in the container that should use the router
	$(container || 'body')
		.find('[data-router-link]')
		// exclude links we already added a listener to
		.not('[data-router-link-bound]')
		// add listeners to the links
		.each(function() {
			var link = $(this);
			// prevent future event handler binding with this function
			link.attr('data-router-link-bound', true)
				.on('click', function(e) {
					// prevent propagation to other event handlers
					e.stopPropagation();
					// don't let browser open the URL
					e.preventDefault();

					// make sure the base path is prepended to the route path
					var path = link.attr('href') || link.attr('data-router-link')
					if (!getBaseRoutingPathRegex().test(path)) {
						path = prependBaseRoutingPath(path);
					}

					// use the router to navigate
					navigateToRoute(path);
				});
		});
}


/**
 * Returns the query param value
 * @param {string} name   Query param
 * @returns {string}
 */
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}