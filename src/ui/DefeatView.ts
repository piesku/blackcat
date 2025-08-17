import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {Action} from "../actions.js";

export function DefeatView(game: Game): string {
    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(100,0,0,0.8); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: monospace; padding: 20px; box-sizing: border-box; text-align: center;"
        >
            <!-- Defeat message -->
            <div
                style="font-size: clamp(28px, 8vw, 48px); font-weight: bold; margin-bottom: 20px; color: #F44336; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
            >
                DEFEAT
            </div>

            <!-- Progress info -->
            <div style="font-size: clamp(16px, 4vw, 20px); margin-bottom: 10px;">
                Reached Arena ${game.State.currentLevel}
            </div>
            <div style="font-size: clamp(12px, 3vw, 16px); color: #CCC; margin-bottom: 30px;">
                ${game.State.playerUpgrades.length} upgrades collected
            </div>

            <!-- Restart button -->
            <button
                onclick="window.$(${Action.RestartRun})"
                style="
                    background: #F44336; 
                    color: white; 
                    border: none; 
                    padding: 15px 30px; 
                    font-size: clamp(14px, 4vw, 18px); 
                    font-family: monospace; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    pointer-events: all;
                    min-height: 44px;
                    min-width: 150px;
                "
            >
                TRY AGAIN
            </button>
        </div>
    `;
}
