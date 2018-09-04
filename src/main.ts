import { animationFrameScheduler,
    fromEvent,
    interval,
    Observable,
    of,
    combineLatest,
    BehaviorSubject } from "rxjs";
import { switchMap,
    scan,
    map,
    startWith,
    filter, 
    distinctUntilChanged,
    withLatestFrom,
    share,
    tap,
    skip,
    takeWhile } from "rxjs/operators";
import { SPEED, DIRECTIONS, FPS, INITIAL_SNAKE, INITIAL_APPLES, SNAKE_LENGTH } from "./constants";
import { Scene, Key, Point2D } from "./types";
import { move, oppositeDirectionFilter, checkCollision, isGameOver } from "./utils";
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
    // If we did not have "length" subject, we'd have circular dependency: snake$ depends on snakeLength$, 
    // apples$ depend on snake$, and snakeLength$ depends on apples$:
    //                                  apples$_
    //                                  /     |\
    //                                 /        \
    //                                /          \
    //                              |/_           \
    //                          snake$-------->snakeLegth$ 
    const length: BehaviorSubject<number> = new BehaviorSubject(SNAKE_LENGTH);
    
    let score = 0;
    let h = document.createElement("h3");
    h.innerHTML = "Your score is " + score;
    document.getElementById("score").appendChild(h);
    length.subscribe(value =>
        {
            if (value === 1) {
                score++;
                h.innerHTML = "Your score is " + score;
            }
        });
    const snakeLength$: Observable<number> = length.pipe(
        scan((accum, value) => accum + value) // On subscribing to "length" increased by SNAKE_LENGTH. Then increased by 1.
    )
    // Run the snake - evaluate the new position based on the current one.
    const snake$ = ticks$.pipe(
        withLatestFrom(direction$, snakeLength$, (_, direction, length) => [direction, length]),
        scan(move, INITIAL_SNAKE),
        share() // Both combineLatest and apples$ will be subscribed to the same Subject that wraps snake$ internally.
    );
    const apples$: Observable<Point2D[]> = snake$.pipe(
        scan(checkCollision, INITIAL_APPLES),
        distinctUntilChanged(),
        share() // Both combineLatest and appleEaten$ will be subscribed to the same Subject that wraps apples$ internally.
    );
    // "Publisher" observable, no observer is passed to "subscribe()".
    let appleEaten$ = apples$.pipe(
        skip(1),
        tap(_ => length.next(1)) // Increase snake length by 1.
    ).subscribe();

    return combineLatest(snake$, apples$, (snake, apples) => ({ snake, apples }));
}

const game$: Observable<Scene> = of("Start Game").pipe(
    map(_ => frames$),
    switchMap(gameLoop),
    takeWhile(scene => !isGameOver(scene))
);

const startGame = () => game$.subscribe(
    scene => renderScene(ctx, scene)
);

startGame();
