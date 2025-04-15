/* === Variables for the player ship === */

const playerShip = document.getElementById('player');         // Reference to the player's ship HTML element
const scoreDisplay = document.getElementById('score');        // Reference to the score display element
const statusFill = document.getElementById('statusFill');     // Reference to the status bar element (time/status bar)

let playerX = window.innerWidth / 2;                          // Initial X position of the ship (center of the screen)
let playerY = window.innerHeight * 0.6;                       // Initial Y position of the ship (60% down the screen)

let playerVelocityX = 0;                                      // Current horizontal velocity of the ship
let playerVelocityY = 0;                                      // Current vertical velocity of the ship

const acceleration = 0.5;                                     // How quickly the ship accelerates when a direction key is pressed
const deceleration = 0.98;                                    // Friction factor to simulate gradual slowing down (drag)


/* === Audio (files located in the "sounds" folder) === */

const bgMusic = new Audio('sounds/bgmusic.mp3');              // Background music
const explosionSound = new Audio('sounds/explosion.mp3');     // Explosion sound (when a target is hit)
const gameOverSound = new Audio('sounds/game-over.mp3');      // Game Over sound
bgMusic.loop = true;                                          // Set the background music to loop continuously

/* === Global Level and Score Variables === */

let level = 1;                                                // Start at level 1
let score = 0;                                                // Initialize the player's score to 0


/* === Highscore Variables === */

// Retrieve the highscore from localStorage, or set it to 0 if not available

let highscore = localStorage.getItem('highscore') ? parseInt(localStorage.getItem('highscore')) : 0;

/* === Targets Array (initial targets for level 1) === */

const targets = [
  {

    indicator: document.getElementById('target1'),        // DOM element for the target indicator (used to display target on screen)
    label: document.getElementById('label1'),             // DOM element for the target label
    targetX: 0,                                           // Destination X (in percentage of the screen size)
    targetY: 0,                                           // Destination Y (in percentage of the screen size)
    currentX: 50,                                         // Initial X position (in percentage of the screen size)
    currentY: 50,                                         // Initial Y position (in percentage of the screen size)
    speed: 0.02 + Math.random() * 0.05                    // Speed of target movement, randomized between 0.02 and 0.07

  },
  {

    indicator: document.getElementById('target2'),        // DOM element for the target indicator (target2 element on screen)
    label: document.getElementById('label2'),             // DOM element for the target label (label2 element on screen)
    targetX: 0,                                           // Destination X (in percentage of the screen size, initially set to 0)
    targetY: 0,                                           // Destination Y (in percentage of the screen size, initially set to 0)
    currentX: 60,                                         // Initial X position (in percentage of the screen size, starts at 60%)
    currentY: 40,                                         // Initial Y position (in percentage of the screen size, starts at 40%)
    speed: 0.02 + Math.random() * 0.05                    // Randomized speed for target movement, between 0.02 and 0.07

  },  
  {

    indicator: document.getElementById('target3'),        // DOM element representing the third target on the HUD
    label: document.getElementById('label3'),             // DOM element for the label associated with target3
    targetX: 0,                                           // Destination X position in percentage (initially 0%)
    targetY: 0,                                           // Destination Y position in percentage (initially 0%)
    currentX: 40,                                         // Starting X position at 40% of the HUD width
    currentY: 60,                                         // Starting Y position at 60% of the HUD height
    speed: 0.02 + Math.random() * 0.05                    // Movement speed: random value between 0.02 and 0.07

  }  
];


const miniRadar = document.getElementById('miniRadar');   // Reference to the mini radar HUD element
const miniRadarSize = 150;                                // Size of the radar in pixels (width and height assumed to be 150x150)


/* === Keyboard Control === */

const keysPressed = {};                                   // Object to track which keys are currently pressed

document.addEventListener('keydown', (e) => 
{

  keysPressed[e.key] = true;

});                                                       // When a key is pressed, mark it as true in keysPressed

