import os
import re
import requests

os.makedirs("perks", exist_ok=True)

with open("images.txt") as f:
    for url in f:
        url = url.strip()

        match = re.search(r'IconPerks_(.*?)\.png', url)
        if not match:
            print("Skipping:", url)
            continue

        perk_name = match.group(1)
        filename = f"perks/{perk_name}.png"

        print("Downloading", filename)

        r = requests.get(url, timeout=30)
        r.raise_for_status()

        with open(filename, "wb") as out:
            out.write(r.content)