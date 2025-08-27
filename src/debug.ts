/**
 * # Debug Scene Graph Inspector
 *
 * TypeScript-based scene graph debugging utilities that work independently
 * of the game loop for debugging paused states.
 */

import {is_entity_alive} from "../lib/world.js";
import {DrawKind} from "./components/com_draw.js";
import {SpawnMode} from "./components/com_spawn.js";
import {TaskKind} from "./components/com_task.js";
import {Game} from "./game.js";
import {Has} from "./world.js";

declare global {
    interface Window {
        toggleSceneGraph(): void;
        refreshSceneGraph(): void;
        selectEntity(entityId: number): void;
        toggleTreeNode(element: HTMLElement, event: Event): void;
    }
}

export interface TreeNode {
    id: number;
    children: TreeNode[];
}

export class SceneGraphInspector {
    private isVisible = false;

    constructor(private game: Game) {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Make inspector functions available globally
        window.toggleSceneGraph = () => this.toggle();
        window.refreshSceneGraph = () => this.refresh();
        window.selectEntity = (entityId: number) => this.selectEntity(entityId);
        window.toggleTreeNode = (element: HTMLElement, event: Event) =>
            this.toggleTreeNode(element, event);
    }

    toggle() {
        const panel = document.getElementById("scene-graph");
        if (!panel) return;

        if (panel.style.display === "none") {
            panel.style.display = "block";
            this.isVisible = true;
            this.refresh();
        } else {
            panel.style.display = "none";
            this.isVisible = false;
        }
    }

    refresh() {
        if (!this.isVisible) return;

        this.updateHeader();
        this.updateEntityTree();
    }

    private updateHeader() {
        const world = this.game.World;
        let activeCount = 0;
        for (let entity = 0; entity < world.Signature.length; entity++) {
            if (is_entity_alive(world, entity)) activeCount++;
        }

        const header = document.querySelector("#scene-graph-header h3");
        if (header) {
            header.textContent = `Scene Graph (${activeCount} entities)`;
        }
    }

    private updateEntityTree() {
        const entityList = document.getElementById("entity-list");
        if (!entityList) return;

        const hierarchy = this.buildEntityHierarchy();
        const html = '<div class="entity-tree">' + this.renderEntityTree(hierarchy, 0) + "</div>";
        entityList.innerHTML = html;
    }

    private buildEntityHierarchy(): TreeNode[] {
        const world = this.game.World;
        const roots: number[] = [];
        const childrenMap = new Map<number, number[]>();

        // Use Children component for hierarchy, not SpatialNode2D
        for (let entity = 0; entity < world.Signature.length; entity++) {
            if (!is_entity_alive(world, entity)) continue; // Skip dead entities

            // Check if this entity is a child of another entity
            let isChild = false;
            for (
                let parentCandidate = 0;
                parentCandidate < world.Signature.length;
                parentCandidate++
            ) {
                if (world.Signature[parentCandidate] & Has.Children) {
                    const children = world.Children[parentCandidate].Children;
                    if (children.includes(entity)) {
                        // This entity is a child
                        if (!childrenMap.has(parentCandidate)) {
                            childrenMap.set(parentCandidate, []);
                        }
                        childrenMap.get(parentCandidate)!.push(entity);
                        isChild = true;
                        break;
                    }
                }
            }

            if (!isChild) {
                roots.push(entity);
            }
        }

        // Build tree structure recursively
        const buildNode = (entityId: number): TreeNode => {
            const children = childrenMap.get(entityId) || [];
            return {
                id: entityId,
                children: children.map((childId) => buildNode(childId)),
            };
        };

        return roots.map((rootId) => buildNode(rootId));
    }

