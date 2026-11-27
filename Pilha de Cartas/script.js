"use strict";

const STORAGE_KEY = "cardstack-state-v1";
const SUITS = [
  { symbol: "♠", name: "Espadas", color: "black" },
  { symbol: "♥", name: "Copas", color: "red" },
  { symbol: "♦", name: "Ouros", color: "red" },
  { symbol: "♣", name: "Paus", color: "black" }
];
const RANKS = [
  { value: "A", name: "Ás" }, { value: "2", name: "2" }, { value: "3", name: "3" },
  { value: "4", name: "4" }, { value: "5", name: "5" }, { value: "6", name: "6" },
  { value: "7", name: "7" }, { value: "8", name: "8" }, { value: "9", name: "9" },
  { value: "10", name: "10" }, { value: "J", name: "Valete" },
  { value: "Q", name: "Dama" }, { value: "K", name: "Rei" }
];

const elements = {
  current: document.querySelector("#current-count"),
  added: document.querySelector("#added-count"),
  removed: document.querySelector("#removed-count"),
  deckLabel: document.querySelector("#deck-count-label"),
  topCard: document.querySelector("#top-card"),
  topLabel: document.querySelector("#top-card-label"),
  stage: document.querySelector("#deck-stage"),
  add: document.querySelector("#add-button"),
  draw: document.querySelector("#draw-button"),
  shuffle: document.querySelector("#shuffle-button"),
  view: document.querySelector("#view-button"),
  sound: document.querySelector("#sound-toggle"),
  modal: document.querySelector("#deck-modal"),
  modalContent: document.querySelector("#modal-content"),
  modalSubtitle: document.querySelector("#modal-subtitle"),
  modalCount: document.querySelector("#modal-count"),
  closeModal: document.querySelector("#close-modal"),
  done: document.querySelector("#done-button"),
  toastRegion: document.querySelector("#toast-region")
};

function isValidCard(card) {
  return card && RANKS.some((rank) => rank.value === card.rank) &&
    SUITS.some((suit) => suit.symbol === card.suit);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.cards) || !saved.cards.every(isValidCard) ||
      !Number.isInteger(saved.added) || saved.added < 0 ||
      !Number.isInteger(saved.removed) || saved.removed < 0) {
      return { cards: [], added: 0, removed: 0, sound: false };
    }
    return { cards: saved.cards, added: saved.added, removed: saved.removed, sound: saved.sound === true };
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn("Os dados salvos do CardStack estavam inválidos e foram ignorados.", error);
      return { cards: [], added: 0, removed: 0, sound: false };
    }
    console.error("Não foi possível carregar os dados salvos do CardStack.", error);
    return { cards: [], added: 0, removed: 0, sound: false };
  }
}

const state = loadState();
let audioContext;
let lastFocusedElement;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Não foi possível salvar o baralho neste dispositivo.", error);
    showToast("Não foi possível salvar as alterações neste dispositivo.", "error");
  }
}

function playTone(frequency, duration, type, volume) {
  if (!state.sound) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      showToast("Seu navegador não oferece suporte a áudio.", "error");
      state.sound = false;
      updateSoundButton();
      return;
    }
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    console.error("Não foi possível reproduzir o som.", error);
    showToast("Não foi possível reproduzir o som.", "error");
  }
}

function playCardSound() {
  playTone(480, 0.11, "triangle", 0.045);
  window.setTimeout(() => playTone(670, 0.12, "sine", 0.035), 55);
}

function updateSoundButton() {
  const icon = state.sound ? "volume-2" : "volume-x";
  const label = state.sound ? "Desativar sons" : "Ativar sons";
  elements.sound.setAttribute("aria-label", label);
  elements.sound.title = label;
  elements.sound.innerHTML = `<i data-lucide="${icon}"></i>`;
  lucide.createIcons();
}

function renderTopCard() {
  const card = state.cards[state.cards.length - 1];
  if (!card) {
    elements.topCard.className = "playing-card empty-card";
    elements.topCard.innerHTML = '<div class="empty-card-inner"><span class="empty-card-icon"><i data-lucide="plus"></i></span><span class="empty-card-title">Seu baralho está vazio</span><span class="empty-card-copy">Adicione uma carta para começar</span></div>';
    elements.topCard.setAttribute("aria-label", "Seu baralho está vazio");
    elements.topLabel.textContent = "Aguardando sua primeira carta";
    return;
  }
  const rank = RANKS.find((item) => item.value === card.rank);
  const suit = SUITS.find((item) => item.symbol === card.suit);
  const faceNames = { J: "VALETE", Q: "DAMA", K: "REI" };
  const centerLabel = faceNames[card.rank] ? `<span class="card-center-label">${faceNames[card.rank]}</span>` : "";
  elements.topCard.className = `playing-card card-reveal ${suit.color === "red" ? "red" : ""}`;
  elements.topCard.innerHTML = `<div class="card-face ${suit.color === "red" ? "red" : ""} ${faceNames[card.rank] ? "is-face" : ""}"><span class="card-corner">${card.rank}<span>${card.suit}</span></span><span class="card-pip">${card.suit}</span>${centerLabel}<span class="card-corner card-corner-bottom">${card.rank}<span>${card.suit}</span></span></div>`;
  elements.topCard.setAttribute("aria-label", `${rank.name} de ${suit.name}, carta no topo`);
  elements.topLabel.textContent = `${rank.name} de ${suit.name}`;
  window.setTimeout(() => elements.topCard.classList.remove("card-reveal"), 450);
}

