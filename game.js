//Canvas
const cvs = document.getElementById("bird");
const ctx = cvs.getContext('2d');

//Variables
let frames = 0;
const DEGREE = Math.PI/180;

//Sprite Image Load
const sprite = new Image();
sprite.src = "img/sprite.png";

//Sounds Load
const scoreSound = new Audio();
scoreSound.src = "audio/sfx_point.wav";

const flapSound = new Audio();
flapSound.src = "audio/sfx_flap.wav";

const hitSound = new Audio();
hitSound.src = "audio/sfx_hit.wav";

const swooshSound = new Audio();
swooshSound.src = "audio/sfx_swooshing.wav";

const dieSound = new Audio();
dieSound.src = "audio/sfx_die.wav";


//Game State
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    gameOver: 2
}

//Start Button
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

//Control the state
cvs.addEventListener("click",function(e){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            swooshSound.play();
            break;

        case state.game:
            bird.flap();
            flapSound.play();
            break;

        case state.gameOver:
            let rect = cvs.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w &&
                clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h ){
                    pipes.reset();
                    bird.speedReset();
                    score.reset();
                    state.current = state.getReady;
                }
            break;
    }
})

//Background object
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+this.w, this.y, this.w, this.h);
    }

}

//Foreground object
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,

    dx: 2,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+this.w, this.y, this.w, this.h);
    },

    update: function(){
        if(state.current === state.game){
            this.x = (this.x - this.dx) % (this.w/2);
        }
    }
}

//Bird
const bird = {
    animation : [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 136}
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    radius: 12,

    frame : 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw: function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h);

        ctx.restore();
    },

    flap: function(){
        this.speed -= this.jump
    },

    update: function(){
        this.period = state.current == state.getReady ? 10 : 5;
        this.frame += frames % this.period === 0 ? 1 : 0;
        this.frame = this.frame % this.animation.length;

        if(state.current === state.getReady) {
            this.y = 150;
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current === state.game) {
                    state.current = state.gameOver;
                    dieSound.play();
                }
            }

            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },

    speedReset: function(){
        this.speed = 0;
    }
}

//Get Ready
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,

    draw: function(){
        if(state.current === state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

//Game Over
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width/2 - 225/2,
    y: 90,

    draw: function(){
        if(state.current === state.gameOver){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

//Pipes
const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0   
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYpos: -150,
    dx: 2,

    draw: function(){
        for(let i=0; i<this.position.length; i++){
            let p = this.position[i]
            let topYpos = p.y
            let bottomYpos = p.y + this.gap + this.h;
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYpos, this.w, this.h);
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYpos, this.w, this.h); 
        }
    },

    update: function(){
        if(state.current !== state.game) return;
        if(frames % 100 === 0){
            this.position.push({
                x: cvs.width,
                y: this.maxYpos * (Math.random() + 1)
            });
        }
        for(let i=0; i<this.position.length; i++){
            let p = this.position[i]
            

            let bottomPipeY = p.y + this.h + this.gap;

            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                    state.current = state.gameOver;
                    hitSound.play();
                }
            
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > bottomPipeY && bird.y - bird.radius < bottomPipeY + this.h){
                    state.current = state.gameOver;
                    hitSound.play();
                }

            p.x -= this.dx;

            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                scoreSound.play();

                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best",score.best);
            }
        }
    },

    reset: function(){
        this.position = [];
    }
}

//Score
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function(){
        ctx.fillStyle = "#FFF";
        ctx.strokStyle = "#000";
        
        if(state.current === state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
        } 
        else if(state.current === state.gameOver) {
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    reset: function(){
        this.value = 0;
    }
}

function draw(){
    ctx.fillStyle = "#70c5ce"
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

function update(){
    bird.update();
    fg.update();
    pipes.update();
}

function loop(){
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}
loop();


