'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Board, Piece, Position, CellValue } from '@/types/tetris'

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]]
];

const COLORS = ['bg-cyan-500', 'bg-yellow-500', 'bg-purple-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500'];

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const checkCollision = useCallback((piece: number[][], position: Position): boolean => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] && (
          board[y + position.y] === undefined ||
          board[y + position.y][x + position.x] === undefined ||
          board[y + position.y][x + position.x] !== 0
        )) {
          return true;
        }
      }
    }
    return false;
  }, [board]);

  const newPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const newPiece: Piece = {
      shape: SHAPES[shapeIndex],
      color: shapeIndex + 1 as CellValue,
    };
    setCurrentPiece(newPiece);
    setCurrentPosition({
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2),
      y: 0
    });

    if (checkCollision(newPiece.shape, { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), y: 0 })) {
      setGameOver(true);
    }
  }, [checkCollision]);

  const mergePiece = () => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[y + currentPosition.y][x + currentPosition.x] = currentPiece.color as CellValue;
        }
      });
    });
    setBoard(newBoard);
    setScore(prevScore => prevScore + 10);
    newPiece();
  };

  const moveDown = useCallback(() => {
    if (!currentPiece) return;

    if (!checkCollision(currentPiece.shape, { x: currentPosition.x, y: currentPosition.y + 1 })) {
      setCurrentPosition(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      mergePiece();
    }
  }, [currentPiece, currentPosition, board]);

  const moveLeft = useCallback(() => {
    if (!currentPiece) return;

    if (!checkCollision(currentPiece.shape, { x: currentPosition.x - 1, y: currentPosition.y })) {
      setCurrentPosition(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, currentPosition, board]);

  const moveRight = useCallback(() => {
    if (!currentPiece) return;

    if (!checkCollision(currentPiece.shape, { x: currentPosition.x + 1, y: currentPosition.y })) {
      setCurrentPosition(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, currentPosition, board]);

  const rotate = useCallback(() => {
    if (!currentPiece) return;

    const rotated = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    if (!checkCollision(rotated, currentPosition)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotated } : null);
    }
  }, [currentPiece, currentPosition, board]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameOver) {
        switch (event.key) {
          case 'ArrowLeft':
            moveLeft();
            break;
          case 'ArrowRight':
            moveRight();
            break;
          case 'ArrowDown':
            moveDown();
            break;
          case 'ArrowUp':
            rotate();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [moveDown, moveLeft, moveRight, rotate]);

  useEffect(() => {
    if (!currentPiece) {
      newPiece();
    }

    const gameLoop = setInterval(() => {
      if (!gameOver) {
        moveDown();
      }
    }, 1000);

    return () => {
      clearInterval(gameLoop);
    };
  }, [currentPiece, gameOver, moveDown, newPiece]);

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-10 gap-px bg-gray-700 p-px">
        {board.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-8 h-8 ${cell !== 0 ? COLORS[cell - 1] : 'bg-gray-900'}`}
            >
              {currentPiece && currentPiece.shape[y - currentPosition.y] && currentPiece.shape[y - currentPosition.y][x - currentPosition.x] === 1 && (
                <div className={`w-full h-full ${COLORS[currentPiece.color - 1]}`} />
              )}
            </div>
          ))
        ))}
      </div>
      <div className="mt-4 text-xl">
        <p>Score: {score}</p>
        {gameOver && <p className="text-red-500 font-bold">Game Over!</p>}
      </div>
    </div>
  );
};

export default Tetris;
