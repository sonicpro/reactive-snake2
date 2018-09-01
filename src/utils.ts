import { Point2D } from "./types";

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