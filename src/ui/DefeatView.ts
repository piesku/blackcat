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
                top: -50%;
                left: -50%;
                right: -50%;
                bottom: -50%;
                background: repeating-conic-gradient(
                    from 0deg at 50% 50%,
                    #f44336cc 0 6deg,
                    #d32f2fcc 0 12deg
                );
                animation: rotate-background 12s linear infinite;
                z-index: -1;
            }
        </style>
        <div class="rotate-background">
            <h2>Oops!</h2>

            <h2>Reached Duel ${game.State.currentLevel}</h2>

            <!-- Restart button -->
            <button onclick="window.$(${Action.RestartRun})">TRY AGAIN</button>
        </div>
    `;
}
