import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game, GameView} from "../game.js";

export function VictoryView(game: Game): string {
    let isFinalVictory = game.VictoryData?.IsFinalVictory || false;
    let timeRemaining = game.VictoryData?.TimeRemaining || 0;

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,100,0,0.8); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: monospace; padding: 20px; box-sizing: border-box; text-align: center;"
        >
            <!-- Victory message -->
            <div
                style="font-size: clamp(28px, 8vw, 48px); font-weight: bold; margin-bottom: 20px; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
            >
                ${isFinalVictory ? "FINAL VICTORY!" : "VICTORY!"}
            </div>

            <!-- Progress info -->
            <div style="font-size: clamp(16px, 4vw, 20px); margin-bottom: 10px;">
                Arena ${game.State.currentLevel - 1} Complete
            </div>
            <div style="font-size: clamp(12px, 3vw, 16px); color: #CCC; margin-bottom: 15px;">
                Population: ${game.State.population.toLocaleString()}
            </div>

            ${!isFinalVictory
                ? `
                <!-- HP gain notification -->
                <div style="
                    background: rgba(76, 175, 80, 0.2); 
                    border: 1px solid #4CAF50; 
                    border-radius: 5px; 
                    padding: 10px 15px; 
                    margin-bottom: 20px; 
                    font-size: clamp(12px, 3vw, 16px); 
                    color: #4CAF50; 
                    font-weight: bold;
                    max-width: 300px;
                ">
                    🏥 You gain +2 HP!
                </div>
                `
                : ""}
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
                        font-size: clamp(14px, 4vw, 18px); 
                        font-family: monospace; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        pointer-events: all;
                        margin-bottom: 10px;
                        min-height: 44px;
                        min-width: 200px;
                    "
                >
                    CONTINUE TO ARENA ${game.State.currentLevel}
                </button>
                
                <!-- Auto-advance note -->
                <div style="font-size: clamp(10px, 2.5vw, 12px); color: #CCC;">
                    Auto-advancing in ${Math.ceil(timeRemaining)} seconds...
                </div>
            `
                : `
                <!-- Final victory content -->
                <div style="text-align: center; font-size: clamp(14px, 4vw, 18px); line-height: 1.6; max-width: 600px; margin-bottom: 20px;">
                    You are the last human standing! You have conquered all 33 arenas and reduced humanity to a single survivor - yourself.
                </div>
                <button 
                    onclick="window.$(${Action.RestartRun})"
                    style="
                        background: #FFD700; 
                        color: black; 
                        border: none; 
                        padding: 15px 30px; 
                        font-size: clamp(14px, 4vw, 18px); 
                        font-family: monospace; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        pointer-events: all;
                        margin-top: 10px;
                        min-height: 44px;
                        min-width: 150px;
                    "
                >
                    PLAY AGAIN
                </button>
            `}
        </div>
    `;
}
