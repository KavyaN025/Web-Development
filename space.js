const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Audio - Create once and reuse to prevent memory leaks
const game_over = new Audio('sounds/game-over.mp3');
const player_shoot = new Audio('sounds/shoot.mp3');
const bg_music = new Audio('sounds/space_atmosphere.mp3');
const explosion = new Audio('sounds/explosion.m4a');
explosion.volume = 1;
// Preload all audio
bg_music.loop = true;
bg_music.preload = 'auto';
player_shoot.preload = 'auto';
game_over.preload = 'auto';
bg_music.volume = 0.8;

// Helper function to safely play audio
function playSound(audio) {
    try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch (error) {
        console.warn('Could not play audio');
    }
}

class Player {
    constructor() {
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.opacity = 1;
        this.width = 0;
        this.height = 0;
        this.position = { x: 0, y: 0 };
        this.imageLoaded = false;

        const image = new Image();
        image.src = "./images/spaceship.png";
        image.onload = () => {
            const scale = 0.14;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            };
            this.imageLoaded = true;
        };
        // Add error handling for image loading
        image.onerror = () => {
            console.warn('Could not load player image');
            // Set default values if image fails to load
            this.width = 50;
            this.height = 50;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            };
            this.imageLoaded = false;
        };
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        
        if (this.image && this.imageLoaded) {
            // Draw image if loaded successfully
            c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            c.rotate(this.rotation);
            c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Draw simple triangle as fallback
            c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            c.rotate(this.rotation);
            c.fillStyle = 'white';
            c.beginPath();
            c.moveTo(0, -this.height / 2);
            c.lineTo(-this.width / 2, this.height / 2);
            c.lineTo(this.width / 2, this.height / 2);
            c.closePath();
            c.fill();
        }
        
        c.restore();
    }

    update() {
        // Only update if player is initialized
        if (this.width > 0 && this.height > 0) {
            this.draw();
            this.position.x += this.velocity.x;
            
            // Keep player on screen
            if (this.position.x < 0) this.position.x = 0;
            if (this.position.x + this.width > canvas.width) {
                this.position.x = canvas.width - this.width;
            }
        }
    }
}

class Projectile {
    constructor(position, velocity) {
        this.position = { x: position.x, y: position.y };
        this.velocity = { x: velocity.x, y: velocity.y };
        this.radius = 3.5;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor(position, velocity, radius, color) {
        this.position = { x: position.x, y: position.y };
        this.velocity = { x: velocity.x, y: velocity.y };
        this.radius = radius;
        this.color = color;
        this.lifetime = 150;
    }

    draw() {
        c.save();
        c.globalAlpha = this.lifetime / 150;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.lifetime--;
    }
}

class InvaderProjectile {
    constructor(position, velocity) {
        this.position = { x: position.x, y: position.y };
        this.velocity = { x: velocity.x, y: velocity.y };
        this.width = 4;
        this.height = 10;
    }

    draw() {
        c.fillStyle = "white";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor(position) {
        this.position = { x: position.x, y: position.y };
        this.velocity = { x: 0, y: 0 };
        this.width = 0;
        this.height = 0;
        this.imageLoaded = false;

        const image = new Image();
        image.src = "./images/invader.png";
        image.onload = () => {
            const scale = 0.045;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.imageLoaded = true;
        };
        // Add error handling for image loading
        image.onerror = () => {
            console.warn('Could not load invader image');
            this.width = 30;
            this.height = 30;
            this.imageLoaded = false;
        };
    }

    draw() {
        if (this.image && this.imageLoaded) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Draw simple rectangle as fallback
            c.fillStyle = 'lime';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update({ velocity }) {
        // Only update if invader is initialized
        if (this.width > 0 && this.height > 0) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        // Only shoot if invader is initialized
        if (this.width > 0 && this.height > 0) {
            invaderProjectiles.push(new InvaderProjectile({
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            }, {
                x: 0,
                y: 10
            }));
        }
    }
}

class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 7, y: 0 };
        this.invaders = [];

        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);
        this.width = columns * 50;

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    x: this.position.x + x * 50,
                    y: this.position.y + y * 50 + 80
                }));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }

    // Safe method to update grid width when invaders are removed
    updateWidth() {
        if (this.invaders.length === 0) {
            this.width = 0;
            return;
        }
        
        let minX = this.invaders[0].position.x;
        let maxX = this.invaders[0].position.x + this.invaders[0].width;
        
        for (let invader of this.invaders) {
            minX = Math.min(minX, invader.position.x);
            maxX = Math.max(maxX, invader.position.x + invader.width);
        }
        
        this.width = maxX - minX;
        this.position.x = minX;
    }
}