document.addEventListener('keyup', (e) => 
{

  keysPressed[e.key] = false;

});                                                       // When a key is released, mark it as false in keysPressed


/* === Timer Variables === */

let startTime;                                            // Variable to store the timestamp when the game starts, 
                                                          // used for tracking elapsed time

let totalTime = 10;                                       // Set a fixed starting time of 10 seconds per level

/* === Function to update mini radar dots === */

function updateMiniRadarDots() 
{// Remove existing dots from the radar

  miniRadar.querySelectorAll('.mini-dot').forEach(dot => dot.remove());

  targets.forEach(({ currentX, currentY }) => 
  {// Loop through each target to create and place a new radar dot

    const miniDot = document.createElement('div');        // Create a new dot
    miniDot.className = 'mini-dot';                       // Assign the radar dot class

    // Convert percentage positions to pixel positions within radar size

    const radarX = (currentX / 100) * miniRadarSize;      // Convert the X position (in %) to pixels relative to radar size
    const radarY = (currentY / 100) * miniRadarSize;      // Convert the Y position (in %) to pixels relative to radar size


    // Adjust dot position and append to the radar display

    miniDot.style.left = `${radarX - 3}px`;               // Position the dot horizontally on the mini radar, centered by subtracting 3px
    miniDot.style.top = `${radarY - 3}px`;                // Position the dot vertically on the mini radar, centered by subtracting 3px
    miniRadar.appendChild(miniDot);                       // Add the mini dot to the mini radar display
    
  });
}


/* === Function to check collision between two rectangles === */

// Function to check collision between two rectangles (e.g., player and target)

// Returns true if the rectangles overlap (i.e., a collision is detected)

function isColliding(rect1, rect2) 
{

  return !(rect1.right < rect2.left ||                                   // rect1 is completely to the left of rect2
           rect1.left > rect2.right ||                                   // rect1 is completely to the right of rect2
           rect1.bottom < rect2.top ||                                   // rect1 is completely above rect2
           rect1.top > rect2.bottom);                                    // rect1 is completely below rect2

}


/* === Function to spawn additional targets for a new level === */

// Create a new visual indicator (DOM element) for the target

function spawnTargets(num) 
{

  for (let i = 0; i < num; i++) 
  {

    const newIndicator = document.createElement('div');                  // Creates a new div element in the DOM
    newIndicator.className = 'target-indicator';                         // Assign the class for styling
    document.querySelector('.hud-container').appendChild(newIndicator);  // Add the indicator to the HUD container


    // Create a label for the target with the text "TARGET"

    const newLabel = document.createElement('div');                     // Creates a new div element for the target label
    newLabel.className = 'target-label';                                // Sets the class name for styling purposes
    newLabel.textContent = "TARGET";                                    // Adds text content to the label that says "TARGET"
    document.querySelector('.hud-container').appendChild(newLabel);     // Appends the newly created label to the .hud-container element in the DOM


    // Add the new target with randomized position and speed to the targets array

    targets.push({

      indicator: newIndicator,                                          // DOM element representing the target
      label: newLabel,                                                  // DOM label element
      targetX: Math.random() * 80 + 10,                                 // New random destination X position (10–90%)
      targetY: Math.random() * 80 + 10,                                 // New random destination Y position (10–90%)
      currentX: Math.random() * 80 + 10,                                // Initial X position
      currentY: Math.random() * 80 + 10,                                // Initial Y position
      speed: 0.02 + Math.random() * 0.05                                // Movement speed of the target

    });

  }

}


/* === Main Game Loop === */

