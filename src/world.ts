import {WorldImpl} from "../lib/world.js";
import {FLOATS_PER_INSTANCE} from "../materials/layout2d.js";
import {AIFighter} from "./components/com_ai_fighter.js";
import {AnimateSprite} from "./components/com_animate_sprite.js";
import {Boomerang} from "./components/com_boomerang.js";
import {Camera2D} from "./components/com_camera2d.js";
import {Children} from "./components/com_children.js";
import {Collide2D} from "./components/com_collide2d.js";
import {ControlAlways2D} from "./components/com_control_always2d.js";
import {ControlPlayer} from "./components/com_control_player.js";
import {Draw} from "./components/com_draw.js";
import {FireZone} from "./components/com_fire_zone.js";
import {Health} from "./components/com_health.js";
import {Lifespan} from "./components/com_lifespan.js";
import {LocalTransform2D} from "./components/com_local_transform2d.js";
import {Move2D} from "./components/com_move2d.js";
import {Named} from "./components/com_named.js";
import {Render2D} from "./components/com_render2d.js";
import {RigidBody2D} from "./components/com_rigid_body2d.js";
import {Shake} from "./components/com_shake.js";
import {SpatialNode2D} from "./components/com_spatial_node2d.js";
import {Spawn} from "./components/com_spawn.js";
import {Task} from "./components/com_task.js";
import {Toggle} from "./components/com_toggle.js";
import {Trigger} from "./components/com_trigger.js";
import {Weapon} from "./components/com_weapon.js";
import {Projectile} from "./components/com_projectile.js";

const enum Component {
    AIFighter,
    AnimateSprite,
    Boomerang,
    Camera2D,
    Collide2D,
    ControlAlways2D,
    ControlPlayer,
    Children,
    Dirty,
    Draw,
    FireZone,
    Health,
    Lifespan,
    LocalTransform2D,
    Move2D,
    Named,
    Projectile,
    Render2D,
    RigidBody2D,
    Shake,
    SpatialNode2D,
    Spawn,
    Task,
    Toggle,
    Trigger,
    Weapon,
}

export const enum Has {
    None = 0,
    AIFighter = 1 << Component.AIFighter,
    AnimateSprite = 1 << Component.AnimateSprite,
    Boomerang = 1 << Component.Boomerang,
    Camera2D = 1 << Component.Camera2D,
    Collide2D = 1 << Component.Collide2D,
    ControlAlways2D = 1 << Component.ControlAlways2D,
    ControlPlayer = 1 << Component.ControlPlayer,
    Children = 1 << Component.Children,
    Dirty = 1 << Component.Dirty,
    Draw = 1 << Component.Draw,
    FireZone = 1 << Component.FireZone,
    Health = 1 << Component.Health,
    Lifespan = 1 << Component.Lifespan,
    LocalTransform2D = 1 << Component.LocalTransform2D,
    Move2D = 1 << Component.Move2D,
    Named = 1 << Component.Named,
    Projectile = 1 << Component.Projectile,
    Render2D = 1 << Component.Render2D,
    RigidBody2D = 1 << Component.RigidBody2D,
    Shake = 1 << Component.Shake,
    SpatialNode2D = 1 << Component.SpatialNode2D,
    Spawn = 1 << Component.Spawn,
    Task = 1 << Component.Task,
    Toggle = 1 << Component.Toggle,
    Trigger = 1 << Component.Trigger,
    Weapon = 1 << Component.Weapon,
}

export class World extends WorldImpl {
    InstanceData = new Float32Array(this.Capacity * FLOATS_PER_INSTANCE);
    BackgroundColor = "#eee";
    Width = 24;
    Height = 16;

    AIFighter: Array<AIFighter> = [];
    AnimateSprite: Array<AnimateSprite> = [];
    Boomerang: Array<Boomerang> = [];
    Camera2D: Array<Camera2D> = [];
    Collide2D: Array<Collide2D> = [];
    ControlAlways2D: Array<ControlAlways2D> = [];
    ControlPlayer: Array<ControlPlayer> = [];
    Children: Array<Children> = [];
    Draw: Array<Draw> = [];
    FireZone: Array<FireZone> = [];
    Health: Array<Health> = [];
    Lifespan: Array<Lifespan> = [];
    LocalTransform2D: Array<LocalTransform2D> = [];
    Move2D: Array<Move2D> = [];
    Named: Array<Named> = [];
    Projectile: Array<Projectile> = [];
    Render2D: Array<Render2D> = [];
    RigidBody2D: Array<RigidBody2D> = [];
    Shake: Array<Shake> = [];
    SpatialNode2D: Array<SpatialNode2D> = [];
    Spawn: Array<Spawn> = [];
    Task: Array<Task> = [];
    Toggle: Array<Toggle> = [];
    Trigger: Array<Trigger> = [];
    Weapon: Array<Weapon> = [];
}
