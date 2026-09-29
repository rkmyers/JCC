const form = document.getElementById("calculatorForm");
const distanceInput = document.getElementById("distance");
const fuelPriceInput = document.getElementById("fuelPrice");
const mpgInput = document.getElementById("mpg");

const results = document.getElementById("results");
const journeyCost = document.getElementById("journeyCost");
const fuelUsed = document.getElementById("fuelUsed");
const costPerMile = document.getElementById("costPerMile");
const errorMessage = document.getElementById("errorMessage");
const clearButton = document.getElementById("clearButton");

const STORAGE_KEY = "journeyFuelCostCalculator";

function saveInputs() {
    const values = {
        distance: distanceInput.value,
        fuelPrice: fuelPriceInput.value,
        mpg: mpgInput.value
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function loadInputs() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (!saved) {
            return;
        }

        distanceInput.value = saved.distance ?? "";
        fuelPriceInput.value = saved.fuelPrice ?? "";
        mpgInput.value = saved.mpg ?? "";
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = "";
}

function calculateCost(event) {
    event.preventDefault();
    clearError();

    const distance = Number(distanceInput.value);
    const fuelPrice = Number(fuelPriceInput.value);
    const mpg = Number(mpgInput.value);

    if (!Number.isFinite(distance) || distance <= 0) {
        showError("Please enter a journey distance greater than zero.");
        distanceInput.focus();
        return;
    }

    if (!Number.isFinite(fuelPrice) || fuelPrice <= 0) {
        showError("Please enter a fuel price greater than zero.");
        fuelPriceInput.focus();
        return;
    }

    if (!Number.isFinite(mpg) || mpg <= 0) {
        showError("Please enter an MPG figure greater than zero.");
        mpgInput.focus();
        return;
    }

    // UK MPG uses Imperial gallons.
    const IMPERIAL_GALLON_LITRES = 4.54609;

    const imperialGallons = distance / mpg;
    const litres = imperialGallons * IMPERIAL_GALLON_LITRES;
    const cost = litres * fuelPrice;
    const costPerMileValue = cost / distance;

    journeyCost.textContent = formatCurrency(cost);
    fuelUsed.textContent = `${litres.toFixed(2)} L`;
    costPerMile.textContent = formatCurrency(costPerMileValue, 3);

    results.hidden = false;
    saveInputs();
}

function formatCurrency(value, decimals = 2) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

function clearCalculator() {
    form.reset();
    results.hidden = true;
    clearError();
    localStorage.removeItem(STORAGE_KEY);
    distanceInput.focus();
}

form.addEventListener("submit", calculateCost);
clearButton.addEventListener("click", clearCalculator);

loadInputs();


// Theme handling
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeText.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
}

function loadTheme() {
    const savedTheme = localStorage.getItem("journeyFuelTheme");

    if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
        return;
    }

    // Respect the user's operating-system preference when no choice has been saved.
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

    applyTheme(newTheme);
    localStorage.setItem("journeyFuelTheme", newTheme);
});

loadTheme();
