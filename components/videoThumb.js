var VIDEO_THUMB_PREVIEW_ADVANCE_INTERVAL = 700;

/**
 * @class VideoThumb
 */
var VideoThumb = Component({
	/**
	 * @public
	 * @param {object} video The video data provided by the Video Promotion API.
	 * @param {int} previewAutoAdvanceInterval The interval at which preview images should auto-advance.
	 *                                         Optional, defaults to `VIDEO_THUMB_PREVIEW_ADVANCE_INTERVAL`
	 */
	init: function(video, previewAutoAdvanceInterval) {
		this.video = video;
		this.previewAutoAdvanceInterval = previewAutoAdvanceInterval || VIDEO_THUMB_PREVIEW_ADVANCE_INTERVAL;
	},

	/**
	 * Renders the video thumbnail.
	 * @public
	 * @returns {JQueryElement} The rendered video thumbnail.
	 */
	render: function() {
		// don't re-render if the element has already been rendered once
		if (this.el) {
			return this.el;
		}

		// create the element
		this.el = $(join(
			'<li class="video-list-item" data-router-link="/details/', this.video.id, '">',
				this.renderVideoPreview(this.video),
				'<p class="title">',
					this.video.title,
				'</p>',
			'</li>'
		));

		// bind events
		this.el
			.on('mouseenter', '.video-preview', this.onMouseenter)
			.on('mouseleave', '.video-preview', this.onMouseleave);

		return this.el;
	},

	/**
	 * Renders a single video preview image element.
	 * @private
	 * @param {object} video The video data provided by the Video Promotion API.
	 * @return {string} The HTML for the video preview.
	 */
	renderVideoPreview: function() {
		var firstImageHtml = this.renderVideoPreviewImage(
			// image url:
			this.video.previewImages[0],
			// the image should be visible right away:
			true
		);

		var otherImages = this.video.previewImages.slice(1).join(',');

		return join(
			'<ul class="video-preview" data-images="', otherImages, '">',
				firstImageHtml,
			'</ul>'
		);
	},

	/**
	 * Renders an HTML string for a single video preview image.
	 * @internal
	 * @param {string} imageUrl The URL from which to load the image.
	 * @param {boolean} visible Whether the image should be instantly visible or not.
	 * @return {string} The HTML for the video preview image.
	 */
	renderVideoPreviewImage: function(imageUrl, visible) {
		return join(
			'<li class="video-preview-item' + (visible ? ' visible' : '') + '"',
				'style="background-image: url(\'' + imageUrl + '\');">',
			'</li>'
		);
	},

	onMouseenter: function() {
		this.isHovered = true;
		this.startPreviewGallery();
	},

	onMouseleave: function() {
		this.isHovered = false;
		this.stopPreviewGallery();
	},

	getVideoPreviewElement: function() {
		return this.el.find('.video-preview');
	},

	stopPreviewGallery: function() {
		clearInterval(this.previewChangeInterval);
	},

	startPreviewGallery: function() {
		// make sure to clear the previous interval if there was any
		this.stopPreviewGallery();

		// ensure all images in the gallery are loaded and in the DOM
		this.preloadGalleryImages().then(function() {
			// Since `preloadGalleryImages` is async, it is possible that the
			// mouse has left the preview gallery while `preloadGalleryImages`
			// was running. If that's the case, `isHovered` is `false` and we
			// must not start auto-playing the preview images.
			if (!this.isHovered) {
				return;
			}

			// advance immediately
			this.advancePreviewGallery();

			// advance again after a while
			this.previewChangeInterval = setInterval(
				this.advancePreviewGallery,
				this.previewAutoAdvanceInterval
			);
		}.bind(this));
	},

	preloadGalleryImages: function() {
		var videoPreview = this.getVideoPreviewElement();
		var imageAttr = (videoPreview.attr('data-images') || '').trim();
		var imageUrls = (
			// if the image attribute has a value, split it by comma to get the,
			// individual preview image URLs, if not, there are no preview images
			imageAttr && imageAttr.length > 0
				? imageAttr.split(',')
				: []
		);
	
		// If there are no images to preload:
		// This could be because there we no images to preload in the first place,
		// or because the images have been preloaded already.
		// Return a promise that resolves immediately.
		if (!imageUrls || imageUrls.length === 0) {
			return Promise.resolve();
		}
	
		return new Promise(function(resolve, reject) {
			var promises = imageUrls.map(function(imageUrl) {
				// ensure the image is in browser cache before appending to the DOM
				return loadImage(imageUrl).then(function() {
					// append it to the DOM
					var previewImage = this.renderVideoPreviewImage(
						imageUrl,
						// set visibility to false because we just want to append,
						// but not show the image
						false
					);
					videoPreview.append(previewImage);
				}.bind(this));
			}.bind(this));
	
			// resolve the outer promise after all images have been preloaded
			Promise.all(promises)
				.then(resolve)
				.catch(reject);
		}.bind(this));
	},

	advancePreviewGallery: function() {
		var visibleImage = this.getVideoPreviewElement().find('.visible');
		var nextImage = visibleImage.next();
		
		if (nextImage.length === 0) {
			nextImage = visibleImage;
		}
	
		if (nextImage === visibleImage) {
			return;
		}
	
		nextImage.addClass('visible');
		visibleImage.removeClass('visible');
	}
});
