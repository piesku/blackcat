import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";
import {getRarityColor, getTierRarity} from "../state.js";
import {
    ALL_UPGRADES_MAP,
    UpgradeCategory,
    UpgradeInstance,
    UpgradeRarity,
} from "../upgrades/types.js";

function getRarityName(rarity: UpgradeRarity): string {
    switch (rarity) {
        case UpgradeRarity.Uncommon:
            return "UNCOMMON";
        case UpgradeRarity.Rare:
            return "RARE";
        case UpgradeRarity.Legendary:
            return "LEGENDARY";
        default:
            return "COMMON";
    }
}

export function UpgradeSelectionView(game: Game): string {
    // Use persisted upgrade choices from game state instead of generating new ones
    // This prevents players from re-rolling choices by reloading the page

    return html`
        <style>
            .translate-background {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                background: #ffea64;
            }
            .translate-background::before {
                content: "";
                position: absolute;
                top: -100%;
                left: -100%;
                right: -100%;
                bottom: -100%;
                background-image:
                    radial-gradient(#fddd50 20%, transparent 0),
                    radial-gradient(#fddd50 20%, transparent 0);
                background-size: 20px 20px;
                background-position:
                    0 0,
                    10px 10px;
                animation: translate-background 4s linear infinite;
                z-index: -1;
            }
            .u {
                position: relative;
                padding: 15px;
                border: 2px solid #333;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                transition: transform 0.1s ease;
            }
            .u:hover {
                transform: scale(1.05);
            }
            .r {
                position: absolute;
                top: -1px;
                left: -1px;
                background: #000;
                color: #fff;
                font-size: 2vmin;
                padding: 2px 6px;
                border-bottom-right-radius: 6px;
                letter-spacing: 1px;
                z-index: -1;
            }
        </style>
        <div class="translate-background">
            <h2>DUEL&nbsp;${game.State.currentLevel}</h2>

            <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                ${game.State.availableUpgradeChoices
                    .map((u: UpgradeInstance, index: number) => {
                        let upgrade = ALL_UPGRADES_MAP[u.id];
                        if (!upgrade) return `<div>Unknown Upgrade</div>`;
                        let tierRarity = getTierRarity(upgrade.Rarity, u.tier);
                        let rarityName = getRarityName(tierRarity);
                        return html`
                            <div class="u" onclick="window.$(${Action.UpgradeSelected}, ${index})">
                                <div class="r">
                                    ${rarityName}${upgrade.Tiers.length > 1
                                        ? ` — TIER ${u.tier}`
                                        : ""}
                                </div>
                                <h3 style="color: ${getRarityColor(u)}; margin-top: 0;">
                                    ${upgrade.Name}
                                </h3>
                                <p>
                                    ${upgrade.Category === UpgradeCategory.Weapon
                                        ? "Weapon"
                                        : upgrade.Category === UpgradeCategory.Companion
                                          ? "Companion"
                                          : upgrade.Tiers[u.tier - 1] || "Enhancement"}
                                </p>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        </div>
    `;
}
