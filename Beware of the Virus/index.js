let game, scene, velocity, virus;

// bat configuration
const config = {
    mirielle: {
        duration: 5,
        theme: "dark",
    },
    preload: [
        {src:"https://i.ibb.co/BqrHW34/virus.png", name:"virus"},
        {src:"https://i.ibb.co/9gbbYZp/unicorn.png", name:"unicorn"},
        {src: "https://www.playonloop.com/previews/POL-guilty-one-preview.mp3", name:"background"},
        {src:"https://www.dropbox.com/s/p8uivzwlesff2zn/hit.ogg?dl=1", name:"hit", type:"aud"},
    ]
};


function onReady() {
    this.unicorn = this.getMedia("unicorn", "img");
    this.virus = this.getMedia("virus", "img");
    this.backgroundAudio = this.getMedia("background", "aud");
    this.backgroundAudio.loop = true;
    this.hitAudio = this.getMedia("hit", "aud");
    let size = new Vec2d(this.unicorn.width, this.unicorn.height).scale(0.6);
    $("mainscreen").css({display:"none"});
    $("mainscreen").css({display:"flex"});
    this.start = () => {
        this.isPlaying = true;
        this.enemies = [];
        this.timeStarted = new Date().getTime();
        this.elapsedTime = 0;
        this.lives = 100;
        this.player = Component.Basic("rect", [scene.getWidth() * 0.5, 
        scene.getHeight() - size.y], size);
        velocity = new Vec2d();
        $("mainscreen").css({display:"none"});
        $("controller").css({display:"block"});
        $("controller").css({display:"flex"});
        scene.getCanvas().css({display: "block"});
        scene.update = updateFunc;
    };
    this.over = () => {
        $("controller").css({display:"none"});
        $("mainscreen").css({display:"block"});
        scene.getCanvas().css({display: "none"});
        scene.update = () => {};
        $("mainscreen").css({display:"flex"});
        $("elapsedTime").innerHTML = `Elapsed Time: ${~~(this.elapsedTime / 60)}mins`;
        $("gameOver").innerHTML = "Game Over";
    }
    this.createVirus = () => {
        let pos1 = new Vec2d(Math.random() * scene.getWidth(), 0);
        let pos2 = new Vec2d(Math.random() * scene.getWidth(), 0);
        let speed1 = Math.random() * 5;
        let speed2 = Math.random() * 5;
        this.enemies.push([pos1, speed1]);
        this.enemies.push([pos2, speed2]);
    }
}

// update function
function updateFunc() {
    let ctx = this.ctx;
    let now = new Date().getTime();
    let dt = this.getElapsedTime();
    // create new Virus after every seconds
    if(Math.abs(now - game.timeStarted) > 1000) {
        game.elapsedTime++;
        game.createVirus();
        game.timeStarted = now;
    }
    // render the viruses and animate them
    game.enemies.forEach((virus, i) => {
        virus[1] += 5;
        virus[0].y += virus[1] * dt;
        let size = new Vec2d(game.virus.width, game.virus.height).scale(0.6);
        let cmp = Component.Basic("rect", virus[0], size);
        if(Physics.Collision2D.Detect.rect(game.player, cmp)) {
            game.hitAudio.play();
            game.enemies.splice(i, 1);
            game.lives -= 2;
        }
        if(virus[0].y + size.y > scene.getHeight()) 
            game.enemies.splice(i, 1);
        ctx.drawImage(game.virus, virus[0].x, virus[0].y, 
            size.x, size.y);
    });

    // add friction to the velocity and move the player
    velocity.x *= 0.92;
    game.player.pos = game.player.pos.addScale(velocity, dt);
    // add bound to the player's position along the x-axis
    if(game.player.pos.x < 0) {
        game.player.pos.x = 0;
        velocity = new Vec2d();
    }
    if(game.player.pos.x + game.player.dimension.x > scene.getWidth()) {
        velocity = new Vec2d();   
        game.player.pos.x = scene.getWidth() - game.player.dimension.x;
    }
    // draw  the player
    ctx.drawImage(game.unicorn, game.player.pos.x, game.player.pos.y,
        game.player.dimension.x, game.player.dimension.y);

    // draw lives and render the game's data texts
    ctx.fillStyle = game.lives >= 50 ? "green" : game.lives >= 25 && 
        game.lives <= 50 ?"yellow" : "red";
    ctx.fillRect(10, 10, game.lives, 10);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(10, 10, 100, 10);
    ctx.fillStyle = "#222";
    ctx.font = "bold 10px 'Press Start 2P";
    ctx.fillText("Lives", 25, 35);
    ctx.font = "bold 10px 'Press Start 2P";
    ctx.fillText(`Time: ${game.elapsedTime}s`, scene.getWidth() - 150, 20);
    // end the game if live is less than 0
    if(game.lives < 0) game.over();
}

const $ = id => document.getElementById(id);

// bat loaded function
Bat.Core.init(() => {
    game = new GameArea(innerWidth, innerHeight - 40, config);
    scene = new Scene(game, true);
    scene.getCanvas().css({backgroundColor:"lightskyblue",
    display:"none"});

    game.onReady = onReady;
    scene.update = () => {};

    // Event Handlers
    addEventListener("keydown", e => {
        if(e.keyCode === 37) velocity.x -= 60;
        else if(e.keyCode === 39) velocity.x += 60;
    });

    $("play-btn").addEventListener("click", () => {
        game.backgroundAudio.play();
        game.start()
    });
    $("left").addEventListener("click", () => velocity.x -= 60);
    $("right").addEventListener("click", () => velocity.x += 60);
    $("about-btn").addEventListener("click", () => alert(aboutText));

    game.init();
});


const aboutText = `B.O.V - Beware of the Virus Game was written by Mirielle. 

it has a single infinite level where you roleplay as a unicorn and dodge the falling viruses.
you get sick when you contacted a virus and your health will deplete. 
It's a survival game, the more careful you are defines how long you stay alive.
It has two controls, Keyboard(left - right arrow keys) and Touch(The control button at the bottom of the gameArea)

This game was Inspired by r8w9 on sololearn`;
