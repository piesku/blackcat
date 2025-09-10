import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";

export function ArenaIntroView(game: Game): string {
    return html`
        <div>
            <div
                style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); animation: titleSlide 1s ease forwards;"
                onanimationend="$(${Action.ArenaIntroComplete})"
            >
                <h2>DUEL ${game.State.currentLevel}</h2>
            </div>

            <style>
                @keyframes titleSlide {
                    0% {
                        top: -20%;
                    }
                    20% {
                        top: 45%;
                    }
                    80% {
                        top: 47%;
                    }
                    100% {
                        top: 120%;
                    }
                }
            </style>
        </div>
    `;
}
