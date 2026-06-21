import json
import re
from pathlib import Path


def prettify(perk_id):
    name = re.sub(r'([A-Z])', r' \1', perk_id).strip()

    if name:
        name = name[0].upper() + name[1:]

    return name


JSON_FILE = "perks.json"

# Load existing perks if present
if Path(JSON_FILE).exists():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        existing_perks = json.load(f)
else:
    existing_perks = []

# Create lookup by id
perk_lookup = {
    perk["id"]: perk
    for perk in existing_perks
}

# Scan filesystem
for perk_type in ["survivor", "killer"]:
    folder = Path(f"perks/{perk_type}")

    for file in folder.glob("*.png"):
        perk_id = file.stem

        if perk_id in perk_lookup:
            # Update fields that should always reflect filesystem state
            perk_lookup[perk_id]["type"] = perk_type
            perk_lookup[perk_id]["image"] = (
                f"perks/{perk_type}/{file.name}"
            )

        else:
            # New perk found
            perk_lookup[perk_id] = {
                "id": perk_id,
                "name": prettify(perk_id),
                "type": perk_type,
                "image": f"perks/{perk_type}/{file.name}",
                "description": ""
            }

# Optional: remove entries whose files no longer exist
valid_ids = set()

for perk_type in ["survivor", "killer"]:
    folder = Path(f"perks/{perk_type}")

    for file in folder.glob("*.png"):
        valid_ids.add(file.stem)

perk_lookup = {
    perk_id: perk
    for perk_id, perk in perk_lookup.items()
    if perk_id in valid_ids
}

# Sort by name
perks = sorted(
    perk_lookup.values(),
    key=lambda perk: perk["name"].lower()
)

with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(
        perks,
        f,
        indent=2,
        ensure_ascii=False
    )

print(f"Saved {len(perks)} perks to {JSON_FILE}")