import { Point2D, Scene } from "./types";

export function move(snake: Array<Point2D>, direction: Point2D) {
  let headX = snake[0].x;
  let headY = snake[0].y;
  
  headX += 1 * direction.x;
  headY += 1 * direction.y;
  
  // Tail becomes head;
  let tail = snake.pop();
  tail.x = headX;
  tail.y = headY;
  
  snake.unshift(tail);
  
   return snake;
}

export function oppositeDirectionFilter(accum: Point2D, current: Point2D): Point2D {
  if (accum.x === -current.x || accum.y === -current.y) {
    return accum;
  }
  return current;
}

export function checkCollision(snake: Point2D[], apple: Point2D): Boolean {
  return apple.x === snake[0].x && apple.y === snake[0].y;
}
