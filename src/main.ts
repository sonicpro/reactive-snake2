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
    share } from "rxjs/operators";
import { SPEED, DIRECTIONS, FPS, INITIAL_SNAKE, INITIAL_APPLES, SNAKE_LENGTH } from "./constants";
import { Scene, Key, Point2D } from "./types";
import { move, oppositeDirectionFilter, checkCollision } from "./utils";
import { createCanvasElement, renderScene, COLS, ROWS } from "./canvas";

const canvas = createCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
document.getElementById("canvasWrapper").appendChild(canvas);

const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT];

// "Base" Obsevables.
const ticks$:Observable<number> = interval(SPEED).pipe(share());
const keydown$: Observable<Event> = fromEvent(document, "keydown");
const frames$: Observable<number> = interval(1000 / FPS, animationFrameScheduler);
const direction$: Observable<Point2D> = keydown$.pipe(
    map((event: KeyboardEvent) => DIRECTIONS[event.keyCode]),
    filter(direction => !! direction),
    scan(oppositeDirectionFilter),
    startWith(INITIAL_DIRECTION),
    distinctUntilChanged()
);

function gameLoop(frameNumber$: Observable<number>): Observable<Scene> {
    // Run the snake - evaluate the new position based on the current one.
    const snake$ = ticks$.pipe(
        withLatestFrom(direction$, (_, direction) => direction),
        scan(move, INITIAL_SNAKE),
        share() // Both combineLatest and apples$ will be subscribed to the same Subject wrapping snake$.
    );
    const apples$: Observable<Point2D[]> = snake$.pipe(
        scan(checkCollision, INITIAL_APPLES),
        distinctUntilChanged()
    );
    const length$: Observable<number> = apples$.pipe(
        scan((accum: number, _: Point2D[]) => { return accum++; }, SNAKE_LENGTH)
    );
    return combineLatest(snake$, apples$, (snake, apples) => ({ snake, apples }));
}

const game$: Observable<Scene> = of("Start Game").pipe(
    map(_ => frames$),
    switchMap(gameLoop)
);

const startGame = () => game$.subscribe(
    scene => renderScene(ctx, scene)
);

startGame();