function gameLoop() 
{// Calculate elapsed time and update the status bar width

  // Calculate the elapsed time by subtracting the start time from the current time

  let elapsed = (Date.now() - startTime) / 1000; // in seconds

  // Calculate the remaining time by subtracting elapsed time from the total time

  let timeLeft = totalTime - elapsed;

  // Update the width of the status fill to visually represent the remaining time

  statusFill.style.width = (timeLeft / totalTime * 100) + "%";

  
  // If time runs out and there are still targets, trigger Game Over

  if (timeLeft <= 0 && targets.length > 0) 
  {
     
    gameOverSound.play();                                               // Play the game over sound when the game ends
    bgMusic.pause();                                                    // Pause the background music when the game is over
    bgMusic.currentTime = 0;                                            // Reset the background music to the beginning

    // Check if the current score is greater than the saved highscore

    // If so, update the highscore variable and store it in localStorage

    if (score > highscore) 
    {

      highscore = score;                                                // Update the highscore
      localStorage.setItem('highscore', highscore);                     // Save new highscore to localStorage

    }

    
    // Create and display the game over overlay with the final score and highscore

    const overlay = document.createElement('div');                     // Create a new div element to serve as the game over overlay

    overlay.className = 'gameover-overlay';                            // Set class for styling the overlay

    overlay.innerHTML = `
      <h1>GAME OVER!</h1>
      <p>Score: ${score}</p>  <!-- Display the current score -->
      <p>Highscore: ${highscore}</p>  <!-- Display the highest score -->
      <button id="restartBtn">PLAY AGAIN</button>  <!-- Button to restart the game -->
    `;                                                                // Set the HTML content for the overlay to display the game over 
                                                                      // message, score, highscore, and a restart button

    document.body.appendChild(overlay);                               // Append the overlay to the document body

    // Add event listener to the "Play Again" button to reload the page and restart the game

    document.getElementById('restartBtn').addEventListener('click', () => 
    {

      location.reload();                                              // Reload the page to restart the game

    });

    return;                                                           // End the game loop

  }

  // Process player input for movement and determine ship rotation

  let dx = 0, dy = 0;                                                 // Initialize movement deltas for X and Y axes

  // Check for upward movement (W key or ArrowUp key)

  if (keysPressed['W'] || keysPressed['w'] || keysPressed['ArrowUp']) 
  {

    dy -= 1;                                                          // Move the ship up by decreasing the Y axis value

  }

  // Check for downward movement (S key or ArrowDown key)

  if (keysPressed['S'] || keysPressed['s'] || keysPressed['ArrowDown']) 
  {

    dy += 1;                                                          // Move the ship down by increasing the Y axis value

  }

  // Check for leftward movement (A key or ArrowLeft key)

  if (keysPressed['A'] || keysPressed['a'] || keysPressed['ArrowLeft']) 
  {

    dx -= 1;                                                          // Move the ship left by decreasing the X axis value

  }

  // Check for rightward movement (D key or ArrowRight key)

  if (keysPressed['D'] || keysPressed['d'] || keysPressed['ArrowRight']) 
  {

    dx += 1;                                                          // Move the ship right by increasing the X axis value

  }

  // Update the ship's rotation based on the key inputs for movement (W, A, S, D or arrow keys)

  if (dx !== 0 || dy !== 0) 
  {

    // Calculate the angle of rotation based on the movement direction

    let angleRad = Math.atan2(dy, dx);                                // Get the angle in radians using the direction of movement
    let angleDeg = angleRad * (180 / Math.PI) + 90;                   // Convert radians to degrees and adjust the angle

    // Apply the rotation to the ship by transforming its style to rotate around its center

    playerShip.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

  }

  // Check if keys are pressed for movement (W, A, S, D or arrow keys) and apply acceleration to velocity

  if (keysPressed['W'] || keysPressed['w'] || keysPressed['ArrowUp']) 
  {

    playerVelocityY -= acceleration;                                   // Move up by decreasing Y velocity

  }

  if (keysPressed['S'] || keysPressed['s'] || keysPressed['ArrowDown']) 
  {

    playerVelocityY += acceleration;                                   // Move down by increasing Y velocity

  }

  if (keysPressed['A'] || keysPressed['a'] || keysPressed['ArrowLeft']) 
  {

    playerVelocityX -= acceleration;                                   // Move left by decreasing X velocity

  }

  if (keysPressed['D'] || keysPressed['d'] || keysPressed['ArrowRight']) 
  {

    playerVelocityX += acceleration;                                   // Move right by increasing X velocity

  }

  // Apply deceleration to the ship's velocity in both X and Y directions

  playerVelocityX *= deceleration;                                     // Reduce the velocity on the X-axis
  playerVelocityY *= deceleration;                                     // Reduce the velocity on the Y-axis

  // Update the player's position by adding the velocity to the current position

  playerX += playerVelocityX;                                          // Update the X position based on velocity
  playerY += playerVelocityY;                                          // Update the Y position based on velocity

  // Update the position of the ship on the screen by setting the new left and top styles

  playerShip.style.left = playerX + 'px';                             // Position the ship horizontally
  playerShip.style.top = playerY + 'px';                              // Position the ship vertically

  // Constrain the ship within the HUD container with a bounce effect

  // Get the dimensions and position of the container element (the HUD container) on the screen

  const containerRect = document.querySelector('.hud-container').getBoundingClientRect();

  // Get the dimensions and position of the player's ship element on the screen

  let playerRect = playerShip.getBoundingClientRect();

  // Set a bounce factor that will be applied when the ship hits the edges of the container

  const bounceFactor = 0.7;                                           // Controls how much the ship bounces when hitting the 
                                                                      // container's boundaries

  // Check if the ship's left side is beyond the left edge of the container

  if (playerRect.left < containerRect.left) 
  {

    // Reposition the ship at the left edge of the container and apply the bounce effect

    // Set the ship's horizontal position to just inside the left boundary of the container
    
    // This ensures the ship doesn't go beyond the screen and appears to "bounce" off the wall

    playerX = containerRect.left + playerRect.width / 2;

    playerVelocityX *= -bounceFactor;                                  // Reverse and reduce the ship's horizontal velocity

  }

  // Check if the ship's right side is beyond the right edge of the container

  if (playerRect.right > containerRect.right) 
  {

    // Reposition the ship at the right edge of the container and apply the bounce effect

    playerX = containerRect.right - playerRect.width / 2;

    playerVelocityX *= -bounceFactor;                                 // Reverse and reduce the ship's horizontal velocity

  }

  // Check if the ship's top side is beyond the top edge of the container

  if (playerRect.top < containerRect.top) 
  {// Reposition the ship at the top edge of the container and apply the bounce effect

    playerY = containerRect.top + playerRect.height / 2;

    playerVelocityY *= -bounceFactor;                                 // Reverse and reduce the ship's vertical velocity

  }

  // Check if the ship's bottom side is beyond the bottom edge of the container

  if (playerRect.bottom > containerRect.bottom) 
  {// Reposition the ship at the bottom edge of the container and apply the bounce effect

    playerY = containerRect.bottom - playerRect.height / 2;

    playerVelocityY *= -bounceFactor;                                 // Reverse and reduce the ship's vertical velocity

  }

  // Update the ship's position on the screen

  playerShip.style.left = playerX + 'px';                            // Set the new horizontal position
  playerShip.style.top = playerY + 'px';                             // Set the new vertical position

  // Update the movement of targets (each moves toward a random destination)

  targets.forEach(target => 
  {// Calculate the distance between the current position and the target destination

    const distance = Math.sqrt(

      Math.pow(target.targetX - target.currentX, 2) +
      Math.pow(target.targetY - target.currentY, 2)

    );

    if (distance < 1) 
    {// If the target is close to its destination, generate a new random destination

      target.targetX = Math.random() * 80 + 10;                     // New X destination (10%–90%)
      target.targetY = Math.random() * 80 + 10;                     // New Y destination (10%–90%)

    }

    // Calculate movement deltas and update the current position gradually

    const deltaX = target.targetX - target.currentX;                // Difference in X between target and current position
    const deltaY = target.targetY - target.currentY;                // Difference in Y between target and current position

    // Move the target a small step closer to its destination based on its speed

    target.currentX += deltaX * target.speed;                       // Update X position based on speed and delta
    target.currentY += deltaY * target.speed;                       // Update Y position based on speed and delta

    // Update the target's visual position on the screen (indicator and label)

    target.indicator.style.top = `${target.currentY}%`;             // Set vertical position of the indicator
    target.indicator.style.left = `${target.currentX}%`;            // Set horizontal position of the indicator
    target.label.style.top = `${target.currentY + 3}%`;             // Position label slightly below the indicator
    target.label.style.left = `${target.currentX}%`;                // Align label horizontally with the indicator

  });

  // Check collisions between the ship and each target

  for (let i = targets.length - 1; i >= 0; i--) 
  {

    const targetRect = targets[i].indicator.getBoundingClientRect(); // Get the bounding box of the target
    
    if (isColliding(playerRect, targetRect))                         // If the player collides with the target
    {

      explosionSound.currentTime = 0;                                // Reset explosion sound
      explosionSound.play();                                         // Play explosion effect
    
      targets[i].indicator.remove();                                 // Remove the visual indicator of the target
      targets[i].label.remove();                                     // Remove the label associated with the target
      score++;                                                       // Increase the player's score
      scoreDisplay.textContent = "Score: " + score;                  // Update score display
    
      targets.splice(i, 1);                                          // Remove the target from the array
      totalTime += 1;                                                // Grant a 1-second time bonus per target hit

    }

  }

  updateMiniRadarDots();                                            // Refresh the mini radar display to reflect the updated positions 
                                                                    // of all targets

  // Level-up condition
  // If all targets have been hit (array is empty), display a victory overlay and prepare the next level

  if (targets.length === 0) 
  {

    const overlay = document.createElement('div');                  // Create a new overlay element
    overlay.className = 'victory-overlay';                          // Assign a CSS class for styling
    overlay.innerHTML = `<h1>LEVEL ${level} COMPLETE!</h1><p>Score: ${score}</p><button id="nextLevelBtn">NEXT LEVEL</button>`; 
                                                                    // Set victory message and next level button
    document.body.appendChild(overlay);                             // Add the overlay to the page

    // Add click event listener to start next level

    document.getElementById('nextLevelBtn').addEventListener('click', () => {
      overlay.parentNode.removeChild(overlay);                      // Remove the overlay from the DOM
      level++;                                                      // Increase level number
      spawnTargets(level * 2);                                      // Spawn more targets based on level
      targets.forEach(target => {
        target.speed *= 1.2;                                        // Increase target speed for next level
      });
      totalTime = 15;                                               // Reset timer
      startTime = Date.now();                                       // Restart the countdown
      gameLoop();                                                   // Start the game loop again
    });

    return;                                                         // Exit the current game loop to wait for player input
  }

  requestAnimationFrame(gameLoop);                                  // Request the browser to call gameLoop before the next repaint 
                                                                    // (creates a smooth animation loop)

}

targets.forEach(target => 
  {// Assign random target coordinates within the screen area (10% to 90% of the width and height)

    target.targetX = Math.random() * 80 + 10;                       // Random X position between 10% and 90%
    target.targetY = Math.random() * 80 + 10;                       // Random Y position between 10% and 90%

  });
  

// Function to start the game when the player is ready

function startGame() 
{

  const startOverlay = document.getElementById('startOverlay');
  startOverlay.parentNode.removeChild(startOverlay);                // Remove the start overlay when the game begins


  totalTime = 10;                                                   // Set the total time for the level and start the timer
  startTime = Date.now();                                           // Record the start time of the game to track elapsed time

  bgMusic.volume = 0.4;                                             // Set background music volume
  bgMusic.play();                                                   // plays the music

  gameLoop();                                                       // Start the game loop to update the game state
}

// Add event listener to the start button to trigger the startGame function when clicked

document.getElementById('startBtn').addEventListener('click', startGame);
