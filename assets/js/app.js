const PERK_BACKGROUND_IMAGE = "./assets/images/perks/bg/very_rare_bg.png";
const PERK_LOADOUT_SIZE = 4;
const ITEM_ADDON_COUNT = 2;

function chooseDistinct(items, count) {
    const pool = [...items];

    for (let index = pool.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
    }

    return pool.slice(0, count);
}

function buildKillerPayload(rawValue, killers) {
    const trimmedValue = rawValue.trim() || "1";
    const parsedValue = Number.parseInt(trimmedValue, 10);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return {
            error: "Number of selections must be a positive integer.",
            numSelections: trimmedValue,
            selections: [],
        };
    }

    if (parsedValue > killers.length) {
        return {
            error: `Cannot select ${parsedValue} unique killers; only ${killers.length} killers are available.`,
            numSelections: trimmedValue,
            selections: [],
        };
    }

    return {
        error: null,
        numSelections: String(parsedValue),
        selections: chooseDistinct(killers, parsedValue),
    };
}

function buildKillerCard(selection, placeholderTemplate) {
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
        placeholder.textContent = placeholderTemplate.replace("__NAME__", selection.name);
        article.appendChild(placeholder);
    }

    const heading = document.createElement("h2");
    heading.textContent = selection.name;
    article.appendChild(heading);

    return article;
}

function buildPerkCard(perk, placeholderTemplate) {
    const article = document.createElement("article");
    article.className = "card perk-card";

    const frame = document.createElement("div");
    frame.className = "perk-frame";
    frame.title = perk.name;

    if (perk.imageUrl) {
        const background = document.createElement("img");
        background.className = "perk-bg";
        background.src = PERK_BACKGROUND_IMAGE;
        background.alt = "";
        background.setAttribute("aria-hidden", "true");
        frame.appendChild(background);

        const icon = document.createElement("img");
        icon.className = "perk-icon";
        icon.src = perk.imageUrl;
        icon.alt = perk.name;
        frame.appendChild(icon);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder perk-placeholder";
        placeholder.textContent = placeholderTemplate.replace("__NAME__", perk.name);
        frame.appendChild(placeholder);
    }

    article.appendChild(frame);

    const heading = document.createElement("h2");
    heading.textContent = perk.name;
    article.appendChild(heading);

    return article;
}

function setErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message || "";
    errorElement.classList.toggle("is-hidden", !message);
}

function updateKillerResults(payload) {
    const results = document.getElementById("killer-results");
    const selectionTitle = document.getElementById("killer-selection-title");
    const selectionGrid = document.getElementById("killer-selection-grid");
    const placeholderTemplate = results.dataset.placeholderTemplate;

    setErrorMessage("killer-error", payload.error);
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
        selectionGrid.appendChild(buildKillerCard(selection, placeholderTemplate));
    });
}

function updatePerkResults(config, perks) {
    const results = document.getElementById(config.resultsId);
    const title = document.getElementById(config.titleId);
    const grid = document.getElementById(config.gridId);
    const placeholderTemplate = results.dataset.placeholderTemplate;

    setErrorMessage(config.errorId, "");
    grid.replaceChildren();

    if (perks.length === 0) {
        results.classList.add("is-hidden");
        return;
    }

    results.classList.remove("is-hidden");
    title.textContent = config.titleText;

    perks.forEach((perk) => {
        grid.appendChild(buildPerkCard(perk, placeholderTemplate));
    });
}

function chooseSurvivorPerks(perkPool, options = {}) {
    const { forceExactlyOneExhaustion = false } = options;

    if (!forceExactlyOneExhaustion) {
        return chooseDistinct(perkPool, PERK_LOADOUT_SIZE);
    }

    const exhaustionPerks = perkPool.filter((perk) => perk.isExhaustionPerk);
    const nonExhaustionPerks = perkPool.filter((perk) => !perk.isExhaustionPerk);

    if (exhaustionPerks.length === 0 || nonExhaustionPerks.length < PERK_LOADOUT_SIZE - 1) {
        throw new Error("Not enough survivor perks are available to force exactly one exhaustion perk.");
    }

    return chooseDistinct([
        ...chooseDistinct(exhaustionPerks, 1),
        ...chooseDistinct(nonExhaustionPerks, PERK_LOADOUT_SIZE - 1),
    ], PERK_LOADOUT_SIZE);
}

function buildItemLoadoutCard(item, addOns) {
    const article = document.createElement("article");
    article.className = "text-loadout-card";

    const categoryLabel = document.createElement("p");
    categoryLabel.className = "text-loadout-label";
    categoryLabel.textContent = item.category;
    article.appendChild(categoryLabel);

    const heading = document.createElement("h2");
    heading.textContent = item.name;
    article.appendChild(heading);

    const addOnLabel = document.createElement("p");
    addOnLabel.className = "text-loadout-subtitle";
    addOnLabel.textContent = "Add-ons";
    article.appendChild(addOnLabel);

    const list = document.createElement("ul");
    list.className = "text-loadout-list";

    addOns.forEach((addOn) => {
        const listItem = document.createElement("li");
        listItem.textContent = addOn;
        list.appendChild(listItem);
    });

    article.appendChild(list);

    return article;
}

function updateItemResults(payload) {
    const results = document.getElementById("survivor-item-results");
    const title = document.getElementById("survivor-item-title");
    const loadout = document.getElementById("survivor-item-loadout");

    setErrorMessage("survivor-item-error", payload.error);
    loadout.replaceChildren();

    if (!payload.item) {
        results.classList.add("is-hidden");
        return;
    }

    results.classList.remove("is-hidden");
    title.textContent = "Survivor item is:";
    loadout.appendChild(buildItemLoadoutCard(payload.item, payload.addOns));
}

