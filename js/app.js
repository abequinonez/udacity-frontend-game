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
    this.speed = speed;
    this.canMove = false;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // this.speed * dt;
    if (this.canMove) {
        this.x += this.speed * dt;
    }

    // Reset enemy position once it leaves the visible canvas
    if (this.x > 505) {
        this.x = -2000;
    }

    // Check and handle collision
    if (!player.alreadyCollided) {
        if (this.x + 60 > player.x && this.x - 60 < player.x &&
            this.y + 60 > player.y && this.y - 60 < player.y) {
            player.alreadyCollided = true;
            player.loseALife();
        }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
    this.canMove = false;
    this.alreadyCollided = false;
    this.blinkInterval;
    this.update = function() {
        // If the player reaches the water, reset their position and add points
        if (this.y <= -35) {
            this.resetPosition();
            game.addPoints(100);
        }

        // If player's lives reaches 0, freeze both the player and the enemies
        if (!game.isOver) {
            if (game.livesRemaining <= 0) {
                game.isOver = true;
                this.canMove = false;
                allEnemies.forEach(function(enemy) {
                    enemy.canMove = false;
                });
                game.removeScore();
                $('.points').text(game.score);

                // I was having flickering issues with .fadeIn(), so I decided to use
                // .animate() instead
                $('.dark-overlay, .game-over-box').show().animate({opacity: 1}, 'fast');
            }
        }
    };

    // Draw the player on the screen, just like the enemy class
    this.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
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
    this.resetPosition = function() {
        this.x = 200;
        this.y = 380;
        this.canMove = true;
        this.alreadyCollided = false;
    };

    // I learned how to bind the parameter 'this' to setTimout() and 
    // setInterval() from Stack Overflow
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
        this.blinkEffect();
        setTimeout(function() {
            if (game.livesRemaining > 0) {
                allEnemies.forEach(function(enemy) {
                    enemy.canMove = true;
                });
                player.resetPosition();
            }
            clearInterval(this.blinkInterval);
        }.bind(this), 1500);
        
    };
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

var Heart = function(x, y) {
    this.sprite = new Image();
    this.sprite.src = 'images/Heart.png';
    this.x = x;
    this.y = y;
};

// Image scaling learned from Stack Overflow
Heart.prototype.draw = function() {
    ctx.drawImage(this.sprite, this.x, this.y, 30, 30 * this.sprite.height / this.sprite.width);
};

Heart.prototype.remove = function() {
    // ctx.fillStyle = 'black';
    // ctx.fillRect(this.x, this.y, 30, 43);
    ctx.clearRect(this.x, this.y, 30, 43);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// Top row of enemies
var bug1 = new Enemy(10, 60, 150);
var bug2 = new Enemy(-2500, 60, 500);
var bug3 = new Enemy(-800, 60, 300);

// Middle row of enemies
var bug4 = new Enemy(150, 143, 250);
var bug5 = new Enemy(-1200, 143, 500);
var bug6 = new Enemy(-1600, 143, 300);

// Bottom row of enemies
var bug7 = new Enemy(300, 227, 300);
var bug8 = new Enemy(-2000, 227, 500);
var allEnemies = [bug1, bug2, bug3, bug4, bug5, bug6, bug7, bug8];

var player = new Player();

// Player lives
var heart1 = new Heart(400, 5);
var heart2 = new Heart(435, 5);
var heart3 = new Heart(470, 5);
var heartSprites;

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

var game = {
    isOver: false,
    livesRemaining: 3,
    score: 0,
    start: function() {
        player.resetPosition();
        this.isOver = false;
        this.livesRemaining = 3;
        this.score = 0;
        this.drawScore();
        this.drawHearts();
        allEnemies.forEach(function(enemy) {
            enemy.canMove = true;
        });
    },
    drawScore: function() {
        ctx.font = "18pt arial";
        ctx.textAlign = 'left';
        ctx.fillStyle = 'black';
        ctx.fillText('Score: ' + this.score, 0, 40);
    },
    removeScore: function() {
        // ctx.fillStyle = 'black';
        ctx.clearRect(0, 8, 300, 40);
        // ctx.fillRect(0, 8, 300, 40);
    },
    addPoints: function(points) {
        this.score += points;
        this.removeScore();
        ctx.fillText('Score: ' + this.score, 0, 40);
    },
    drawHearts: function() {
        heartSprites = [heart1, heart2, heart3];
        heartSprites.forEach(function(heart) {
            heart.draw();
        });
    }
};

// Add the event listener after the page has finished loading
$(function() {
    $('button').on('click', function() {
        $('.dialog-box, .dark-overlay').animate({opacity: 0}, 'fast', function() {
            $(this).hide();
        });
        game.start();
    });
});
