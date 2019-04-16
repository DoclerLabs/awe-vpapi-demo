/**
 * Returns the `<input>` element used as a search field in the main menu bar.
 * @return {JQuery} Returns a jQuery wrapped DOM element.
 */
function getMainMenuBarSearchFieldInput() {
	return $('.main-menu-bar .search-field-input');
}


/**
 * Returns the `<ul>` element used to display suggestions in the main menu bar search field.
 * @return {JQuery} Returns a jQuery wrapped DOM element.
 */
function getMainMenuBarSearchFieldSuggestionList() {
	return $('.main-menu-bar .suggestions');
}


/**
 * Returns the element that contains the site content.
 * @return {JQuery} Returns a jQuery wrapped DOM element.
 */
function getContentContainer() {
	return $('.site-content');
}


/**
 * Scrolls to the top of the page.
 * @return {void}
 */
function scrollToTop() {
	$('.site-content-wrapper').animate({
		scrollTop: 0
	}, 200);
}
