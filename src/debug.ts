/**
 * # Debug Scene Graph Inspector
 *
 * TypeScript-based scene graph debugging utilities that work independently
 * of the game loop for debugging paused states.
 */

import {DrawKind} from "./components/com_draw.js";
import {TaskKind} from "./components/com_task.js";
import {Game} from "./game.js";
import {Has} from "./world.js";

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
        (window as any).toggleSceneGraph = () => this.toggle();
        (window as any).refreshSceneGraph = () => this.refresh();
        (window as any).selectEntity = (entityId: number) => this.selectEntity(entityId);
        (window as any).toggleTreeNode = (element: HTMLElement, event: Event) =>
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
            if (world.Signature[entity] !== 0) activeCount++;
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
            if (world.Signature[entity] === 0) continue; // Skip dead entities

            // Check if this entity is a child of another entity
            let isChild = false;
            for (
                let parentCandidate = 0;
                parentCandidate < world.Signature.length;
                parentCandidate++
            ) {
                if (world.Children[parentCandidate]) {
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

    private getEntityComponents(entityId: number): string[] {
        const signature = this.game.World.Signature[entityId];
        const components: string[] = [];

        // Use actual Has enum as source of truth - no duplication!
        if (signature & Has.LocalTransform2D) components.push("Transform");
        if (signature & Has.SpatialNode2D) components.push("SpatialNode");
        if (signature & Has.Render2D) components.push("Render");
        if (signature & Has.Health) components.push("Health");
        if (signature & Has.AIFighter) components.push("AI");
        if (signature & Has.Move2D) components.push("Move");
        if (signature & Has.RigidBody2D) components.push("RigidBody");
        if (signature & Has.Collide2D) components.push("Collide");
        if (signature & Has.Weapon) components.push("Weapon");
        if (signature & Has.Named) components.push("Named");
        if (signature & Has.Spawn) components.push("Spawn");
        if (signature & Has.Lifespan) components.push("Lifespan");
        if (signature & Has.DealDamage) components.push("DealDamage");
        if (signature & Has.Particle) components.push("Particle");
        if (signature & Has.AnimateSprite) components.push("Animate");
        if (signature & Has.Boomerang) components.push("Boomerang");
        if (signature & Has.Camera2D) components.push("Camera");
        if (signature & Has.GrenadeBehavior) components.push("Grenade");
        if (signature & Has.ControlAlways2D) components.push("ControlAlways");
        if (signature & Has.ControlPlayer) components.push("ControlPlayer");
        if (signature & Has.Children) components.push("Children");
        if (signature & Has.Draw) components.push("Draw");
        if (signature & Has.Shake) components.push("Shake");
        if (signature & Has.Task) components.push("Task");
        if (signature & Has.Toggle) components.push("Toggle");
        if (signature & Has.Trigger) components.push("Trigger");
        if (signature & Has.Dirty) components.push("Dirty");

        return components.sort();
    }

    private getEntityName(entityId: number): string | null {
        const world = this.game.World;

        // Check Named component first
        if (world.Named[entityId]) {
            return world.Named[entityId].Name;
        }

        // Try to infer name from components
        if (world.AIFighter[entityId]) {
            return world.Health[entityId] ? "Fighter" : "AI Entity";
        }
        if (world.Weapon[entityId]) {
            return "Weapon";
        }
        if (world.Particle[entityId]) {
            return "Particle";
        }
        if (world.Spawn[entityId]) {
            return "Spawner";
        }
        if (world.Camera2D[entityId]) {
            return "Camera";
        }

        return null;
    }

    selectEntity(entityId: number) {
        const details = document.getElementById("entity-details");
        if (!details) return;

        const world = this.game.World;

        if (world.Signature[entityId] === 0) {
            details.innerHTML = "<h4>Entity not found</h4>";
            return;
        }

        const name = this.getEntityName(entityId) || `Entity ${entityId}`;

        let html = `<h4>${name} (ID: ${entityId})</h4>`;
        html += `<p><strong>Signature:</strong> ${world.Signature[entityId]} (0b${world.Signature[entityId].toString(2).padStart(32, "0")})</p>`;

        html += "<h5>Active Components:</h5>";
        html += '<div class="component-list">';

        // Check each component type - alphabetical order
        if (world.Signature[entityId] & Has.AIFighter) {
            const ai = world.AIFighter[entityId];
            html += `<div class="component">
                <strong>AIFighter</strong><br>
                State: ${ai.State}<br>
                Aggressiveness: ${ai.Aggressiveness.toFixed(2)}<br>
                Patience: ${ai.Patience.toFixed(2)}
            </div>`;
        }

        if (world.Signature[entityId] & Has.AnimateSprite) {
            const a = world.AnimateSprite[entityId];
            html += `<div class="component">
                <strong>AnimateSprite</strong><br>
                Duration: ${a.Duration.toFixed(2)}<br>
                Time: ${a.Time.toFixed(2)}<br>
                Frames: ${Object.keys(a.Frames).length}
            </div>`;
        }

        if (world.Signature[entityId] & Has.Boomerang) {
            const b = world.Boomerang[entityId];
            html += `<div class="component">
                <strong>Boomerang</strong><br>
                Phase: ${b.Phase}<br>
                Thrower: ${b.ThrowerEntity}<br>
                Target: [${b.OriginalTarget[0].toFixed(2)}, ${b.OriginalTarget[1].toFixed(2)}]<br>
                Max Range: ${b.MaxRange.toFixed(2)}<br>
                Speed: ${b.Speed.toFixed(2)}
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
                Source: ${d.Source}
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

        if (world.Signature[entityId] & Has.GrenadeBehavior) {
            const g = world.GrenadeBehavior[entityId];
            html += `<div class="component">
                <strong>GrenadeBehavior</strong><br>
                Gravity: ${g.Gravity.toFixed(2)}<br>
                Flight Time: ${g.FlightTime.toFixed(2)} / ${g.TimeToTarget.toFixed(2)}<br>
                Target: [${g.TargetPosition[0].toFixed(2)}, ${g.TargetPosition[1].toFixed(2)}]<br>
                Damage: ${g.Damage}
            </div>`;
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
                Remaining: ${l.Age.toFixed(2)}s
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

        if (world.Signature[entityId] & Has.Named) {
            const n = world.Named[entityId];
            html += `<div class="component">
                <strong>Named</strong><br>
                Name: "${n.Name}"
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
            if (s.Parent !== undefined && world.Signature[s.Parent] !== 0) {
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
                Duration: ${s.Duration.toFixed(2)}<br>
                Interval: ${s.Interval.toFixed(2)}<br>
                Burst Count: ${s.BurstCount}<br>
                Speed: ${s.SpeedMin.toFixed(1)} - ${s.SpeedMax.toFixed(1)}
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
                Damage: ${w.Damage}<br>
                Range: ${w.Range}<br>
                Cooldown: ${w.Cooldown.toFixed(2)}<br>
                Last Attack: ${w.LastAttackTime.toFixed(2)}
            </div>`;
        }

        html += "</div>";
        details.innerHTML = html;
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
