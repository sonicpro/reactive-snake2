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
import { createCanvasElement, renderScene } from "./canvas";

const canvas = createCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
document.getElementById("canvasWrapper").appendChild(canvas);

const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT];

// "Base" Obsevables.
const ticks$:Observable<number> = interval(SPEED).pipe(share());
const keydown$: Observable<Event> = fromEvent(document, "keydown");
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
    //                                  apples$__
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

    let scene$ = combineLatest(snake$, apples$, (snake, apples) => ({ snake, apples }));
    return frameNumber$.pipe(
        withLatestFrom(scene$),
        map(array => array[1])
    );
}

const game$: Observable<Scene> = of("Start Game").pipe(
    map(_ => interval(1000 / FPS, animationFrameScheduler)),
    switchMap(gameLoop),
    takeWhile(scene => !isGameOver(scene))
);

const startGame = () => game$.subscribe(
    scene => renderScene(ctx, scene),
    null,
    () =>
    {
        let tableau = document.getElementById("score");
        while (tableau.firstChild) {
            //The list is LIVE so it will re-index each call
            tableau.removeChild(tableau.firstChild);
        }
        let h = document.createElement("h3");
        h.innerHTML = "GAME OVER"
        tableau.appendChild(h);
    }
);

startGame();
