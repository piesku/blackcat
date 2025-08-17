import {html} from "../../lib/html.js";
import {AIState} from "../components/com_ai_fighter.js";
import {Game, GameView} from "../game.js";
import {dispatch, Action} from "../actions.js";
import {Has} from "../world.js";
import {ALL_UPGRADES, UpgradeType} from "../upgrades/types.js";

// Helper function to get AI state name
function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling:
            return "Circling";
        case AIState.Attacking:
            return "Attacking";
        case AIState.Retreating:
            return "Retreating";
        case AIState.Stunned:
            return "Stunned";
        case AIState.Pursuing:
            return "Pursuing";
        default:
            return "Unknown";
    }
}

export function App(game: Game) {
    switch (game.CurrentView) {
        case GameView.UpgradeSelection:
            return UpgradeSelectionView(game);
        case GameView.Arena:
            return ArenaHUD(game);
        case GameView.Victory:
            return VictoryView(game);
        case GameView.Defeat:
            return DefeatView(game);
        default:
            return ArenaHUD(game);
    }
}

function UpgradeSelectionView(game: Game): string {
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

function VictoryView(game: Game): string {
    let isFinalVictory = game.ViewData?.isFinalVictory;

    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,100,0,0.8); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: monospace;"
        >
            <!-- Victory message -->
            <div
                style="font-size: 48px; font-weight: bold; margin-bottom: 20px; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
            >
                ${isFinalVictory ? "FINAL VICTORY!" : "VICTORY!"}
            </div>

            <!-- Progress info -->
            <div style="font-size: 20px; margin-bottom: 10px;">
                Arena ${game.State.currentLevel - 1} Complete
            </div>
            <div style="font-size: 16px; color: #CCC; margin-bottom: 30px;">
                Population: ${game.State.population.toLocaleString()}
            </div>

            ${!isFinalVictory
                ? `
                <!-- Continue button -->
                <button 
                    onclick="window.$(${Action.ViewTransition}, {view: ${GameView.UpgradeSelection}})"
                    style="
                        background: #4CAF50; 
                        color: white; 
                        border: none; 
                        padding: 15px 30px; 
                        font-size: 18px; 
                        font-family: monospace; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        pointer-events: all;
                        margin-bottom: 10px;
                    "
                >
                    CONTINUE TO ARENA ${game.State.currentLevel}
                </button>
                
                <!-- Auto-advance note -->
                <div style="font-size: 12px; color: #CCC;">
                    Auto-advancing in 5 seconds...
                </div>
            `
                : `
                <!-- Final victory content -->
                <div style="text-align: center; font-size: 18px; line-height: 1.6; max-width: 600px;">
                    You are the last human standing! You have conquered all 33 arenas and reduced humanity to a single survivor - yourself.
                </div>
                <button 
                    onclick="window.$(${Action.RestartRun})"
                    style="
                        background: #FFD700; 
                        color: black; 
                        border: none; 
                        padding: 15px 30px; 
                        font-size: 18px; 
                        font-family: monospace; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        pointer-events: all;
                        margin-top: 30px;
                    "
                >
                    PLAY AGAIN
                </button>
            `}
        </div>
    `;
}

function DefeatView(game: Game): string {
    return html`
        <div
            style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(100,0,0,0.8); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: monospace;"
        >
            <!-- Defeat message -->
            <div
                style="font-size: 48px; font-weight: bold; margin-bottom: 20px; color: #F44336; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
            >
                DEFEAT
            </div>

            <!-- Progress info -->
            <div style="font-size: 20px; margin-bottom: 10px;">
                Reached Arena ${game.State.currentLevel}
            </div>
            <div style="font-size: 16px; color: #CCC; margin-bottom: 30px;">
                ${game.State.playerUpgrades.length} upgrades collected
            </div>

            <!-- Restart button -->
            <button
                onclick="window.$(${Action.RestartRun})"
                style="
                    background: #F44336; 
                    color: white; 
                    border: none; 
                    padding: 15px 30px; 
                    font-size: 18px; 
                    font-family: monospace; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    pointer-events: all;
                "
            >
                TRY AGAIN
            </button>
        </div>
    `;
}

function ArenaHUD(game: Game): string {
    // Get upgrades from game state
    let playerUpgrades = game.State.playerUpgrades.map((upgrade: UpgradeType) => upgrade.name);
    let opponentUpgrades = game.State.opponentUpgrades.map((upgrade: UpgradeType) => upgrade.name);

    // Find entities with AI and health to get their stats
    let playerHP = "?";
    let opponentHP = "?";
    let playerAIState = "Unknown";
    let opponentAIState = "Unknown";

    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.AIFighter) {
            let ai = game.World.AIFighter[entity];
            if (!ai) continue;

            // Get health info
            let healthInfo = "?/?";
            if (game.World.Signature[entity] & Has.Health) {
                let health = game.World.Health[entity];
                if (health) {
                    healthInfo = `${Math.ceil(health.Current)}/${health.Max}`;
                }
            }

            // Get AI state info
            let aiStateInfo = getAIStateName(ai.State);

            // Use IsPlayer property to distinguish
            if (ai.IsPlayer) {
                playerHP = healthInfo;
                playerAIState = aiStateInfo;
            } else {
                opponentHP = healthInfo;
                opponentAIState = aiStateInfo;
            }
        }
    }

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
