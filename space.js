const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor() {
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;

        const image = new Image();
        image.src = "./images/spaceship.png";
        image.onload = () => {
            const scale = 0.15; // ✅ Fixed player scale
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            };
        };
    }

    draw() {
        if (this.image) {
            c.save();
            c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            c.rotate(this.rotation);
            c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            c.restore();
        }
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Projectile {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 4;
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

class InvaderProjectile {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
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

        const image = new Image();
        image.src = "./images/invader.png";

        image.onload = () => {
            const scale = 0.045;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
        };
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height
        }, {
            x: 0,
            y: 5
        }));
    }
}

class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 5, y: 0 };
        this.invaders = [];

        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);
        this.width = columns * 50;

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    x: this.position.x + x * 50,
                    y: this.position.y + y * 50
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
}

const player = new Player();
const grids = [];
const projectiles = [];
const invaderProjectiles = [];

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    space: { pressed: false }
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);

function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    if (player.image) {
        player.update();

        projectiles.forEach((projectile, index) => {
            if (projectile.position.y + projectile.radius <= 0) {
                projectiles.splice(index, 1);
            } else {
                projectile.update();
            }
        });

        invaderProjectiles.forEach((invaderProjectile, index) => {
            if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
                invaderProjectiles.splice(index, 1);
            } else {
                invaderProjectile.update();
            }
        });

        grids.forEach((grid, gridIndex) => {
            grid.update();

            if (frames % 100 === 0 && grid.invaders.length > 0) {
                grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
            }

            grid.invaders.forEach((invader, i) => {
                invader.update({ velocity: grid.velocity });

                projectiles.forEach((projectile, j) => {
                    if (
                        projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                        projectile.position.x + projectile.radius >= invader.position.x &&
                        projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                        projectile.position.y + projectile.radius >= invader.position.y
                    ) {
                        setTimeout(() => {
                            const invaderFound = grid.invaders.find(invader2 => invader2 === invader);
                            const projectileFound = projectiles.find(projectile2 => projectile2 === projectile);

                            if (invaderFound && projectileFound) {
                                grid.invaders.splice(i, 1);
                                projectiles.splice(j, 1);

                                if (grid.invaders.length > 0) {
                                    const firstInvader = grid.invaders[0];
                                    const lastInvader = grid.invaders[grid.invaders.length - 1];

                                    grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                } else {
                                    grids.splice(gridIndex, 1);
                                }
                            }
                        }, 0);
                    }
                });
            });
        });

        if (player.position && player.width) {
            if (keys.a.pressed && player.position.x >= 0) {
                player.velocity.x = -10;
                player.rotation = -0.15;
            } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
                player.velocity.x = 10;
                player.rotation = 0.15;
            } else {
                player.velocity.x = 0;
                player.rotation = 0;
            }
        }

        if (frames % randomInterval === 0) {
            grids.push(new Grid());
            randomInterval = Math.floor(Math.random() * 500 + 500);
            frames = 0;
        }
        frames++;
    }
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case ' ':
            projectiles.push(new Projectile(
                {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                { x: 0, y: -5 }
            ));
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;
    }
});
