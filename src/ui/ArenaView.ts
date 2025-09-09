import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {ALL_UPGRADES_MAP, UpgradeId, UpgradeType} from "../upgrades/types.js";
import {getFighterStats, getPlayerEnergy} from "./entity_queries.js";

export function ArenaView(game: Game): string {
    // Get upgrades from game state (state stores ids)
    let playerUpgrades = game.State.playerUpgrades
        .map((id: UpgradeId) => ALL_UPGRADES_MAP[id])
        .filter((u): u is UpgradeType => !!u)
        .map((u) => u.name);
    let opponentUpgrades = game.State.opponentUpgrades
        .map((id: UpgradeId) => ALL_UPGRADES_MAP[id])
        .filter((u): u is UpgradeType => !!u)
        .map((u) => u.name);

    // Get fighter stats
    let {PlayerHP, OpponentHP, PlayerAIState, OpponentAIState} = getFighterStats(game);

    // Get player unified energy and healing status
    let playerEnergy = getPlayerEnergy(game);
    let maxEnergy = 5;

    const healthbar = (hp: {current: number; max: number} | null, isPlayer: boolean) => {
        if (!hp) return "";
        const percent = (hp.current / hp.max) * 100;
        const innerStyle = `width: ${percent}%; height: 100%; background: ${isPlayer ? "#4CAF50" : "#F44336"}; ${!isPlayer ? "float: right;" : ""}`;

        return html`
            <div
                style="position: absolute; ${isPlayer
                    ? "left: 10px"
                    : "right: 10px"}; top: 10px; width: 40%; height: 20px; background: #333; overflow: hidden; border: 2px solid #222;"
            >
                <div style="${innerStyle}"></div>
            </div>
        `;
    };

    return html`
        <div>
            ${healthbar(PlayerHP, true)} ${healthbar(OpponentHP, false)}

            <div
                style="position: absolute; top: 40px; left: 10px; background: #000c; padding: 8px; color: white; font-family: monospace; font-size: clamp(10px, 2.5vw, 12px); max-width: 35vw;"
            >
                <div style="color: #4CAF50; font-weight: bold; margin-bottom: 3px;">PLAYER</div>
                ${playerUpgrades
                    .map(
                        (upgrade: string) =>
                            `<div style="font-size: clamp(8px, 2vw, 10px);">• ${upgrade}</div>`,
                    )
                    .join("")}
            </div>

            <div
                style="position: absolute; top: 40px; right: 10px; background: #000c; padding: 8px; color: white; font-family: monospace; font-size: clamp(10px, 2.5vw, 12px); text-align: right; max-width: 35vw;"
            >
                <div style="color: #F44336; font-weight: bold; margin-bottom: 3px;">OPPONENT</div>
                ${opponentUpgrades
                    .map(
                        (upgrade: string) =>
                            `<div style="font-size: clamp(8px, 2vw, 10px);">• ${upgrade}</div>`,
                    )
                    .join("")}
            </div>

            <div
                style="position: absolute; top: 5%; left: 50%; transform: translate(-50%, -50%); background: #000c; padding: 8px 12px; color: white; font-family: monospace; font-weight: bold; font-size: clamp(10px, 3vw, 14px); white-space: nowrap;"
            >
                Arena ${game.State.currentLevel}
            </div>
        </div>
    `;
}
