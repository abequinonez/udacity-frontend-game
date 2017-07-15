// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Initial enemy starting position
    this.x = x;
    this.y = y;

    // Store the original x position (used to reset an enemy's position)
    this.originalXPos = x;

    // The enemy's speed (received as a parameter)
    this.speed = speed;

    // Enemies cannot move until the game starts
    this.canMove = false;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.canMove) {
        this.x += this.speed * dt;
    }

    // Reset enemy position once it leaves the visible canvas
    if (this.x > 505) {
        this.resetPosition();
    }

    // Check and handle collision
    if (!player.alreadyCollided) {
        if (this.x + 63 > player.x && this.x - 63 < player.x &&
            this.y + 63 > player.y && this.y - 63 < player.y) {
            player.alreadyCollided = true;
            player.loseALife();
        }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset the enemy's position
Enemy.prototype.resetPosition = function() {
    this.x = this.originalXPos;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // Load the player image/sprite
    this.sprite = 'images/char-boy.png';

    // Initial player starting position
    this.x = 200;
    this.y = 380;

    // The player cannot move until the game starts
    this.canMove = false;

    // Used to prevent multiple calls to player.loseALife() when checking for
    // collision in Enemy.update()
    this.alreadyCollided = false;

    // Interval timer ID used in player.blinkEffect()
    this.blinkInterval;

    // Keeps track of the player's state
    this.update = function() {
        // If the player reaches the water, reset their position and add points
        if (this.y <= -35) {
            this.resetPosition();
            game.addPoints(100);
        }

        // If player's lives reaches 0, end the game
        if (!game.isOver) {
            if (game.livesRemaining <= 0) {
                game.end();
            }
        }
    };

    // Draw the player on the screen, just like the enemy class
    this.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    // Receives user input with keys defined in allowedKeys and
    // moves the player accordingly
    this.handleInput = function(key) {
        if (this.canMove) {
            if (key === 'up') {
                this.y -= 83;
            }
            else if (key === 'down' && this.y < 380) {
                this.y += 83;
            }
            else if (key === 'left' && this.x > -2) {
                this.x -= 101;
            }
            else if (key === 'right' && this.x < 402) {
                this.x += 101;
            }
        }
    };

    // Returns the player to the starting position and allows for movement
    this.resetPosition = function() {
        this.x = 200;
        this.y = 380;
        this.canMove = true;
        this.alreadyCollided = false;
    };

    // Takes appropriate action after a player collides with an enemy.
    // Freezes the player and enemies momentarily, removes a life, and resets
    // the user's position, among other actions.
    this.loseALife = function() {
        if (heartSprites.length > 0) {
            heartSprites[heartSprites.length - 1].remove();
            heartSprites.pop();
        }
        game.livesRemaining--;
        this.canMove = false;
        allEnemies.forEach(function(enemy) {
            enemy.canMove = false;
        });
        if (game.livesRemaining > 0) {
            this.blinkEffect();

            // I learned how to bind the parameter 'this' to setTimout() and 
            // setInterval() from Stack Overflow
            setTimeout(function() {
                allEnemies.forEach(function(enemy) {
                    enemy.canMove = true;
                });
                player.resetPosition();
                clearInterval(this.blinkInterval);
            }.bind(this), 1500);
        }
    };

    // When a player collides with an enemy, they will flash momentarily.
    // Called by the player.loseALife() method above
    this.blinkEffect = function() {
        var currentLocation = this.x;
        this.blinkInterval = setInterval(function() {
            if (this.x === -2000) {
                this.x = currentLocation;
            }
            else {
                this.x = -2000;
            }
        }.bind(this), 200);
    };
};

// Produces heart sprite objects representing the player's lives.
// The heart sprites are added to the heartSprites array at the
// begining of a new game.
var Heart = function(x, y) {
    this.sprite = new Image();
    this.sprite.src = 'images/Heart.png';
    this.x = x;
    this.y = y;
};

// Draws a heart sprite onto the canvas.
// Image scaling learned from Stack Overflow
Heart.prototype.draw = function() {
    ctx.drawImage(this.sprite, this.x, this.y, 28, 28 * this.sprite.height / this.sprite.width);
};

// Removes a heart sprite from the canvas. Coincides with a player losing a life.
// Called by the player.loseALife() method through the heartSprites array
Heart.prototype.remove = function() {
    // ctx.fillStyle = 'black';
    // ctx.fillRect(this.x, this.y, 28, 40);
    ctx.clearRect(this.x, this.y, 28, 40);
};

// Produces collectible gems of various colors and point values.
// Gems are created dynamically during the course of a game. When
// the player picks up a gem, a new one is generated. Gem color
// and location are randomly chosen.
var Gem = function(color, x, y) {
    // The color parameter decides the gem's url, type, and point value
    if (color === 'blue') {
        this.sprite = 'images/Gem-Blue.png';
        this.pointAmount = 100;
        this.type = color;
    }
    else if (color === 'green') {
        this.sprite = 'images/Gem-Green.png';
        this.pointAmount = 200;
        this.type = color;
    }
    else if (color === 'orange') {
        this.sprite = 'images/Gem-Orange.png';
        this.pointAmount = 300;
        this.type = color;
    }
    this.x = x;
    this.y = y;
};

// Keeps track of the gem's state. Handles 'collision' with player.
Gem.prototype.update = function() {
    // Check if the player is within range of picking up a gem
    if (this.x - 5 > player.x && this.x - 40 < player.x &&
        this.y - 40 > player.y && this.y - 75 < player.y) {

        // Remove the gem from the gems array so that it disappears from the screen
        gems.pop();
        game.gemsCollected++;
        if (this.type === 'blue') {
            game.blueGems++;
        }
        else if (this.type === 'green') {
            game.greenGems++;
        }
        else if (this.type === 'orange') {
            game.orangeGems++;
        }
        game.addPoints(this.pointAmount);
        game.drawGemTotal();

        // Generate a new gem after a slight delay
        setTimeout(function() {
            game.generateGem();
        }, 100);
    }
};

// Draw a gem onto the canvas, like the Enemy and Player classes above
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 60, 102);
};

