# Dead by Daylight Randomizer

A GitHub Pages project for Dead by Daylight killer and perk randomization.

Live site: [https://jadencioffi.github.io/dbd/](https://jadencioffi.github.io/dbd/)

Largely A.I. generated / assisted using OpenAI Codex

__"Vibe coding doesn’t mean turning off your brain; it means using all the tools at your disposal, intelligently." - Hailey Quach__
__[link to article](https://medium.com/@haileyq/i-revolted-against-vibe-coding-until-i-realized-id-been-doing-it-all-along-b5469c440feb)__

## Project Structure

```text
.
|-- index.html
|-- assets/
|   |-- css/
|   |   `-- styles.css
|   |-- js/
|   |   `-- app.js
|   `-- images/
|       |-- killers/
|       |-- perks/
|       `-- ui/
|-- data/
|   |-- killers.json
|   |-- perks.json
|   `-- quotes/
|       `-- attributed_quotes.txt
`-- scripts/
    |-- generate_perks_json.py
    |-- get_images.py
    |-- sort_perks.py
    `-- source/
        |-- perk_image_urls.txt
        `-- quotes_multiline.txt
```

## Maintaining The Project

## Adding A New Perk

Perks are driven by [data/perks.json](data/perks.json), so adding a new perk usually means adding an image file and one JSON entry.

1. Add the perk image to the correct folder.

Survivor perk images go in [assets/images/perks/survivor](assets/images/perks/survivor).

Killer perk images go in [assets/images/perks/killer](assets/images/perks/killer).

2. Name the image file using the same camelCase style already used in the repo.

Example: `shoulderTheBurden.png`

3. Add a new object to the array in [data/perks.json](data/perks.json).

```json
{
  "id": "shoulderTheBurden",
  "name": "Shoulder The Burden",
  "type": "survivor",
  "image": "assets/images/perks/survivor/shoulderTheBurden.png",
  "description": ""
}
```

4. Make sure the values are correct.

`type` must be either `"survivor"` or `"killer"`.

`image` must exactly match the real file path.

`id` should be unique.

5. Reload the page and click the relevant perk button.

If the JSON path and image path are correct, the new perk will automatically be included in the random pool.

You do not need to edit [assets/js/app.js](assets/js/app.js) for ordinary perk additions, because perk data is loaded from [data/perks.json](data/perks.json).

## Adding A New Killer

Killers are driven by [data/killers.json](data/killers.json), so adding a new killer is very similar to the perk workflow.

1. Add the killer image to [assets/images/killers](assets/images/killers).

2. Name the file using the existing pattern.

Example: `K44_The_Example.webp`

The text portion of the filename should closely match the killer name, using underscores between words.

3. Add a new object to the array in [data/killers.json](data/killers.json).

```json
{
  "id": "theExample",
  "name": "The Example",
  "image": "assets/images/killers/K44_The_Example.webp"
}
```

4. Make sure the values are correct.

`id` should be unique.

`name` is the display name shown on the page.

`image` must exactly match the real file path.

5. Reload the page and use the killer randomizer.

If the JSON entry and image path are correct, the new killer will automatically be included in the random pool.

## Utility Scripts

[scripts/generate_perks_json.py](scripts/generate_perks_json.py)

Refreshes [data/perks.json](data/perks.json) from the perk image folders.

[scripts/get_images.py](scripts/get_images.py)

Downloads perk images from the URLs listed in [scripts/source/perk_image_urls.txt](scripts/source/perk_image_urls.txt) into `assets/images/perks/unsorted/`.

[scripts/sort_perks.py](scripts/sort_perks.py)

Moves downloaded perk images from `assets/images/perks/unsorted/` into the `killer` and `survivor` folders.

## Important Notes

For perks, [data/perks.json](data/perks.json) is the source of truth.

For killers, [data/killers.json](data/killers.json) is the source of truth.

If a name or filename format is slightly off, the item may still randomize but show no image.

The killer and perk maintenance process is now intentionally similar.
