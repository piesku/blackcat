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
    let energyPercent = Math.round((playerEnergy / maxEnergy) * 100);

    const healthbar = (hp: {current: number; max: number} | null, isPlayer: boolean) => {
        if (!hp) return "";
        const percent = (hp.current / hp.max) * 100;
        const innerStyle = `width: ${percent}%; height: 100%; background: ${isPlayer ? "#4CAF50" : "#F44336"}; ${!isPlayer ? "float: right;" : ""}`;

        return html`
            <div
                style="position: absolute; ${isPlayer
                    ? "left: 10px"
                    : "right: 10px"}; top: 10px; width: 40%; height: 20px; background: #333; border-radius: 5px; overflow: hidden; border: 2px solid #222;"
            >
                <div style="${innerStyle}"></div>
            </div>
        `;
    };

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; pointer-events: none; z-index: 100;"
        >
            ${healthbar(PlayerHP, true)} ${healthbar(OpponentHP, false)}

            <!-- Player info (left side) -->
            <div
                style="position: absolute; top: 40px; left: 10px; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 5px; color: white; font-family: monospace; font-size: clamp(10px, 2.5vw, 12px); max-width: 35vw;"
            >
                <div style="color: #4CAF50; font-weight: bold; margin-bottom: 3px;">PLAYER</div>
                <div style="color: #FFF; margin-bottom: 2px;">
                    HP: ${PlayerHP ? `${PlayerHP.current}/${PlayerHP.max}` : "?"}
                </div>
                <div style="color: #FFD700; margin-bottom: 5px; font-size: clamp(8px, 2vw, 10px);">
                    ${PlayerAIState}
                </div>
                ${playerUpgrades
                    .map(
                        (upgrade: string) =>
                            `<div style="font-size: clamp(8px, 2vw, 10px);">• ${upgrade}</div>`,
                    )
                    .join("")}
                ${playerUpgrades.length === 0
                    ? '<div style="color: #666; font-size: clamp(8px, 2vw, 10px);">No upgrades</div>'
                    : ""}

                <!-- Unified energy meter -->
                <div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #444;">
                    <div
                        style="color: #FFD700; font-size: clamp(6px, 1.5vw, 8px); margin-bottom: 2px;"
                    >
                        ENERGY: ${playerEnergy.toFixed(1)}s
                    </div>
                    <div
                        style="
                        width: 100%;
                        height: 4px;
                        background: #333;
                        border-radius: 2px;
                        overflow: hidden;
                        position: relative;
                    "
                    >
                        <div
                            style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(to right, #4CAF50, #FFC107, #F44336);
                            clip-path: inset(0 ${100 - energyPercent}% 0 0);
                            transition: clip-path 0.1s ease;
                        "
                        ></div>
                    </div>
                </div>
            </div>

            <!-- Opponent info (right side) -->
            <div
                style="position: absolute; top: 40px; right: 10px; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 5px; color: white; font-family: monospace; font-size: clamp(10px, 2.5vw, 12px); text-align: right; max-width: 35vw;"
            >
                <div style="color: #F44336; font-weight: bold; margin-bottom: 3px;">OPPONENT</div>
                <div style="color: #FFF; margin-bottom: 2px;">
                    HP: ${OpponentHP ? `${OpponentHP.current}/${OpponentHP.max}` : "?"}
                </div>
                <div style="color: #FFD700; margin-bottom: 5px; font-size: clamp(8px, 2vw, 10px);">
                    ${OpponentAIState}
                </div>
                ${opponentUpgrades
                    .map(
                        (upgrade: string) =>
                            `<div style="font-size: clamp(8px, 2vw, 10px);">• ${upgrade}</div>`,
                    )
                    .join("")}
                ${opponentUpgrades.length === 0
                    ? '<div style="color: #666; font-size: clamp(8px, 2vw, 10px);">No upgrades</div>'
                    : ""}
            </div>

            <!-- Game title -->
            <div
                style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 5px; color: white; font-family: monospace; font-weight: bold; font-size: clamp(10px, 3vw, 14px); white-space: nowrap;"
            >
                Arena ${game.State.currentLevel}
            </div>
        </div>
    `;
}
