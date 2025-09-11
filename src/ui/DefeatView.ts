import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";

export function DefeatView(game: Game): string {
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
                    #f44336cc 0 6deg,
                    #d32f2fcc 0 12deg
                );
                animation: rotate-background 20s linear infinite;
                z-index: -1;
            }
        </style>
        <div class="rotate-background">
            <h2>OH NO!</h2>

            <h2>DUEL ${game.State.currentLevel} LOST!</h2>

            <button onclick="window.$(${Action.RestartRun})">TRY AGAIN</button>
        </div>
    `;
}