    private renderEntityTree(nodes: TreeNode[], depth: number): string {
        let html = "";

        for (const node of nodes) {
            const entity = node.id;
            const components = this.getEntityComponents(entity);
            const hasChildren = node.children.length > 0;

            const expandIcon = hasChildren
                ? `<span class="tree-toggle" onclick="toggleTreeNode(this, event)">▼</span>`
                : `<span class="tree-spacer">•</span>`;

            // Format name line: either "named_entity" or "Entity N"
            const entityName = this.getEntityName(entity);
            const displayName = entityName ? entityName : `Entity ${entity}`;

            html += `<div class="tree-node" style="margin-left: ${depth * 20}px;">
                <div class="entity-item" onclick="selectEntity(${entity})">
                    <div class="entity-header">
                        ${expandIcon}
                        <strong>${displayName}</strong>
                        <span class="entity-id">id: ${entity}</span>
                    </div>
                    <small>${components.join(", ")}</small>
                </div>
                <div class="tree-children">
                    ${this.renderEntityTree(node.children, depth + 1)}
                </div>
            </div>`;
        }

        return html;
    }

    private getComponentMapping(): Record<number, string> {
        // Centralized component mapping
        return {
            [Has.AnimateSprite]: "AnimateSprite",
            [Has.Camera2D]: "Camera2D",
            [Has.Collide2D]: "Collide2D",
            [Has.ControlAi]: "ControlAi",
            [Has.ControlAlways2D]: "ControlAlways2D",
            [Has.ControlPlayer]: "ControlPlayer",
            [Has.Children]: "Children",
            [Has.DealDamage]: "DealDamage",
            [Has.Dirty]: "Dirty",
            [Has.Draw]: "Draw",
            [Has.Health]: "Health",
            [Has.Lifespan]: "Lifespan",
            [Has.LocalTransform2D]: "LocalTransform2D",
            [Has.Move2D]: "Move2D",
            [Has.Label]: "Label",
            [Has.Particle]: "Particle",
            [Has.Render2D]: "Render2D",
            [Has.RigidBody2D]: "RigidBody2D",
            [Has.Shake]: "Shake",
            [Has.SpatialNode2D]: "SpatialNode2D",
            [Has.Spawn]: "Spawn",
            [Has.Task]: "Task",
            [Has.Toggle]: "Toggle",
            [Has.Trigger]: "Trigger",
            [Has.Weapon]: "Weapon",
        };
    }

    private getEntityComponents(entityId: number): string[] {
        const signature = this.game.World.Signature[entityId];
        const components: string[] = [];
        const componentMapping = this.getComponentMapping();

        // Use component mapping to avoid duplication
        for (const [hasValue, name] of Object.entries(componentMapping)) {
            if (signature & parseInt(hasValue)) {
                components.push(name);
            }
        }

        return components.sort();
    }

    private getEntityName(entityId: number): string | null {
        const world = this.game.World;

        // Check Label component first
        if (world.Signature[entityId] & Has.Label && world.Label[entityId].Name) {
            return world.Label[entityId].Name;
        }

        // Try to infer name from components using signatures
        if (world.Signature[entityId] & Has.ControlAi) {
            return "Fighter";
        }
        if (world.Signature[entityId] & Has.Weapon) {
            return "Weapon";
        }
        if (world.Signature[entityId] & Has.Particle) {
            return "Particle";
        }
        if (world.Signature[entityId] & Has.Spawn) {
            return "Spawner";
        }
        if (world.Signature[entityId] & Has.Camera2D) {
            return "Camera";
        }

        return null;
    }

