// setting objects 
// board
let board
let boardWidth = 360; // measurements from size of background
let boardHeight = 576;
let context;

// doodler 
let doodlerWidth = 46; // Set size of doodler
let doodlerHeight = 46;
let doodlerX = boardWidth/2 - doodlerWidth/2; // set position of doodler X and Y
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = { // make the doodler an object 
    img : null, 
    x : doodlerX, // need the following arguments for any images 
    y : doodlerY,
    width : doodlerWidth,
    height : doodlerHeight
}

// physics (game movements)
let velocityX = 0;
let velocityY = 0; // doodler jump speed
let initialVelocityY = -8;  // starting velocity Y
let gravity = 0.4;

// platforms (array of platform objects since we need a lot)
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platfromImg;

// score 
let score = 0; 
let maxScore = 0;

// game over 
let gameOver = false;

// sfx 
let jumpSound = new Audio("./sfx jump.wav");
let gameOverSound = new Audio("./sfx ooga-pucanje.mp3");

// loading objects so that they show on screen 
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    // draw doodler
    // context.fillStyle = "green";
    // context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height)

    // load image 
    doodlerImg = new Image();
    doodlerImg.src = "./Doodler.png"; // dont forget the .src or else no show
    doodler.img = doodlerImg
    doodlerImg.onload = function () { // ensure that the image loads before we asign in 
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height); //doodler.img = the image
    }

    doodlerRightImg = new Image();
    doodlerRightImg.src = "./DoodlerRight.png";

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./DoodlerLeft.png"; 

    platfromImg = new Image();
    platfromImg.src = "./platform.png";
    
    velocityY = initialVelocityY;
    placePlatforms(); // place initial platforms onto the canvas
    requestAnimationFrame(update); // the game loop 
    document.addEventListener("keydown", moveDoodler); //calls function to move doodler
}

// game loop 
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return; 
    }
    context.clearRect(0,0,boardWidth, boardHeight);

    // doodler (draws the doodler over and over again)   
    doodler.x +=velocityX;  // update x value
    if (doodler.x > boardWidth) { // so the doodler wraps around the screen 
        doodler.x = 0;  // from right to appear to left 
    }
    else if (doodler.x + doodlerWidth < 0){
        doodler.x = boardWidth; // from left to appear to right 
    }

    // velocity 
    velocityY += gravity; 
    doodler.y += velocityY;

    if (doodler.y > boardHeight) {
        gameOver = true;
        gameOverSound.play();
    }    

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // platforms 
    for (i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= initialVelocityY; // slide platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            jumpSound.play();
            velocityY = initialVelocityY; // jump of the platform
        }
        context.drawImage(platform.img, platform.x, platform.y, platformWidth, platformHeight); 
    }

    // clear platforms and add new platforms
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) { // platform has fallen off the canvas
        platformArray.shift(); // removes first element from the array
        newPlatform(); // replace with new platform on top
    }

    // update score
    updateScore(); 
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        //context.fillText ("Happy Birthday! Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*7/8);
            const line1 = "Happy Birthday!";
            const line2 = "Game Over: Press 'Space' to Restart";

            context.font = "20px Arial";
            context.textAlign = "center";
            context.textBaseline = "top";

            const padding = 10;
            const lineHeight = 28;

            const x = boardWidth / 2;
            const y = boardHeight * 0.75;

            const maxTextWidth = Math.max(
                context.measureText(line1).width,
                context.measureText(line2).width
            );

            const rectX = x - maxTextWidth / 2 - padding;
            const rectY = y - padding;
            const rectWidth = maxTextWidth + padding * 2;
            const rectHeight = lineHeight * 2 + padding * 2;

            // Draw white background
            context.fillStyle = "white";
            context.fillRect(rectX, rectY, rectWidth, rectHeight);

            // Draw black outline
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.strokeRect(rectX, rectY, rectWidth, rectHeight);

            // Draw black text
            context.fillStyle = "black";
            context.fillText(line1, x, y);
            context.fillText(line2, x, y + lineHeight);
    }
}

// moving the doodler
function moveDoodler(e) { // takes in event e (key event)
    if (e.code == "ArrowRight" || e.code == "KeyD") {
        velocityX = 4; // moves the doodler 4 pixels to the right
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == 'Space' && gameOver) {
        // reset game
        doodler = { // make the doodler an object 
            img : doodlerImg, 
            x : doodlerX,
            y : doodlerY,
            width : doodlerWidth,
            height : doodlerHeight
        }
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0 
        maxScore = 0 
        gameOver = false;
        placePlatforms();
    }
}

// platform 
function placePlatforms() {
    platformArray = [];

    // starting platforms 
    let platform = {
        img : platfromImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);

    // platform = {
    //     img : platfromImg,
    //     x : boardWidth/2,
    //     y : boardHeight - 150,
    //     width : platformWidth,
    //     height : platformHeight
    // }

    // platformArray.push(platform);

    // randomised platforms 
    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * baordWidth*3/4
        let platform = {
        img : platfromImg,
        x : randomX,
        y : boardHeight - 75*i - 150,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * baordWidth*3/4
    let platform = {
        img : platfromImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a top left corner doesnt reach b top right corner
           a.x + a.width > b.x &&   // a top right corner passes b top left corner
           a.y < b.y + b.height &&  // a top left corner doesnt reach b bottom left corner
           a.y + a.height > b.y;    // a bottom left corner passes b top left coner
           
}

function updateScore() {
    let points = Math.floor (50*Math.random()); 
    if (velocityY < 0) { // going up 
        maxScore += points; 
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points; 
    }
}