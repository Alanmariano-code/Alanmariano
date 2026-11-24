"use strict";

const raceForm = document.querySelector("#race-form");
const raceButton = document.querySelector("#race-button");
const raceTrack = document.querySelector("#race-track");
const raceResults = document.querySelector("#race-results");
const combatForm = document.querySelector("#combat-form");
const combatPanel = document.querySelector(".combat-panel");
const attackButton = document.querySelector("#attack-button");
const resetButton = document.querySelector("#reset-combat");
const historyList = document.querySelector("#history-list");
const historyCount = document.querySelector("#history-count");
const combatFeedback = document.querySelector("#combat-feedback");
const combatMessage = document.querySelector("#combat-message");
const damageNumber = document.querySelector("#damage-number");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const spellCards = document.querySelectorAll(".spell-card");
const spells = {
  dragon: { name: "Chama do Dragão" },
  celestial: { name: "Corte Celestial" },
  arcane: { name: "Explosão Arcana" },
  divine: { name: "Tempestade Divina" }
};

let round = 0;
let startingHealth = null;
let isCombatAnimating = false;
let selectedSpell = "arcane";

function readNumber(form, fieldName) {
  return Number(form.elements[fieldName].value);
}

function validateNames(form, fieldNames) {
  let isValid = true;
  for (const fieldName of fieldNames) {
    const field = form.elements[fieldName];
    const isNameValid = field.value.trim().length > 0;
    field.setCustomValidity(isNameValid ? "" : "Informe um nome válido.");
    isValid = isValid && isNameValid;
  }
  return isValid;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function buildRaceResult(name, speed, isWinner) {
  const card = document.createElement("div");
  card.className = `race-result-card${isWinner ? " is-winner" : ""}`;
  const nameElement = document.createElement("span");
  nameElement.className = "race-result-name";
  nameElement.textContent = `${name}${isWinner ? " — VENCEDOR" : ""}`;
  const speedElement = document.createElement("span");
  speedElement.className = "race-result-speed";
  speedElement.textContent = `${formatNumber(speed)} KM/H`;
  card.append(nameElement, speedElement);
  return card;
}

function showRaceResults(first, second) {
  const isTie = first.speed === second.speed;
  const firstWins = first.speed > second.speed;
  raceResults.replaceChildren(
    buildRaceResult(first.name, first.speed, !isTie && firstWins),
    buildRaceResult(second.name, second.speed, !isTie && !firstWins)
  );
  const message = document.createElement("p");
  message.className = "race-result-note";
  message.textContent = isTie
    ? `Empate! ${first.name} e ${second.name} cruzaram com ${formatNumber(first.speed)} km/h.`
    : `${firstWins ? first.name : second.name} venceu a corrida!`;
  raceResults.append(message);
  raceResults.hidden = false;
  raceTrack.classList.remove("is-racing");
  raceTrack.classList.add("has-result");
  raceButton.disabled = false;
}

raceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validateNames(raceForm, ["vehicleOneName", "vehicleTwoName"]);
  if (!raceForm.reportValidity()) return;

  const first = {
    name: raceForm.elements.vehicleOneName.value.trim(),
    speed: readNumber(raceForm, "vehicleOneSpeed")
  };
  const second = {
    name: raceForm.elements.vehicleTwoName.value.trim(),
    speed: readNumber(raceForm, "vehicleTwoSpeed")
  };
  raceButton.disabled = true;
  raceResults.hidden = true;
  raceTrack.classList.remove("has-result", "is-racing");
  void raceTrack.offsetWidth;
  raceTrack.classList.add("is-racing");
  window.setTimeout(() => showRaceResults(first, second), 1200);
});

function getCombatValues() {
  return {
    attacker: combatForm.elements.attackerName.value.trim(),
    attack: readNumber(combatForm, "attackPower"),
    defender: combatForm.elements.defenderName.value.trim(),
    health: readNumber(combatForm, "defenderHealth"),
    defense: readNumber(combatForm, "defensePower"),
    attackerLevel: readNumber(combatForm, "attackerLevel"),
    defenderLevel: readNumber(combatForm, "defenderLevel"),
    hasShield: combatForm.elements.hasShield.checked,
    spell: spells[selectedSpell]
  };
}

