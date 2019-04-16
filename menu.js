//
// menu.js
//
// Renders the main menu content.
//


// Key codes:
var KEY_RETURN = 13;
var KEY_ESCAPE = 27;
var KEY_ARROW_UP = 38;
var KEY_ARROW_DOWN = 40;

/**
 * The tags to show when `updateSearchSuggestions` is called for the next time.
 * @internal
 */
var suggestions = [];

/**
 * This is `true` while the user is hovering or scrolling through the suggestion list.
 * @internal
 */
var isSuggestionListFocused = false;


/**
 * Initialize rendering of the main menu.
 * The main menu will only contain content after this function was called.
 * @returns {void}
 */
function renderMainMenu() {
	var searchFieldInput = getMainMenuBarSearchFieldInput();

	// listen for key events on document for navigation in the suggestion list
	$(document)
		.on('keypress', onPotentialArrowKey)
		.on('keypress', onPotentialSuggestionKeyup);

	// bind the event handlers for the search field
	searchFieldInput
		.on('keypress', onPotentialSuggestionKeyup)
		// prevent blank lines in the search field
		.on('keypress', function() {
			if (event && event.which === 13) {
				event.preventDefault();
				return false;
			}
		})
		.on('keyup', onSearchFieldChange)
		.on('keyup', onPotentialArrowKey)
		.on('change', onSearchFieldChange)
		.on('focus', onSearchFieldChange)
		// clear the search suggestion list if the input blurs, but only if
		// the blur wasn't caused by the user focusing the suggestion list
		.on('blur', function() {
			if (!isSuggestionListFocused) {
				clearSearchSuggestions();
			}
		});

	// set the `isSuggestionListFocused` flag to `true` while the user hovers
	// the suggestion container
	getMainMenuBarSearchFieldSuggestionList()
		.on('mouseover', function() {
			isSuggestionListFocused = true;

			// Blur the input when the user hovers the suggestion list.
			// This way the user doesn't have to click twice to select a
			// suggestion from the list (1st click is to blur the input,
			// 2nd click would be registered as suggestion click).
			searchFieldInput.blur();
		})
		.on('mouseleave', function() {
			isSuggestionListFocused = false;
		});
}

/**
 * Returns the sorted matches where the value is a part of a tag
 * The sorting is based on the #index of the character matched first
 *
 * @param {Array} tags
 * @param {String} value
 * @returns {Array}
 */
function getPartialTagMatches(tags, value) {
	return tags.filter(function(tag) {
		return tag.indexOf(value) > -1;
	}).sort(function(a, b) {
		var aIndex = a.indexOf(value);
		var bIndex = b.indexOf(value);

		if (aIndex > bIndex) {
			return 1;
		} else if (aIndex < bIndex) {
			return -1;
		}

		return 0;
	});
}

/**
 * Returns the sorted tags by similarity to the current search field value
 *
 * @param {Array} tags
 * @param {String} value
 * @returns {Array}
 */
function getSuggestedTags(tags, value) {
	return tags.slice().sort(function(a, b) {
		var distanceA = levenshteinDistance(value, a);
		var distanceB = levenshteinDistance(value, b);

		if (distanceA > distanceB) {
			return 1;
		} else if (distanceA < distanceB) {
			return -1;
		} else {
			return 0;
		}
	});
}


/**
 * Called on all change and keyup events emitted by the search field input.
 * @internal
 * @returns {void}
 */
function onSearchFieldChange() {
	var value = getMainMenuBarSearchFieldInput().val();

	// don't show any suggestions if there's no input value
	if (!value || value.length === 0) {
		clearSearchSuggestions();
		return;
	}

	loadTagList(true).then(function(tags) {
		var partialMatches = getPartialTagMatches(tags, value);
		var suggestedTags = getSuggestedTags(tags, value);

		// filter out duplicates from combination of the 2 result sets
		var results = partialMatches.concat(suggestedTags).filter(function(tag, idx, self) {
			return self.indexOf(tag) === idx;
		});

		// only show the top tags
		results = results.splice(0, 5);

		// don't re-render if the suggestions wouldn't change
		if (results.join(',') === suggestions.join(',')) {
			return;
		}

		suggestions = results;
		updateSearchSuggestions(results);
	});
}