    selectEntity(entityId: number) {
        const details = document.getElementById("entity-details");
        if (!details) return;

        const world = this.game.World;

        if (!is_entity_alive(world, entityId)) {
            details.innerHTML = "<h4>Entity not found</h4>";
            return;
        }

        const name = this.getEntityName(entityId) || `Entity ${entityId}`;

        let html = `<h4>${name} (ID: ${entityId})</h4>`;
        html += `<p><strong>Signature:</strong> ${this.formatSignatureBinary(world.Signature[entityId])}</p>`;

        html += "<h5>Active Components:</h5>";
        html += '<div class="component-list">';

        // Check each component type - alphabetical order

        if (world.Signature[entityId] & Has.AnimateSprite) {
            const a = world.AnimateSprite[entityId];
            html += `<div class="component">
                <strong>AnimateSprite</strong><br>
                Duration: ${a.Duration.toFixed(2)}<br>
                Time: ${a.Time.toFixed(2)}<br>
                Frames: ${Object.keys(a.Frames).length}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Camera2D) {
            const c = world.Camera2D[entityId];
            html += `<div class="component">
                <strong>Camera2D</strong><br>
                Radius: [${c.Projection.Radius[0].toFixed(2)}, ${c.Projection.Radius[1].toFixed(2)}]<br>
                Viewport: ${c.ViewportWidth} × ${c.ViewportHeight}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Children) {
            const c = world.Children[entityId];
            const clickableChildren = c.Children.slice(0, 5).map((id) => {
                const childName = this.getEntityName(id) || `Entity ${id}`;
                return `<a href="#" onclick="selectEntity(${id}); return false;" style="color: #4a9eff; text-decoration: underline;">${childName}</a>`;
            });

            html += `<div class="component">
                <strong>Children</strong><br>
                Count: ${c.Children.length}<br>`;

            if (clickableChildren.length > 0) {
                html += `Children: ${clickableChildren.join(", ")}${c.Children.length > 5 ? "..." : ""}`;
            }

            html += `</div>`;
        }

        if (world.Signature[entityId] & Has.Collide2D) {
            const c = world.Collide2D[entityId];
            html += `<div class="component">
                <strong>Collide2D</strong><br>
                Layers: ${c.Layers}<br>
                Mask: ${c.Mask}<br>
                Radius: ${c.Radius.toFixed(2)}<br>
                Collisions: ${c.Collisions.length}
            </div>`;
        }

        if (world.Signature[entityId] & Has.ControlAi) {
            const ai = world.ControlAi[entityId];
            html += `<div class="component">
                <strong>ControlAi</strong><br>
                State: ${ai.State}<br>
                Aggressiveness: ${ai.Aggressiveness.toFixed(2)}<br>
                Patience: ${ai.Patience.toFixed(2)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.ControlAlways2D) {
            const c = world.ControlAlways2D[entityId];
            const directionText = c.Direction
                ? `[${c.Direction[0].toFixed(2)}, ${c.Direction[1].toFixed(2)}]`
                : "null";
            html += `<div class="component">
                <strong>ControlAlways2D</strong><br>
                Direction: ${directionText}<br>
                Rotation: ${c.Rotation.toFixed(2)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.ControlPlayer) {
            html += `<div class="component">
                <strong>ControlPlayer</strong><br>
                <em>Marker component (no data)</em>
            </div>`;
        }

        if (world.Signature[entityId] & Has.DealDamage) {
            const d = world.DealDamage[entityId];
            html += `<div class="component">
                <strong>DealDamage</strong><br>
                Damage: ${d.Damage}<br>
            </div>`;
        }

        if (world.Signature[entityId] & Has.Dirty) {
            html += `<div class="component">
                <strong>Dirty</strong><br>
                <em>Marker component (no data)</em>
            </div>`;
        }

        if (world.Signature[entityId] & Has.Draw) {
            const d = world.Draw[entityId];
            html += `<div class="component">
                <strong>Draw</strong><br>
                Kind: ${d.Kind}<br>`;

            if (d.Kind === DrawKind.Text) {
                html += `Text: "${d.Text}"<br>Font: ${d.Font}<br>Fill: ${d.FillStyle}`;
            } else if (d.Kind === DrawKind.Rect) {
                html += `Color: ${d.Color}<br>Size: ${d.Width} × ${d.Height}`;
            } else if (d.Kind === DrawKind.Arc) {
                html += `Color: ${d.Color}<br>Radius: ${d.Radius.toFixed(2)}<br>Angles: ${d.StartAngle.toFixed(2)} - ${d.EndAngle.toFixed(2)}`;
            } else if (d.Kind === DrawKind.Selection) {
                html += `Color: ${d.Color}<br>Size: ${d.Size.toFixed(2)}`;
            }

            html += `</div>`;
        }

        if (world.Signature[entityId] & Has.Health) {
            const h = world.Health[entityId];
            html += `<div class="component">
                <strong>Health</strong><br>
                Current: ${h.Current} / ${h.Max}<br>
                Alive: ${h.IsAlive}<br>
                Pending Damage: ${h.PendingDamage ? h.PendingDamage.length : 0}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Lifespan) {
            const l = world.Lifespan[entityId];
            html += `<div class="component">
                <strong>Lifespan</strong><br>
                Age: ${l.Age.toFixed(2)}s / ${l.Lifetime.toFixed(2)}s
            </div>`;
        }

        if (world.Signature[entityId] & Has.LocalTransform2D) {
            const t = world.LocalTransform2D[entityId];
            html += `<div class="component">
                <strong>LocalTransform2D</strong><br>
                Translation: [${t.Translation[0].toFixed(2)}, ${t.Translation[1].toFixed(2)}]<br>
                Rotation: ${t.Rotation.toFixed(2)}<br>
                Scale: [${t.Scale[0].toFixed(2)}, ${t.Scale[1].toFixed(2)}]
            </div>`;
        }

        if (world.Signature[entityId] & Has.Move2D) {
            const m = world.Move2D[entityId];
            html += `<div class="component">
                <strong>Move2D</strong><br>
                Direction: [${m.Direction[0].toFixed(2)}, ${m.Direction[1].toFixed(2)}]<br>
                Speed: ${m.MoveSpeed}<br>
                Rotation Speed: ${m.RotationSpeed}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Label) {
            const n = world.Label[entityId];
            html += `<div class="component">
                <strong>Label</strong><br>
                Name: "${n.Name || "none"}"
            </div>`;
        }

        if (world.Signature[entityId] & Has.Particle) {
            const p = world.Particle[entityId];
            html += `<div class="component">
                <strong>Particle</strong><br>
                Type: ${p.Type}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Render2D) {
            const r = world.Render2D[entityId];
            html += `<div class="component">
                <strong>Render2D</strong><br>
                Sprite: ${r.Sprite}<br>
                Color: [${r.Color[0].toFixed(2)}, ${r.Color[1].toFixed(2)}, ${r.Color[2].toFixed(2)}, ${r.Color[3].toFixed(2)}]
            </div>`;
        }

        if (world.Signature[entityId] & Has.RigidBody2D) {
            const rb = world.RigidBody2D[entityId];
            html += `<div class="component">
                <strong>RigidBody2D</strong><br>
                Kind: ${rb.Kind}<br>
                Velocity: [${rb.VelocityLinear[0].toFixed(2)}, ${rb.VelocityLinear[1].toFixed(2)}]<br>
                Gravity: [${rb.Gravity[0].toFixed(2)}, ${rb.Gravity[1].toFixed(2)}]<br>
                Drag: ${rb.Drag.toFixed(2)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Shake) {
            const s = world.Shake[entityId];
            html += `<div class="component">
                <strong>Shake</strong><br>
                Duration: ${s.Duration.toFixed(2)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.SpatialNode2D) {
            const s = world.SpatialNode2D[entityId];

            // Make parent clickable if it exists
            let parentDisplay = "None";
            if (s.Parent !== undefined && is_entity_alive(world, s.Parent)) {
                const parentName = this.getEntityName(s.Parent) || `Entity ${s.Parent}`;
                parentDisplay = `<a href="#" onclick="selectEntity(${s.Parent}); return false;" style="color: #4a9eff; text-decoration: underline;">${parentName}</a>`;
            }

            // Get children from Children component and make them clickable
            let childrenInfo = "None";
            let childrenCount = 0;
            if (world.Children[entityId]) {
                const children = world.Children[entityId].Children;
                childrenCount = children.length;
                const clickableChildren = children.slice(0, 3).map((id) => {
                    const childName = this.getEntityName(id) || `Entity ${id}`;
                    return `<a href="#" onclick="selectEntity(${id}); return false;" style="color: #4a9eff; text-decoration: underline;">${childName}</a>`;
                });
                if (clickableChildren.length > 0) {
                    childrenInfo =
                        clickableChildren.join(", ") + (children.length > 3 ? "..." : "");
                }
            }

            html += `<div class="component">
                <strong>SpatialNode2D</strong><br>
                Parent: ${parentDisplay}<br>
                Children: ${childrenCount}`;

            if (childrenCount > 0) {
                html += `<br><small>└─ ${childrenInfo}</small>`;
            }

            html += `</div>`;
        }

        if (world.Signature[entityId] & Has.Spawn) {
            const s = world.Spawn[entityId];
            html += `<div class="component">
                <strong>Spawn</strong><br>
                Mode: ${s.Mode === SpawnMode.Count ? "Count" : "Timed"}<br>
                ${
                    s.Mode === SpawnMode.Count
                        ? `Remaining Count: ${s.RemainingCount}`
                        : `Duration: ${s.Duration.toFixed(2)}`
                }<br>
                Interval: ${s.Interval.toFixed(2)}<br>
                Speed: ${s.SpeedMin.toFixed(1)} - ${s.SpeedMax.toFixed(1)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.SpawnedBy) {
            const s = world.SpawnedBy[entityId];
            const isSpawnerAlive = is_entity_alive(world, s.Fighter);
            const spawnerName = this.getEntityName(s.Fighter) || `Entity ${s.Fighter}`;
            const statusIcon = isSpawnerAlive ? "🟢" : "🔴";
            const fighterDisplay = `<a href="#" onclick="selectEntity(${s.Fighter}); return false;" style="color: #4a9eff; text-decoration: underline;">${spawnerName}</a> ${statusIcon}`;

            html += `<div class="component">
                <strong>SpawnedBy</strong><br>
                Fighter: ${fighterDisplay}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Task) {
            const t = world.Task[entityId];
            html += `<div class="component">
                <strong>Task</strong><br>`;

            if (t.Kind === TaskKind.When) {
                html += `Type: When (predicate)`;
            } else if (t.Kind === TaskKind.Delay) {
                html += `Type: Delay<br>Remaining: ${t.Remaining.toFixed(2)}s`;
            } else if (t.Kind === TaskKind.Then) {
                html += `Type: Then (callback)`;
            }

            html += `</div>`;
        }

        if (world.Signature[entityId] & Has.Toggle) {
            const t = world.Toggle[entityId];
            html += `<div class="component">
                <strong>Toggle</strong><br>
                Mask: ${t.Mask}<br>
                Frequency: ${t.Frequency.toFixed(2)}<br>
                Since Last: ${t.SinceLast.toFixed(2)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Trigger) {
            const t = world.Trigger[entityId];
            html += `<div class="component">
                <strong>Trigger</strong><br>
                Action: ${t.Action}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Weapon) {
            const w = world.Weapon[entityId];
            html += `<div class="component">
                <strong>Weapon</strong><br>
                Range: ${w.Range}<br>
                Cooldown: ${w.Cooldown.toFixed(2)}<br>
                Last Attack: ${w.LastAttackTime.toFixed(2)}
            </div>`;
        }

        html += "</div>";
        details.innerHTML = html;
    }

    private formatSignatureBinary(signature: number): string {
        const binaryStr = signature.toString(2).padStart(32, "0");
        const componentMapping = this.getComponentMapping();
        let html = "";

        for (let i = 0; i < 32; i++) {
            const bit = binaryStr[i];
            const bitPosition = 31 - i; // Reverse because binary string is MSB first
            const bitValue = 1 << bitPosition;
            const componentName = componentMapping[bitValue] || `Bit${bitPosition}`;
            const isActive = bit === "1";

            const className = isActive ? "bit-active" : "bit-inactive";
            html += `<span class="${className}" title="${componentName} (bit ${bitPosition})">${bit}</span>`;
        }

        return html;
    }

    toggleTreeNode(toggleElement: HTMLElement, event: Event) {
        event.stopPropagation(); // Prevent entity selection

        const treeNode = toggleElement.closest(".tree-node") as HTMLElement;
        const childrenDiv = treeNode.querySelector(".tree-children") as HTMLElement;

        if (childrenDiv.style.display === "none") {
            childrenDiv.style.display = "block";
            toggleElement.textContent = "▼";
        } else {
            childrenDiv.style.display = "none";
            toggleElement.textContent = "▶";
        }
    }
}
