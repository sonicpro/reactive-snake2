import { animationFrameScheduler,
    fromEvent,
    interval,
    Observable,
    of,
    combineLatest } from "rxjs";
import { switchMap,
    scan,
    map,
    startWith,
    filter, 
    distinctUntilChanged,
    withLatestFrom,
    first } from "rxjs/operators";
import { SPEED, DIRECTIONS, FPS } from "./constants";
import { Scene, Key, Point2D } from "./types";
import { move, oppositeDirectionFilter, checkCollision } from "./utils";
import { createCanvasElement, renderScene, COLS, ROWS } from "./canvas";

const canvas = createCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
document.getElementById("canvasWrapper").appendChild(canvas);

const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT];

// "Base" Obsevables.
const ticks$: Observable<number> = interval(SPEED);
const keydown$: Observable<Event> = fromEvent(document, "keydown");
const frames$: Observable<number> = interval(1000 / FPS, animationFrameScheduler);
const direction$: Observable<Point2D> = keydown$.pipe(
    map((event: KeyboardEvent) => DIRECTIONS[event.keyCode]),
    filter(direction => !! direction),
    scan(oppositeDirectionFilter),
    startWith(INITIAL_DIRECTION),
    distinctUntilChanged()
);
const apples$: Observable<Point2D[]> = of([{ x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) },
    { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }]);

function gameLoop(frameNumber$: Observable<number>): Observable<Scene> {
    const topLeft: Point2D = { x:0, y:0 };
    const snake: Array<Point2D> = [ topLeft,
        { ...topLeft, x: 1 },
        { ...topLeft, x: 2 },
        { ...topLeft, x: 3 },
        { ...topLeft, x: 4 }];

    // Run the snake - evaluate the new position based on the current one.
    const snake$ = ticks$.pipe(
        withLatestFrom(direction$, (_, direction) => direction),
        scan(move, snake)
    );
    return combineLatest(snake$, apples$, (snake, apples) => ({ snake, apples }));
}

const game$: Observable<Scene> = of("Start Game").pipe(
    map(_ => frames$),
    switchMap(gameLoop)
);

const startGame = () => game$.subscribe(
    scene =>
    {
        checkCollision(scene);
        renderScene(ctx, scene);
    }
);

startGame();
