import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";

export function DefeatView(game: Game): string {
    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: repeating-conic-gradient(from 0deg at 50% 50%, #F44336cc 0 6deg, #d32f2fcc 0 12deg); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: Impact; padding: 20px; box-sizing: border-box; text-align: center;"
        >
            <h2>OUCH!</h2>

            <div style="font-size: 20px; margin-bottom: 10px;">
                Reached Arena ${game.State.currentLevel}
            </div>

            <!-- Restart button -->
            <button onclick="window.$(${Action.RestartRun})">TRY AGAIN</button>
        </div>
    `;
}
