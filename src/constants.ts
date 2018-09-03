import { Directions, Point2D } from './types';
import { COLS, ROWS } from "./canvas";

export const SNAKE_LENGTH = 5;

const topLeft: Point2D = { x:0, y:0 };
export const INITIAL_SNAKE: Array<Point2D> = [ topLeft,
    { ...topLeft, x: 1 },
    { ...topLeft, x: 2 },
    { ...topLeft, x: 3 },
    { ...topLeft, x: 4 }];
export const INITIAL_APPLES: Point2D[] = [{ x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) },
    { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }];

// game changes every 200 ms.
export const SPEED = 200;
export const FPS = 60;

export const DIRECTIONS: Directions = {
  37: { x: -1, y: 0 },
  39: { x: 1, y: 0 },
  38: { x: 0, y: -1 },
  40: { x: 0, y: 1 }
};