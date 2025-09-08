import {RenderTarget} from "./framebuffer.js";
import {GL_CULL_FACE, GL_DEPTH_TEST, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA} from "./webgl.js";
import {Entity, WorldImpl, create_entity} from "./world.js";

const update_span = document.getElementById("update");
const fps_span = document.getElementById("fps");

/**
 * The base Game class.
 *
 * This class is the base class for all games. It runs the main loop.
 */
export abstract class GameImpl {
    IsRunning = 0;
    private Milliseconds = 0;
    Time = 0; // Game time in seconds (for gameplay systems)

    abstract World: WorldImpl;

    ViewportWidth = window.innerWidth;
    ViewportHeight = window.innerHeight;
    ViewportResized = true;

    Ui = document.querySelector("main")!;

    constructor() {
        document.addEventListener("visibilitychange", () =>
            document.hidden ? this.Stop() : this.Start(),
        );

        this.Ui.addEventListener("contextmenu", (evt) => evt.preventDefault());
    }

    Start() {
        let last = performance.now();

        let tick = (now: number) => {
            let delta = (now - last) / 1000;
            last = now;

            this.IsRunning = requestAnimationFrame(tick);

            this.FrameSetup(delta);
            this.FrameUpdate(delta);
            this.FrameReset(delta);
        };

        requestAnimationFrame(tick);
    }

    Stop() {
        cancelAnimationFrame(this.IsRunning);
        this.IsRunning = 0;
    }

    FrameSetup(delta: number) {
        this.Milliseconds = performance.now();
        this.Time += delta; // Accumulate game time in seconds
    }

    FrameUpdate(delta: number) {}

    FrameReset(delta: number) {
        this.ViewportResized = false;

        let update = performance.now() - this.Milliseconds;
        if (update_span) {
            update_span.textContent = update.toFixed(1);
        }
        if (fps_span) {
            fps_span.textContent = (1 / delta).toFixed();
        }
    }
}

/**
 * The base Game class for 3D games.
 *
 * Stores references to the canvas elements and the WebGL2 context, as well as
 * Context2D instances for drawing behind and in front of the scene.
 */
export abstract class Game3D extends GameImpl {
    BackgroundCanvas = document.querySelector("#background")! as HTMLCanvasElement;
    BackgroundContext = this.BackgroundCanvas.getContext("2d")!;

    ForegroundCanvas = document.querySelector("#foreground")! as HTMLCanvasElement;
    ForegroundContext = this.ForegroundCanvas.getContext("2d")!;

    SceneCanvas = document.querySelector("#scene")! as HTMLCanvasElement;
    Gl = this.SceneCanvas.getContext("webgl2")!;

    Audio = new AudioContext();
    Camera?: Entity;
    Targets: Record<string, RenderTarget> = {};

    constructor() {
        super();

        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.enable(GL_CULL_FACE);

        this.Gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    }
}

/**
 * Base Game class for XR games.
 *
 * XR games use the WebXR API's `requestAnimationFrame` to run the game loop.
 */
export abstract class GameXR extends Game3D {
    XrSupported = false;
    XrSession?: XRSession;
    XrSpace?: XRReferenceSpace;
    // XrFrame can be used to check whether we're presenting to a VR display.
    XrFrame?: XRFrame;
    XrInputs: Record<string, XRInputSource> = {};

    constructor() {
        super();

        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.enable(GL_CULL_FACE);

        this.Gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        if (navigator.xr) {
            xr_init(this);
        }
    }

    override Start() {
        let last = performance.now();

        let tick = (now: number, frame?: XRFrame) => {
            let delta = (now - last) / 1000;
            last = now;

            if (frame) {
                this.XrFrame = frame;
                this.IsRunning = this.XrFrame.session.requestAnimationFrame(tick);
            } else {
                this.XrFrame = undefined;
                this.IsRunning = requestAnimationFrame(tick);
            }

            this.FrameSetup(delta);
            this.FrameUpdate(delta);
            this.FrameReset(delta);
        };

        if (this.XrSession) {
            this.IsRunning = this.XrSession.requestAnimationFrame(tick);
        } else {
            this.IsRunning = requestAnimationFrame(tick);
        }
    }

    override Stop() {
        if (this.XrSession) {
            this.XrSession.cancelAnimationFrame(this.IsRunning);
        } else {
            cancelAnimationFrame(this.IsRunning);
        }
        this.IsRunning = 0;
    }

    async EnterXR() {
        let session = await navigator.xr.requestSession("immersive-vr");
        session.updateRenderState({
            baseLayer: new XRWebGLLayer(session, this.Gl),
        });
        this.XrSpace = await session.requestReferenceSpace("local");

        this.Stop();
        this.XrSession = session;
        this.Start();

        this.XrSession.addEventListener("end", () => {
            this.Stop();
            this.XrSession = undefined;
            this.XrSpace = undefined;
            this.XrFrame = undefined;
            this.ViewportResized = true;
            this.Start();
        });
    }

    override FrameSetup(delta: number) {
        super.FrameSetup(delta);

        if (this.XrFrame) {
            this.XrInputs = {};
            for (let input of this.XrFrame.session.inputSources) {
                if (input.gripSpace) {
                    this.XrInputs[input.handedness] = input;
                }
            }
        }
    }
}

type Mixin<G extends GameImpl> = (game: G, entity: Entity) => void;
export type Blueprint<G extends GameImpl> = Array<Mixin<G>>;

export function instantiate<G extends GameImpl>(game: G, blueprint: Blueprint<G>) {
    let entity = create_entity(game.World);
    for (let mixin of blueprint) {
        mixin(game, entity);
    }
    return entity;
}

// Implemented as a free function so that we can use async/await.
async function xr_init(game: GameXR) {
    await game.Gl.makeXRCompatible();
    game.XrSupported = await navigator.xr.isSessionSupported("immersive-vr");
}