function updateHealthDisplay(health, maximum) {
  const percentage = maximum > 0 ? Math.max(0, Math.min(100, (health / maximum) * 100)) : 0;
  document.querySelector("#health-current").textContent = formatNumber(health);
  document.querySelector("#health-max").textContent = formatNumber(maximum);
  const progress = document.querySelector("#health-progress");
  const fill = document.querySelector("#health-fill");
  progress.setAttribute("aria-valuenow", String(Math.round(percentage)));
  progress.setAttribute("aria-valuetext", `${formatNumber(health)} de ${formatNumber(maximum)} pontos de vida`);
  fill.style.width = `${percentage}%`;
  fill.classList.toggle("is-low", percentage > 0 && percentage <= 30);
  fill.classList.toggle("is-empty", health <= 0);
}

function setCombatFeedback(message, state) {
  combatMessage.textContent = message;
  combatFeedback.classList.remove("is-success", "is-blocked", "is-victory");
  if (state) combatFeedback.classList.add(`is-${state}`);
}

function animateCombat(damage, spell, isShielded, isVictory) {
  combatPanel.classList.remove("is-attacking");
  damageNumber.classList.remove("is-visible");
  combatPanel.dataset.activeSpell = selectedSpell;
  combatPanel.classList.toggle("is-shielding", isShielded);
  combatPanel.classList.toggle("is-victory", isVictory);
  void combatPanel.offsetWidth;
  combatPanel.classList.add("is-attacking");
  if (damage > 0) {
    damageNumber.textContent = `-${formatNumber(damage)} HP`;
    damageNumber.classList.add("is-visible");
  }
  window.setTimeout(() => combatPanel.classList.remove("is-attacking", "is-shielding"), 850);
}

function addHistoryEntry(values, damage, remainingHealth, isVictory) {
  const emptyEntry = historyList.querySelector(".history-empty");
  if (emptyEntry) emptyEntry.remove();

  const entry = document.createElement("li");
  if (damage === 0) entry.classList.add("is-blocked");
  if (isVictory) entry.classList.add("is-victory");
  const roundLabel = document.createElement("span");
  roundLabel.className = "history-round";
  roundLabel.textContent = `R${String(round).padStart(2, "0")}`;
  const description = document.createElement("span");
  description.textContent = `${values.attacker} usou ${values.spell.name} contra ${values.defender}`;
  const result = document.createElement("span");
  result.className = "history-damage";
  result.textContent = damage > 0
    ? `-${formatNumber(damage)} HP · ${formatNumber(remainingHealth)} restantes`
    : "ATAQUE BLOQUEADO · 0 DANO";
  entry.append(roundLabel, description, result);
  historyList.prepend(entry);
  historyCount.textContent = `${round} ${round === 1 ? "REGISTRO" : "REGISTROS"}`;
}

combatForm.elements.defenderHealth.addEventListener("input", () => {
  const health = combatForm.elements.defenderHealth.valueAsNumber;
  if (!Number.isFinite(health) || health < 0) {
    document.querySelector("#health-current").textContent = "—";
    document.querySelector("#health-max").textContent = "—";
    document.querySelector("#health-fill").style.width = "0%";
    return;
  }
  const maximum = startingHealth ?? health;
  updateHealthDisplay(health, maximum);
});

combatForm.elements.hasShield.addEventListener("change", (event) => {
  document.querySelector("#shield-state").textContent = event.currentTarget.checked ? "ATIVADO" : "DESATIVADO";
});

spellCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedSpell = card.dataset.spell;
    combatPanel.dataset.activeSpell = selectedSpell;
    spellCards.forEach((spellCard) => {
      const isSelected = spellCard === card;
      spellCard.classList.toggle("is-selected", isSelected);
      spellCard.setAttribute("aria-pressed", String(isSelected));
    });
    attackButton.setAttribute("aria-label", `Executar ataque com ${spells[selectedSpell].name}`);
    setCombatFeedback(`${spells[selectedSpell].name} selecionada. Escolha o momento de atacar.`, "");
  });
});

function updateSceneCharacters() {
  const heroName = combatForm.elements.attackerName.value.trim();
  const guardianName = combatForm.elements.defenderName.value.trim();
  document.querySelector("#scene-hero-name").textContent = heroName || "HERÓI";
  document.querySelector("#scene-guardian-name").textContent = guardianName || "GUARDIÃO";
  document.querySelector("#scene-hero-level").textContent = combatForm.elements.attackerLevel.value || "24";
  document.querySelector("#scene-guardian-level").textContent = combatForm.elements.defenderLevel.value || "30";
}

