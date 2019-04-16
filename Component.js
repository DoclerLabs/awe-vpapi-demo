/**
 * Creates a UI component class.
 * 
 * @param {object} methods An object containing methods by name.
 * @return {Function} Returns an instantiable function.
 * @example
 *     // Create a component class:
 *     var CounterButtonView = Component({
 *         init: function(initialCount) {
 *             this.count = initialCount || 0;
 *         },
 *         render: function() {
 *             if (!this.el) {
 *                 this.el = $('<button></button>');
 *                 this.el.on('click', this.increment);
 *             }
 *             this.el.text(this.count);
 *             return this.el;
 *         },
 *         increment: function() {
 *             this.count += 1;
 *             this.render();
 *         }
 *     });
 *
 *     // Usage:
 *     var view = new CounterButtonView(1);
 *     $('body').append(view.render());
 */
function Component(methods) {
	// READ ME:
	// This function creates a "class" by attaching the methods
	// given in the `methods` parameter to a function's prototype.
	// Read more about how prototypes work here:
	//   https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes

	// ensure the `methods` object is useful
	if (typeof methods !== 'object' || methods === null) {
		throw new Error('Invalid methods object provided.');
	}

	// The class constructor that we'll return later.
	// We use this function's prototype to attach methods to.
	var Constructor = function() {
		// auto-bind the function scope to simplify event binding
		for (var methodName in methods) {
			this[methodName] = this[methodName].bind(this);
		}
		// call the constructor
		this.init.apply(this, arguments);
	};

	// make sure we have all required methods
	methods.init = methods.init || function() {};
	methods.render = methods.render || function() {};

	// attach methods to constructor function prototype
	for (var methodName in methods) {
		Constructor.prototype[methodName] = methods[methodName];
	}

	// return the class constructor
	return Constructor;
}
