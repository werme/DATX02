'use strict';

Darwinator.Player = function(game, x, y, cursors) {
    Darwinator.Entity.call(this, game, x, y, 'player');
    this.cursors = cursors;
    this.anchor.setTo(0.5, 0.5);
    this.initKeys();
    this.initEventListeners();
    this.initAnimations();

    this.attributes.strength  = Darwinator.PLAYER_BASE_STRENGTH;
    this.attributes.agility   = Darwinator.PLAYER_BASE_AGILITY;
    this.attributes.intellect = Darwinator.PLAYER_BASE_INTELLECT;
    this.updateAttributes();

    this.dashTimer   = null;
    this.direction   = 90;
    this.dashCounter = 0;
    
    this.useRandomInput = Darwinator.settings.randomPlayer;
    this.lastRandomInput = Date.now();
    this.lastDirection = [0,0];

    this.moving = false;

    if(Darwinator.settings.immortalPlayer){
        this.health = Infinity;
    }
};

Darwinator.Player.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Player.prototype.update = function () {
    Darwinator.Entity.prototype.update.call(this);
    
    if (this.useRandomInput) {
        this.updateRandomInput();
        return;
    }

    if (this.dead || this.knockedBack) {
        return;
    }

    var pointer = this.game.input.activePointer;
    if (pointer.isDown) {
        this.weapons.ranged.fire(pointer.worldX, pointer.worldY);
    }

    if(this.meleeKey.isDown){
        var strikeEnemy = function(player, enemy){
                this.weapons.melee.strike(enemy);
            }.bind(this);

            this.game.physics.arcade.overlap(this, this.game.enemies, strikeEnemy);
    }

    /*
     *  If dashing, override manual controls and
     *  just keep the values assigned in dash. Once
     *  dash is completed, return to normal controls.
     */
    if (this.isDashing()) {
        this.makeMove(this.direction);
        this.dashCounter--;
    } else {
        this.currentSpeed = this.speed;
        this.body.velocity.setTo(0,0);
        var dir = [0,0];
        this.moving = false;
        
        if (this.cursors.left.isDown || this.leftKey.isDown) {
            dir[0] = -1;
        } else if (this.cursors.right.isDown || this.rightKey.isDown) {
            dir[0] = 1;
        }

        if (this.cursors.up.isDown || this.upKey.isDown) {
            if (this.getBounds().y <= 0 || this.getBounds().y <= 0) { // top right
                this.body.velocity.y = 0;
            }
            dir[1] = 1;
        } else if (this.cursors.down.isDown || this.downKey.isDown) {
            dir[1] = -1;
        }

        if (dir[0] !== 0 || dir[1] !== 0) {
            this.moving = true;
        } 

        if (!this.moving) {
            this.animations.stop();
            this.body.frame = 4;
        } else {
            this.makeMove(dir);
        }
    }

    if (this.sprintKey.isDown && this.currBreath > 1 && this.moving) {
        this.body.velocity.multiply(2,2);
        this.currBreath--;
    } else if (this.currBreath < this.stamina) {
        this.currBreath += 0.2;
    }
};

Darwinator.Player.prototype.makeMove = function (dir) {
    
    // Going upwards
    if (dir[1] === 1) {
        this.direction = 270;
        this.animations.play('walk-up');
        
        // Also going right or left
        if (dir[0] === 1) {
            this.direction = 315;
        } else if (dir[0] === -1) {
            this.direction = 225;
        }

    // Going downwards
    } else if (dir[1] === -1) {
        this.direction = 90;
        this.animations.play('walk-down');
    
        // Also going right or left
        if (dir[0] === 1) {
            this.direction = 45;
        } else if (dir[0] === -1) {
            this.direction = 135;
        }

    // Going right
    } else if (dir[0] === 1) {
        this.direction = 0;
        this.animations.play('walk-right');
    
    // Going left
    } else if (dir[0] === -1) {
        this.direction = 180;
        this.animations.play('walk-left');
    }
    
    // Set speed and angle
    this.game.physics.arcade.velocityFromAngle(this.direction, this.currentSpeed, this.body.velocity);
};

Darwinator.Player.prototype.initDashInKeyDirection = function (key) {

    this.dashCounter  = 10;
    this.currentSpeed = 1000;
    this.currBreath  -= 30;

    if (key === this.cursors.left || key === this.leftKey) {
        this.direction = 180;
    } else if (key === this.cursors.right || key === this.rightKey) {
        this.direction = 0;
    } else if (key === this.cursors.up || key === this.upKey) {
        this.direction = 270;
    } else if (key === this.cursors.down || key === this.downKey) {
        this.direction = 90;
    }
};

Darwinator.Player.prototype.initKeys = function () {

    this.upKey     = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.leftKey   = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.downKey   = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.rightKey  = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    this.sprintKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.meleeKey  = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.telKey    = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
    this.dodgeKey  = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
};

