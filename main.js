const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

const scoreDisplay = document.querySelector(".high-score");
const reset = document.querySelector(".reset");

let highScore = parseInt(localStorage.getItem("highScore"));
if (!highScore) {
  highScore = 0;
}
scoreDisplay.innerHTML = `High Score: ${highScore}`;

let rightPressed = false;
let leftPressed = false;

let score = 0;
let levelUp = true;
let speed = 3;

reset.addEventListener("click", () => {
  localStorage.setItem("highScore", "0");
  document.location.reload();
  // score = 0;
  // scoreDisplay.innerHTML = "High Score: 0";
  // drawBlocks();
});

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  }
  if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  }
  if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function drawScore() {
  ctx.font = "16px lato";
  ctx.fillStyle = "#230c33";
  ctx.fillText("Score: " + score, 8, 20);
}

function movePaddle() {
  if (rightPressed) {
    if (paddle.x + paddle.width < canvas.width) {
      paddle.x += 7;
    }
  }

  if (leftPressed) {
    if (paddle.x > 0) paddle.x -= 7;
  }
}

let ball = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  dx: speed,
  dy: -speed + 1,
  radius: 7,
  draw: function () {
    ctx.beginPath();
    ctx.fillStyle = "#230c33";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  },
};

let paddle = {
  height: 10,
  width: 76,
  x: canvas.width / 2 - 76 / 2,
  draw: function () {
    ctx.beginPath();
    ctx.rect(this.x, canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = "#230c33";
    ctx.closePath();
    ctx.fill();
  },
};

/////////////////////////////////////////////////////
// PLAY GAME

function play() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBlocks();
  ball.draw();
  paddle.draw();
  movePaddle();
  blockCollision();
  difficultyLevelUp();
  drawScore();

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce off walls
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  // Bounce off top / bottom
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // reset score
  if (ball.y + ball.radius > canvas.height) {
    if (score > parseInt(localStorage.getItem("highScore"))) {
      localStorage.setItem("highScore", score.toString());
      scoreDisplay.innerHTML = `High Score: ${score}`;
    }
    score = 0;
    generateBlocks();
    ball.dx = speed;
    ball.dy = -speed + 1;
  }

  // Bounce off paddle
  if (
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.y + ball.radius >= canvas.height - paddle.height
  ) {
    ball.dy = -ball.dy;
    console.log("hit");
  }

  requestAnimationFrame(play);
}

///////////////////////////////////////////
///////////////////////////////////////////
// BLOCKS

let blockRowCount = 3;
let blockColCount = 5;
let blockWidth = 70;
let blockHeight = 20;
let blockGap = 20;
let blockOffsetTop = 30;
let blockOffsetLeft = 35;

let blocks = [];

function generateBlocks() {
  for (let c = 0; c < blockColCount; c++) {
    blocks[c] = [];
    for (let r = 0; r < blockRowCount; r++) {
      blocks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function drawBlocks() {
  for (let c = 0; c < blockColCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      if (blocks[c][r].status === 1) {
        let blockX = c * (blockWidth + blockGap) + blockOffsetLeft;
        let blockY = r * (blockHeight + blockGap) + blockOffsetTop;

        blocks[c][r].x = blockX;
        blocks[c][r].y = blockY;

        ctx.beginPath();
        ctx.rect(blockX, blockY, blockWidth, blockHeight);
        ctx.fillStyle = "#230c33";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function blockCollision() {
  for (let c = 0; c < blockColCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      let bl = blocks[c][r];

      if (bl.status === 1) {
        if (
          ball.x >= bl.x &&
          ball.x <= bl.x + blockWidth &&
          ball.y >= bl.y &&
          ball.y <= bl.y + blockHeight
        ) {
          ball.dy = -ball.dy;
          bl.status = 0;
          score++;
        }
      }
    }
  }
}

// Regenrate Blocks & speed up
function difficultyLevelUp() {
  if (score % 15 === 0 && score != 0) {
    if (ball.y > canvas.height / 2) {
      generateBlocks();
    }

    if (levelUp) {
      if (ball.dy > 0) {
        ball.dy += 1;
        levelUp = false;
      } else {
        ball.dy -= 1;
        levelUp = false;
      }
    }
  }

  if (score % 15 != 0) {
    levelUp = true;
  }
}

generateBlocks();
play();
