
var canvas;
var stage;
var screen_width;
var screen_height;
var player;
var ground;
var rock;
var arrow;
var score;
var bestScore = 0;
var groundTiles;
var titleSpriteSheet;

function init() {
    canvas = document.getElementById("gameCanvas");

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", handleLoadComplete);
    queue.loadManifest([
     	{id:"player", src:"assets/panda_animation.png"},
     	{id:"map", src:"assets/map.png"},
     	{id:"arrow", src:"assets/arrow.png"},
     	{id:"rock", src:"assets/rock_roll.png"},
     	{id:"title", src:"assets/title.png"},
     	{id:"sound_die", src:"assets/die.wav"},
     	{id:"sound_jump", src:"assets/jump.wav"},
     	{id:"sound_turbo", src:"assets/turbo.wav"},
     	{id:"music", src:"assets/ld48.ogg"},
    ]);
}

function reset() {
    stage.removeAllChildren();
    createjs.Ticker.removeAllListeners();
    stage.update();
}

function handleLoadComplete(e) {
	//remove context menu
	document.getElementById("gameCanvas").oncontextmenu = function() {
     return false;  
	} 
	//launch music
	createjs.Sound.play("music","none",0,0,-1);
	// create a new stage and point it at our canvas:
	stage = new createjs.Stage(canvas);
	screen_width = canvas.width;
	screen_height = canvas.height;
    startGame();

}

function startGame() {
	//initialize score 
	stage = new createjs.Stage(canvas);
	score = 0;
	//initialize message and score board
	document.getElementById("score_board").style.display = "block";
	document.getElementById("game_message").style.display = "none";
	// init game title spritesheet
	titleSpriteSheet = new createjs.SpriteSheet({
		images: ["assets/title.png"],
		frames: {width: 320, height:210, regX: 0, regY: 0},
		animations: {
			intro : [0, 9,false],
			end   : [10,17,false],
			full  : [0,17,false],
		}
	});
	//init tiles spritesheet for groundgenerator
	groundTiles = new createjs.SpriteSheet({
		images: ["assets/map.png"],
		frames: {width: 32, height:32 , regX :0 , regY:0 },
		animations: {
			left_top      : [0,0],
			left_down     : [6,6],
			middle_top_1  : [3,3],
			middle_down_1 : [1,1],
			middle_top_2  : [4,4],
			middle_down_2 : [5,5],
			right_top     : [2,2],
			right_down    : [7,7],
			grass         : [8,8],
			trap          : [9,9],
			cloud         : [10,10],
			bamboo_1      : [11,11],
			bamboo_2      : [12,12],
			bamboo_3      : [13,13],
		}

	});
    //create basic ground
	ground = [createGround(20, true),createGround(20)];
	ground.speed = 10;
    // create spritesheet for the player and assign the associated data.
	var playerSpriteSheet = new createjs.SpriteSheet({

	    images: ["assets/panda_animation.png"], 
	    frames: {width: 20, height: 32, regX: 10, regY: 16}, 
	    animations: {	
		    run: [0, 3, "run"],
		    jump: [5, 5, "jump"],
		    die: [6, 6, "die"]
	    }
    });
	
    //create a Sprite for the player   
	player = new createjs.Sprite(playerSpriteSheet);

    // start playing the first sequence:
    player.gotoAndPlay("run"); 	//animate
    player.name = "player";
    player.direction = 90;
    player.vX = 1;
    player.x = 64;
    player.y = 224;
    player.width = 40;
    player.height = 64;
    player.scaleX = 2;
    player.scaleY = 2;
    player.currentFrame = 0;
    stage.addChild(player);
	player.velocityY = 1;
	player.velocityX = 0;
	player.force = -13;
	player.life = true;
	//create rock object
	var rockSpriteSheet = new createjs.SpriteSheet({
		images: ["assets/rock_roll.png"],
		frames: { width: 16, height:16, regX:8, regY: 8},
		animations: {
			roll: [ 0, 3, "roll"]
		}
	});
	rock = new createjs.Sprite(rockSpriteSheet);
	rock.gotoAndPlay("roll");
	rock.x = screen_width + 20;
	rock.y = 224 + 16;
	rock.scaleX = 2;
    rock.scaleY = 2;
    rock.width = 32;
	stage.addChild(rock);
    //create arrow object
    var arrowSpriteSheet = new createjs.SpriteSheet({
    	images: ["assets/arrow.png"],
    	frames: { width: 15, height: 5, regX:0, regY:0},
    	animations: {
    		fly : [0,2, "fly"]
    	}
    });
    arrow = new createjs.Sprite(arrowSpriteSheet);
    arrow.gotoAndPlay("fly");
    arrow.x = -50;
    arrow.scaleX = 2;
    arrow.scaleY = 2;
    arrow.fly = true;
    stage.addChild(arrow);
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(16);
    
}

