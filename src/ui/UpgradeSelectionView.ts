import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {Action} from "../actions.js";
import {ALL_UPGRADES, UpgradeType} from "../upgrades/types.js";

export function UpgradeSelectionView(game: Game): string {
    // Use persisted upgrade choices from game state instead of generating new ones
    // This prevents players from re-rolling choices by reloading the page
    let choices = game.State.availableUpgradeChoices;

    return html`
        <style>
            @media (min-width: 900px) {
                .upgrade-container {
                    flex-direction: row !important;
                }
                .upgrade-card {
                    width: 280px !important;
                    min-height: 150px !important;
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
                .upgrade-container {
                    flex-direction: column !important;
                    align-items: center !important;
                }
                .upgrade-card {
                    width: 100% !important;
                    min-height: 120px !important;
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
                CHOOSE YOUR UPGRADE
            </div>

            <!-- Arena info -->
            <div
                style="font-size: clamp(12px, 3vw, 16px); margin-bottom: 20px; color: #CCC; text-align: center;"
            >
                Arena ${game.State.currentLevel} • Population:
                ${game.State.population.toLocaleString()}
            </div>

            <!-- Upgrade choices -->
            <div
                class="upgrade-container"
                style="display: flex; gap: 15px; margin-bottom: 30px; width: 100%; max-width: 800px; justify-content: center;"
            >
                ${choices
                    .map(
                        (upgrade: UpgradeType, index: number) => `
                    <div 
                        onclick="window.$(${Action.UpgradeSelected}, ${index})"
                        class="upgrade-card"
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
                        onmouseover="this.style.borderColor='#FFD700'; this.style.background='rgba(255,215,0,0.1)'"
                        onmouseout="this.style.borderColor='#555'; this.style.background='rgba(255,255,255,0.1)'"
                    >
                        <div style="font-weight: bold; font-size: clamp(16px, 4vw, 18px); margin-bottom: 8px; color: #FFD700;">
                            ${upgrade.name}
                        </div>
                        <div style="font-size: clamp(10px, 2.5vw, 12px); color: #CCC; text-transform: uppercase; margin-bottom: 8px;">
                            ${upgrade.category}
                        </div>
                        <div style="font-size: clamp(12px, 3vw, 14px); color: #FFF; line-height: 1.4; max-width: 100%;">
                            ${upgrade.description || "Powerful upgrade for your fighter"}
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
