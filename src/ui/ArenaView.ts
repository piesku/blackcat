import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {UpgradeType} from "../upgrades/types.js";
import {
    getFighterStats,
    getPlayerEnergy,
    getPlayerHealingStatus,
    getAimingDebugInfo,
} from "./entity_queries.js";

export function ArenaView(game: Game): string {
    // Get upgrades from game state
    let playerUpgrades = game.State.playerUpgrades.map((upgrade: UpgradeType) => upgrade.name);
    let opponentUpgrades = game.State.opponentUpgrades.map((upgrade: UpgradeType) => upgrade.name);

    // Get fighter stats
    let {playerHP, opponentHP, playerAIState, opponentAIState} = getFighterStats(game);

    // Get player unified energy and healing status
    let playerEnergy = getPlayerEnergy(game);
    let maxEnergy = 1.0; // Should match MAX_ENERGY from sys_control_player
    let energyPercent = Math.round((playerEnergy / maxEnergy) * 100);

    let healingStatus = getPlayerHealingStatus(game);

    // Get aiming debug info
    let aimingDebug = getAimingDebugInfo(game);

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
                <div style="color: #FFD700; margin-bottom: 5px; font-size: clamp(8px, 2vw, 10px);">
                    ${playerAIState}
                </div>
                <!-- Debug: Direction to target -->
                <div style="color: #FF6B6B; font-size: clamp(7px, 1.8vw, 9px); margin-bottom: 3px;">
                    DEBUG: Target Dir: ${aimingDebug.playerDirection}
                </div>
                <div style="color: #FF6B6B; font-size: clamp(7px, 1.8vw, 9px); margin-bottom: 5px;">
                    Distance: ${aimingDebug.playerDistance}
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

                <!-- Player movement controls -->
                <div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #444;">
                    <div
                        style="color: #FFD700; font-size: clamp(7px, 1.8vw, 9px); margin-bottom: 3px;"
                    >
                        CONTROLS:
                    </div>
                    <div style="color: #AAA; font-size: clamp(7px, 1.8vw, 9px);">
                        Tap anywhere to energize movement & shooting
                    </div>
                    <div style="color: #AAA; font-size: clamp(7px, 1.8vw, 9px);">
                        AI controls direction
                    </div>

                    <!-- Unified energy meter -->
                    <div style="margin-top: 5px;">
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
                        "
                        >
                            <div
                                style="
                                width: ${energyPercent}%;
                                height: 100%;
                                background: ${playerEnergy > 0.6
                                    ? "#4CAF50"
                                    : playerEnergy > 0.3
                                      ? "#FFC107"
                                      : "#F44336"};
                                transition: width 0.1s ease, background-color 0.3s ease;
                            "
                            ></div>
                        </div>

                        <!-- Healing status indicator -->
                        ${healingStatus.isHealing
                            ? `<div style="margin-top: 3px; color: #4CAF50; font-size: clamp(6px, 1.5vw, 8px);">
                                 ⚕️ HEALING +0.5/s (No energy)
                               </div>`
                            : healingStatus.energy === 0
                              ? `<div style="margin-top: 3px; color: #FFC107; font-size: clamp(6px, 1.5vw, 8px);">
                                     ⚕️ Ready to heal (Full health)
                                 </div>`
                              : ""}
                    </div>
                </div>
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
                <!-- Debug: Direction to target -->
                <div style="color: #FF6B6B; font-size: clamp(7px, 1.8vw, 9px); margin-bottom: 3px;">
                    DEBUG: Target Dir: ${aimingDebug.opponentDirection}
                </div>
                <div style="color: #FF6B6B; font-size: clamp(7px, 1.8vw, 9px); margin-bottom: 5px;">
                    Distance: ${aimingDebug.opponentDistance}
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
