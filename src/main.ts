import { animationFrameScheduler,
    fromEvent,
    interval,
    Observable,
    of } from "rxjs";
import { switchMap, scan, share, map } from "rxjs/operators";
import { SPEED, DIRECTIONS, FPS } from "./constants";
import { Key, Point2D } from "./types";
import { move } from "./utils";
import { createCanvasElement, renderSnake } from "./canvas";

const canvas = createCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
document.getElementById("canvasWrapper").appendChild(canvas);

// "Base" Obsevables.
const ticks$: Observable<number> = interval(SPEED);
const keydown$: Observable<Event> = fromEvent(document, "keydown");
const frames$: Observable<number> = interval(1000 / FPS, animationFrameScheduler);

const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT];

function createGame(frameNumber$: Observable<number>) {
    const direction$ = of(INITIAL_DIRECTION);
    const topLeft: Point2D = { x:0, y:0 };
    const snake: Array<Point2D> = [ topLeft,
        { ...topLeft, x: 1 },
        { ...topLeft, x: 2 },
        { ...topLeft, x: 3 },
        { ...topLeft, x: 4 }];
    
    // Run the snake - evaluate the new position based on the current one.
    return ticks$.pipe(
        switchMap(_ => direction$),
        scan(move, snake),
        share()
    );
}

const game$ = of("Start Game").pipe(
    map(_ => frames$),
    switchMap(createGame)
);

const startGame = () => game$.subscribe(
    snake => renderSnake(ctx, snake)
);

startGame();
