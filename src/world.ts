import {WorldImpl} from "../lib/world.js";
import {FLOATS_PER_INSTANCE} from "../materials/layout2d.js";
import {Abilities} from "./components/com_abilities.js";
import {Aim} from "./components/com_aim.js";
import {AnimateSprite} from "./components/com_animate_sprite.js";
import {Camera2D} from "./components/com_camera2d.js";
import {Children} from "./components/com_children.js";
import {Collide2D} from "./components/com_collide2d.js";
import {ControlAi} from "./components/com_control_ai.js";
import {ControlAlways2D} from "./components/com_control_always2d.js";
import {DealDamage} from "./components/com_deal_damage.js";
import {Draw} from "./components/com_draw.js";
import {Health} from "./components/com_health.js";
import {Label} from "./components/com_label.js";
import {Lifespan} from "./components/com_lifespan.js";
import {LocalTransform2D} from "./components/com_local_transform2d.js";
import {Move2D} from "./components/com_move2d.js";
import {Particle} from "./components/com_particle.js";
import {Render2D} from "./components/com_render2d.js";
import {RigidBody2D} from "./components/com_rigid_body2d.js";
import {Shake} from "./components/com_shake.js";
import {SpatialNode2D} from "./components/com_spatial_node2d.js";
import {Spawn} from "./components/com_spawn.js";
import {SpawnedBy} from "./components/com_spawned_by.js";
import {Weapon} from "./components/com_weapon.js";

const enum Component {
    Abilities,
    Aim,
    AnimateSprite,
    Camera2D,
    Collide2D,
    ControlAi,
    ControlAlways2D,
    Children,
    DealDamage,
    Dirty,
    Draw,
    Health,
    Label,
    Lifespan,
    LocalTransform2D,
    Move2D,
    Particle,
    Render2D,
    RigidBody2D,
    Shake,
    SpatialNode2D,
    Spawn,
    SpawnedBy,
    Weapon,
}

export const enum Has {
    None = 0,
    Abilities = 1 << Component.Abilities,
    Aim = 1 << Component.Aim,
    AnimateSprite = 1 << Component.AnimateSprite,
    Camera2D = 1 << Component.Camera2D,
    Collide2D = 1 << Component.Collide2D,
    ControlAi = 1 << Component.ControlAi,
    ControlAlways2D = 1 << Component.ControlAlways2D,
    Children = 1 << Component.Children,
    DealDamage = 1 << Component.DealDamage,
    Dirty = 1 << Component.Dirty,
    Draw = 1 << Component.Draw,
    Health = 1 << Component.Health,
    Label = 1 << Component.Label,
    Lifespan = 1 << Component.Lifespan,
    LocalTransform2D = 1 << Component.LocalTransform2D,
    Move2D = 1 << Component.Move2D,
    Particle = 1 << Component.Particle,
    Render2D = 1 << Component.Render2D,
    RigidBody2D = 1 << Component.RigidBody2D,
    Shake = 1 << Component.Shake,
    SpatialNode2D = 1 << Component.SpatialNode2D,
    Spawn = 1 << Component.Spawn,
    SpawnedBy = 1 << Component.SpawnedBy,
    Weapon = 1 << Component.Weapon,
}

export class World extends WorldImpl {
    InstanceData = new Float32Array(this.Capacity * FLOATS_PER_INSTANCE);
    BackgroundColor = "#eee";
    Width = 24;
    Height = 16;

    Abilities: Array<Abilities> = [];
    Aim: Array<Aim> = [];
    AnimateSprite: Array<AnimateSprite> = [];
    Camera2D: Array<Camera2D> = [];
    Collide2D: Array<Collide2D> = [];
    ControlAi: Array<ControlAi> = [];
    ControlAlways2D: Array<ControlAlways2D> = [];
    Children: Array<Children> = [];
    DealDamage: Array<DealDamage> = [];
    Draw: Array<Draw> = [];
    Health: Array<Health> = [];
    Label: Array<Label> = [];
    Lifespan: Array<Lifespan> = [];
    LocalTransform2D: Array<LocalTransform2D> = [];
    Move2D: Array<Move2D> = [];
    Particle: Array<Particle> = [];
    Render2D: Array<Render2D> = [];
    RigidBody2D: Array<RigidBody2D> = [];
    Shake: Array<Shake> = [];
    SpatialNode2D: Array<SpatialNode2D> = [];
    Spawn: Array<Spawn> = [];
    SpawnedBy: Array<SpawnedBy> = [];
    Weapon: Array<Weapon> = [];
}
