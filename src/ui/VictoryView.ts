import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game, GameView} from "../game.js";

export function VictoryView(game: Game): string {
    let isFinalVictory = game.VictoryData?.IsFinalVictory || false;

    return html`
        <div
            onclick="window.$(${Action.ViewTransition}, {view: ${GameView.UpgradeSelection}})"
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: repeating-conic-gradient(from 0deg at 50% 50%, #4CAF5099 0 6deg, #2d8f2d99 0 12deg); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;"
        >
            <h2 style="color: #4CAF50;">
                ${isFinalVictory ? "YOU WIN!" : `DUEL ${game.State.currentLevel - 1} COMPLETE!`}
            </h2>

            ${!isFinalVictory
                ? `
            <h2 style="color: #4CAF50;">
                    You gain +2 HP!
            </h2>
            <button>
                CONTINUE
            </button>
            `
                : ""}
            ${!isFinalVictory
                ? `
            `
                : `
                <!-- Final victory content -->
                <div style="text-align: center; font-size: 18px; line-height: 1.6; max-width: 600px; margin-bottom: 20px;">
                    You are the last human standing! You have conquered all 33 arenas and reduced humanity to a single survivor - yourself.
                </div>
                <button 
                    style="background: #FFD700; color: black; border: 3px solid #fff; padding: 15px 30px; font-family: Impact; border-radius: 5px; cursor: pointer; text-transform: uppercase; font-weight: bold; box-shadow: 4px 4px 0 #333; transform: rotate(-1deg); transition: all 0.2s; margin-top: 10px; min-width: 150px;"
                    onmouseover="this.style.transform='rotate(0deg) translateY(-2px)'; this.style.boxShadow='6px 6px 0 #333'"
                    onmouseout="this.style.transform='rotate(-1deg)'; this.style.boxShadow='4px 4px 0 #333'"
                >
                    PLAY AGAIN
                </button>
            `}
        </div>
    `;
}