function render() {
  const count = state.cards.length;
  elements.current.textContent = count;
  elements.added.textContent = state.added;
  elements.removed.textContent = state.removed;
  elements.deckLabel.textContent = `${count} ${count === 1 ? "carta" : "cartas"}`;
  elements.draw.disabled = count === 0;
  elements.shuffle.disabled = count < 2;
  elements.draw.setAttribute("aria-disabled", String(count === 0));
  elements.shuffle.setAttribute("aria-disabled", String(count < 2));
  elements.stage.classList.toggle("has-cards", count > 0);
  elements.stage.querySelectorAll(".stack-card").forEach((card, index) => {
    card.hidden = count <= index;
  });
  renderTopCard();
  if (!elements.modal.hidden) renderModal();
  lucide.createIcons();
}

function drawRandomCard() {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank: rank.value, suit: suit.symbol };
}

function addCard() {
  state.cards.push(drawRandomCard());
  state.added += 1;
  saveState();
  render();
  playCardSound();
  showToast("Carta adicionada ao baralho.");
}

function drawCard() {
  if (state.cards.length === 0) {
    showToast("Seu baralho está vazio. Adicione uma carta primeiro.", "error");
    return;
  }
  const card = state.cards.pop();
  state.removed += 1;
  saveState();
  render();
  playTone(310, 0.15, "triangle", 0.045);
  const rank = RANKS.find((item) => item.value === card.rank);
  const suit = SUITS.find((item) => item.symbol === card.suit);
  showToast(`Você puxou ${rank.name} de ${suit.name}.`);
}

function shuffleCards() {
  if (state.cards.length < 2) {
    showToast("Adicione pelo menos duas cartas para embaralhar.", "error");
    return;
  }
  for (let index = state.cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [state.cards[index], state.cards[swapIndex]] = [state.cards[swapIndex], state.cards[index]];
  }
  saveState();
  render();
  playTone(390, 0.18, "sawtooth", 0.018);
  showToast("Baralho embaralhado.");
}

function createMiniCard(card, index) {
  const suit = SUITS.find((item) => item.symbol === card.suit);
  const rank = RANKS.find((item) => item.value === card.rank);
  const element = document.createElement("div");
  element.className = `mini-card ${suit.color === "red" ? "red" : ""}`;
  element.style.animationDelay = `${Math.min(index * 18, 240)}ms`;
  element.setAttribute("aria-label", `${rank.name} de ${suit.name}`);
  const top = document.createElement("span");
  top.className = "mini-corner";
  top.textContent = card.rank;
  const topSuit = document.createElement("span");
  topSuit.textContent = card.suit;
  top.append(topSuit);
  const pip = document.createElement("span");
  pip.className = "mini-pip";
  pip.textContent = card.suit;
  const bottom = document.createElement("span");
  bottom.className = "mini-corner mini-corner-bottom";
  bottom.textContent = card.rank;
  const bottomSuit = document.createElement("span");
  bottomSuit.textContent = card.suit;
  bottom.append(bottomSuit);
  element.append(top, pip, bottom);
  return element;
}

function renderModal() {
  const count = state.cards.length;
  elements.modalSubtitle.textContent = `${count} ${count === 1 ? "carta disponível" : "cartas disponíveis"}`;
  elements.modalCount.textContent = `${count} ${count === 1 ? "carta" : "cartas"}`;
  elements.modalContent.replaceChildren();
  if (count === 0) {
    const empty = document.createElement("div");
    empty.className = "modal-empty";
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", "layers-2");
    const message = document.createElement("span");
    message.textContent = "Seu baralho está vazio. Adicione uma carta para começar.";
    empty.append(icon, message);
    elements.modalContent.append(empty);
    lucide.createIcons();
    return;
  }
  [...state.cards].reverse().forEach((card, index) => {
    elements.modalContent.append(createMiniCard(card, index));
  });
}

function openModal() {
  lastFocusedElement = document.activeElement;
  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
  renderModal();
  elements.closeModal.focus();
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocusedElement) lastFocusedElement.focus();
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", type === "error" ? "circle-alert" : "check-circle-2");
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(icon, text);
  elements.toastRegion.append(toast);
  lucide.createIcons();
  window.setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3000);
}

elements.add.addEventListener("click", addCard);
elements.draw.addEventListener("click", drawCard);
elements.shuffle.addEventListener("click", shuffleCards);
elements.view.addEventListener("click", openModal);
elements.closeModal.addEventListener("click", closeModal);
elements.done.addEventListener("click", closeModal);
elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) closeModal();
  if (event.key === "Tab" && !elements.modal.hidden) {
    const focusable = elements.modal.querySelectorAll("button:not(:disabled)");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
elements.sound.addEventListener("click", () => {
  state.sound = !state.sound;
  saveState();
  updateSoundButton();
  if (state.sound) playTone(520, 0.1, "sine", 0.03);
  showToast(state.sound ? "Sons ativados." : "Sons desativados.");
});

updateSoundButton();
render();
