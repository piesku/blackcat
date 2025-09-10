import {html} from "../../lib/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";
import {ALL_UPGRADES_MAP, UpgradeId, UpgradeType} from "../upgrades/types.js";

export function UpgradeSelectionView(game: Game): string {
    // Use persisted upgrade choices from game state instead of generating new ones
    // This prevents players from re-rolling choices by reloading the page
    // State stores ids; map to UpgradeType objects for rendering
    let choices: UpgradeType[] = game.State.availableUpgradeChoices
        .map((id: UpgradeId) => ALL_UPGRADES_MAP[id])
        .filter((u): u is UpgradeType => !!u);

    // Player / opponent loadouts (ids -> objects)
    let playerLoadout: UpgradeType[] = game.State.playerUpgrades
        .map((id: UpgradeId) => ALL_UPGRADES_MAP[id])
        .filter((u): u is UpgradeType => !!u);
    let opponentLoadout: UpgradeType[] = game.State.opponentUpgrades
        .map((id: UpgradeId) => ALL_UPGRADES_MAP[id])
        .filter((u): u is UpgradeType => !!u);

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; background: #ffea64; background-image: radial-gradient(#fddd50 20%, transparent 0), radial-gradient(#fddd50 20%, transparent 0); background-size: 20px 20px; background-position: 0 0, 10px 10px;"
        >
            <h2>DUEL ${game.State.currentLevel}</h2>

            <!-- Upgrade choices -->
            <div style="display: flex; gap: 15px; margin-bottom: 30px; justify-content: center;">
                ${choices
                    .map(
                        (upgrade: UpgradeType, index: number) => `
                    <div 
                        onclick="window.$(${Action.UpgradeSelected}, ${index})"
                        style="
                            border: 2px solid #000;
                            background: #fff;
                            transition: all 0.2s;
                            flex: 1;
                            box-shadow: 4px 4px 0 #000c;
                        "
                    >
                        <h3>
                            ${upgrade.name}
                        </h3>
                        <div>
                            ${upgrade.description}
                        </div>

                        <button>CHOOSE</button>
                    </div>
                `,
                    )
                    .join("")}
            </div>
        </div>
    `;
}
