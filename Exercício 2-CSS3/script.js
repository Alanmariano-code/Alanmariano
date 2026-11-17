const cardGrid = document.querySelector("#card-grid");
let cards = [...cardGrid.querySelectorAll(".content-card")];
const clearSelectionButton = document.querySelector("#clear-selection");
const hideSelectedButton = document.querySelector("#hide-selected");
const showHiddenButton = document.querySelector("#show-hidden");
const hiddenCount = document.querySelector("#hidden-count");
const totalCount = document.querySelector("#total-count");
const selectionStatus = document.querySelector("#selection-status");
const emptyState = document.querySelector("#empty-state");
const emptyShowHiddenButton = document.querySelector("#empty-show-hidden");

function getVisibleCards() {
  return cards.filter((card) => !card.classList.contains("hidden"));
}

function getSelectedCards() {
  return cards.filter((card) => card.classList.contains("selected"));
}

function updateControls() {
  const selectedCards = getSelectedCards();
  const hiddenCards = cards.filter((card) => card.classList.contains("hidden"));
  const visibleCards = getVisibleCards();

  clearSelectionButton.disabled = selectedCards.length === 0;
  hideSelectedButton.disabled = selectedCards.length === 0;
  showHiddenButton.disabled = hiddenCards.length === 0;
  hiddenCount.textContent = hiddenCards.length;
  totalCount.textContent = String(visibleCards.length).padStart(2, "0");
  selectionStatus.textContent = selectedCards.length
    ? `${selectedCards.length} card${selectedCards.length === 1 ? "" : "s"} selecionado${selectedCards.length === 1 ? "" : "s"}`
    : "Selecione um card para começar";
  emptyState.classList.toggle("hidden", visibleCards.length > 0);
  cardGrid.classList.toggle("hidden", visibleCards.length === 0);
}

function toggleCardSelection(card) {
  const wasSelected = card.classList.contains("selected");

  cards.forEach((item) => {
    item.classList.remove("selected");
    item.setAttribute("aria-pressed", "false");
  });

  if (!wasSelected) {
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
  }
  updateControls();
}

function hideCard(card) {
  card.classList.remove("selected");
  card.setAttribute("aria-pressed", "false");
  card.classList.add("hidden");
  updateControls();
}

function bindCard(card) {
  card.addEventListener("click", (event) => {
    if (event.target.closest("[data-action='hide']")) {
      event.stopPropagation();
      hideCard(card);
      return;
    }
    toggleCardSelection(card);
  });

  card.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target === card) {
      event.preventDefault();
      toggleCardSelection(card);
    }
  });
}

cards.forEach(bindCard);

clearSelectionButton.addEventListener("click", () => {
  cards.forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  updateControls();
});

hideSelectedButton.addEventListener("click", () => {
  getSelectedCards().forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
    card.classList.add("hidden");
  });
  updateControls();
});

function showHiddenCards() {
  cards.forEach((card) => card.classList.remove("hidden"));
  updateControls();
}

showHiddenButton.addEventListener("click", showHiddenCards);
emptyShowHiddenButton.addEventListener("click", showHiddenCards);

document.querySelector("#create-card-button").addEventListener("click", () => {
  const card = cards[0].cloneNode(true);
  const title = "Nova ideia";

  card.classList.remove("card-violet", "selected", "hidden");
  card.classList.add("card-yellow");
  card.setAttribute("aria-label", `${title}, card de anotação`);
  card.setAttribute("aria-pressed", "false");
  card.querySelector(".card-art").className = "card-art new-art";
  card.querySelector(".card-art").innerHTML = '<span class="new-art-orb"></span><span class="new-art-copy">IDEIAS<br>EM CONSTRUÇÃO</span>';
  card.querySelector(".category").className = "category category-yellow";
  card.querySelector(".category").textContent = "NOVA IDEIA";
  card.querySelector(".card-menu").setAttribute("aria-label", `Ocultar ${title}`);
  card.querySelector("h2").textContent = title;
  card.querySelector(".card-description").textContent = "Uma nova ideia pronta para ganhar forma.";
  card.querySelector(".card-date").innerHTML = '<span class="date-dot"></span> Criado agora';

  cards.push(card);
  cardGrid.append(card);
  bindCard(card);
  updateControls();
  card.focus();
});

updateControls();
