import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {dispatch, Action} from "../actions.js";
import {ALL_UPGRADES, UpgradeType} from "../upgrades/types.js";

export function UpgradeSelectionView(game: Game): string {
    // Cache upgrade choices in ViewData to prevent regeneration every frame
    if (!game.ViewData?.upgradeChoices) {
        // Generate 3 random upgrade choices excluding already owned upgrades
        let availableUpgrades = ALL_UPGRADES.filter(
            (upgrade) => !game.State.playerUpgrades.some((owned) => owned.id === upgrade.id),
        );

        let choices: UpgradeType[] = [];
        for (let i = 0; i < 3 && availableUpgrades.length > 0; i++) {
            let randomIndex = Math.floor(Math.random() * availableUpgrades.length);
            choices.push(availableUpgrades.splice(randomIndex, 1)[0]);
        }

        if (!game.ViewData) {
            game.ViewData = {};
        }
        game.ViewData.upgradeChoices = choices;

        // Store choices in global for onclick access
        // @ts-ignore
        window.upgradeChoices = choices;
    }

    let choices = game.ViewData.upgradeChoices;

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: monospace;"
        >
            <!-- Title -->
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 20px; color: #FFD700;">
                CHOOSE YOUR UPGRADE
            </div>

            <!-- Arena info -->
            <div style="font-size: 16px; margin-bottom: 30px; color: #CCC;">
                Arena ${game.State.currentLevel} • Population:
                ${game.State.population.toLocaleString()}
            </div>

            <!-- Upgrade choices -->
            <div style="display: flex; gap: 20px; margin-bottom: 40px;">
                ${choices
                    .map(
                        (upgrade: UpgradeType, index: number) => `
                    <div 
                        onclick="window.$(${Action.UpgradeSelected}, window.upgradeChoices[${index}])"
                        style="
                            width: 200px; 
                            height: 150px; 
                            background: rgba(255,255,255,0.1); 
                            border: 2px solid #555; 
                            border-radius: 10px; 
                            padding: 20px; 
                            cursor: pointer; 
                            transition: all 0.2s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                        "
                        onmouseover="this.style.borderColor='#FFD700'; this.style.background='rgba(255,215,0,0.1)'"
                        onmouseout="this.style.borderColor='#555'; this.style.background='rgba(255,255,255,0.1)'"
                    >
                        <div style="font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #FFD700;">
                            ${upgrade.name}
                        </div>
                        <div style="font-size: 12px; color: #CCC; text-transform: uppercase; margin-bottom: 10px;">
                            ${upgrade.category}
                        </div>
                        <div style="font-size: 14px; color: #FFF; line-height: 1.4;">
                            ${upgrade.description || "Powerful upgrade for your fighter"}
                        </div>
                    </div>
                `,
                    )
                    .join("")}
            </div>

            <!-- Opponent preview -->
            <div
                style="background: rgba(255,0,0,0.1); border: 1px solid #F44336; border-radius: 5px; padding: 15px; margin-top: 20px;"
            >
                <div
                    style="color: #F44336; font-weight: bold; margin-bottom: 10px; text-align: center;"
                >
                    OPPONENT LOADOUT
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                    ${game.State.opponentUpgrades
                        .map(
                            (upgrade: UpgradeType) => `
                        <span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 3px; font-size: 12px;">
                            ${upgrade.name}
                        </span>
                    `,
                        )
                        .join("")}
                </div>
            </div>
        </div>
    `;
}