// Game variables
let score = 0;
let frames = 0;
let gameOverFrame = null;
let game = {
    over: false,
}
let randomInterval = Math.floor(Math.random() * 500 + 500);
let playerHit = false;
let canShoot = true;
let shootCooldown = 200;
let musicStarted = false;

// Game objects
const player = new Player();
const grids = [];
const projectiles = [];
const invaderProjectiles = [];
const particles = [];
const stars = [];

// Player controls
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    space: { pressed: false }
};

// Create background stars
function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push(new Particle(
            {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            {
                x: 0,
                y: 1
            },
            Math.random() * 2,
            "white"
        ));
    }
}

// Initialize stars
createStars();

// Safe array removal function - iterate backwards to avoid index issues
function safeRemoveFromArray(array, condition) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (condition(array[i], i)) {
            array.splice(i, 1);
        }
    }
}

// Main game loop
function animate() {
    requestAnimationFrame(animate);
    
    // Clear canvas
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Only run game logic if player is initialized
    if (player.width > 0 && player.height > 0) {
        player.update();

        // Draw score
        c.fillStyle = "white";
        c.font = "bold 24px Arial";
        c.textAlign = "left";
        c.fillText(`Score: ${score}`, 20, 40);

        // Update particles - safe removal
        safeRemoveFromArray(particles, (particle) => {
            particle.update();
            return particle.lifetime <= 0;
        });

        // Update projectiles - safe removal
        safeRemoveFromArray(projectiles, (projectile) => {
            projectile.update();
            return projectile.position.y + projectile.radius <= 0;
        });

        // Update stars
        stars.forEach(star => {
            star.draw();
            star.position.y += star.velocity.y;

            // Loop star back to top if it moves out of view
            if (star.position.y > canvas.height) {
                star.position.y = 0;
                star.position.x = Math.random() * canvas.width;
            }
        });

        // Update invader projectiles - safe removal
        safeRemoveFromArray(invaderProjectiles, (invaderProjectile) => {
            invaderProjectile.update();
            
            // Check collision with player
            if (!game.over && !playerHit &&
                invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
                invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
                invaderProjectile.position.x <= player.position.x + player.width
            ) {
                playerHit = true;
                if (gameOverFrame === null) {
                    gameOverFrame = frames;
                }

                // Create explosion particles
                for (let i = 0; i < 20; i++) {
                    particles.push(new Particle(
                        {
                            x: player.position.x + player.width / 2,
                            y: player.position.y + player.height / 2
                        },
                        {
                            x: (Math.random() - 0.5) * 2,
                            y: (Math.random() - 0.5) * 2
                        },
                        Math.random() * 15,
                        "white"
                    ));
                }
                
                playSound(game_over);
                return true; // Remove this projectile
            }
            
            return invaderProjectile.position.y + invaderProjectile.height >= canvas.height;
        });

        // Update grids - safe removal
        safeRemoveFromArray(grids, (grid, gridIndex) => {
            grid.update();

            // Random invader shooting
            if (frames % 100 === 0 && grid.invaders.length > 0) {
                const randomInvader = grid.invaders[Math.floor(Math.random() * grid.invaders.length)];
                randomInvader.shoot(invaderProjectiles);
            }

            // Update invaders - safe removal
            safeRemoveFromArray(grid.invaders, (invader, invaderIndex) => {
                invader.update({ velocity: grid.velocity });

                // Check if invader reached bottom
                if (invader.position.y + invader.height >= canvas.height) {
                    if (gameOverFrame === null) {
                        gameOverFrame = frames;
                    }
                    return false; // Don't remove, just trigger game over
                }

                // Check collision with projectiles
                for (let j = projectiles.length - 1; j >= 0; j--) {
                    const projectile = projectiles[j];
                    
                    if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                        projectile.position.x + projectile.radius >= invader.position.x &&
                        projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                        projectile.position.y + projectile.radius >= invader.position.y
                    ) {
                        // Create explosion particles
                        for (let k = 0; k < 5; k++) {
                            particles.push(new Particle(
                                {
                                    x: invader.position.x + invader.width / 2,
                                    y: invader.position.y + invader.height / 2
                                },
                                {
                                    x: (Math.random() - 0.5) * 2,
                                    y: (Math.random() - 0.5) * 2
                                },
                                Math.random() * 6,
                                "yellow"
                            ));
                        }
                        explosion.play();
                        score += 100;
                        projectiles.splice(j, 1);
                        grid.updateWidth(); // Update grid width after removal
                        return true; // Remove this invader
                    }
                }
                return false; // Don't remove invader
            });

            // Remove empty grids
            return grid.invaders.length === 0;
        });

        // Player movement
        if (keys.a.pressed && player.position.x >= 0) {
            player.velocity.x = -15;
            player.rotation = -0.15;
        } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
            player.velocity.x = 15;
            player.rotation = 0.15;
        } else {
            player.velocity.x = 0;
            player.rotation = 0;
        }

        // Spawn new grid
        if (frames % randomInterval === 0) {
            grids.push(new Grid());
            randomInterval = Math.floor(Math.random() * 500 + 500);
            frames = 0;
        }

        // Player fade out effect when hit
        if (playerHit && player.opacity > 0) {
            player.opacity -= 0.02;
            if (player.opacity < 0) player.opacity = 0;
        }

        // Game over screen
        if (gameOverFrame !== null && frames - gameOverFrame > 30) {
            game.over = true;
            c.fillStyle = "white";
            c.font = "bold 48px Arial";
            c.textAlign = "center";
            c.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

            c.font = "24px Arial";
            c.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2 + 50);
        }

        frames++;
    }
}

