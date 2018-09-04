import { Point2D, Scene } from "./types";
import { COLS, ROWS } from "./canvas";

export function move(snake: Array<Point2D>, [direction, length]: [Point2D, number]): Point2D[] {
  let headX = snake[0].x;
  let headY = snake[0].y;
  
  headX += direction.x;
  headY += direction.y;
  if (snake.length === length) {
    // Tail becomes head;
    let tail = snake.pop();
    tail.x = headX;
    tail.y = headY;
    snake.unshift(tail);
  } else {
    snake.unshift({ x: headX, y: headY });
  }
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
      // It is crusial to use Array literal syntax rather than apples.push() for distinctUntilChanged() detects a value change.
      return [...apples, { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }];
  }
  return apples;
}

export function isGameOver(scene: Scene) {
  let snake = scene.snake;
  let head = snake[0];
  let body = snake.slice(1, snake.length);

  return body.some(segment => { return segment.x === head.x && segment.y === head.y; });
}
