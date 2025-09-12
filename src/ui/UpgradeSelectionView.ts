import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";
import {
    ALL_UPGRADES_MAP,
    UpgradeCategory,
    UpgradeId,
    UpgradeInstance,
    UpgradeType,
} from "../upgrades/types.js";

export function UpgradeSelectionView(game: Game): string {
    // Use persisted upgrade choices from game state instead of generating new ones
    // This prevents players from re-rolling choices by reloading the page
    // State stores ids; map to UpgradeType objects for rendering
    let choices: UpgradeType[] = game.State.availableUpgradeChoices
        .map((ui) => ui.id)
        .map((id: UpgradeId) => ALL_UPGRADES_MAP[id])
        .filter((u): u is UpgradeType => !!u);

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
        </style>
        <div class="translate-background">
            <h2>DUEL&nbsp;${game.State.currentLevel}</h2>

            <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                ${game.State.availableUpgradeChoices
                    .map((u: UpgradeInstance, index: number) => {
                        let upgrade = ALL_UPGRADES_MAP[u.id];
                        if (!upgrade) return `<div>Unknown Upgrade</div>`;
                        return html`
                            <div
                                onclick="window.$(${Action.UpgradeSelected}, ${index})"
                                style="
                                    border: 4px solid #000;
                                    background: #fff;
                                    transition: all 0.2s;
                                    width: calc(100% - 80px);
                                    box-shadow: 4px 4px 0 #000c;
                                    transform: skewX(-10deg) rotate(-2deg);
                                    text-align: center;
                                    padding: 1em;
                                    margin: 0 20px;
                                    cursor: pointer;
                                "
                                onmouseover="this.style.transform='skewX(-10deg) rotate(-2deg) scale(1.05)'; this.style.boxShadow='6px 6px 0 #000c'"
                                onmouseout="this.style.transform='skewX(-10deg) rotate(-2deg)'; this.style.boxShadow='4px 4px 0 #000c'"
                            >
                                <h3
                                    style="color: ${upgrade.Category === UpgradeCategory.Weapon
                                        ? "#ff4a4a"
                                        : upgrade.Category === UpgradeCategory.Enhancement
                                          ? "#8bc34a"
                                          : upgrade.Category === UpgradeCategory.Companion
                                            ? "#55ceff"
                                            : upgrade.Category === UpgradeCategory.Special
                                              ? "#e75dff"
                                              : "#000"};"
                                >
                                    ${upgrade.Name}
                                </h3>
                                <p>
                                    ${upgrade.Category === UpgradeCategory.Weapon
                                        ? "Weapon"
                                        : upgrade.Category === UpgradeCategory.Companion
                                          ? "Companion"
                                          : upgrade.Tiers[u.tier - 1] || "Unknown Tier"}
                                </p>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        </div>
    `;
}
