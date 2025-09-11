import {Entity, WorldImpl, create_entity} from "./world.js";

/**
 * The base Game class for 3D games.
 *
 * Stores references to the canvas elements and the WebGL2 context, as well as
 * Context2D instances for drawing behind and in front of the scene.
 */
export abstract class Game3D {
    IsRunning = 0;
    Time = 0; // Game time in seconds (for gameplay systems)

    abstract World: WorldImpl;

    ViewportWidth = window.innerWidth;
    ViewportHeight = window.innerHeight;
    ViewportResized = true;

    Ui = document.querySelector("main")!;
    SceneCanvas = document.querySelector("#scene")! as HTMLCanvasElement;
    Gl = this.SceneCanvas.getContext("webgl2")!;

    Audio = new AudioContext();
    Camera?: Entity;

    constructor() {
        document.addEventListener("visibilitychange", () =>
            document.hidden ? this.Stop() : this.Start(),
        );
    }

    Start() {
        let last = performance.now();

        let tick = (now: number) => {
            let delta = (now - last) / 1000;
            last = now;

            this.IsRunning = requestAnimationFrame(tick);

            this.FrameSetup(delta);
            this.FrameUpdate(delta);
        };

        requestAnimationFrame(tick);
    }

    Stop() {
        cancelAnimationFrame(this.IsRunning);
        this.IsRunning = 0;
    }

    FrameSetup(delta: number) {
        this.Time += delta; // Accumulate game time in seconds
        this.ViewportResized = false;
    }

    abstract FrameUpdate(delta: number): void;
}

type Mixin<G extends Game3D> = (game: G, entity: Entity) => void;
export type Blueprint<G extends Game3D> = Array<Mixin<G>>;

export function instantiate<G extends Game3D>(game: G, blueprint: Blueprint<G>) {
    let entity = create_entity(game.World);
    for (let mixin of blueprint) {
        mixin(game, entity);
    }
    return entity;
}
