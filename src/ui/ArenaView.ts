import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {UpgradeType} from "../upgrades/types.js";
import {getFighterStats} from "./entity_queries.js";

export function ArenaView(game: Game): string {
    // Get upgrades from game state
    let playerUpgrades = game.State.playerUpgrades.map((upgrade: UpgradeType) => upgrade.name);
    let opponentUpgrades = game.State.opponentUpgrades.map((upgrade: UpgradeType) => upgrade.name);

    // Get fighter stats
    let {playerHP, opponentHP, playerAIState, opponentAIState} = getFighterStats(game);

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; pointer-events: none; z-index: 100;"
        >
            <!-- Player info (left side) -->
            <div
                style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; color: white; font-family: monospace; font-size: 12px;"
            >
                <div style="color: #4CAF50; font-weight: bold; margin-bottom: 5px;">PLAYER</div>
                <div style="color: #FFF; margin-bottom: 3px;">HP: ${playerHP}</div>
                <div style="color: #FFD700; margin-bottom: 8px;">${playerAIState}</div>
                ${playerUpgrades.map((upgrade: string) => `<div>• ${upgrade}</div>`).join("")}
                ${playerUpgrades.length === 0 ? '<div style="color: #666;">No upgrades</div>' : ""}
            </div>

            <!-- Opponent info (right side) -->
            <div
                style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; color: white; font-family: monospace; font-size: 12px; text-align: right;"
            >
                <div style="color: #F44336; font-weight: bold; margin-bottom: 5px;">OPPONENT</div>
                <div style="color: #FFF; margin-bottom: 3px;">HP: ${opponentHP}</div>
                <div style="color: #FFD700; margin-bottom: 8px;">${opponentAIState}</div>
                ${opponentUpgrades.map((upgrade: string) => `<div>• ${upgrade}</div>`).join("")}
                ${opponentUpgrades.length === 0
                    ? '<div style="color: #666;">No upgrades</div>'
                    : ""}
            </div>

            <!-- Game title -->
            <div
                style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; color: white; font-family: monospace; font-weight: bold;"
            >
                33 DUELS - Arena ${game.State.currentLevel}
            </div>
        </div>
    `;
}