combatForm.elements.attackerName.addEventListener("input", updateSceneCharacters);
combatForm.elements.defenderName.addEventListener("input", updateSceneCharacters);
combatForm.elements.attackerLevel.addEventListener("input", updateSceneCharacters);
combatForm.elements.defenderLevel.addEventListener("input", updateSceneCharacters);

combatForm.addEventListener("input", (event) => {
  if (event.target.name === "defenderHealth") return;
  if (startingHealth === null && combatForm.elements.defenderHealth.value !== "") {
    const health = readNumber(combatForm, "defenderHealth");
    updateHealthDisplay(health, health);
  }
});

combatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validateNames(combatForm, ["attackerName", "defenderName"]);
  if (isCombatAnimating || !combatForm.reportValidity()) return;

  const values = getCombatValues();
  if (values.health <= 0) {
    setCombatFeedback("O combate terminou. Reinicie para começar uma nova batalha.", "victory");
    return;
  }
  if (startingHealth === null) startingHealth = values.health;

  const difference = values.attack - values.defense;
  const damage = difference > 0
    ? difference / (values.hasShield ? 2 : 1)
    : 0;
  const remainingHealth = Math.max(0, values.health - damage);
  const isVictory = remainingHealth === 0;

  combatForm.elements.defenderHealth.value = String(remainingHealth);
  updateHealthDisplay(remainingHealth, startingHealth);
  round += 1;
  document.querySelector("#round-counter").textContent = String(round).padStart(2, "0");
  document.querySelector("#scene-round").textContent = String(round).padStart(2, "0");
  animateCombat(damage, values.spell, values.hasShield && damage > 0, isVictory);
  addHistoryEntry(values, damage, remainingHealth, isVictory);

  if (isVictory) {
    setCombatFeedback(`${values.attacker} venceu com ${values.spell.name}! ${values.defender} ficou sem pontos de vida.`, "victory");
  } else if (damage === 0) {
    setCombatFeedback(`${values.spell.name} foi bloqueada! ${values.defender} não sofreu dano.`, "blocked");
  } else {
    setCombatFeedback(`${values.attacker} lançou ${values.spell.name} e causou ${formatNumber(damage)} de dano.`, "success");
  }

  isCombatAnimating = true;
  attackButton.disabled = true;
  window.setTimeout(() => {
    isCombatAnimating = false;
    attackButton.disabled = isVictory;
  }, 850);
});

resetButton.addEventListener("click", () => {
  if (isCombatAnimating) return;
  if (startingHealth !== null) combatForm.elements.defenderHealth.value = String(startingHealth);
  const healthInput = combatForm.elements.defenderHealth;
  if (healthInput.value !== "") {
    const health = healthInput.valueAsNumber;
    updateHealthDisplay(health, startingHealth ?? health);
  } else {
    document.querySelector("#health-current").textContent = "—";
    document.querySelector("#health-max").textContent = "—";
    document.querySelector("#health-fill").style.width = "100%";
    document.querySelector("#health-fill").classList.remove("is-low", "is-empty");
  }
  round = 0;
  startingHealth = null;
  document.querySelector("#round-counter").textContent = "00";
  document.querySelector("#scene-round").textContent = "01";
  historyList.replaceChildren();
  const emptyEntry = document.createElement("li");
  emptyEntry.className = "history-empty";
  emptyEntry.textContent = "Nenhum ataque registrado. A batalha começa com você.";
  historyList.append(emptyEntry);
  historyCount.textContent = "0 REGISTROS";
  attackButton.disabled = false;
  setCombatFeedback("Combate reiniciado. Configure os personagens e comece novamente.", "");
  damageNumber.classList.remove("is-visible");
  combatPanel.classList.remove("is-attacking", "is-shielding", "is-victory");
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menu" : "Fechar menu");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link) {
    navigation.querySelectorAll(".nav-link").forEach((navLink) => {
      navLink.classList.toggle("is-active", navLink === link);
    });
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    navigation.classList.remove("is-open");
  }
});
