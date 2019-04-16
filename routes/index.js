//
// index.js
//
// Renders the main page.
//

// register the route handler
registerRouteHandler(/^\/?$/, function() {
	// clear the content container before rendering
	getContentContainer().html('');

	// render the page content
	renderFeaturedVideoList();
	renderRelevantVideoList();

	// make sure to scroll to the top of the viewport
	scrollToTop();
});


/**
 * Renders a list of videos that are currently at the top of the video promotion API's
 * list response. The video's rendered by this function change over time.
 * @returns {void}
 */
function renderFeaturedVideoList() {
	var contentContainer = getContentContainer();

	contentContainer.html(join(
		'<div class="video-list-wrapper featured-videos">',
			'<h2 class="featured-videos-heading">Featured Videos</h2>',
			'<div class="featured-videos-container"></div>',
		'</div>'
	));

	var featuredVideosContainer = contentContainer.find('.featured-videos-container');

	// non-featured videos
	new VideoList()
		.setContainer(featuredVideosContainer)
		.setVideoPromotionApiParams({ limit: 10 })
		.setNoVideosCallback(function() {
			$('.featured-videos-heading').remove();
			featuredVideosContainer.remove();
		})
		.render();
}


/**
 * Renders a list of videos relevant to the given params.
 * @param {object} params The params to load videos from the API with.
 * @param {Function} paginationCallback Optional. A callback to be run when a pagination
 *                                      link is clicked. When omitted, pagination will
 *                                      call the current route with URL param `page`.
 * @returns {void}
 */
function renderRelevantVideoList(params, paginationCallback, endpoint) {
	var contentContainer = getContentContainer();

	var heading = (
		params && params.tags && params.tags.length >= 1
			? 'Latest videos for <em>#' + window.decodeURIComponent(params.tags[0]) + '</em>'
			: 'Popular videos'
	);

	var container = $(join(
		'<div class="video-list-wrapper relevant-videos">',
			'<h2>', heading, '</h2>',
			'<div class="relevant-videos-container"></div>',
		'</div>'
	));

	contentContainer.append(container);

	var popularVideosContainer = contentContainer.find('.relevant-videos-container');

	params = params || {};
	params.page = params.page || parseInt(getUrlParameter('page'), 10) || 1;
	params.limit = params.limit || 20;

	// popular videos are paginated with 20 per page
	var paginationView = new PaginationView(
		// pass on the pagination callback
		paginationCallback
	);
	new VideoList()
		.setContainer(popularVideosContainer)
		.setVideoPromotionApiParams(params)
		.setVideoPromotionApiEndpoint(endpoint)
		.setPaginationView(paginationView)
		.render();

	return container;
}
