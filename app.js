$(document).ready(function() {
	// set the base path for the router to compare against
	setBaseRoutingPath($('base').attr('href'));

	// render the current route once the DOM is ready
	navigateToCurrentPath();

	// automatically update routing on navigation
	window.addEventListener('popstate', navigateToCurrentPath);

	// initialize the main menu
	renderMainMenu();

	// for the VPAPI demo only
	initDemo();
});
