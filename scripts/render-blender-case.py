"""Render the published Blender case-study frames from the original scene."""

import os
from pathlib import Path

import bpy


source = os.environ.get("BLENDER_CASE_SOURCE")
output = os.environ.get("BLENDER_CASE_OUTPUT")

if not source or not Path(source).exists():
    raise RuntimeError("BLENDER_CASE_SOURCE must point to the original .blend file")
if not output:
    raise RuntimeError("BLENDER_CASE_OUTPUT must point to the destination directory")

output_dir = Path(output).resolve()
output_dir.mkdir(parents=True, exist_ok=True)


def prepare_scene():
    # Reloading between frames avoids a GPU-image failure in this source scene
    # when its missing external label texture is evaluated more than once.
    bpy.ops.wm.open_mainfile(filepath=str(Path(source).resolve()))
    scene = bpy.context.scene
    scene.camera = bpy.data.objects.get("Camera") or scene.camera
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    for engine in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue
    return scene


def render(frame, filename, material_override=None):
    scene = prepare_scene()
    scene.view_layers[0].material_override = material_override(scene) if material_override else None
    scene.frame_set(frame)
    bpy.ops.render.render()
    image = bpy.data.images["Render Result"]
    image.file_format = "PNG"
    image.filepath_raw = str(output_dir / filename)
    image.save()


render(30, "cup-noodle-frame-030.png")
render(60, "cup-noodle-frame-060.png")
render(90, "cup-noodle-frame-090.png")

# A neutral material pass makes the authored geometry and scene layers easier to
# inspect without implying that the missing external label texture is complete.
def create_clay_material(_scene):
    clay = bpy.data.materials.new("Portfolio scene breakdown")
    clay.diffuse_color = (0.62, 0.65, 0.68, 1.0)
    clay.use_nodes = True
    principled = clay.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (0.62, 0.65, 0.68, 1.0)
        principled.inputs["Roughness"].default_value = 0.78
    return clay


render(60, "cup-noodle-scene-breakdown.png", create_clay_material)
