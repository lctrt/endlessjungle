(function (window) {
	function Player(sprite) {
		
	}
	Player.prototype = new createjs.Bitmap();

	// save the original initialize-method so it won't be gone after
	// overwriting it
	Player.prototype.Bitmap_initialize = Player.prototype.initialize;

	// initialize the object
	Player.prototype.initialize = function (image) {
		this.Bitmap_initialize(image);
		this.name = 'Player';
		this.snapToPixel = true;
		console.log(this.image);

	}

	// we will call this function every frame to 
	Player.prototype.tick = function () {
		this.y += 1;
	}

	// this will reset the position of the Player
	// we can call this e.g. whenever a key is pressed
	Player.prototype.reset = function() {
		this.x = 50;
		this.y = 200;
	}

	window.Player = Player;
} (window));