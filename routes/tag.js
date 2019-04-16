//
// tag.js
//
// Handles tag list pages.
// Uses the route from index.js.
//

registerRouteHandler(/^\/tag\/(.*)$/, function(route, tagName) {
	// clear the content container before rendering
	getContentContainer().html('');

	// render the page content
	renderRelevantVideoList({
		tags: [tagName]
	});

	// make sure to scroll to the top of the viewport
	scrollToTop();
});