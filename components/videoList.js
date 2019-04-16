/**
 * @class VideoList
 * @example
 *     // renders a video list to the body:
 *     new VideoList()
 *         .setContainer($('body'))
 *         .render();
 *
 *     // renders a video list to the body, with a pagination view:
 *     var paginationView = new PaginationView(...);
 *     new VideoList()
 *         .setContainer($('body'))
 *         .setPaginationView(paginationView)
 *         .render();
 *
 *     // renders a video list with custom VPAPI parameters to the
 *     // body, with a pagination view:
 *     var paginationView = new PaginationView(...);
 *     new VideoList()
 *         .setContainer($('body'))
 *         .setPaginationView(paginationView)
 *         .setVideoPromotionApiParams({ tags: ['ass', '69'], page: 2 })
 *         .render();
 * 
 *     // add custom behaviour if there are no videos:
 *     var videoList = new VideoList()
 *         .setContainer($('body'))
 *         .setNoVideosCallback(function() {
 *             console.warn('No videos:', videoList);
 *         })
 *         .render();
 * 
 *     // show related videos
 *     var videoList = new VideoList()
 *         .setContainer($('body'))
 *         .setVideoPromotionApiEndpoint('related')
 *         .setVideoPromotionApiParams({ id: '7fd0c770453553ba5e56dc3186aa35f4' })
 *         .render();
 */
var VideoList = Component({
	/**
	 * Sets which Video Promotion API endpoint will be used.
	 * The component uses the `list` endpoint by default, but this can be
	 * changed to use the `related` endpoint.
	 * @public
	 * @chainable
	 */
	setVideoPromotionApiEndpoint: function(endpoint) {
		this.endpoint = endpoint;
		return this;
	},

	/**
	 * Sets the parameters that are going to be used to load a list of videos
	 * from the Video Promotion API's "list" endpoint.
	 * @public
	 * @chainable
	 */
	setVideoPromotionApiParams: function(vpapiParams) {
		this.vpapiParams = vpapiParams;
		return this;
	},

	/**
	 * Sets the container for the video list.
	 * This container should be dedicated to one video list only.
	 * @public
	 * @chainable
	 */
	setContainer: function(container) {
		this.container = container;
		return this;
	},

	/**
	 * Sets the pagination view that will be rendered below the list of videos.
	 * Pagination will only be visible below the video list if this view is set.
	 * @public
	 * @chainable
	 */
	setPaginationView: function(paginationView) {
		this.paginationView = paginationView;
		return this;
	},

	/**
	 * Sets a callback function that is called when the Video Promotion API's
	 * "list" request returns no videos.
	 * @public
	 * @chainable
	 */
	setNoVideosCallback: function(noVideosCallback) {
		this.noVideosCallback = noVideosCallback;
		return this;
	},

	/**
	 * Renders the video list.
	 * @public
	 * @returns {void}
	 */
	render: function () {
		// check if necessary properties are set
		if (!this.container) {
			throw new Error(
				'The "container" property is missing in a VideoList.' +
				'Use method setContainer(...) to set it before rendering the VideoList.'
			);
		}

		// show a loader while we wait for the VPAPI response
		var loaderAnimation = this.renderLoader(this.container);

		// determine which function to use to load the data
		var loaderFunction = this.endpoint === 'related' ? loadRelated : loadList;
		
		// load the videos from the API
		loaderFunction(this.vpapiParams).then(function(response) {
			var videos = response.videos;
			var paginationInfo = response.pagination;

			// hide the loader
			loaderAnimation.hide();

			// render the "no content" view in case there are no videos
			if (!videos || videos.length === 0) {
				this.handleEmptyListResponse();
				if (this.noVideosCallback) {
					this.noVideosCallback();
				}
			}
			// render normally if there are videos
			else {
				if (this.paginationView) {
					this.paginationView.setPaginationInfo(paginationInfo);
				}

				this.handleNonEmptyListResponse(videos);
			}

			// bind all event listeners in the rendered view
			bindRouteLinks(this.container);
		}.bind(this));
	},

	/**
	 * Renders a loading icon into a container.
	 * @private
	 * @returns {JQueryElement} A jQuery object that wraps the loading icon.
	 */
	renderLoader: function() {
		var loader = $('<div class="loader"><div class="loader-animation"></div></div>');
		this.container.append(loader);
		return loader;
	},

	/**
	 * Called when a video list response returns no videos.
	 * @private
	 * @return {void} 
	 */
	handleEmptyListResponse: function() {
		this.container.html(join(
			'<p class="no-videos-found" data-router-link="/">',
				'No videos found.<br>',
				'Click <u>here</u> to go back.',
			'</p>'
		));
	},

	/**
	 * Called when a video list response returns at least one video.
	 * @private
	 * @param {object[]} videos The list of videos returned by the list response.
	 * @return {void}
	 */
	handleNonEmptyListResponse: function(videos) {
		// prepare the content container for rendering the video lists
		this.container.html('<ul class="video-list"></ul>');
		var videoList = this.container.find('.video-list');

		// render one item per video
		this.videoThumbs = videos.map(function(video) {
			return new VideoThumb(video);
		});

		// add all video items to the list
		videoList
			.html('')
			.append(this.videoThumbs.map(function(thumb) {
				return thumb.render();
			}));

		// append the pagination view to the content container
		if (this.paginationView) {
			this.container.append(this.paginationView.render());
		}
	}
});
