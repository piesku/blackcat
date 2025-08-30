import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {UpgradeType} from "../upgrades/types.js";
import {getFighterStats, getPlayerWeaponCooldowns, WeaponCooldownInfo} from "./entity_queries.js";
import {dispatch, Action} from "../actions.js";

function renderWeaponCooldown(weapon: WeaponCooldownInfo): string {
    // Calculate progress percentage (1.0 = ready, 0.0 = just fired)
    let progress =
        weapon.totalCooldown > 0
            ? Math.max(0, 1.0 - weapon.cooldownRemaining / weapon.totalCooldown)
            : 1.0;

    let progressPercent = Math.round(progress * 100);
    let backgroundColor = weapon.isReady ? "#4CAF50" : "#333";
    let textColor = weapon.isReady ? "#FFF" : "#AAA";

    return `
        <div style="
            position: relative;
            margin-bottom: 2px;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: clamp(7px, 1.8vw, 9px);
            color: ${textColor};
            overflow: hidden;
            border: 1px solid ${weapon.isReady ? "#4CAF50" : "#666"};
        ">
            <!-- Background progress fill -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: ${progressPercent}%;
                background: linear-gradient(90deg, ${backgroundColor}22, ${backgroundColor}44);
                transition: width 0.1s ease;
                z-index: -1;
            "></div>
            
            <!-- Weapon name and status -->
            <span style="position: relative; z-index: 1;">
                ${weapon.name} ${weapon.isReady ? "●" : Math.ceil(weapon.cooldownRemaining).toFixed(1) + "s"}
            </span>
        </div>
    `;
}

export function ArenaView(game: Game): string {
    // Get upgrades from game state
    let playerUpgrades = game.State.playerUpgrades.map((upgrade: UpgradeType) => upgrade.name);
    let opponentUpgrades = game.State.opponentUpgrades.map((upgrade: UpgradeType) => upgrade.name);

    // Get fighter stats
    let {playerHP, opponentHP, playerAIState, opponentAIState} = getFighterStats(game);

    // Get player weapon cooldowns
    let playerWeaponCooldowns = getPlayerWeaponCooldowns(game);

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
                ${playerUpgrades
                    .map(
                        (upgrade: string) =>
                            `<div style="font-size: clamp(8px, 2vw, 10px);">• ${upgrade}</div>`,
                    )
                    .join("")}
                ${playerUpgrades.length === 0
                    ? '<div style="color: #666; font-size: clamp(8px, 2vw, 10px);">No upgrades</div>'
                    : ""}

                <!-- Player weapon cooldowns -->
                ${playerWeaponCooldowns.length > 0
                    ? `
                    <div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #444;">
                        <div style="color: #FFD700; font-size: clamp(7px, 1.8vw, 9px); margin-bottom: 3px;">
                            WEAPONS (Click to fire):
                        </div>
                        ${playerWeaponCooldowns.map((weapon) => renderWeaponCooldown(weapon)).join("")}
                    </div>
                `
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
