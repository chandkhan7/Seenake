import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Import icons
import './Game.css'; // Import the CSS file

const Game = () => {
  const boardSize = 10; // The game board is a 10x10 grid
  const initialSnake = [{ x: 2, y: 2 }]; // Snake starting with just one segment
  const initialFood = { x: 5, y: 5 }; // Initial food position
  const initialSpeed = 200; // Initial game speed

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(initialSpeed);
  const [obstacles, setObstacles] = useState([]);
  const [touchStart, setTouchStart] = useState(null); // Store the starting touch position

  useEffect(() => {
    if (gameOver) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && direction !== 'DOWN') setDirection('UP');
      if (e.key === 'ArrowDown' && direction !== 'UP') setDirection('DOWN');
      if (e.key === 'ArrowLeft' && direction !== 'RIGHT') setDirection('LEFT');
      if (e.key === 'ArrowRight' && direction !== 'LEFT') setDirection('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, gameOver]);

  // Handle touch gestures for mobile swipe control
  useEffect(() => {
    if (gameOver) return;

    const handleTouchStart = (e) => {
      const touchStartPosition = e.touches[0];
      setTouchStart({ x: touchStartPosition.clientX, y: touchStartPosition.clientY });
    };

    const handleTouchEnd = (e) => {
      if (!touchStart) return;

      const touchEndPosition = e.changedTouches[0];
      const deltaX = touchEndPosition.clientX - touchStart.x;
      const deltaY = touchEndPosition.clientY - touchStart.y;

      // Swipe detection
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe (left or right)
        if (deltaX > 0 && direction !== 'LEFT') {
          setDirection('RIGHT');
        } else if (deltaX < 0 && direction !== 'RIGHT') {
          setDirection('LEFT');
        }
      } else {
        // Vertical swipe (up or down)
        if (deltaY > 0 && direction !== 'UP') {
          setDirection('DOWN');
        } else if (deltaY < 0 && direction !== 'DOWN') {
          setDirection('UP');
        }
      }

      setTouchStart(null); // Reset the touch start position
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [direction, touchStart, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const newHead = { ...snake[0] };

      // Move the head based on the direction
      if (direction === 'UP') newHead.y -= 1;
      if (direction === 'DOWN') newHead.y += 1;
      if (direction === 'LEFT') newHead.x -= 1;
      if (direction === 'RIGHT') newHead.x += 1;

      // Check for collisions with walls or self
      if (
        newHead.x < 0 || 
        newHead.y < 0 || 
        newHead.x >= boardSize || 
        newHead.y >= boardSize || 
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y) ||
        obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y) // Check for obstacles
      ) {
        setGameOver(true);
        return;
      }

      let newSnake = [newHead];

      // Check for food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        // If snake eats food, add a new segment to the tail (snake grows)
        setScore(score + 1);
        setSpeed(speed - 10); // Increase speed as the snake grows
        generateFood();
        generateObstacles(); // Optionally add obstacles after food collision
      } else {
        // Move the snake normally (remove the tail)
        newSnake = [...newSnake, ...snake.slice(0, snake.length - 1)];
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(gameInterval);
  }, [snake, direction, food, gameOver, speed, score]);

  const generateFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const generateObstacles = () => {
    const newObstacles = [];
    for (let i = 0; i < 3; i++) { // Add 3 obstacles at random positions
      let newObstacle;
      do {
        newObstacle = {
          x: Math.floor(Math.random() * boardSize),
          y: Math.floor(Math.random() * boardSize)
        };
      } while (snake.some(segment => segment.x === newObstacle.x && segment.y === newObstacle.y) || 
               newObstacles.some(obs => obs.x === newObstacle.x && obs.y === newObstacle.y));
      newObstacles.push(newObstacle);
    }
    setObstacles(newObstacles);
  };

  const restartGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(initialSpeed);
    setObstacles([]);
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Snake Game</h1>
      <div className="game-status">
        <p>Score: {score}</p>
        {gameOver && <p className="game-over">Game Over</p>}
      </div>
      <div className="game-board">
        <div className="board">
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const x = index % boardSize;
            const y = Math.floor(index / boardSize);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;
            const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);

            return (
              <div
                key={index}
                className={`cell ${isSnake ? 'snake' : isFood ? 'food' : isObstacle ? 'obstacle' : ''}`}
              />
            );
          })}
        </div>
      </div>
      {gameOver && (
        <div className="restart-container">
          <button onClick={restartGame} className="restart-button">Restart</button>
        </div>
      )}

      {/* Directional Control Buttons */}
      <div className="controller">
        <button onClick={() => direction !== 'DOWN' && setDirection('UP')} className="control-button up">
          <FaArrowUp />
        </button>
        <div className="middle-row">
          <button onClick={() => direction !== 'RIGHT' && setDirection('LEFT')} className="control-button left">
            <FaArrowLeft />
          </button>
          <button onClick={() => direction !== 'LEFT' && setDirection('RIGHT')} className="control-button right">
            <FaArrowRight />
          </button>
        </div>
        <button onClick={() => direction !== 'UP' && setDirection('DOWN')} className="control-button down">
          <FaArrowDown />
        </button>
      </div>
    </div>
  );
};

export default Game;
