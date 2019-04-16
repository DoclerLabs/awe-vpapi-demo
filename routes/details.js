//
// details.js
//
// Renders video details pages.
//

registerRouteHandler(/^\/details\/(.*)$/, function(route, videoId) {
	var contentContainer = getContentContainer();

	var detailParams = {
		videoId: videoId,
		primaryColor: '7dba27',
		labelColor: 'fff'
	};

	loadDetails(detailParams).then(function(response) {
		contentContainer.html(join(
			'<div class="video-content-wrapper">',
				'<div class="video-content">',
					renderVideoPlayer(response),
					renderVideoMetaData(response),
				'</div>',
				renderSideBar(),
			'</div>'
		));

		renderVideoListUnderPlayer(1, videoId);
		renderVideosInSidebar($('.video-sidebar'));
		bindRouteLinks(contentContainer);

		// make sure to scroll to the top of the viewport
		scrollToTop();
	});
});


/**
 * The element in which the popular videos are rendered under the video player.
 * @internal
 */
var relevantVideoListContainer;

/**
 * Renders the video list under the video player. If there's already a video list
 * under the player, it will be removed first.
 * @internal
 * @param {int} pageNumber
 * @returns {void}
 */
function renderVideoListUnderPlayer(pageNumber, videoId) {
	if (relevantVideoListContainer) {
		relevantVideoListContainer.remove();
	}

	relevantVideoListContainer = renderRelevantVideoList(
		// pass the new page number
		{ page: pageNumber, id: videoId },
		// re-render this list on page changes instead of navigating to a new page
		function(pageNumber) { renderVideoListUnderPlayer(pageNumber, videoId) },
		'related'
	);
}

/**
 * Renders the videos next to the video player on the details page.
 * @param {JQueryElement} container The container to render the video list into.
 * @returns {void}
 */
function renderVideosInSidebar(container) {
	container.append(join(
		'<div class="video-list-wrapper">',
			'<div class="recommended-videos-container"></div>',
		'</div>'
	));

	var recommendedVideosContainer = container.find('.recommended-videos-container');

	var params = {
		limit: 6
	};

	// popular videos are paginated with 20 per page
	new VideoList()
		.setContainer(recommendedVideosContainer)
		.setVideoPromotionApiParams(params)
		.render();
}

function renderSideBar() {
	return join(
		'<div class="video-sidebar">',
			'<img src="assets/banner.png" />',
			'<button data-router-link="/" class="video-sidebar-more-button">More from this uploader</button>',
		'</div>'
	);
}

function renderVideoMetaData(details) {
	return join(
		'<div class="video-details">',
			'<h1 class="video-details-heading">',
				details.title,
			'</h1>',
			'<p>',
				'<img src="assets/uploader.svg" class="video-details-icon"/>',
				'<span class="video-details-meta-category">',
					'Uploader: ',
					'<em>LiveJasmin</em>',
				'</span>',
			'</p>',
			'<p>',
				'<img src="assets/star.svg" class="video-details-icon"/>',
				'<span class="video-details-meta-category">',
					'Star: ',
					'<em>',
						details.performerId,
					'</em>',
				'</span>',
			'</p>',
			details.tags
				? join(
					'<p class="video-details-tags">',
						'Tags: ' + details.tags.map(function(tag) {
							return join(
								'<span data-router-link="/tag/', tag, '">',
									'<em>#</em>',
									tag,
								'</span>'
							);
						}).join(' '))
				: '',
			'</p>',
		'</div>'
	);
}

function renderVideoPlayer(details) {
	return join(
		'<div class="video-player-frame-aspect-ratio-wrapper" data-awe-container-id="video-player"></div>',
		details.playerEmbedScript.replace('{CONTAINER}', 'video-player')
	);
}

