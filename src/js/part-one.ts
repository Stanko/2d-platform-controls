// ----- Types
type Vector = {
  x: number;
  y: number;
};

type Trail = Array<{
  color: string;
  position: Vector;
}>;

// ----- Constants

const FRAME_DURATION: number = 1000 / 60;

// ----- Game state

// Game speed
const speed: number = 1;

const acceleration: number = 1 * speed;
const deceleration: number = 2 * speed;
const maxSpeed: number = 5 * speed;

const velocity: Vector = {
  x: 0,
  y: 0,
};

const position: Vector = {
  x: 0,
  y: 0,
};

const trailMaxLength = 50;
const trail: Trail = [];
let trailColor;

// Render
const statusElement = document.querySelector('.status') as HTMLPreElement;
const playerElement = document.querySelector('.player') as HTMLDivElement;
const trailElement = document.querySelector('.trail') as HTMLDivElement;

function render() {
  // status
  statusElement.innerHTML = `position: ${JSON.stringify(position)}\n`;
  statusElement.innerHTML += `velocity: ${JSON.stringify(velocity)}`;

  // player
  playerElement.style.transform = `translate(${
    position.x
  }px, ${-position.y}px)`;
}

function renderTrail() {
  let trailHTML: string = '';

  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    const { x, y } = point.position;

    trailHTML += `<div 
      class="trail-point" 
      style="
        background: ${point.color};
        transform: translate(${x}px, ${y}px);
      "></div>`;
  }

  trailElement.innerHTML = trailHTML;
}

// ----- Keyboard input
const activeKeys: Record<string, boolean> = {};

const keys = {
  SPACE: ' ',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
};

window.addEventListener('keydown', (e) => {
  activeKeys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  delete activeKeys[e.key];
});

// ----- Update
function cap(value: number, min: number, max: number) {
  if (value < min) {
    trailColor = 'silver';
    return min;
  }

  if (value > max) {
    trailColor = 'silver';
    return max;
  }

  return value;
}

function updateHorizontalMovement(delta: number) {
  const isLeftPressed = activeKeys[keys.LEFT];
  const isRightPressed = activeKeys[keys.RIGHT];

  const isExclusivelyLeft = isLeftPressed && !isRightPressed;
  const isExclusivelyRight = isRightPressed && !isLeftPressed;

  const isMovingRight = velocity.x > 0;
  const isMovingLeft = velocity.x < 0;

  trailColor = 'silver';

  // Increase velocity while arrows are pressed
  if (isExclusivelyLeft) {
    trailColor = 'lime';
    if (isMovingRight) {
      velocity.x -= deceleration * delta;
    } else {
      velocity.x -= acceleration * delta;
    }
  } else if (isExclusivelyRight) {
    trailColor = 'lime';
    if (isMovingLeft) {
      velocity.x += deceleration * delta;
    } else {
      velocity.x += acceleration * delta;
    }
  } else {
    // Deaccelerate if both, on no arrows are pressed
    trailColor = 'red';

    if (isMovingRight) {
      velocity.x -= deceleration * delta;

      // Don't start moving in the opposite direction
      if (velocity.x < 0) {
        velocity.x = 0;
      }
    } else if (isMovingLeft) {
      velocity.x += deceleration * delta;

      // Don't start moving in the opposite direction
      if (velocity.x > 0) {
        velocity.x = 0;
      }
    }
  }

  // Cap at maximum speed
  velocity.x = cap(velocity.x, -maxSpeed, maxSpeed);

  position.x = position.x + velocity.x;
}

function updateTrail() {
  const last = trail[trail.length - 1];

  const hasMoved =
    position.x !== last?.position.x || position.y !== last?.position.y;

  if (hasMoved) {
    trail.push({
      color: trailColor,
      position: {
        ...position,
      },
    });

    if (trail.length > trailMaxLength) {
      trail.shift();
    }

    // For performance, trail is only rendered when it is changed
    renderTrail();
  }
}

// ----- Game loop
let lastUpdate = performance.now();

function gameLoop() {
  const now = performance.now();
  const delta = (now - lastUpdate) / FRAME_DURATION;

  // Update game state
  updateHorizontalMovement(delta);
  updateTrail();

  // Render
  render();

  // Update time
  lastUpdate = now;

  // Next frame
  requestAnimationFrame(gameLoop);
}

gameLoop();
