import React, {useRef, useEffect} from 'react'
import laserSound from '../sounds/laser.m4a'
import hitSound from '../sounds/hit.m4a'
import explodeSound from '../sounds/explode.m4a'
import thrustSound from '../sounds/thrust.m4a'
import musicHigh from '../sounds/music-high.m4a'
import musicLow from '../sounds/music-low.m4a'



const GameBoard = (props) => {
 const canvasRef = useRef(null); 
 const SHIP_SIZE = 30; // ship height in px
 const TURN_SPEED = 360;  // turn speed deg per sec
 const SHIP_THRUST = 5; //acceleration
 const SHIP_EXPLODE_DUR = 0.8; // duration of ship explodsion
 const SHIP_INV_DUR = 3;
 const SHIP_BLINK_DUR = 0.1;
 const FRICTION = 0.7 //friction
 let shipRot = 0; 
 let shipAngle = 90 / 180 * Math.PI; 
 let thrusting = false; 
 let thrust = {
    x: 0, 
    y: 0
 }
let shipX = 0; 
let shipY = 0; 

// TEXT 
const TEXT_FADE_TIME = 2.5; 
const TEXT_SIZE = 40; 
let level,lives, roids, ship, text, textAlpha, score, scoreHigh;

// number of live 
const GAME_LIVES = 3; 
// set up sound effect 
const SOUND_ON = false;  
let fxLaser = new Sound(laserSound, 5, 0.3); 
let fxhit = new Sound(hitSound, 5); 
let fxexplode = new Sound(explodeSound); 
let fxthrust = new Sound(thrustSound); 

// music 
let music = new Music(musicHigh, musicLow); 
const MUSIC_ON = false; 
let roidsLeft, roidsTotal; 

// point systme 
const ROIDS_PTS_LGE = 25; 
const ROIDS_PTS_MED = 50;
const ROIDS_PTS_SML = 100;

// local stoage 
const SAVE_KEY_SCORE = 'highscore'; 

// Lazer 
const LASER_MAX = 10;// max amount of lazer on screen
const LASER_SPD = 500; 
let LASER_EXPLODE_DUR = 0.1; 
let canShoot = true; 
let laserDis = 0.4; // max distnace laser can travel on scren 

let lasers = []; 
 

  // create Astroids
  const ROIDS_NUM = 2; //starting number of astroids
  const ROIDS_SIZE = 100;//astroid sixe 
  const ROIDS_SPD = 30; //
  const ROIDS_VERT = 10; // averager num on each astroids vertsis   
  const ROIDS_JAG = 0.4; // 0 = no jaged 1 = lots of jag 
  let blinkTime = Math.ceil(SHIP_BLINK_DUR * 30); 
  let blinkNum = Math.ceil(SHIP_INV_DUR/SHIP_BLINK_DUR);
  // collision 
  const SHOW_CENTER_DOT = false;
  const SHOW_BOUNDIG = false; // show or hide our collision 

        // shotting LAZZERRR 
        const shootLaser = () => {
            // create laser
            if(canShoot && lasers.length < LASER_MAX) {
                lasers.push({
                    x: shipX + 4 / 3 * (SHIP_SIZE/2) * Math.cos(shipAngle), 
                     y: shipY - 4 / 3 * (SHIP_SIZE/2) * Math.sin(shipAngle),
                    xv: LASER_SPD * Math.cos(shipAngle) / 30, 
                    yv: -LASER_SPD * Math.sin(shipAngle) / 30,
                    dist: 0,
                    explodeTime: 0
                })
                // perevent shooting
                canShoot = false; 
                fxLaser.play(); 
            }
        }

        function Music(srcHigh, srcLow){
            this.soundHigh = new Audio(srcHigh); 
            this.soundLow = new Audio(srcLow); 
            this.low = true; 
            this.tempo = 1.0; 
            this.beatTime = 0;

            this.play = function() {
                if(MUSIC_ON) {

                    if(this.low) {
                        this.soundLow.play(); 
                    } else {
                        this.soundHigh.play()
                    }
                    this.low = !this.low; 
                }
            }
            this.setAsteriodRatio = function(ratio) {
                this.tempo = 1.0 - 0.75 *  (1.0 -ratio); 
            }

            this.tick = function() {
                if(this.beatTime === 0) {
                    this.play(); 
                    this.beatTime = Math.ceil(this.tempo * 30); 

                } else {
                    this.beatTime--; 
                }
            }
        }

        function Sound(src, maxStream = 1, vol = 1.0)  {
            this.streamNum = 0; 
            this.stream = []; 
            for(let i = 0; i < maxStream; i++) 
            {
                this.stream.push(new Audio(src)); 
                this.stream[i].volume = vol 

            }
            this.play = function() {
                if(SOUND_ON) {

                    this.streamNum = (this.streamNum + 1) % maxStream; 
                    this.stream[this.streamNum].play(); 
                }
            }
            this.stop = function() {
                this.stream[this.streamNum].pause(); 
                this.stream[this.streamNum].currentTime = 0; 
            }
        }


 const update = (ctx, frameCount, ship, roids, canvas, distBetweenPoints, destroyAsteroid, newGame) =>{

    shipX = ship.x; 
    shipY = ship.y;  

let blinkOn = blinkNum % 2 == 0; 
let exploding = ship.explodeTime > 0

// tick music 
music.tick(); 

// laser stuff
for(let laser of lasers) {
// check distance of travel 
    if(laser.dist > laserDis * canvas.width) {
        lasers.splice(laser, 1) // remove one 
        continue;  // re start from the top, start new event 
        
    }
        // handle the explosion 
        if(laser.explodeTime > 0) {
            laser.explodeTime--; 

            // destroy the laser after the duration is up 
            if(laser.explodeTime === 0 ) {
                lasers.splice(laser, 1); 
                continue; 
            } 
        }else {
            //move laser 
            laser.x += laser.xv; 
            laser.y += laser.yv; 
            // calcl distance 
            // c = 
            laser.dist += Math.sqrt(Math.pow(laser.xv, 2) + Math.pow(laser.yv, 2)); 
        }
    

       
   
    // handle edge screen laser
    if (laser.x < 0) {
        laser.x = canvas.width; 
    } else if (laser.x > canvas.width) {
        laser.x = 0; 
    }
    if (laser.y < 0) {
        laser.y = canvas.width; 
    } else if (laser.y > canvas.height) {
        laser.y = 0; 
    }
} 





    // draw space 
ctx.fillStyle = 'black'; 
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); 


// thrust the ship 
if(thrusting && !ship.dead) {
    thrust.x += SHIP_THRUST * Math.cos(shipAngle)/5
    thrust.y += SHIP_THRUST * Math.sin(shipAngle)/5
    fxthrust.play(); 

    if (!exploding && blinkOn) {
        // draw thruster
        ctx.fillStyle = 'red'; 
        ctx.strokeStyle = 'yellow'; 
        ctx.lineWidth = SHIP_SIZE / 10; 
        ctx.beginPath(); 
        ctx.moveTo( // rear left 
        ship.x - ship.r * (2/3 * Math.cos(shipAngle) + 0.5 * Math.sin(shipAngle)), 
        ship.y + ship.r * (2/3 * Math.sin(shipAngle) - 0.5 * Math.cos(shipAngle))
        ); 
        ctx.lineTo ( // rear center behind ship 
            ship.x - ship.r * 6/3 * Math.cos(shipAngle), 
            ship.y + ship.r * 6/3 * Math.sin(shipAngle) 
            ); 
            ctx.lineTo ( // right side 
                ship.x - ship.r * (2/3 * Math.cos(shipAngle) - 0.5 * Math.sin(shipAngle)), 
                ship.y + ship.r * (2/3 * Math.sin(shipAngle) + 0.5 * Math.cos(shipAngle))
            )
        ctx.closePath(); // closes triangel 
        ctx.fill(); 
        ctx.stroke(); 
   
    } 
} else {
    thrust.x -= FRICTION * thrust.x /30; 
    thrust.y -= FRICTION * thrust.y /30; 
    fxthrust.stop(); 
}
// handle edge of screen 
if(ship.x < 0 - ship.r/6) {
    ship.x = ctx.canvas.width + ship.r/6; 
} else if (ship.x > ctx.canvas.width + ship.r/6){
    ship.x = 0 - ship.r/6; 
}
if(ship.y < 0 - ship.r/6) {
    ship.y = ctx.canvas.height + ship.r/6; 
} else if (ship.y > ctx.canvas.height + ship.r/6){
    ship.y = 0 - ship.r/6; 
}
const explodeShip = () =>{
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * 30);
    fxexplode.play();  
    // ctx.fillStyle = 'lime'; 
    // ctx.strokeStyle = 'lime'; 
    // ctx.beginPath(); 
    // ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI *  2, false); 
    // ctx.fill(); 
    // ctx.stroke(); 
}
const gameOver = () => {
    ship.dead = true; 
    text = 'Game Over'; 
    textAlpha = 1; 

}

