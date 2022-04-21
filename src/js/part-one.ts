import { Trail, Vector } from './types';
import easings from './easings';

// ----- Constants

const FRAME_DURATION: number = 1000 / 60;

// ----- Game state

// Game speed
const speed: number = 1;

// Movement
const accelerationGround: number = 1 * speed;
const decelerationGround: number = 2 * speed;
const maxSpeed: number = 8 * speed;

const decelerationAir: number = 0.5 * speed;

// Jumping
const initialJumpVelocity: number = 8 * speed;
const jumpDeceleration: number = 0.4 * speed;
const jumpFall: number = 1 * speed;
const jumpAllowThreshold: number = 30;

const velocity: Vector = {
  x: 0,
  y: 0,
};

const position: Vector = {
  x: 0,
  y: 0,
};

let isOnGround: boolean = true;
let isJumpLegal: boolean = true;

const trailMaxLength: number = 200;
const trail: Trail = [];
let trailColor: string;

// Render
const statusElement = document.querySelector('.status') as HTMLPreElement;
const playerElement = document.querySelector('.player') as HTMLDivElement;
const trailElement = document.querySelector('.trail') as HTMLDivElement;
const jumpElement = document.querySelector('.jump') as HTMLDivElement;

function render() {
  // status
  statusElement.innerHTML = `position: ${JSON.stringify(position)}\n`;
  statusElement.innerHTML += `velocity: ${JSON.stringify(velocity)}`;
  statusElement.innerHTML += isJumpLegal
    ? '<div class="jump-status jump-status--legal" />'
    : '<div class="jump-status jump-status--illegal" />';

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
        transform: translate(${x}px, ${-y}px);
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

  if (e.key === keys.SPACE && !e.repeat) {
    jumpElement.style.transform = `translate(${
      position.x
    }px, ${-position.y}px)`;
    jumpElement.innerHTML = position.y.toFixed(0);
  }
});

window.addEventListener('keyup', (e) => {
  delete activeKeys[e.key];
});

// ----- Update
function updateHorizontalMovement(delta: number) {
  const isLeftPressed = activeKeys[keys.LEFT];
  const isRightPressed = activeKeys[keys.RIGHT];

  const isExclusivelyLeft = isLeftPressed && !isRightPressed;
  const isExclusivelyRight = isRightPressed && !isLeftPressed;

  const isMovingRight = velocity.x > 0;
  const isMovingLeft = velocity.x < 0;

  const deceleration = isOnGround ? decelerationGround : decelerationAir;

  if (isExclusivelyLeft) {
    trailColor = 'lime';

    // Left arrow is pressed
    if (isMovingRight) {
      // Slow down if player is already moving right
      velocity.x -= deceleration * delta;
    } else {
      // If not, accelerate to the left
      velocity.x -= accelerationGround * delta;
    }
  } else if (isExclusivelyRight) {
    trailColor = 'lime';

    // Right arrow is pressed
    if (isMovingLeft) {
      // Slow down if player is already moving left
      velocity.x += deceleration * delta;
    } else {
      // If not, accelerate to the right
      velocity.x += accelerationGround * delta;
    }
  } else {
    trailColor = 'red';

    // Either both or no horizontal arrows are pressed
    // Decelerate to the stop

    if (isMovingRight) {
      // Player is moving right, decelerate
      velocity.x -= deceleration * delta;

      // When velocity starts going in the opposite direction, stop the player
      if (velocity.x < 0) {
        velocity.x = 0;
      }
    } else if (isMovingLeft) {
      // Player is moving left, decelerate
      velocity.x += deceleration * delta;

      // When velocity starts going in the opposite direction, stop the player
      if (velocity.x > 0) {
        velocity.x = 0;
      }
    }
  }

  // Cap at maximum speed
  if (velocity.x > maxSpeed) {
    trailColor = 'silver';
    velocity.x = maxSpeed;
  } else if (velocity.x < -maxSpeed) {
    trailColor = 'silver';
    velocity.x = -maxSpeed;
  }

  // Update player's position using new velocity value
  position.x += velocity.x * delta;
}

function updateVerticalMovement(delta: number) {
  const isJumpPressed: boolean = activeKeys[keys.SPACE];
  isOnGround = position.y === 0;

  if (isOnGround) {
    if (isJumpPressed && isJumpLegal) {
      velocity.y = initialJumpVelocity;
      trailColor = 'blue';
      isJumpLegal = false;
    }
  } else {
    if (isJumpPressed && velocity.y > 0) {
      trailColor = 'blue';
      velocity.y -= jumpDeceleration * delta;
    } else {
      velocity.y -= jumpFall * delta;
      // velocity.y *= 1.1;
      trailColor = 'purple';
    }
  }

  // Update position
  position.y += velocity.y * delta;

  // Prevent player going into the ground
  if (position.y < 0) {
    position.y = 0;
    velocity.y = 0;
  }

  if (!isJumpPressed && position.y < jumpAllowThreshold) {
    // allow jumping again
    isJumpLegal = true;
  }
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
let lastUpdate: number = performance.now();

function gameLoop() {
  const now = performance.now();
  const delta = (now - lastUpdate) / FRAME_DURATION;

  // Update game state
  updateHorizontalMovement(delta);
  updateVerticalMovement(delta);
  updateTrail();

  // Render
  render();

  // Update time
  lastUpdate = now;

  // Next frame
  requestAnimationFrame(gameLoop);
  // setTimeout(gameLoop, 30);
}

gameLoop();
