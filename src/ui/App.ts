import {html} from "../../lib/html.js";
import {Game} from "../game.js";

export function App(game: Game) {
    return html`
        <div style="margin: 10px;">
            <h1 style="float: left; margin-right: 10px;">BlackCat</h1>
        </div>
    `;
}
