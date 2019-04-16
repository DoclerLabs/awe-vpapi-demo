//
// vpapi.js
//
// Functions to load data from the AWE Video Promition API.
//


/**
 * The Video Promotion API's base URL, **without** a trailing slash.
 * @const
 */
var API_BASE_URL = 'https://pt.protoawe.com/api/video-promotion/v1';
var API_PSID = 'YOUR_PSID_HERE';
var API_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';



/**********************************************************************************/
/******************************** HTTP Requests ***********************************/
/**********************************************************************************/


/**
 * Sends a request to the API, then parses and returns the API's JSON response.
 * @internal
 * @param {string} path The URL path to request from.
 * @param {object} params Optional parameters to send to the API.
 * @return {Promise<object>} The parsed response.
 */
function sendRequest(path, params) {
	// remove leading slashes from the path to avoid multiple slashes in the URL
	path = path.replace(/^\/+/, '');

	// ensure params is an object
	params = params || {};

	// inject parameters that are needed for every request
	params.psid = API_PSID;
	params.accessKey = API_ACCESS_KEY;

	// remove all params that are `undefined`
	for (var key in params) {
		if (typeof params[key] === 'undefined') {
			delete params[key];
		}
	}

	// Create a URL object, then add the params to it. For more info, see:
	//   - https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
	//   - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
	var url = new URL(API_BASE_URL + '/' + path);
	url.search = new URLSearchParams(params);

	// create the request options
	var options = {
		// all requests against the Video Promotion API are GET
		method: 'GET',
		// add the necessary headers
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	};

	// send the request, parse it as JSON, then return the nested `data`
	return fetch(url, options).then(function(rawResponse) {
		return rawResponse.json().then(function(parsedResponse) {
			return parsedResponse.data;
		});
	});
}




/**********************************************************************************/
/************************************* Tags ***************************************/
/**********************************************************************************/

/**
 * Used to cache all tags available in the Video Promotion API.
 * Variable is assigned when the tags have been loaded for the first time.
 * @internal
 */
var cachedTags;

/**
 * Actually loads all tags from the Video Promotion API.
 * Updates `cachedTags` with the newly loaded tags.
 * @internal
 * @return {Promise<string[]>} The returned promise will resolve to a string array,
 *                             containing all available tags.
 */
function loadTagListInternal() {
	return sendRequest('tags').then(function(data) {
		// tags are nested in the response
		var tags = data.tags;

		// update the tag cache
		cachedTags = tags;

		// Return the tags from here so callers of `loadTagListInternal`
		// get the tags as a return value.
		// Return a copy though to prevent accidental modification of the
		// `cachedTags` array.
		return [].concat(tags);
	});
}


/**
 * Returns a list of all tags available through the Video Promotion API.
 * @param {boolean} allowCache Whether to allow using cached tags.
 * @return {Promise<string[]>} The returned promise will resolve to a string array,
 *                             containing all available tags.
 */
function loadTagList(allowCache) {
	// if we're allowed to use cached tags and if there are any cached tags,
	// return them instead of reloading from the API
	if (allowCache && cachedTags) {
		// return a copy of the cached tags array to prevent
		// accidental modification of our actual cache
		var tags = [].concat(cachedTags);
		return Promise.resolve(tags);
	}
	// tags not cached yet, load the tags from the API instead
	else {
		return loadTagListInternal();
	}
}




/**********************************************************************************/
/************************************* List ***************************************/
/**********************************************************************************/

function loadList(params) {
	// ensure the params object exists
	params = params || {};

	return sendRequest('client/list', {
		pageIndex: Math.max(params.page || 1, 1),
		limit: params.limit || undefined,
		sexualOrientation: params.sexualOrientation || 'straight',
		primaryColor: params.primaryColor || 'ff9900',
		labelColor: params.labelColor || '000',
		tags: params.tags || undefined
	});
}



/**********************************************************************************/
/************************************* Related ************************************/
/**********************************************************************************/

function loadRelated(params) {
	// ensure the params object exists
	params = params || {};

	return sendRequest('client/related/' + params.id, {
		pageIndex: Math.max(params.page || 1, 1),
		limit: params.limit || undefined,
	});
}




/**********************************************************************************/
/*********************************** Details **************************************/
/**********************************************************************************/

function loadDetails(params) {
	return sendRequest('client/details/' + params.videoId, {
		primaryColor: params.primaryColor || 'ff9900',
		labelColor: params.labelColor || '000'
	});
}
