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
        <div class="rotate-background">
            ${isFinalVictory
                ? `
                    <h2>VICTORY!</h2>
                    <h2>THANKS FOR PLAYING</h2>
                    <button onclick="window.$(${Action.RestartRun})">PLAY AGAIN</button>
                `
                : `
                    <h2>DUEL ${game.State.currentLevel - 1} WON!</h2>
                    <h2>+2 LIFE!</h2>
                    <button onclick="window.$(${Action.ToUpgradeSelection})">CONTINUE</button>
                `}
        </div>
    `;
}
