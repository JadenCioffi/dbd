import re
from pathlib import Path

import requests


ROOT_DIR = Path(__file__).resolve().parent.parent
SOURCE_FILE = ROOT_DIR / "scripts" / "source" / "perk_image_urls.txt"
OUTPUT_DIR = ROOT_DIR / "assets" / "images" / "perks" / "unsorted"


OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with open(SOURCE_FILE, "r", encoding="utf-8") as file_handle:
    for url in file_handle:
        url = url.strip()

        match = re.search(r"IconPerks_(.*?)\.png", url)
        if not match:
            print("Skipping:", url)
            continue

        perk_name = match.group(1)
        filename = OUTPUT_DIR / f"{perk_name}.png"

        print("Downloading", filename.relative_to(ROOT_DIR))

        response = requests.get(url, timeout=30)
        response.raise_for_status()

        with open(filename, "wb") as output_file:
            output_file.write(response.content)