const drawShip = (x, y, a, color = 'white') => {
    ctx.strokeStyle = color
    ctx.lineWidth = SHIP_SIZE / 20; 
    ctx.beginPath(); 
    ctx.moveTo( // nose of ship 
        x +  4 /3 * ship.r * Math.cos(a), 
        y -  4 /3 * ship.r * Math.sin(a)
    ); 
    ctx.lineTo ( // left side 
        x - ship.r * (2/3 * Math.cos(a) + Math.sin(a)), 
        y + ship.r * (2/3 * Math.sin(a) - Math.cos(a))
    ); 
    ctx.lineTo ( // right side 
        x - ship.r * (2/3 * Math.cos(a) - Math.sin(a)), 
        y + ship.r * (2/3 * Math.sin(a) + Math.cos(a))
    )
    ctx.closePath(); // closes triangel 
    ctx.stroke(); 
}
// draw ship
if(!exploding) {
    if(blinkOn && !ship.dead) {
        drawShip(ship.x, ship.y, shipAngle )
    }
    // hadle blink 
    if(blinkNum > 0) {
        // reduce blink time 
        blinkTime--; 
        // reduce the blink num 
        if (blinkTime == 0) {
            blinkTime = Math.ceil(SHIP_BLINK_DUR * 30)
            blinkNum--; 
        }
    }

} else {
    // draw the explosion 
    ctx.fillStyle = 'darkred'; 
    ctx.beginPath(); 
    ctx.arc(ship.x, ship.y, ship.r * 1.5, 0 , Math.PI *  2, false); 
    ctx.fill()
    ctx.fillStyle = 'red'; 
    ctx.beginPath(); 
    ctx.arc(ship.x, ship.y, ship.r * 1.3, 0 , Math.PI *  2, false); 
    ctx.fill(); 
    ctx.fillStyle = 'orange'; 
    ctx.beginPath(); 
    ctx.arc(ship.x, ship.y, ship.r * 1.0, 0 , Math.PI *  2, false); 
    ctx.fill(); 
    ctx.fillStyle = 'yellow'; 
    ctx.beginPath(); 
    ctx.arc(ship.x, ship.y, ship.r * 0.7, 0 , Math.PI *  2, false); 
    ctx.fill(); 
    ctx.fillStyle = 'white'; 
    ctx.beginPath(); 
    ctx.arc(ship.x, ship.y, ship.r * 0.5 , 0 , Math.PI *  2, false); 
    ctx.fill(); 

}
// to show our boundaries for collision ship 
if(SHOW_BOUNDIG) {
    ctx.strokeStyle = 'lime'; 
    ctx.beginPath(); 
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI *  2, false); 
    ctx.stroke(); 
}