async function loadQuotes() {
    const response = await fetch("./data/quotes/attributed_quotes.txt");

    if (!response.ok) {
        throw new Error(`Unable to load quotes (${response.status})`);
    }

    const text = await response.text();

    return text
        .split("\n")
        .map((quote) => quote.trim())
        .filter((quote) => quote.length > 0);
}

async function loadKillers() {
    const response = await fetch("./data/killers.json");

    if (!response.ok) {
        throw new Error(`Unable to load killer data (${response.status})`);
    }

    const data = await response.json();

    return data.map((killer) => ({
        ...killer,
        imageUrl: killer.image ? `./${killer.image}` : null,
    }));
}

async function loadPerks() {
    const response = await fetch("./data/perks.json");

    if (!response.ok) {
        throw new Error(`Unable to load perks data (${response.status})`);
    }

    const data = await response.json();
    const survivorPerks = [];
    const killerPerks = [];

    data.forEach((perk) => {
        const normalizedPerk = {
            ...perk,
            imageUrl: perk.image ? `./${perk.image}` : null,
        };

        if (perk.type === "survivor") {
            survivorPerks.push(normalizedPerk);
        } else if (perk.type === "killer") {
            killerPerks.push(normalizedPerk);
        }
    });

    return {
        survivorPerks,
        killerPerks,
    };
}

async function loadItems() {
    const response = await fetch("./data/items.json");

    if (!response.ok) {
        throw new Error(`Unable to load item data (${response.status})`);
    }

    return response.json();
}

function createKillerHandler(killersPromise) {
    return async function handleKillerSubmit(event) {
        event.preventDefault();

        const numSelectionsInput = document.getElementById("num_selections");

        try {
            const killers = await killersPromise;
            const payload = buildKillerPayload(numSelectionsInput.value, killers);
            numSelectionsInput.value = payload.numSelections;
            updateKillerResults(payload);
        } catch (error) {
            setErrorMessage("killer-error", "Unable to load killers right now.");
        }
    };
}

function createPerkHandler(perksPromise, perkType, config, options = {}) {
    return async function handlePerkSelection() {
        try {
            const perkData = await perksPromise;
            const perkPool = perkType === "survivor" ? perkData.survivorPerks : perkData.killerPerks;
            const selectedPerks = perkType === "survivor"
                ? chooseSurvivorPerks(perkPool, {
                    forceExactlyOneExhaustion: options.forceExactlyOneExhaustion?.() ?? false,
                })
                : chooseDistinct(perkPool, PERK_LOADOUT_SIZE);
            updatePerkResults(config, selectedPerks);
        } catch (error) {
            const message = error.message === "Not enough survivor perks are available to force exactly one exhaustion perk."
                ? error.message
                : "Unable to load perks right now.";
            setErrorMessage(config.errorId, message);
        }
    };
}

function createItemHandler(itemsPromise) {
    return async function handleItemSelection() {
        try {
            const items = await itemsPromise;
            const [selectedItem] = chooseDistinct(items, 1);
            const selectedAddOns = chooseDistinct(selectedItem.addOns, ITEM_ADDON_COUNT);

            updateItemResults({
                error: null,
                item: selectedItem,
                addOns: selectedAddOns,
            });
        } catch (error) {
            updateItemResults({
                error: "Unable to load survivor items right now.",
                item: null,
                addOns: [],
            });
        }
    };
}

function initializeQuote(quotesPromise) {
    const quoteText = document.getElementById("quote-text");

    if (!quoteText) {
        return;
    }

    quotesPromise
        .then((quotes) => {
            if (quotes.length === 0) {
                return;
            }

            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteText.textContent = randomQuote;
        })
        .catch(() => {
            // Keep the fallback quote text already present in the HTML.
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const killerForm = document.getElementById("killer-form");
    const survivorPerkButton = document.getElementById("survivor-perk-button");
    const survivorPerkForceExhaustion = document.getElementById("survivor-perk-force-exhaustion");
    const survivorItemButton = document.getElementById("survivor-item-button");
    const killerPerkButton = document.getElementById("killer-perk-button");
    const numSelectionsInput = document.getElementById("num_selections");
    const helperText = document.getElementById("helper-text");
    const quotesPromise = loadQuotes();
    const killersPromise = loadKillers();
    const perksPromise = loadPerks();
    const itemsPromise = loadItems();

    initializeQuote(quotesPromise);

    if (
        !killerForm
        || !survivorPerkButton
        || !survivorPerkForceExhaustion
        || !survivorItemButton
        || !killerPerkButton
        || !numSelectionsInput
        || !helperText
    ) {
        return;
    }

    killersPromise
        .then((killers) => {
            numSelectionsInput.max = String(killers.length);
            helperText.textContent = `Enter a value from 1 to ${killers.length}.`;
        })
        .catch(() => {
            setErrorMessage("killer-error", "Unable to load killers right now.");
        });

    killerForm.addEventListener("submit", createKillerHandler(killersPromise));
    survivorPerkButton.addEventListener(
        "click",
        createPerkHandler(perksPromise, "survivor", {
            errorId: "survivor-perk-error",
            resultsId: "survivor-perk-results",
            titleId: "survivor-perk-title",
            gridId: "survivor-perk-grid",
            titleText: "Survivor perks are:",
        }, {
            forceExactlyOneExhaustion: () => survivorPerkForceExhaustion.checked,
        }),
    );
    survivorItemButton.addEventListener("click", createItemHandler(itemsPromise));
    killerPerkButton.addEventListener(
        "click",
        createPerkHandler(perksPromise, "killer", {
            errorId: "killer-perk-error",
            resultsId: "killer-perk-results",
            titleId: "killer-perk-title",
            gridId: "killer-perk-grid",
            titleText: "Killer perks are:",
        }),
    );
});
