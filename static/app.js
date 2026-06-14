const KILLERS = [
    "The Trapper",
    "The Wraith",
    "The Hillbilly",
    "The Nurse",
    "The Shape",
    "The Hag",
    "The Doctor",
    "The Huntress",
    "The Cannibal",
    "The Nightmare",
    "The Pig",
    "The Clown",
    "The Spirit",
    "The Legion",
    "The Plague",
    "The Ghost Face",
    "The Demogorgon",
    "The Oni",
    "The Deathslinger",
    "The Executioner",
    "The Blight",
    "The Twins",
    "The Trickster",
    "The Nemesis",
    "The Cenobite",
    "The Artist",
    "The Onryo",
    "The Dredge",
    "The Mastermind",
    "The Knight",
    "The Skull Merchant",
    "The Singularity",
    "The Xenomorph",
    "The Good Guy",
    "The Unknown",
    "The Lich",
    "The Dark Lord",
    "The Houndmaster",
    "The Ghoul",
    "The Animatronic",
    "The Krasue",
    "The First",
    "The Slasher",
];

const IMAGE_FILENAMES = [
    "K01_The_Trapper.webp",
    "K02_The_Wraith.webp",
    "K03_The_Hillbilly.webp",
    "K04_The_Nurse.webp",
    "K05_The_Hag.webp",
    "K06_The_Shape.webp",
    "K07_The_Doctor.webp",
    "K08_The_Huntress.webp",
    "K09_The_Cannibal.webp",
    "K10_The_Nightmare.webp",
    "K11_The_Pig.webp",
    "K12_The_Clown.webp",
    "K13_The_Spirit.webp",
    "K14_The_Legion.webp",
    "K15_The_Plague.webp",
    "K16_The_Ghostface.webp",
    "K17_The_Demogorgon.webp",
    "K18_The_Oni.webp",
    "K19_The_Deathslinger.webp",
    "K20_The_Executioner.webp",
    "K21_The_Blight.webp",
    "K22_The_Twins.webp",
    "K23_The_Trickster.webp",
    "K24_The_Nemesis.webp",
    "K25_The_Cenobite.webp",
    "K26_The_Artist.webp",
    "K27_The_Onryo.webp",
    "K28_The_Dredge.webp",
    "K29_The_Master_Mind.webp",
    "K30_The_Knight.webp",
    "K31_The_Skull_Merchant.webp",
    "K32_The_Singularity.webp",
    "K33_The_Xenomorph.webp",
    "K34_The_Good_Guy.webp",
    "K35_The_Unknown.webp",
    "K36_The_Lich.webp",
    "K37_The_Dark_Lord.webp",
    "K38_The_Houndmaster.webp",
    "K39_The_Ghoul.webp",
    "K40_The_Animatronic.webp",
    "K41_The_Krasue.webp",
    "K42_The_First.webp",
    "K43_The_Slasher.webp",
];

function normalizeName(value) {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

function extractImageName(filename) {
    const stem = filename.replace(/\.[^.]+$/, "");
    const splitIndex = stem.indexOf("_");
    const rawName = splitIndex >= 0 ? stem.slice(splitIndex + 1) : stem;
    return rawName.replaceAll("_", " ");
}

function buildImageLookup() {
    const killerByKey = new Map(KILLERS.map((killer) => [normalizeName(killer), killer]));
    const imageLookup = new Map();

    IMAGE_FILENAMES.forEach((filename) => {
        const normalizedImageName = normalizeName(extractImageName(filename));
        const killerName = killerByKey.get(normalizedImageName);

        if (killerName) {
            imageLookup.set(killerName, `./images/${filename}`);
        }
    });

    return imageLookup;
}

const IMAGE_LOOKUP = buildImageLookup();

function chooseKillers(numSelections) {
    const pool = [...KILLERS];

    for (let index = pool.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
    }

    return pool.slice(0, numSelections);
}

function parseNumSelections(rawValue) {
    const trimmedValue = rawValue.trim() || "1";
    const parsedValue = Number.parseInt(trimmedValue, 10);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return {
            error: "Number of selections must be a positive integer.",
            numSelections: trimmedValue,
            selections: [],
        };
    }

    if (parsedValue > KILLERS.length) {
        return {
            error: `Cannot select ${parsedValue} unique killers; only ${KILLERS.length} killers are available.`,
            numSelections: trimmedValue,
            selections: [],
        };
    }

    return {
        error: null,
        numSelections: String(parsedValue),
        selections: chooseKillers(parsedValue).map((killer) => ({
            name: killer,
            imageUrl: IMAGE_LOOKUP.get(killer) || null,
        })),
    };
}

function buildSelectionCard(selection, placeholderTemplate) {
    const article = document.createElement("article");
    article.className = "card";

    if (selection.imageUrl) {
        const image = document.createElement("img");
        image.src = selection.imageUrl;
        image.alt = selection.name;
        article.appendChild(image);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = placeholderTemplate.replace("__KILLER__", selection.name);
        article.appendChild(placeholder);
    }

    const heading = document.createElement("h2");
    heading.textContent = selection.name;
    article.appendChild(heading);

    return article;
}

function updateResults(payload) {
    const errorMessage = document.getElementById("error-message");
    const results = document.getElementById("results");
    const selectionTitle = document.getElementById("selection-title");
    const selectionGrid = document.getElementById("selection-grid");
    const placeholderTemplate = results.dataset.placeholderTemplate;

    errorMessage.textContent = payload.error || "";
    errorMessage.classList.toggle("is-hidden", !payload.error);

    selectionGrid.replaceChildren();

    if (payload.selections.length === 0) {
        results.classList.add("is-hidden");
        selectionGrid.classList.remove("single-selection");
        return;
    }

    results.classList.remove("is-hidden");
    selectionTitle.textContent = payload.selections.length === 1 ? "Killer is:" : "Killers are:";
    selectionGrid.classList.toggle("single-selection", payload.selections.length === 1);

    payload.selections.forEach((selection) => {
        selectionGrid.appendChild(buildSelectionCard(selection, placeholderTemplate));
    });
}

function handleSubmit(event) {
    event.preventDefault();

    const numSelectionsInput = document.getElementById("num_selections");
    const payload = parseNumSelections(numSelectionsInput.value);

    numSelectionsInput.value = payload.numSelections;
    updateResults(payload);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("killer-form");
    const numSelectionsInput = document.getElementById("num_selections");
    const helperText = document.getElementById("helper-text");

    if (!form || !numSelectionsInput || !helperText) {
        return;
    }

    numSelectionsInput.max = String(KILLERS.length);
    helperText.textContent = `Enter a value from 1 to ${KILLERS.length}.`;
    form.addEventListener("submit", handleSubmit);
});
