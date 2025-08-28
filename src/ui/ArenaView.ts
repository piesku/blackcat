import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {UpgradeType} from "../upgrades/types.js";
import {getFighterStats} from "./entity_queries.js";
import {dispatch, Action} from "../actions.js";
import {getStanceName, getStanceEmoji} from "../components/com_control_ai.js";

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
                style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 5px; color: white; font-family: monospace; font-size: clamp(10px, 2.5vw, 12px); max-width: 35vw;"
            >
                <div style="color: #4CAF50; font-weight: bold; margin-bottom: 3px;">PLAYER</div>
                <div style="color: #FFF; margin-bottom: 2px;">HP: ${playerHP}</div>
                <div style="color: #FFD700; margin-bottom: 2px; font-size: clamp(8px, 2vw, 10px);">
                    ${playerAIState}
                </div>
                <div style="color: #FF9500; margin-bottom: 5px; font-size: clamp(8px, 2vw, 10px);">
                    ${getStanceEmoji(game.State.selectedStance)}
                    ${getStanceName(game.State.selectedStance)}
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
            </div>

            <!-- Opponent info (right side) -->
            <div
                style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 5px; color: white; font-family: monospace; font-size: clamp(10px, 2.5vw, 12px); text-align: right; max-width: 35vw;"
            >
                <div style="color: #F44336; font-weight: bold; margin-bottom: 3px;">OPPONENT</div>
                <div style="color: #FFF; margin-bottom: 2px;">HP: ${opponentHP}</div>
                <div style="color: #FFD700; margin-bottom: 5px; font-size: clamp(8px, 2vw, 10px);">
                    ${opponentAIState}
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

            <!-- Game title and restart button -->
            <div
                style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 5px; color: white; font-family: monospace; font-weight: bold; font-size: clamp(10px, 3vw, 14px); white-space: nowrap; display: flex; align-items: center; gap: 12px;"
            >
                <span>33 DUELS - Arena ${game.State.currentLevel}</span>
                <button
                    onclick="window.$(5)"
                    style="background: #F44336; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-family: monospace; font-size: clamp(8px, 2vw, 10px); cursor: pointer; pointer-events: auto;"
                    title="Restart run from level 1"
                >
                    RESTART
                </button>
            </div>
        </div>
    `;
}