// center dot
if(SHOW_CENTER_DOT) {
    ctx.fillStyle = 'red'; 
ctx.fillRect(ship.x - 1, ship.y -1, 2 , 2); 
}

// draw LAzer 
for( let i = 0 ; i< lasers.length; i++) {
    if(lasers[i].explodeTime === 0){
        ctx.fillStyle = 'salmon'; 
        ctx.beginPath(); 
        ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 15, 0 , Math.PI * 2, false); 
        ctx.fill();
    } else {
        ctx.fillStyle = 'orange'; 
        ctx.beginPath(); 
        ctx.arc(lasers[i].x, lasers[i].y, ship.r * 0.75, 0 , Math.PI * 2, false); 
        ctx.fill();
        ctx.fillStyle = 'salmon'; 
        ctx.beginPath(); 
        ctx.arc(lasers[i].x, lasers[i].y, ship.r * 0.5, 0 , Math.PI * 2, false); 
        ctx.fill();
        ctx.fillStyle = 'pink'; 
        ctx.beginPath(); 
        ctx.arc(lasers[i].x, lasers[i].y, ship.r * 0.25, 0 , Math.PI * 2, false); 
        ctx.fill();
    }
} 


// detect laser hit on astroids
let ax, ay, ar, lx, ly; 
for (let i = roids.length -1; i >= 0; i--) {
// grab the astroid prop 
    ax = roids[i].x; 
    ay = roids[i].y; 
    ar = roids[i].r; 
    // lop over laser
    for( let j = lasers.length -1 ;j >= 0;  j--) {
        lx = lasers[j].x; 
        ly = lasers[j].y; 

        //dectect hits
        if(lasers[j].explodeTime === 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
            // remove the laser
            // lasers.splice(j, 1); 

            //destroy the astroid and activate the laser explosion 
            // roids.splice(i, 1); 
            destroyAsteroid(i); 
            lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * 30); 
            break; 
        }
    }

}
// check for astroids collision 
if( !exploding) {
    if( blinkNum === 0 && !ship.dead) {
        for(let i = 0; i < roids.length; i++ ) { 
            if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r){
                explodeShip(); 
                destroyAsteroid(i); 
                break; 
            }
        }
    }
   
    //  rotate ship 
    shipAngle += shipRot; 
    // move the ship
    ship.x += thrust.x/30; 
    ship.y -= thrust.y /30; 
} else {
    ship.explodeTime--; 
    if(ship.explodeTime == 0 ){
        blinkNum = Math.ceil(SHIP_INV_DUR/ SHIP_BLINK_DUR)
        if(blinkOn) {
            lives--; 
            if(lives === 0) {
                gameOver(); 
            } else {
                ship.x = 700/2; 
                ship.y = 500/2; 
                thrust.x = 0; 
                thrust.y = 0; 
                shipAngle = 90 / 180 * Math.PI; 
            }
        }
      if(blinkNum > 0) {
        // reduce blink time 
        blinkTime--; 
        // reduce the blink num 
        if (blinkTime == 0) {
            blinkTime = Math.ceil(SHIP_BLINK_DUR * 30)
            blinkNum--; 
        }
        }
      
    }

    console.log(ship, 'outisde')
}





