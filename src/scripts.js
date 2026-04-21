const ITEMS_PER_PAGE = 50;
const FILTERS_LISTS = {
  "SMG": ["MP9", "MAC-10", "P90", "UMP-45", "PP-Bizon", "MP7"],
  "Rifle": ["AK-47", "M4A4", "M4A1-S", "SSG 08", "AWP", "FAMAS", "G3SG1", "SCAR-20"],
  "Pistol": ["Glock-18", "USP-S", "P2000", "Desert Eagle", "Five-SeveN", "Dual Berettas", "CZ75-Auto", "R8 Revolver"],
  "Shotgun": ["Nova", "XM1014", "Sawed-Off", "MAG-7"],
  "LMG": ["Negev", "M249"],
  "Zeus": ["Zeus x27"],
  "Knife": ["Bayonet", "Bowie Knife", "Butterfly Knife", "Classic Knife", "Falchion Knife", "Flip Knife", "Gut Knife",
    "Karambit", "Kukri Knife", "M9 Bayonet", "Navaja Knife", "Nomad Knife", "Paracord Knife", "Huntsman Knife", "Shadow Daggers",
    "Skeleton Knife", "Stiletto Knife", "Survival Knife", "Talon Knife", "Ursus Knife"],
  "Gloves": ["Bloodhound Gloves", "Sport Gloves", "Driver Gloves", "Hand Wraps", "Moto Gloves", "Specialist Gloves"],
  "Sticker": ["Sticker"],
  "Charm": ["Charm"]
}


let dataset = [];
let filteredDataset = [];
let sortAscending = false;
let current_page = 0;

// init
document.addEventListener("DOMContentLoaded", main);

function main() {
  fetch("src/dataset.json")
    .then((response) => response.json())
    .then((data) => {
      dataset = data["data"] || [];
      filteredDataset = dataset;
      applyFilters();
    })
    .catch((error) => {
      console.error("Error loading JSON data: ", error);
    });
}

// This function adds cards the page to display the data in the array
function showCards() {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  const templateCard = document.querySelector(".card");

  if (!filteredDataset || filteredDataset.length === 0) {
    return;
  }

  for (let i = current_page * ITEMS_PER_PAGE; i < Math.min((current_page + 1) * ITEMS_PER_PAGE, filteredDataset.length); i++) {
    const item = filteredDataset[i];
    if (!item) continue;

    let marketName = item.market_name;
    let imageURL = item.image;
    let price = item.prices.latest;
    let borderColor = item.border_color || "#666";

    const nextCard = templateCard.cloneNode(true); // Copy the template card (instancing)
    editCardContent(nextCard, marketName, imageURL, price, borderColor); // edit card data.
    cardContainer.appendChild(nextCard); // Add new card to the container
  }
}

function editCardContent(card, newTitle, newImageURL, price, borderColor) {
  card.style.display = "block";
  card.style.borderColor = "#" + borderColor;

  const cardHeader = card.querySelector("h2");
  cardHeader.textContent = newTitle;

  const cardImage = card.querySelector("img");
  cardImage.src = newImageURL;
  cardImage.alt = newTitle + " Poster";
  const priceElement = card.querySelector("h3");
  priceElement.textContent = formatMoney(price);

  console.log("new card:", newTitle, "- html: ", card);
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function filterCards() {
  filteredDataset = dataset.filter(filterRules);
}

function filterRules(item) {
  const split_name = item.market_name.split(" | ");
  const price = item.prices.latest;
  const priceThreshold = parseFloat(document.getElementById("price-threshold").value) || 0;
  const type = split_name[0] || "";
  const typeFilter = document.getElementById("type-filter").value;
  const statTrak = item.market_name.includes("StatTrak™");
  const statTrakFilter = document.getElementById("stattrak-filter").value;
  const exterior = split_name[1] || "";
  const exteriorFilter = document.getElementById("exterior-filter").value;
  const search = document.getElementById("search-input").value.toLowerCase();

  if (search && !item.market_name.toLowerCase().includes(search)) {
    return false;
  }
  
  if (price < priceThreshold) {
    return false;
  }
  else if (typeFilter && FILTERS_LISTS[typeFilter] && !FILTERS_LISTS[typeFilter].some((subtype) => item.market_name.includes(subtype))) {
    return false;
  }
  else if (statTrakFilter !== "All") {
    if (statTrakFilter === "StatTrak™" && !statTrak) {
      return false;
    }
    else if (statTrakFilter === "Non-StatTrak™" && statTrak) {
      return false;
    }
  }

  if (exteriorFilter !== "All" && !exterior.includes(exteriorFilter)) {
    return false;
  }

  return true;
}

function sortCards() {
  filteredDataset.sort((a, b) => {
    const priceA = a.prices.latest;
    const priceB = b.prices.latest;
    return sortAscending ? priceA - priceB : priceB - priceA;
  });
}

function applyFilters() {
  getCards();
  showCards();
}

function getCards() {
  filterCards();
  sortCards();
  current_page = 0;
}

function toggleSort() {
  sortAscending = !sortAscending;
  document.getElementById("sort-order").textContent = sortAscending
    ? "↑"
    : "↓";
  sortCards();
  showCards();
}