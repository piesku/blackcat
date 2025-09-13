import {link, Material} from "../lib/material.js";
import {GL_TRIANGLE_STRIP} from "../lib/webgl.js";
import {Has} from "../src/world.js";
import {Attribute, Render2DLayout} from "./layout2d.js";

/**

  Uniforms:
  - pv → u (projection-view matrix)
  - sheet_size → s (sprite sheet size)
  - sheet_texture → x (texture sampler)

  Vertex Attributes:
  - attr_position → p
  - attr_texcoord → t
  - attr_rotation → r
  - attr_translation → n
  - attr_color → c
  - attr_sprite → e

  Varying Variables:
  - vert_texcoord → v
  - vert_color → w

  Local Variables:
  - signature → i
  - world → m
  - scale → a
  - rotation → b
  - world_position → o
  - clip_position → l
  - frag_color → f

*/

let vertex = `#version 300 es\n
    uniform mat3x2 u;uniform vec2 s;layout(location=${Attribute.VertexPosition}) in vec2 p;layout(location=${Attribute.VertexTexCoord}) in vec2 t;layout(location=${Attribute.InstanceRotation}) in vec4 r;layout(location=${Attribute.InstanceTranslation}) in vec4 n;layout(location=${Attribute.InstanceColor}) in vec4 c;layout(location=${Attribute.InstanceSprite}) in vec4 e;out vec2 v;out vec4 w;void main(){int i=int(n.w);if((i&${Has.Render2D})==${Has.Render2D}){mat3x2 m;if((i&${Has.SpatialNode2D})==${Has.SpatialNode2D}) {m=mat3x2(r.xy,r.zw,n.xy);}else{vec2 a=r.xy;float b=r.z;m=mat3x2(cos(b)*a.x,sin(b)*a.x,-sin(b)*a.y,cos(b)*a.y,n.xy);}vec3 o=mat3(m)*vec3(p,1);vec3 l=mat3(u)*o;gl_Position=vec4(l.xy,-n.z,1);v=(e.xy+e.zw*t)/s;w=c;}else{gl_Position.z=2.0;}}`;

let fragment = `#version 300 es\n
    precision mediump float;uniform sampler2D x;in vec2 v;in vec4 w;out vec4 f;void main(){f=w*texture(x,v);if(f.a==0.0){discard;}}`;

export function mat_render2d(gl: WebGL2RenderingContext): Material<Render2DLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_TRIANGLE_STRIP,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "u")!,
            SheetTexture: gl.getUniformLocation(program, "x")!,
            SheetSize: gl.getUniformLocation(program, "s")!,
        },
    };
}