// draw the astroids
    let  x, y, r, a, vert, offset; 
 for( let i = 0; i < roids.length; i++) {
    ctx.strokeStyle = 'slategray'; 
    ctx.lineWidth = SHIP_SIZE / 20; 
    // astroids prop 
    x = roids[i].x; 
    y = roids[i].y; 
    r = roids[i].r; 
    a = roids[i].a; 
    vert = roids[i].vert; 
    offset = roids[i].offset; 
    // draw path
    ctx.beginPath(); 
    ctx.moveTo(
        x + r * offset[0] *Math.cos(a),
        y + r * offset[0]* Math.sin(a)
    )
    //draw the polygon
        for( let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / vert),
            ); 
        }
        ctx.closePath();
        ctx.stroke();

    // to show our boundaries for collision AStroids
    if(SHOW_BOUNDIG) {
    ctx.strokeStyle = 'lime'; 
    ctx.beginPath(); 
    ctx.arc(x, y, r, 0, Math.PI *  2, false); 
    ctx.stroke(); 
    }
 }
    // move astroids
    for(let i = 0; i < roids.length; i++ ) {
        roids[i].x += roids[i].xv; 
        roids[i].y += roids[i].yv; 
    //handle edge of screen 
        if(roids[i].x < 0 - roids[i].r/1.2){
            roids[i].x = canvas.width + roids[i].r/1.2; 
        } else if (roids[i].x > canvas.width + roids[i].r/1.2) {
            roids[i].x = 0  - roids[i].r/1.2
        }
        if(roids[i].y < 0 - roids[i].r/1.2){
            roids[i].y = canvas.height + roids[i].r/1.2; 
        } else if (roids[i].y > canvas.height + roids[i].r/1.2) {
            roids[i].y = 0  - roids[i].r/1.2
        }
    }

    // draw the game text
    if(textAlpha > 0) {
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 
        ctx.fillStyle = "rgb(255, 255, 255, " + textAlpha + ")"; 
        ctx.font = ' small-caps ' + TEXT_SIZE + 'px dejavu sans mono'; 
        ctx.fillText(text, canvas.width / 2, canvas.height * 0.75); 
        textAlpha -= (1.0 / TEXT_FADE_TIME / 30); 
    } else if(ship.dead) {
        newGame();
    }
    // draw lives 
    let lifeColor; 
    for( let i = 0; i< lives; i++) {
        lifeColor = exploding && i === lives -1 ? 'red' : 'white'; 
        drawShip (SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor); 
    }
    // draw the score 
    ctx.textAlign = 'right'; 
    ctx.textBaseline = 'middle'; 
    ctx.fillStyle = 'white';  
    ctx.font =  TEXT_SIZE + 'px dejavu sans mono'; 
    ctx.fillText(score, canvas.width - SHIP_SIZE /2 , SHIP_SIZE); 
    
     // draw the highest score 
     ctx.textAlign = 'center'; 
     ctx.textBaseline = 'middle'; 
     ctx.fillStyle = 'white';  
     ctx.font = (TEXT_SIZE * 0.60 )+ 'px dejavu sans mono'; 
     ctx.fillText('BEST '+ scoreHigh, canvas.width/2 , SHIP_SIZE); 

       const KeyDown = (e) => {
        if(ship.dead) {
            return; 
        }
        switch(e.keyCode) {
            case 32: //laser 
            shootLaser(lasers);  
            break; 
            case 37: //left 
            shipRot = TURN_SPEED /180 * Math.PI/30; 
            break; 
            case 38:// up 
            thrusting = true; 
             break; 
            case 39: // right
            shipRot = -TURN_SPEED /180 * Math.PI/30; 
            break; 
        
        }
       }
    
       const KeyUp = (e) => {
        if(ship.dead) {
            return; 
        }
        switch(e.keyCode) {
            case 32: //laser 
            canShoot = true;  
            break;
            case 37: //left
            shipRot = 0; 
            break; 
            case 38://up
            thrusting = false;  
             break; 
            case 39: //right
            shipRot = 0; 
            break; 
        
        }
       }
    
    document.addEventListener('keydown', KeyDown); 
    document.addEventListener('keyup', KeyUp); 
 }

 
  




 useEffect(() => { 
    const canvas = canvasRef.current
    // console.log('line 16',canvas); 
    // fix pixel and make crispt 
    let rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    // context.scale(devicePixelRatio, devicePixelRatio);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    const context = canvas.getContext('2d'); 
    const newShip = () => {
        return   {
              x: canvas.width /2, 
              y: canvas.height / 2, 
              r: SHIP_SIZE/2 ,
              explodeTime: 0,
              dead: false
          }
      }


   
    // set up astroids
    const newAstroid = (x, y, r) => {
        let lvlMult = 1 + 0.1 * level
        var roid = {
            x: x, 
            y: y, 
            xv: Math.random() * ROIDS_SPD * lvlMult/ 30 * (Math.random()< 0.5 ? 1 : -1), 
            yv: Math.random() * ROIDS_SPD * lvlMult / 30 * (Math.random()< 0.5 ? 1 : -1),
            r: r, 
            a: Math.random() * Math.PI * 2,//radians 
            vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
            offset: []
        
        }
        // create the vertex offset array 
        for( let i = 0; i < roid.vert; i++) {
            roid.offset.push(Math.random()* ROIDS_JAG * 2 + 1 - ROIDS_JAG)
        }
         return roid; 
        }
     const distBetweenPoints = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 -y1, 2)); 
     }

    const AstroidBelt = () => {
        roids = []; 
        roidsTotal = (ROIDS_NUM + level) * 7; 
        roidsLeft = roidsTotal; 
        let x, y; 
        for(var i = 0; i < ROIDS_NUM + level ; i++){
            do {
                x = Math.floor(Math.random() * canvas.width); 
                y = Math.floor(Math.random() * canvas.height);
            } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r){
                roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 2))); 
            }
        }
       }
       let frameCount = 0
       let animationFrameId
       const newLevel = () => {
        text = 'Level ' + (level + 1); 
        textAlpha = 1.0; 
           AstroidBelt()
       }
       // new game 
       const newGame = () => {
           level = 1; 
           lives = GAME_LIVES; 
           score = 0; 
           thrusting = false; 
           ship = newShip(); 

           // ge the high score from storage 
           var scoreStr = localStorage.getItem(SAVE_KEY_SCORE); 
           if(scoreStr === null) {
            scoreHigh = 0; 
           } else {
            scoreHigh = parseInt(scoreStr)
           }
           newLevel(); 
       }
        // set up the game params 
        newGame(); 
    
       
       const destroyAsteroid = (index)  => {
        let x = roids[index].x; 
        let y = roids[index].y; 
        let r = roids[index].r; 
        // split the astroid in two if neccessaty
        if(r === Math.ceil(ROIDS_SIZE /2)) {
            roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 4))); 
            roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 4))); 
            score += ROIDS_PTS_LGE; 
        } else if(r == Math.ceil(ROIDS_SIZE / 4)) {
            roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 8))); 
            roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 8))); 
            score += ROIDS_PTS_MED; 
        } else {
            score += ROIDS_PTS_SML; 
        }

        //check high score
        if(score > scoreHigh) {
            scoreHigh = score; 
            localStorage.setItem(SAVE_KEY_SCORE, scoreHigh)
        }

        // destroy the asteroid
        roids.splice(index, 1); 
        fxhit.play(); 

        // calculate the ratio of astroids
        roidsLeft--; 
        music.setAsteriodRatio(roidsLeft === 0 ? 1 : roidsLeft /roidsTotal)
        // new level when no more asteroids
        if(roids.length === 0) {
            level++ 
            newLevel()
        }
       }
       AstroidBelt()

    

      

    //Our draw came here
    const render = () => {
      frameCount = frameCount + 30
      update(context, frameCount, ship, roids, canvas, distBetweenPoints, destroyAsteroid, newGame)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }

 },
 [update])
  return (
    <canvas className='gameBoard' ref={canvasRef}{...props}>

    </canvas>
  )
}

export default GameBoard

// add a new component = drawings
//add a new component = ship

