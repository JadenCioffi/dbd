import html
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import Request, urlopen


ROOT_DIR = Path(__file__).resolve().parent.parent
ITEMS_FILE = ROOT_DIR / "data" / "items.json"
ITEMS_IMAGE_DIR = ROOT_DIR / "assets" / "images" / "items"
ADDONS_IMAGE_DIR = ROOT_DIR / "assets" / "images" / "item-addons"
BASE_URL = "https://deadbydaylight.wiki.gg"
USER_AGENT = "dbd-codex-item-sync/1.0 (+local workspace automation)"

PAGE_BY_CATEGORY = {
    "Flashlights": "Flashlights",
    "Med-Kits": "Med-Kits",
    "Toolboxes": "Toolboxes",
    "Keys": "Keys",
    "Maps": "Maps",
    "Fog Vials": "Fog_Vial",
}

RARITY_BY_CLASS = {
    "common-item-element": "Common",
    "uncommon-item-element": "Uncommon",
    "rare-item-element": "Rare",
    "very-rare-item-element": "Very Rare",
    "visceral-item-element": "Ultra Rare",
    "event-item-element": "Event",
    "limited-item-element": "Limited",
}


def fetch_url(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})

    with urlopen(request, timeout=60) as response:
        return response.read()


def fetch_text(url):
    return html.unescape(fetch_url(url).decode("utf-8"))


def extract_rows(page_html):
    return re.findall(r"<tr\b.*?</tr>", page_html, flags=re.DOTALL)


def find_row(rows, name):
    exact_title_pattern = f'title="{name}"'
    exact_text_pattern = f">{name}</a>"

    for row in rows:
        if exact_title_pattern in row and exact_text_pattern in row:
            return row

    for row in rows:
        if exact_title_pattern in row:
            return row

    return None


def normalize_image_filename(alt_text, image_url, fallback_name):
    alt_match = re.search(r"Icon(?:Items|Addon)\s+(.+?\.(?:png|webp|jpg|jpeg))$", alt_text)

    if alt_match:
        return alt_match.group(1)

    parsed_path = unquote(Path(urlparse(image_url).path).name)
    parsed_path = re.sub(r"^\d+px-", "", parsed_path)
    parsed_path = re.sub(r"^(?:IconItems_|IconAddon_)", "", parsed_path)

    if "." in parsed_path:
        return parsed_path

    safe_stem = re.sub(r"[^a-zA-Z0-9]+", "", fallback_name) or "asset"
    return f"{safe_stem}.png"


def extract_metadata(row, name):
    rarity_class_match = re.search(
        r"\b(common-item-element|uncommon-item-element|rare-item-element|very-rare-item-element|visceral-item-element|event-item-element|limited-item-element)\b",
        row,
    )
    image_match = re.search(r'<img [^>]*alt="([^"]+)"[^>]*src="([^"]+)"', row)

    if not rarity_class_match:
        raise ValueError(f"Missing rarity class for {name}")

    if not image_match:
        raise ValueError(f"Missing image for {name}")

    alt_text, image_src = image_match.groups()
    image_url = urljoin(BASE_URL, image_src)
    filename = normalize_image_filename(alt_text, image_url, name)

    return {
        "rarity": RARITY_BY_CLASS[rarity_class_match.group(1)],
        "image_url": image_url,
        "filename": filename,
    }


def download_image(url, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(fetch_url(url))
    time.sleep(0.08)


def main():
    raw_items = json.loads(ITEMS_FILE.read_text(encoding="utf-8"))
    rows_cache = {}
    updated_items = []

    for page_name in PAGE_BY_CATEGORY.values():
        page_html = fetch_text(f"{BASE_URL}/wiki/{page_name}")
        rows_cache[page_name] = extract_rows(page_html)

    for item in raw_items:
        page_name = PAGE_BY_CATEGORY[item["category"]]
        item_rows = rows_cache[page_name]
        item_row = find_row(item_rows, item["name"])

        if not item_row:
            raise KeyError(f"Could not find item row for {item['name']} on {page_name}")

        item_meta = extract_metadata(item_row, item["name"])
        item_destination = ITEMS_IMAGE_DIR / item_meta["filename"]
        download_image(item_meta["image_url"], item_destination)

        updated_addons = []

        for add_on_name in item["addOns"]:
            add_on_row = find_row(item_rows, add_on_name)

            if not add_on_row:
                raise KeyError(f"Could not find add-on row for {add_on_name} on {page_name}")

            add_on_meta = extract_metadata(add_on_row, add_on_name)
            add_on_destination = ADDONS_IMAGE_DIR / add_on_meta["filename"]
            download_image(add_on_meta["image_url"], add_on_destination)

            updated_addons.append(
                {
                    "name": add_on_name,
                    "rarity": add_on_meta["rarity"],
                    "image": str(add_on_destination.relative_to(ROOT_DIR)).replace("\\", "/"),
                }
            )

        updated_items.append(
            {
                "name": item["name"],
                "category": item["category"],
                "rarity": item_meta["rarity"],
                "image": str(item_destination.relative_to(ROOT_DIR)).replace("\\", "/"),
                "addOns": updated_addons,
            }
        )

    ITEMS_FILE.write_text(f"{json.dumps(updated_items, indent=2)}\n", encoding="utf-8")
    print(f"Updated {len(updated_items)} items")


if __name__ == "__main__":
    main()
