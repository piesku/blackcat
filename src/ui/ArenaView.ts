import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {getFighterStats} from "./entity_queries.js";

export function ArenaView(game: Game): string {
    // Get fighter stats
    let {PlayerHP, OpponentHP, PlayerMana, OpponentMana} = getFighterStats(game);

    const createBar = (
        value: {current: number; max: number} | null,
        isPlayer: boolean,
        isHealthBar: boolean,
    ) => {
        const percent = value ? (value.current / value.max) * 100 : 0;
        const barColor = isHealthBar
            ? isPlayer
                ? "#2196F3"
                : "#F44336"
            : isPlayer
              ? "#4CAF50"
              : "#FF9800"; // Blue for player mana, orange for opponent mana

        const barLabel = isHealthBar ? "LIFE" : "MANA";
        const position = isPlayer ? "left: 20px;" : "right: 20px;";
        const topOffset = isHealthBar
            ? "calc(20px + env(safe-area-inset-top))"
            : "calc(30px + 3vh + env(safe-area-inset-top))";

        // Different skew directions for left vs right bars
        const skewTransform = isPlayer
            ? "transform: skewX(-15deg) rotate(-3deg);"
            : "transform: skewX(15deg) rotate(3deg);";

        return html`
            <div
                style="
                    position: absolute; 
                    ${position} 
                    top: ${topOffset}; 
                    width: calc(100% / 2 - 40px); 
                    height: 3vh; 
                    background: #222; 
                    border: 3px solid #000; 
                    box-shadow: 3px 3px 0 #000c;
                    ${skewTransform}
                    overflow: hidden;
                "
            >
                <div
                    style="
                        width: ${percent}%; 
                        height: 100%; 
                        background: ${barColor}; 
                        ${!isPlayer ? "float: right;" : ""}
                        transition: width 0.3s ease;
                    "
                ></div>
                <div
                    style="
                        position: absolute; 
                        top: 0; 
                        left: 0; 
                        right: 0; 
                        bottom: 0; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        color: #fff;
                        text-shadow: 1px 1px 0 #000;
                    "
                >
                    ${value ? Math.ceil(value.current) : 0} ${barLabel}
                </div>
            </div>
        `;
    };

    return html`
        <div>
            ${createBar(PlayerHP, true, true)} ${createBar(OpponentHP, false, true)}
            ${createBar(PlayerMana, true, false)} ${createBar(OpponentMana, false, false)}
        </div>
    `;
}
