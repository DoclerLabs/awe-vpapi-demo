var PAGINATION_MAX_NUM_NEXT_LINKS = 3;
var PAGINATION_MAX_NUM_LAST_LINKS = 3;
var PAGINATION_MAX_NUM_LINKS = 6;
var LOWEST_POSSIBLE_PAGE_NUM = 1;

/**
 * @class PaginationView
 */
var PaginationView = Component({
	/**
	 * @param {Function} paginationCallback Optional. A callback to be run when a pagination
	 *                                      link is clicked. When omitted, pagination will
	 *                                      call the current route with URL param `page`.
	 */
	init: function(paginationCallback) {
		this.paginationCallback = paginationCallback;
	},

	/**
	 * Set the pagination info object to be used when rendering the view.
	 * The object is expected to be the same format as the `paginationInfo` returned by the
	 * "list" and "related" Video Promotion API endpoints.
	 * @chainable
	 * @param {object} paginationInfo The pagination info object.
	 */
	setPaginationInfo: function(paginationInfo) {
		this.paginationInfo = paginationInfo;
		return this;
	},

	/**
	 * Renders a pagination view.
	 * @public
	 * @returns {JQueryElement} The pagination component's element.
	 */
	render: function () {
		var windowStart = this.paginationInfo.currentPage - Math.floor(PAGINATION_MAX_NUM_LINKS / 2);
		// ensure the window doesn't start before the lowest possible page number
		windowStart = Math.max(windowStart, LOWEST_POSSIBLE_PAGE_NUM);

		var windowEnd = windowStart + PAGINATION_MAX_NUM_LINKS;
		// ensure the window doesn't exceed the highest available page number
		windowEnd = Math.min(windowEnd, this.paginationInfo.totalPages);

		var windowLength = windowEnd - windowStart;
		if (windowLength < PAGINATION_MAX_NUM_LINKS) {
			windowStart -= PAGINATION_MAX_NUM_LINKS - windowLength;
			// ensure the window doesn't start before the lowest possible page number
			windowStart = Math.max(windowStart, LOWEST_POSSIBLE_PAGE_NUM);
		}

		// render all pagination links in an array
		var paginationLinks = [];
		for (var pageNumber = windowStart; pageNumber <= windowEnd; pageNumber++) {
			var isCurrentPage = pageNumber === this.paginationInfo.currentPage;
			var link = this.renderPaginationLink(
				pageNumber,
				isCurrentPage
			);

			paginationLinks.push(link);
		}

		// add "previous page" and "next page" buttons
		if (this.paginationInfo.currentPage > 1) {
			var prevPageLink = this.renderPaginationLink(
				this.paginationInfo.currentPage - 1,
				false,
				'<img src="assets/arrow-left.svg" class="pagination-left-arrow"> Previous'
			);
			paginationLinks.unshift(prevPageLink);
		}
		if (this.paginationInfo.currentPage < this.paginationInfo.totalPages) {
			var prevPageLink = this.renderPaginationLink(
				this.paginationInfo.currentPage + 1,
				false,
				'Next <img src="assets/arrow-right.svg" class="pagination-right-arrow">'
			);
			paginationLinks.push(prevPageLink);
		}

		// render the element
		var element = $(join(
			'<nav class="pagination-container">',
			'<ul></ul>',
			'</nav>'
		));
		element.find('ul').append(paginationLinks);
		return element;
	},

	/**
	 * Renders a single pagination link.
	 * @private
	 * @param {int} pageNumber The number of the page that should be opened by this link.
	 * @param {boolean} isCurrent Whether this is the current page or not. Default is `false`.
	 * @param {string} text The text to display in the link. Default is the `pageNumber`.
	 * @param {string} basePath The path to open when clicked. Default is `window.location.pathname`.
	 * @returns {string} The HTML for the page link.
	 */
	renderPaginationLink: function (pageNumber, isCurrent, text, basePath) {
		basePath = basePath || window.location.pathname;
		isCurrent = isCurrent || false;
		text = text || pageNumber;

		var linkAttr = (
			!this.paginationCallback && typeof pageNumber === 'number'
				? join('data-router-link="', basePath, '?page=', pageNumber, '" ')
				: ''
		);

		var element = $(join(
			'<li ',
			linkAttr,
			'class="', (isCurrent ? 'current-page' : ''), '"',
			'>',
			text,
			'</li>'
		));

		if (this.paginationCallback) {
			$(element).on('click', function () {
				this.paginationCallback(pageNumber, isCurrent, basePath);
			}.bind(this));
		}

		return element;
	}
});