Darwinator.Player.prototype.initEventListeners = function () {

    var setLastReleased = function (key) {
        key.lastReleased = this.game.time.now;
    };

    var checkLastReleased = function (key) {

        var triedDash = !!key.lastReleased && this.game.time.now - key.lastReleased < 200;
        var dashReady = !this.isDashing() && this.currBreath > 30;

        if (triedDash && dashReady) {
            this.initDashInKeyDirection(key);
        }
    };

    this.telKey.onDown.add(
        function() {
            var pointer = this.game.input.activePointer;
            this.tryTeleport(pointer.worldX, pointer.worldY);
        }, this);

    this.dodgeKey.onDown.add(this.tryDodge, this);

    this.upKey.onUp.add(setLastReleased, this);
    this.leftKey.onUp.add(setLastReleased, this);
    this.downKey.onUp.add(setLastReleased, this);
    this.rightKey.onUp.add(setLastReleased, this);
    this.cursors.up.onUp.add(setLastReleased, this);
    this.cursors.down.onUp.add(setLastReleased, this);
    this.cursors.right.onUp.add(setLastReleased, this);
    this.cursors.left.onUp.add(setLastReleased, this);

    this.upKey.onDown.add(checkLastReleased, this);
    this.leftKey.onDown.add(checkLastReleased, this);
    this.downKey.onDown.add(checkLastReleased, this);
    this.rightKey.onDown.add(checkLastReleased, this);
    this.cursors.up.onDown.add(checkLastReleased, this);
    this.cursors.down.onDown.add(checkLastReleased, this);
    this.cursors.right.onDown.add(checkLastReleased, this);
    this.cursors.left.onDown.add(checkLastReleased, this);
}

Darwinator.Player.prototype.updateRandomInput = function () {

    this.currentSpeed = this.speed;
    this.body.velocity.setTo(0,0);
    this.moving = false;
    var dir = [0,0];

    // Random movement
    if ((Date.now() - this.lastRandomInput) > 750) {
        dir = this.randomInput();
        this.moving = true;
    } else {
        dir = this.lastDirection;
        this.moving = true;
        if (this.body.blocked.left || this.body.blocked.right || 
            this.body.blocked.up ||this.body.blocked.down ) {
            dir = this.randomInput();
        }
    }
    
    if (!this.moving) {
            this.animations.stop();
            this.body.frame = 4;
        } else {
            this.makeMove(dir);
    }

    // Fire at random
    if (Math.random() >= 0.5) {
        var angle = 360 * Math.random();
        this.weapons.ranged.fireInDirection(angle);
    }   
};

Darwinator.Player.prototype.updateAttributes = function () {

    this.health         = Darwinator.PLAYER_BASE_HEALTH  + this.attributes.strength;
    this.damage         = Darwinator.PLAYER_BASE_DAMAGE  + this.attributes.strength;
    this.speed          = Darwinator.PLAYER_BASE_SPEED   + this.attributes.agility * 3;
    this.stamina        = Darwinator.PLAYER_BASE_STAMINA + this.attributes.agility * 2;
    this.aim            = this.attributes.intellect; // Intended to define how well the enemy aims. 0 = "shitty" aim, 100 = "perfect" aim
    this.criticalStrike = this.attributes.intellect / 100; // Critical strike percentage
    this.currBreath     = this.stamina;
    this.currentSpeed   = this.speed;

    var red   = 'color: red; font-weight: bold;';
    var green = 'color: #02c;';

    console.log('%c Updated player attributes! ', 'background: #222; color: #dc3');

    console.log('%c\tStrength:  ' + this.attributes.strength,  green);
    console.log('%c\tAgility:   ' + this.attributes.agility,   green);
    console.log('%c\tIntellect: ' + this.attributes.intellect, green);

    console.log('\tHealth:  ' + '%c' + this.health,  red);
    console.log('\tDamage:  ' + '%c' + this.damage,  red);
    console.log('\tSpeed:   ' + '%c' + this.speed,   red);
    console.log('\tStamina: ' + '%c' + this.stamina + '\n', red);
};

Darwinator.Player.prototype.initAnimations = function () {

    var anims = [
        ['walk-up',     [0,1,2,3],     10, true],
        ['walk-down',   [4,5,6,7],     10, true],
        ['walk-left',   [8,9,10,11],   10, true], 
        ['walk-right',  [12,13,14,15], 10, true],
        ['slash-up',    [16,17],       10, false],
        ['slash-down',  [18,19],       10, false],
        ['slash-left',  [20,21],       10, false],
        ['slash-right', [22,23],       10, false]
    ];

    this.setAnimations(anims);
};

Darwinator.Player.prototype.isDashing = function () {
    return this.dashCounter > 0;
};

Darwinator.Player.prototype.resetAttributes = function () {
    this.attributes.strength  = Darwinator.PLAYER_BASE_STRENGTH;
    this.attributes.agility   = Darwinator.PLAYER_BASE_AGILITY;
    this.attributes.intellect = Darwinator.PLAYER_BASE_INTELLECT;
    this.updateAttributes();
};

Darwinator.Player.prototype.randomInput = function () {
    
    this.lastRandomInput = Date.now();
    var rand = Math.random();
    var dir = [0,0];
    if (rand < 0.25) {
        //Moving left
        dir[0] = -1;
    } else if (rand < 0.5) {
        //Moving right
        dir[0] = 1;
    } else if (rand < 0.75) {
        //Moving up
        dir[1] = 1;
    } else {
        //Moving down
        dir[1] = -1;
    }
    this.lastDirection = dir;
    return dir;
};
