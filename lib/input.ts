import {GameImpl} from "./game";
import {Vec2} from "./math";

export function input_pointer_lock(game: GameImpl) {
    game.Ui.addEventListener("click", () => game.Ui.requestPointerLock());
}

export function pointer_down(game: GameImpl) {
    return game.PointerState > 0;
}

export function pointer_clicked(game: GameImpl) {
    return game.PointerDelta === -1;
}

export function pointer_viewport(game: GameImpl, out: Vec2): boolean {
    // Since we no longer track pointer positions, always return false
    return false;
}
