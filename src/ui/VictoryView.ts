import {html} from "../../lib/html.js";
import {Game, GameView} from "../game.js";
import {Action} from "../actions.js";

export function VictoryView(game: Game): string {
    let isFinalVictory = game.ViewData?.isFinalVictory;

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,100,0,0.8); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: monospace;"
        >
            <!-- Victory message -->
            <div
                style="font-size: 48px; font-weight: bold; margin-bottom: 20px; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
            >
                ${isFinalVictory ? "FINAL VICTORY!" : "VICTORY!"}
            </div>

            <!-- Progress info -->
            <div style="font-size: 20px; margin-bottom: 10px;">
                Arena ${game.State.currentLevel - 1} Complete
            </div>
            <div style="font-size: 16px; color: #CCC; margin-bottom: 30px;">
                Population: ${game.State.population.toLocaleString()}
            </div>

            ${!isFinalVictory
                ? `
                <!-- Continue button -->
                <button 
                    onclick="window.$(${Action.ViewTransition}, {view: ${GameView.UpgradeSelection}})"
                    style="
                        background: #4CAF50; 
                        color: white; 
                        border: none; 
                        padding: 15px 30px; 
                        font-size: 18px; 
                        font-family: monospace; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        pointer-events: all;
                        margin-bottom: 10px;
                    "
                >
                    CONTINUE TO ARENA ${game.State.currentLevel}
                </button>
                
                <!-- Auto-advance note -->
                <div style="font-size: 12px; color: #CCC;">
                    Auto-advancing in 5 seconds...
                </div>
            `
                : `
                <!-- Final victory content -->
                <div style="text-align: center; font-size: 18px; line-height: 1.6; max-width: 600px;">
                    You are the last human standing! You have conquered all 33 arenas and reduced humanity to a single survivor - yourself.
                </div>
                <button 
                    onclick="window.$(${Action.RestartRun})"
                    style="
                        background: #FFD700; 
                        color: black; 
                        border: none; 
                        padding: 15px 30px; 
                        font-size: 18px; 
                        font-family: monospace; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        pointer-events: all;
                        margin-top: 30px;
                    "
                >
                    PLAY AGAIN
                </button>
            `}
        </div>
    `;
}