/**
 * Called whenever the user might have pressed the up or down arrow key to
 * navigate through search suggestions.
 * @internal
 * @param {JQueryKeypressEvent} event 
 * @returns {void}
 */
function onPotentialArrowKey(event) {
	if (
		!getMainMenuBarSearchFieldInput().is(':focus') &&
		!isSuggestionListFocused
	) {
		return;
	}

	switch (event.which) {
		case KEY_ARROW_UP:
			selectNextSearchFieldSuggestion('previous');
			break;
		case KEY_ARROW_DOWN:
			selectNextSearchFieldSuggestion('next');
			break;
		default:
			// do nothing
			break;
	}
}


/**
 * Called whenever the user might have pressed the reutrn or escaape key to
 * confirm or cancel a selected suggestion list item.
 * @internal
 * @param {JQueryKeyupEvent} event 
 * @returns {void}
 */
function onPotentialSuggestionKeyup(event) {
	if (
		!getMainMenuBarSearchFieldInput().is(':focus') &&
		!isSuggestionListFocused
	) {
		return;
	}

	switch (event.which) {
		case KEY_RETURN:
			var currentItem = getMainMenuBarSearchFieldSuggestionList().find('.selected');
			currentItem.click();
			updateSearchFieldInputValue(currentItem.text());
			getMainMenuBarSearchFieldInput().blur();
			break;

		case KEY_ESCAPE:
			clearSearchSuggestions();
			getMainMenuBarSearchFieldInput().focus();
			break;

		default:
			// do nothing
			break;
	}
}


/**
 * Updates the value of the search input.
 * @internal
 * @param {string} value The new value.
 * @returns {void}
 */
function updateSearchFieldInputValue(value) {
	getMainMenuBarSearchFieldInput().val(value);
}


/**
 * Removes all currently visible search field suggestions.
 * @internal
 * @returns {void}
 */
function clearSearchSuggestions() {
	getMainMenuBarSearchFieldSuggestionList().html('');
}


/**
 * Updates the search field suggestion list with the tags currently in `suggestions`.
 * @internal
 * @returns {void}
 */
function updateSearchSuggestions(suggestions) {
	var suggestionContainer = getMainMenuBarSearchFieldSuggestionList();

	// remove any previous suggestions
	clearSearchSuggestions();

	// render the new suggestions
	var suggestionListItems = (suggestions || []).map(renderSearchFieldSuggestion);
	suggestionContainer.html(join(suggestionListItems));

	// update links
	bindRouteLinks(suggestionContainer);

	// apply selected or clicked suggestions
	suggestionContainer.find('li')
		.on('click', function(e) {
			clearSearchSuggestions();
			updateSearchFieldInputValue(e.currentTarget.innerText);
		})
		.on('keyup', function(e) {
			if (e.which === 13) {
				clearSearchSuggestions();
				updateSearchFieldInputValue(e.currentTarget.innerText);
			}
		});
}

/**
 * Renders a single search field suggestion item.
 * @internal
 * @param {string} suggestion The text to be displayed in the suggestion item.
 * @returns {void}
 */
function renderSearchFieldSuggestion(suggestion) {
	return join(
		'<li data-router-link="', '/tag/', suggestion, '">',
			suggestion,
		'</li>'
	);
}


/**
 * Selects either the next or the previous item in the suggestion list.
 * @internal
 * @param {'previous' | 'next'} direction Which item to select.
 * @returns {void}
 */
function selectNextSearchFieldSuggestion(direction) {
	if (direction !== 'previous' && direction !== 'next') {
		throw new Error('Invalid value for parameter "direction": "' + direction + '"');
	}

	var suggestionList = getMainMenuBarSearchFieldSuggestionList();
	var currentItem = suggestionList.find('.selected');

	if (!currentItem && direction === 'previous') {
		return;
	}

	if (direction === 'next') {
		var nextItem = currentItem.next();
		nextItem = nextItem.length ? nextItem : suggestionList.children().first();

		if (!nextItem.length) {
			return;
		}

		nextItem.addClass('selected');
		currentItem.removeClass('selected');
	} else if (direction === 'previous') {
		var previousItem = currentItem.prev();
		previousItem = previousItem.length ? previousItem : suggestionList.children().last();

		if (!previousItem.length) {
			return;
		}

		previousItem.addClass('selected');
		currentItem.removeClass('selected');
	}
}
