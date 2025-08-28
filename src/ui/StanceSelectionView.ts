import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {Action} from "../actions.js";
import {
    CombatStance,
    getStanceName,
    getStanceDescription,
    getStanceEmoji,
    STANCE_MODIFIERS,
} from "../components/com_control_ai.js";
import {UpgradeType} from "../upgrades/types.js";

export function StanceSelectionView(game: Game): string {
    const stances = [CombatStance.Aggressive, CombatStance.Defensive, CombatStance.Berserker];

    function getStanceStats(stance: CombatStance): string {
        const modifiers = STANCE_MODIFIERS[stance];
        let stats: string[] = [];

        if (modifiers.DamageMultiplier !== 1.0) {
            let pct = Math.round((modifiers.DamageMultiplier - 1.0) * 100);
            stats.push(`${pct > 0 ? "+" : ""}${pct}% damage`);
        }

        if (modifiers.HealthModifier !== 0) {
            stats.push(
                `${modifiers.HealthModifier > 0 ? "+" : ""}${modifiers.HealthModifier} health`,
            );
        }

        if (modifiers.MoveSpeedMultiplier !== 1.0) {
            let pct = Math.round((modifiers.MoveSpeedMultiplier - 1.0) * 100);
            stats.push(`${pct > 0 ? "+" : ""}${pct}% speed`);
        }

        if (modifiers.AttackCooldownMultiplier !== 1.0) {
            let pct = Math.round((1.0 - modifiers.AttackCooldownMultiplier) * 100);
            stats.push(`${pct > 0 ? "+" : ""}${pct}% attack speed`);
        }

        if (!modifiers.CanRetreat) {
            stats.push("no retreating");
        }

        if (modifiers.ForceDashAttacks) {
            stats.push("constant aggression");
        }

        return stats.join(" • ");
    }

    function getStanceColor(stance: CombatStance): string {
        switch (stance) {
            case CombatStance.Aggressive:
                return "#FF6B6B";
            case CombatStance.Defensive:
                return "#4ECDC4";
            case CombatStance.Berserker:
                return "#FF9F43";
            default:
                return "#FFD700";
        }
    }

    return html`
        <style>
            @media (min-width: 900px) {
                .stance-container {
                    flex-direction: row !important;
                }
                .stance-card {
                    width: 250px !important;
                    min-height: 180px !important;
                    flex: 1 !important;
                }
                .loadout-container {
                    flex-direction: row !important;
                }
                .loadout-box {
                    flex: 1 !important;
                    min-width: 250px !important;
                }
            }
            @media (max-width: 899px) {
                .stance-container {
                    flex-direction: column !important;
                    align-items: center !important;
                }
                .stance-card {
                    width: 100% !important;
                    min-height: 140px !important;
                    max-width: 600px !important;
                }
                .loadout-container {
                    flex-direction: column !important;
                    align-items: center !important;
                }
                .loadout-box {
                    width: 100% !important;
                    max-width: 600px !important;
                }
            }
        </style>
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; color: white; font-family: monospace; padding: 20px; box-sizing: border-box; overflow-y: auto;"
        >
            <!-- Title -->
            <div
                style="font-size: clamp(20px, 6vw, 32px); font-weight: bold; margin-bottom: 15px; color: #FFD700; text-align: center;"
            >
                CHOOSE YOUR FIGHTING STYLE
            </div>

            <!-- Arena info -->
            <div
                style="font-size: clamp(12px, 3vw, 16px); margin-bottom: 20px; color: #CCC; text-align: center;"
            >
                Arena ${game.State.currentLevel} • Population:
                ${game.State.population.toLocaleString()}
            </div>

            <!-- Hint text -->
            <div
                style="font-size: clamp(10px, 2.5vw, 14px); margin-bottom: 25px; color: #AAA; text-align: center; max-width: 600px; line-height: 1.4;"
            >
                Choose a combat stance that matches your strategy. Consider your opponent's upgrades
                below.
            </div>

            <!-- Stance choices -->
            <div
                class="stance-container"
                style="display: flex; gap: 15px; margin-bottom: 30px; width: 100%; max-width: 800px; justify-content: center;"
            >
                ${stances
                    .map(
                        (stance: CombatStance) => `
                    <div 
                        onclick="window.$(${Action.StanceSelected}, ${stance})"
                        class="stance-card"
                        style="
                            background: rgba(255,255,255,0.1); 
                            border: 2px solid #555; 
                            border-radius: 10px; 
                            padding: 15px; 
                            cursor: pointer; 
                            transition: all 0.2s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            box-sizing: border-box;
                        "
                        onmouseover="this.style.borderColor='${getStanceColor(stance)}'; this.style.background='rgba(255,255,255,0.15)'"
                        onmouseout="this.style.borderColor='#555'; this.style.background='rgba(255,255,255,0.1)'"
                    >
                        <div style="font-size: clamp(24px, 6vw, 32px); margin-bottom: 8px;">
                            ${getStanceEmoji(stance)}
                        </div>
                        <div style="font-weight: bold; font-size: clamp(16px, 4vw, 18px); margin-bottom: 8px; color: ${getStanceColor(stance)};">
                            ${getStanceName(stance)}
                        </div>
                        <div style="font-size: clamp(11px, 2.5vw, 13px); color: #FFF; line-height: 1.3; margin-bottom: 12px;">
                            ${getStanceDescription(stance)}
                        </div>
                        <div style="font-size: clamp(10px, 2vw, 11px); color: #AAA; line-height: 1.2;">
                            ${getStanceStats(stance)}
                        </div>
                    </div>
                `,
                    )
                    .join("")}
            </div>

            <!-- Player and Opponent loadouts -->
            <div
                class="loadout-container"
                style="display: flex; gap: 15px; width: 100%; max-width: 800px; justify-content: center;"
            >
                <!-- Player loadout -->
                <div
                    class="loadout-box"
                    style="background: rgba(0,255,0,0.1); border: 1px solid #4CAF50; border-radius: 5px; padding: 12px; box-sizing: border-box;"
                >
                    <div
                        style="color: #4CAF50; font-weight: bold; margin-bottom: 8px; text-align: center; font-size: clamp(12px, 3vw, 14px);"
                    >
                        YOUR LOADOUT
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                        ${game.State.playerUpgrades.length > 0
                            ? game.State.playerUpgrades
                                  .map(
                                      (upgrade: UpgradeType) => `
                                <span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 3px; font-size: clamp(10px, 2.5vw, 12px);">
                                    ${upgrade.name}
                                </span>
                            `,
                                  )
                                  .join("")
                            : '<span style="color: #666; font-style: italic; font-size: clamp(10px, 2.5vw, 12px);">No upgrades yet</span>'}
                    </div>
                </div>

                <!-- Opponent loadout -->
                <div
                    class="loadout-box"
                    style="background: rgba(255,0,0,0.1); border: 1px solid #F44336; border-radius: 5px; padding: 12px; box-sizing: border-box;"
                >
                    <div
                        style="color: #F44336; font-weight: bold; margin-bottom: 8px; text-align: center; font-size: clamp(12px, 3vw, 14px);"
                    >
                        OPPONENT LOADOUT
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                        ${game.State.opponentUpgrades
                            .map(
                                (upgrade: UpgradeType) => `
                            <span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 3px; font-size: clamp(10px, 2.5vw, 12px);">
                                ${upgrade.name}
                            </span>
                        `,
                            )
                            .join("")}
                    </div>
                </div>
            </div>
        </div>
    `;
}