//called if there is an error loading the image (usually due to a 404)
function handleImageError(e) {
	console.log("Error Loading Image : " + e.target.src);
}

function tick() {
	if (player.life){
		moveGrounds();
		rock.x -= 32;
		movePlayer();
		collideRock();
		createRock();
		createArrow();
		moveArrow();
		score += 1.2;
		document.getElementById("score_value").innerHTML = Math.floor(score);
	} else {
		player.velocityY ++;
		player.y += player.velocityY;
	}
    // update the stage:
    stage.update();
}

//check for a touch-option
if ('ontouchstart' in document.documentElement) {
	canvas.addEventListener('touchstart', function(e) {
		handleKeys();
	}, false);

} else {
	document.onkeydown = handleKeys;
	document.onmousedown = handleKeys;
}
function handleKeys(e){
	if (e.button == 0 || e.keyCode == 32){
	jump(e);
	} else if (e.button == 2 || e.ctrlKey == true){
		turbo(e);
	}
	if (!player.life && player.y > screen_height){
		startGame();
	}
}
function jump(e) {
	if (collideGround(player) && player.life){
		test = createjs.Sound.play("sound_jump");
		player.jump = true;
		player.gotoAndPlay("jump");
		player.velocityY = player.force;
	}
}
function turbo(e){
	if (player.life && player.x == 64) {
		createjs.Sound.play("sound_turbo");
		player.velocityX = player.force *(-2);
		player.turbo = true;
	}
}
function moveGrounds(){
	for (var i = 0 ; i < ground.length; i++) {
		if ( (ground[i].x + ground[i].width ) <= 0) {
			ground[i] = createGround(20);
		} 
		ground[i].x -= ground.speed;
		for (var j = 0; j < ground[i].middleTiles.length; j++){
			ground[i].middleTiles[j].x -= ground.speed;
			ground[i].underTiles[j].x -= ground.speed;
			ground[i].grassTiles[j].x -= ground.speed;
			ground[i].skyTiles[j].x -= ground.speed;
		}
		
	}
}
function onComplete(e) {
	player.gotoAndStop("jump");
	stage.removeChild(player);
	player.gotoAndPlay("run");
	stage.addChild(player);
}
function movePlayer(){
	if (collideGround(player) && player.velocityY > player.force){
			if (player.jump == true ){
				player.gotoAndPlay("run");
			}
			player.velocityY = 0;
			player.jump = false;

		} else {
		    player.velocityY ++;
	    }
		player.y += player.velocityY;
		if (player.turbo == true){
			player.velocityX -= 2;
		}
		if (player.x < 64){
			player.turbo = false;
			player.velocityX = 0;
			player.x = 64;
		}
		player.x += player.velocityX;
}
function createGround(size, init) {
	init = init || false;
	groundItem = new createjs.Shape();
	groundItem.width = size * 32;
	groundItem.height = 32;
	if (init){
		groundItem.x = 0;
	} else {
		groundItem.x = 32*20;
	}
	groundItem.y = 256;
	groundItem.middleTiles  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	groundItem.underTiles   = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	groundItem.grassTiles   = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	groundItem.skyTiles     = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	for(var i = 0; i< size; i++){
		groundItem.middleTiles[i]= new createjs.Sprite(groundTiles);
		rand_top = Math.floor(Math.random()*4 + 1);
		rand_down = Math.floor(Math.random()*4 + 1);
		if (rand_top == 1){
			groundItem.middleTiles[i].gotoAndStop("middle_top_1");
		} else if (rand_top == 2) {
			groundItem.middleTiles[i].gotoAndStop("middle_top_2");
		} else if (rand_top == 3) {
			groundItem.middleTiles[i].gotoAndStop("right_top");
		} else {
			groundItem.middleTiles[i].gotoAndStop("left_top");
		}
		groundItem.middleTiles[i].y = 256;
		groundItem.middleTiles[i].x = 32*i + groundItem.x;
		stage.addChild(groundItem.middleTiles[i]);
		// underTiles
		groundItem.underTiles[i]= new createjs.Sprite(groundTiles);
		if (rand_down == 1){
			groundItem.underTiles[i].gotoAndStop("middle_down_1");
		}else if (rand_down == 2) {
			groundItem.underTiles[i].gotoAndStop("middle_down_2");
		}else if (rand_down == 3) {
			groundItem.underTiles[i].gotoAndStop("right_down");
		} else {
			groundItem.underTiles[i].gotoAndStop("left_down");
		}
		groundItem.underTiles[i].y = 256 + 32;
		groundItem.underTiles[i].x = 32*i + groundItem.x;
		stage.addChild(groundItem.underTiles[i]);
		// grassTiles and bamboo
		rand_grass = Math.floor(Math.random()*30 + 1);
		groundItem.grassTiles[i]= new createjs.Sprite(groundTiles);
		//do peaceful shit
		if (rand_grass <= 17){
			groundItem.grassTiles[i].gotoAndStop("grass");
		} else if (rand_grass <=23 ) {
			groundItem.grassTiles[i].gotoAndStop("bamboo_1");
		} else if (rand_grass <= 26 ) {
			groundItem.grassTiles[i].gotoAndStop("bamboo_2");
		} else {
			groundItem.grassTiles[i].gotoAndStop("bamboo_3");
		}
		groundItem.grassTiles[i].y = 256 - 32;
		groundItem.grassTiles[i].x = 32*i + groundItem.x;
		stage.addChild(groundItem.grassTiles[i]);
		// do clouds
		rand_cloud = Math.random();
		groundItem.skyTiles[i]= new createjs.Sprite(groundTiles);
		if (rand_cloud > 0.90 ) {
			groundItem.skyTiles[i].gotoAndStop("cloud");
		} else {
			groundItem.skyTiles[i].gotoAndStop(14);
		}
		groundItem.skyTiles[i].y = 45 + Math.floor(Math.random()*25);
		groundItem.skyTiles[i].x = 32*i + groundItem.x;
		stage.addChild(groundItem.skyTiles[i]);
	}
	stage.addChild(groundItem);
	return groundItem;
}
function collideGround(object){
	for (var i = 0 ; i < ground.length; i++) {
		touchUp = (object.y + object.height/2) > ground[i].y; 
		touchLat = (object.x  >= ground[i].x ) && (object.x <= ( ground[i].width + ground[i].x ) );
		if (touchLat && touchUp)
			return true;
	}	
	return false;
}
function createRock(){
	if (rock.x < 0 ){
		dice = Math.random()*20;
		if (dice > 18){
			rock.x = screen_width + 50;
		}
	}

}
function createArrow(){
	if (arrow.x < 0){
		dice = Math.random()*20;
		if (dice > 18){
			arrow.fly = true;
			arrow.gotoAndPlay("fly");
			arrow.x = screen_width - 50;
			arrow.y = Math.floor(Math.random()*screen_height/4);
			arrow.velocity = Math.floor(Math.random()*3 + 2);
		}	
	}
}
function moveArrow(){
	
	if (!( arrow.y>=256 - 12) && arrow.fly){
		collideArrow();
		arrow.velocity++;
		arrow.y += arrow.velocity;
		arrow.x -= 32;
	}
	else {
		if (arrow.fly){
			arrow.gotoAndStop("fly");
			arrow.fly = false;
		}
		arrow.y = 256 - 12;
		arrow.x -= ground.speed;
	} 
}
function collideArrow(){
	touchLat = arrow.x <= player.x;
	touchUp = (player.y - player.height /2 <= arrow.y) && (arrow.y + 12 <= player.y + player.height /2);
	if(touchLat && touchUp && arrow.y > 0){
		playerDie();
		stage.removeChild(arrow);
	}
	
}
function collideRock(){
	touchLat = (player.x  >= rock.x ) && (player.x <= ( rock.width + rock.x ) );
	touchUp = (player.y + player.height/2) > rock.y; 
	if (touchLat && touchUp)
		playerDie();
}
function playerDie(){
	test = createjs.Sound.play("sound_die");
	document.getElementById("score_board").style.display = "none";
	//test best score
	score = Math.floor(score);
	if (score >= bestScore){
		bestScore = score;
	}
	endScore = score;
	if (endScore != bestScore){
		document.getElementById("game_message").innerHTML = "Your best score : "+ bestScore +"<br />Your score : " +endScore + "<br />Try again ?";
	} else {
		document.getElementById("game_message").innerHTML = "Your did your best ! Great job !<br />Your score : " +endScore + "<br />Try again ?";
	}
	document.getElementById("game_message").style.display = "block";
	//stop objects
	player.life = false;
	player.gotoAndStop("run");
	stage.removeChild(player);
	stage.addChild(player);
	player.gotoAndPlay("die");
	player.velocityY = -8;
	rock.gotoAndStop("roll");
	stage.removeChild(rock);
	stage.removeChild(arrow);
	//end title animation
	var title = new createjs.Sprite(titleSpriteSheet);
	title.gotoAndStop(0);
	setInterval(function(e){
		title.gotoAndPlay("intro");
		setInterval(function(e){
			title.gotoAndStop(17);
		},1500);
	},1500);
	
	
	title.x = screen_width /4;
	//title.y = 50;
	stage.addChild(title);
}