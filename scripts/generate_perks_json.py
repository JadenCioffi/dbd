import json
import re
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
JSON_FILE = ROOT_DIR / "data" / "perks.json"
PERK_IMAGE_DIR = ROOT_DIR / "assets" / "images" / "perks"


def prettify(perk_id):
    name = re.sub(r"([A-Z])", r" \1", perk_id).strip()

    if name:
        name = name[0].upper() + name[1:]

    return name


if JSON_FILE.exists():
    with open(JSON_FILE, "r", encoding="utf-8") as file_handle:
        existing_perks = json.load(file_handle)
else:
    existing_perks = []

perk_lookup = {perk["id"]: perk for perk in existing_perks}

for perk_type in ["survivor", "killer"]:
    folder = PERK_IMAGE_DIR / perk_type

    for file_path in folder.glob("*.png"):
        perk_id = file_path.stem
        image_path = f"assets/images/perks/{perk_type}/{file_path.name}"

        if perk_id in perk_lookup:
            perk_lookup[perk_id]["type"] = perk_type
            perk_lookup[perk_id]["image"] = image_path
        else:
            perk_lookup[perk_id] = {
                "id": perk_id,
                "name": prettify(perk_id),
                "type": perk_type,
                "image": image_path,
                "description": "",
            }

valid_ids = set()

for perk_type in ["survivor", "killer"]:
    folder = PERK_IMAGE_DIR / perk_type

    for file_path in folder.glob("*.png"):
        valid_ids.add(file_path.stem)

perk_lookup = {
    perk_id: perk
    for perk_id, perk in perk_lookup.items()
    if perk_id in valid_ids
}

perks = sorted(perk_lookup.values(), key=lambda perk: perk["name"].lower())

with open(JSON_FILE, "w", encoding="utf-8") as file_handle:
    json.dump(perks, file_handle, indent=2, ensure_ascii=False)

print(f"Saved {len(perks)} perks to {JSON_FILE.relative_to(ROOT_DIR)}")