// Start the game
animate();

// Restart game function
function restartGame() {
    // Clear all arrays
    grids.length = 0;
    invaderProjectiles.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    stars.length = 0;
    
    // Recreate stars
    createStars();

    // Reset game state
    score = 0;
    frames = 0;
    randomInterval = Math.floor(Math.random() * 500 + 500);
    game.over = false;
    player.opacity = 1;
    playerHit = false;
    gameOverFrame = null;

    // Reset player position (only if initialized)
    if (player.width > 0 && player.height > 0) {
        player.position.x = canvas.width / 2 - player.width / 2;
        player.position.y = canvas.height - player.height - 20;
    }
}

// Keyboard event listeners
window.addEventListener('keydown', (event) => {
    // Start music on first interaction
    if (!musicStarted) {
        playSound(bg_music);
        musicStarted = true;
    }

    // Handle restart
    if (game.over && event.key === 'Enter') {
        restartGame();
        return;
    }

    // Don't process other keys if game is over
    if (game.over) return;

    switch (event.key) {
        case 'a':
        case 'A':
            keys.a.pressed = true;
            break;
        case 'd':
        case 'D':
            keys.d.pressed = true;
            break;
        case ' ':
            event.preventDefault(); // Prevent page scroll
            if (canShoot && player.width > 0 && player.height > 0) {
                playSound(player_shoot);

                projectiles.push(new Projectile(
                    {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    { x: 0, y: -12 }
                ));
                
                canShoot = false;
                setTimeout(() => {
                    canShoot = true;
                }, shootCooldown);
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (game.over) return;
    
    switch (event.key) {
        case 'a':
        case 'A':
            keys.a.pressed = false;
            break;
        case 'd':
        case 'D':
            keys.d.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;
    }
});
