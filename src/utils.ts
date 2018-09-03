import { Point2D } from "./types";
import { COLS, ROWS } from "./canvas";

export function move(snake: Array<Point2D>, direction: Point2D) {
  let headX = snake[0].x;
  let headY = snake[0].y;
  
  headX += 1 * direction.x;
  headY += 1 * direction.y;
  // TODO: implement length$ observable tracking.
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

export function checkCollision(apples: Point2D[], snake: Point2D[]): Point2D[] {
  let index = apples.findIndex(apple => { return snake[0].x === apple.x && snake[0].y === apple.y; });
  if (index > -1) {
      apples.splice(index, 1);
      apples.push({ x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) });
  }
  return apples;
}
