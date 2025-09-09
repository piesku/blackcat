import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";

export function ArenaIntroView(game: Game): string {
    return html`
        <div>
            <div
                style="position: absolute; left: 50%; transform: translate(-50%, -50%); background: #000c; padding: 8px 12px; color: white; font-family: monospace; font-weight: bold; font-size: 10vw; animation: titleSlide 2s ease-in-out forwards;"
                onanimationend="$(${Action.ArenaIntroComplete})"
            >
                Duel ${game.State.currentLevel}
            </div>

            <style>
                @keyframes titleSlide {
                    0% {
                        top: -20%;
                    }
                    30% {
                        top: 50%;
                    }
                    80% {
                        top: 50%;
                    }
                    100% {
                        top: 120%;
                    }
                }
            </style>
        </div>
    `;
}
