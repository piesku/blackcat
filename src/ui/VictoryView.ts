import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";

export function VictoryView(game: Game): string {
    let isFinalVictory = game.State.currentLevel > 33;

    return html`
        <style>
            .rotate-background {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .rotate-background::before {
                content: "";
                position: absolute;
                top: -100%;
                left: -100%;
                right: -100%;
                bottom: -100%;
                background: repeating-conic-gradient(
                    from 0deg at 50% 50%,
                    #4caf50cc 0 6deg,
                    #2d8f2dcc 0 12deg
                );
                animation: rotate-background 20s linear infinite;
                z-index: -1;
            }
        </style>
        <div onclick="window.$(${Action.ToUpgradeSelection})" class="rotate-background">
            <h2>${isFinalVictory ? "YOU WIN!" : `DUEL ${game.State.currentLevel - 1} WON!`}</h2>

            ${!isFinalVictory
                ? `
            <h2>
                    +2 LIFE!
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