// Game object that contains game-specific properties and methods
var game = {
    isOver: false,
    livesRemaining: 3,
    score: 0,
    gemsCollected: 0,
    blueGems: 0,
    greenGems: 0,
    orangeGems: 0,
    start: function() {
        player.resetPosition();
        this.isOver = false;
        this.livesRemaining = 3;
        this.score = 0;
        gems = [];
        this.gemsCollected = 0;
        this.blueGems = 0;
        this.greenGems = 0;
        this.orangeGems = 0;
        this.drawScore();
        this.drawGemTotal();
        this.drawHearts();
        this.generateGem();
        allEnemies.forEach(function(enemy) {
            enemy.resetPosition();
            enemy.canMove = true;
        });
    },
    formatDisplayText: function() {
        ctx.font = "16pt arial";
        ctx.textAlign = 'left';
        ctx.fillStyle = 'black'; 
    },
    drawScore: function() {
        this.formatDisplayText();
        this.removeScore();
        ctx.fillText('Score: ' + this.score, 0, 42);
    },
    removeScore: function() {
        ctx.clearRect(0, 15, 240, 33);
        // ctx.fillStyle = 'black';
        // ctx.fillRect(0, 15, 240, 33);
    },
    addPoints: function(points) {
        this.score += points;
        this.drawScore();
    },
    drawGemTotal: function() {
        this.formatDisplayText();
        this.removeGemTotal();
        ctx.fillText('Gems: ' + this.gemsCollected, 243, 42);
    },
    removeGemTotal: function() {
        ctx.clearRect(243, 15, 160, 33);
        // ctx.fillStyle = 'black';
        // ctx.fillRect(243, 15, 160, 33);
    },
    drawHearts: function() {
        heartSprites = [heart1, heart2, heart3];
        heartSprites.forEach(function(heart) {
            heart.draw();
        });
    },

    // Random number with probability developed with help from
    // Stack Overflow
    getGemColor: function() {
        var num = Math.random();
        if (num < 0.6) {
            return 'blue';
        }
        else if (num < 0.9) {
            return 'green';
        }
        else {
            return 'orange';
        }
    },

    // MDN used as a reference
    getGemLocation: function() {
        return Math.floor(Math.random() * gemLocations.length);
    },
    generateGem: function() {
        var color = this.getGemColor();

        // If the gem position is too close to the player, try again.
        // Basically, a new gem will never appear near the player
        do {
            var i = this.getGemLocation();
        } while (gemLocations[i][0] + 150 > player.x && gemLocations[i][0] - 150 < player.x &&
                gemLocations[i][1] + 150 > player.y && gemLocations[i][1] - 150 < player.y);
        gems.push(new Gem(color, gemLocations[i][0], gemLocations[i][1]));
    },
    end: function() {
        this.isOver = true;
        player.canMove = false;
        allEnemies.forEach(function(enemy) {
            enemy.canMove = false;
        });
        this.removeScore();
        this.removeGemTotal();
        $('.points').text(this.score);
        $('.gems').text(this.gemsCollected);
        $('.blue-gems').text(this.blueGems);
        $('.green-gems').text(this.greenGems);
        $('.orange-gems').text(this.orangeGems);

        // I was having flickering issues with .fadeIn(), so I decided to use
        // .animate() instead
        $('.dark-overlay, .game-over-box').show().animate({opacity: 1}, 'fast');
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// Top row of enemies
var bug1 = new Enemy(-2500, 60, 300);
var bug2 = new Enemy(-300, 60, 300);

// Middle row of enemies
var bug3 = new Enemy(-2900, 143, 400);
var bug4 = new Enemy(-700, 143, 400);

// Bottom row of enemies
var bug5 = new Enemy(-2380, 227, 500);
var bug6 = new Enemy(-100, 227, 500);

// Array containing all of the enemy objects
var allEnemies = [bug1, bug2, bug3, bug4, bug5, bug6];

var player = new Player();

// Player heart sprites representing lives
var heart1 = new Heart(405, 8);
var heart2 = new Heart(440, 8);
var heart3 = new Heart(475, 8);

// Array that is filled with the heart sprites. The sprites are added by
// game.drawHearts() at the beginning of a new game.
var heartSprites;

// Array that is filled with a single gem at a time. The array is filled
// by game.generateGem() at the beginning of a new game and whenever the
// player picks up a gem (after popping the previous gem).
var gems = [];

// Possible locations for a new gem. Used by the game.generateGem() method.
var gemLocations = [[20, 105], [121, 105], [222, 105], [323, 105], [424, 105],
                    [20, 188], [121, 188], [222, 188], [323, 188], [424, 188],
                    [20, 271], [121, 271], [222, 271], [323, 271], [424, 271]];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // Prevent the page from scrolling when the arrow keys are pressed
    if (allowedKeys[e.keyCode]) {
        e.preventDefault();
    }
    player.handleInput(allowedKeys[e.keyCode]);
});

// Add the event listener after the page has finished loading
$(function() {
    // Hides the dialog box and starts a new game when the button is clicked
    $('button').on('click', function() {
        $('.dialog-box, .dark-overlay').animate({opacity: 0}, 'fast', function() {
            $(this).hide();
        });
        game.start();
    });
});
