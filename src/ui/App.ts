import {html} from "../../lib/html.js";
import {AIState} from "../components/com_ai_fighter.js";
import {Game} from "../game.js";
import {getUpgradeDisplayName} from "../upgrades/types.js";
import {Has} from "../world.js";

// Helper function to get AI state name
function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling: return "Circling";
        case AIState.Attacking: return "Attacking";
        case AIState.Retreating: return "Retreating";
        case AIState.Stunned: return "Stunned";
        case AIState.Pursuing: return "Pursuing";
        default: return "Unknown";
    }
}

export function App(game: Game) {
    // Find entities with upgrade inventories and collect their stats
    let playerUpgrades: string[] = [];
    let opponentUpgrades: string[] = [];
    let playerHP = "?";
    let opponentHP = "?";
    let playerAIState = "Unknown";
    let opponentAIState = "Unknown";
    
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.UpgradeInventory) {
            let inventory = game.World.UpgradeInventory[entity];
            if (!inventory) continue;
            
            let upgradeNames = inventory.Weapons.map(weapon => getUpgradeDisplayName(weapon));
            
            // Get health info
            let healthInfo = "?/?";
            if (game.World.Signature[entity] & Has.Health) {
                let health = game.World.Health[entity];
                if (health) {
                    healthInfo = `${Math.ceil(health.Current)}/${health.Max}`;
                }
            }
            
            // Get AI state info
            let aiStateInfo = "Unknown";
            if (game.World.Signature[entity] & Has.AIFighter) {
                let ai = game.World.AIFighter[entity];
                if (ai) {
                    aiStateInfo = getAIStateName(ai.State);
                }
            }
            
            // First entity with upgrades = player, second = opponent (simple heuristic)
            if (playerUpgrades.length === 0) {
                playerUpgrades = upgradeNames;
                playerHP = healthInfo;
                playerAIState = aiStateInfo;
            } else if (opponentUpgrades.length === 0) {
                opponentUpgrades = upgradeNames;
                opponentHP = healthInfo;
                opponentAIState = aiStateInfo;
            }
        }
    }

    return html`
        <div style="position: fixed; top: 0; left: 0; right: 0; pointer-events: none; z-index: 100;">
            <!-- Player info (left side) -->
            <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; color: white; font-family: monospace; font-size: 12px;">
                <div style="color: #4CAF50; font-weight: bold; margin-bottom: 5px;">PLAYER</div>
                <div style="color: #FFF; margin-bottom: 3px;">HP: ${playerHP}</div>
                <div style="color: #FFD700; margin-bottom: 8px;">State: ${playerAIState}</div>
                <div style="color: #CCC; font-size: 10px; margin-bottom: 3px;">WEAPONS:</div>
                ${playerUpgrades.map(upgrade => `<div>• ${upgrade}</div>`).join('')}
                ${playerUpgrades.length === 0 ? '<div style="color: #666;">No upgrades</div>' : ''}
            </div>
            
            <!-- Opponent info (right side) -->
            <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; color: white; font-family: monospace; font-size: 12px; text-align: right;">
                <div style="color: #F44336; font-weight: bold; margin-bottom: 5px;">OPPONENT</div>
                <div style="color: #FFF; margin-bottom: 3px;">HP: ${opponentHP}</div>
                <div style="color: #FFD700; margin-bottom: 8px;">State: ${opponentAIState}</div>
                <div style="color: #CCC; font-size: 10px; margin-bottom: 3px;">WEAPONS:</div>
                ${opponentUpgrades.map(upgrade => `<div>• ${upgrade}</div>`).join('')}
                ${opponentUpgrades.length === 0 ? '<div style="color: #666;">No upgrades</div>' : ''}
            </div>
            
            <!-- Game title -->
            <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; color: white; font-family: monospace; font-weight: bold;">
                33 DUELS
            </div>
        </div>
    `;
}
