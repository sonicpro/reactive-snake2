import { Scene, Point2D } from "./types";

export const COLS = 30;
export const ROWS = 30;
export const GAP_SIZE = 1;
export const CELL_SIZE = 10;
export const CANVAS_WIDTH = COLS * (CELL_SIZE + GAP_SIZE);
export const CANVAS_HEIGHT = ROWS * (CELL_SIZE + GAP_SIZE);

export function createCanvasElement() {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    return canvas;
}

// Head is black.
function getSegmentColor(index: number) {
    return index === 0 ? 'black' : '#2196f3';
}

export function renderScene(ctx: CanvasRenderingContext2D, scene: Scene) {
    renderBackground(ctx);
    scene.apples.forEach(renderApple, ctx);
    scene.snake.forEach((segment, index) => paintCell(ctx, wrapBounds(segment), getSegmentColor(index)));
}

function wrapBounds(point: Point2D) {
    point.x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x;
    point.y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y;
  
    return point;
}

function paintCell(ctx: CanvasRenderingContext2D, point: Point2D, color: string) {
    const x = point.x * CELL_SIZE + (point.x * GAP_SIZE);
    const y = point.y * CELL_SIZE + (point.y * GAP_SIZE);
  
    ctx.fillStyle = color;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}

function renderBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#EEE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function renderApple(point: Point2D) {
    paintCell(this, point, "#F00");
}