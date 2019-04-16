/**
 * Debounces a function call.
 * @param {*} fn The function to debounce.
 * @param {*} pause The time to wait before calling `fn`.
 * @returns {Function} The debounced function.
 */
function debounce(fn, pause) {
	var timeout;

	return function () {
		clearTimeout(timeout);
		timeout = setTimeout(fn, pause);
	};
}


/**
 * Calculates the Levensthein distance between 2 strings.
 * From: https://stackoverflow.com/a/11958496/3861083
 * @param {string} stringA The string to compare to.
 * @param {string} stringB The string to compare with.
 * @returns {number} The distance between `stringA` and `stringB`.
 */
function levenshteinDistance(stringA, stringB) {
	var d = []; // 2d matrix

	// Step 1
	var n = stringA.length;
	var m = stringB.length;

	if (n == 0) return m;
	if (m == 0) return n;

	// Create an array of arrays (descending loop is quicker)
	for (var i = n; i >= 0; i--) d[i] = [];

	// Step 2
	for (var i = n; i >= 0; i--) d[i][0] = i;
	for (var j = m; j >= 0; j--) d[0][j] = j;

	// Step 3
	for (var i = 1; i <= n; i++) {
		var s_i = stringA.charAt(i - 1);

		// Step 4
		for (var j = 1; j <= m; j++) {

			// Check the jagged ld total so far
			if (i == j && d[i][j] > 4) return n;

			var t_j = stringB.charAt(j - 1);
			var cost = (s_i == t_j) ? 0 : 1; // Step 5

			// Calculate the minimum
			var mi = d[i - 1][j] + 1;
			var b = d[i][j - 1] + 1;
			var c = d[i - 1][j - 1] + cost;

			if (b < mi) mi = b;
			if (c < mi) mi = c;

			d[i][j] = mi; // Step 6

			// Damerau transposition
			if (i > 1 && j > 1 && s_i == stringB.charAt(j - 2) && stringA.charAt(i - 2) == t_j) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
			}
		}
	}

	// Step 7
	return d[n][m];
}


/**
 * Joins multiple strings together.
 * @return {string} The joined string.
 * @example
 *     join('a', 'b', 'c'); // returns "abc"
 *     join('a', ['b', 'c'], 'd'); // returns "abcd"
 */
function join() {
	var joined = ''

	for (var i = 0; i < arguments.length; i++) {
		var part = arguments[i];

		if (Array.isArray(part)) {
			part = join.apply(undefined, part);
		}

		joined += part;
	}

	return joined;
}


/**
 * Alternative for ES6 `Array.find()`.
 */
function arrayFind(array, predicate, thisArg) {
	// Implementation adapted from Mozilla's polyfill at:
	//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find

	if (!array) {
		throw new TypeError('"array" is null or not defined');
	}

	var object = Object(array);
	var length = object.length >>> 0;

	if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	}

	var index = 0;

	while (index < length) {
		var value = object[index];
		if (predicate.call(thisArg, value, index, object)) {
			return value;
		}
		index++;
	}

	return undefined;
}


/**
 * Loads an image, returning a promise. The promise will resolve when the image has
 * been loaded successfully and rejects when loading failed.
 * @param {string} url The URL to load the image from.
 * @returns {Promise} A promise that will resolve/reject when the image loads.
 */
function loadImage(url) {
	return new Promise(function(resolve, reject) {
		var image = new Image();
		image.onload = resolve;
		image.onerror = reject;
		image.onabort = reject;
		image.src = url;
	});
}
