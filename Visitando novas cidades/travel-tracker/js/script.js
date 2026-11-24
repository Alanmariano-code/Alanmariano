"use strict";

const STORAGE_KEY = "travel-tracker-data";
const emptyState = () => ({ traveler: "", destinations: [], answer: "", completed: false });

const elements = {
  form: document.querySelector("#tripForm"),
  travelerName: document.querySelector("#travelerName"),
  cityName: document.querySelector("#cityName"),
  cityField: document.querySelector("#cityField"),
  noCityNote: document.querySelector("#noCityNote"),
  addButton: document.querySelector("#addDestinationButton"),
  finishButton: document.querySelector("#finishTripButton"),
  clearButton: document.querySelector("#clearButton"),
  destinationList: document.querySelector("#destinationList"),
  destinationCount: document.querySelector("#destinationCount"),
  headerCount: document.querySelector("#headerDestinationCount"),
  travelerSummary: document.querySelector("#travelerSummary"),
  travelerInitials: document.querySelector("#travelerInitials"),
  summaryTravelerName: document.querySelector("#summaryTravelerName"),
  tripStatus: document.querySelector("#tripStatus"),
  saveStatus: document.querySelector("#saveStatus"),
  currentYear: document.querySelector("#currentYear")
};

function announce(message, isError = false) {
  elements.saveStatus.textContent = message;
  elements.saveStatus.classList.toggle("is-error", isError);
}

function readSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyState();

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.destinations)) {
      throw new Error("Formato de cadastro inválido.");
    }

    const destinations = parsed.destinations.filter(
      (city) => typeof city === "string" && city.trim().length > 0
    );
    return {
      traveler: typeof parsed.traveler === "string" ? parsed.traveler.trim() : "",
      destinations,
      answer: parsed.answer === "yes" || parsed.answer === "no" ? parsed.answer : "",
      completed: parsed.completed === true
    };
  } catch (error) {
    announce("Não foi possível carregar os dados salvos. Você pode iniciar um novo cadastro.", true);
    return emptyState();
  }
}

let state = readSavedState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    announce("Não foi possível salvar neste dispositivo. Verifique o espaço disponível no navegador.", true);
    return false;
  }
}

function selectedAnswer() {
  const selected = document.querySelector('input[name="visited"]:checked');
  return selected ? selected.value : "";
}

function syncForm() {
  const answer = selectedAnswer();
  const hasName = elements.travelerName.value.trim().length > 0;
  const canContinue = hasName && answer !== "";
  const wantsToAddCity = answer === "yes";

  elements.cityField.classList.toggle("is-hidden", !wantsToAddCity);
  elements.cityName.required = wantsToAddCity;
  elements.cityName.disabled = !wantsToAddCity;
  elements.noCityNote.classList.toggle("is-hidden", answer !== "no");
  elements.addButton.classList.toggle("is-hidden", answer === "no");
  elements.finishButton.disabled = !canContinue;
  elements.addButton.disabled = !canContinue || !wantsToAddCity || !elements.cityName.value.trim();
}

function formatCityLabel(city) {
  return city.trim().replace(/\s+/g, " ");
}

function renderDestinations() {
  const total = state.destinations.length;
  elements.destinationCount.textContent = String(total).padStart(2, "0");
  elements.headerCount.textContent = String(total);
  elements.travelerSummary.classList.toggle("is-hidden", !state.traveler);
  elements.summaryTravelerName.textContent = state.traveler;
  elements.travelerInitials.textContent = state.traveler ? state.traveler.charAt(0).toLocaleUpperCase("pt-BR") : "V";
  elements.tripStatus.textContent = state.completed ? "VIAGEM FINALIZADA" : "EM ANDAMENTO";
  elements.tripStatus.classList.toggle("is-complete", state.completed);

  elements.destinationList.replaceChildren();
  if (total === 0) {
    const emptyStateElement = document.createElement("div");
    emptyStateElement.className = "empty-state";
    emptyStateElement.innerHTML = `
      <span class="empty-illustration" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.7 7-11.2a7 7 0 1 0-14 0C5 15.3 12 21 12 21Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9.8" r="2.2" stroke="currentColor" stroke-width="1.5"/></svg>
      </span>
      <strong>Nenhum destino por enquanto</strong>
      <p>Suas cidades visitadas vão aparecer aqui.</p>`;
    elements.destinationList.append(emptyStateElement);
    return;
  }

  let index = 0;
  while (index < total) {
    const item = document.createElement("article");
    item.className = "destination-item";

    const pin = document.createElement("span");
    pin.className = "destination-pin";
    pin.setAttribute("aria-hidden", "true");
    pin.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M19 10.1c0 5-7 10.1-7 10.1S5 15.1 5 10.1a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.6"/></svg>';

    const details = document.createElement("div");
    details.className = "destination-details";
    const city = document.createElement("strong");
    city.textContent = state.destinations[index];
    const caption = document.createElement("span");
    caption.textContent = "Destino explorado";
    details.append(city, caption);

    const number = document.createElement("span");
    number.className = "destination-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const removeButton = document.createElement("button");
    removeButton.className = "remove-destination";
    removeButton.type = "button";
    removeButton.dataset.index = String(index);
    removeButton.setAttribute("aria-label", `Remover ${state.destinations[index]}`);
    removeButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

    item.append(pin, details, number, removeButton);
    elements.destinationList.append(item);
    index += 1;
  }
}

function restoreForm() {
  elements.travelerName.value = state.traveler;
  const savedAnswer = document.querySelector(`input[name="visited"][value="${state.answer}"]`);
  if (savedAnswer) savedAnswer.checked = true;
  syncForm();
}

function handleAddDestination(event) {
  event.preventDefault();
  const traveler = elements.travelerName.value.trim();
  const answer = selectedAnswer();

  if (!traveler) {
    announce("Informe seu nome para começar o registro.", true);
    elements.travelerName.focus();
    return;
  }
  if (answer !== "yes") {
    announce("Selecione “Sim, já explorei” para adicionar uma cidade.", true);
    return;
  }

  const city = formatCityLabel(elements.cityName.value);
  if (!city) {
    announce("Informe o nome da cidade antes de adicionar.", true);
    elements.cityName.focus();
    return;
  }

  const alreadyAdded = state.destinations.some(
    (destination) => destination.localeCompare(city, "pt-BR", { sensitivity: "base" }) === 0
  );
  if (alreadyAdded) {
    announce("Essa cidade já está na sua lista de destinos.", true);
    elements.cityName.focus();
    return;
  }

  state.traveler = traveler;
  state.answer = answer;
  state.completed = false;
  state.destinations.push(city);
  elements.cityName.value = "";
  syncForm();
  const saved = saveState();
  renderDestinations();
  if (saved) announce(`${city} foi adicionada à sua jornada.`);
}

function handleFinishTrip() {
  const traveler = elements.travelerName.value.trim();
  const answer = selectedAnswer();
  if (!traveler) {
    announce("Informe seu nome antes de finalizar a viagem.", true);
    elements.travelerName.focus();
    return;
  }
  if (!answer) {
    announce("Responda se já visitou alguma cidade para continuar.", true);
    return;
  }

  state.traveler = traveler;
  state.answer = answer;
  state.completed = true;
  const saved = saveState();
  renderDestinations();
  const total = state.destinations.length;
  if (saved) {
    announce(total === 0
      ? `Viagem finalizada, ${traveler}. Sua próxima cidade está esperando por você!`
      : `Viagem finalizada, ${traveler}: ${total} ${total === 1 ? "cidade visitada" : "cidades visitadas"}.`);
  }
}

function handleRemoveDestination(event) {
  const button = event.target.closest(".remove-destination");
  if (!button) return;

  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || index < 0 || index >= state.destinations.length) return;

  const [removedCity] = state.destinations.splice(index, 1);
  state.completed = false;
  const saved = saveState();
  renderDestinations();
  if (saved) announce(`${removedCity} foi removida da sua lista.`);
}

function handleClear() {
  if (!window.confirm("Deseja limpar o cadastro e remover todos os destinos salvos?")) return;

  state = emptyState();
  elements.form.reset();
  syncForm();
  renderDestinations();
  try {
    localStorage.removeItem(STORAGE_KEY);
    announce("Cadastro limpo. Quando quiser, sua próxima jornada começa aqui.");
  } catch (error) {
    announce("O cadastro foi limpo na tela, mas não foi possível remover os dados salvos no navegador.", true);
  }
}

elements.form.addEventListener("submit", handleAddDestination);
elements.travelerName.addEventListener("input", syncForm);
elements.travelerName.addEventListener("change", () => {
  state.traveler = elements.travelerName.value.trim();
  saveState();
  renderDestinations();
});
elements.cityName.addEventListener("input", syncForm);
document.querySelectorAll('input[name="visited"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.answer = selectedAnswer();
    saveState();
    syncForm();
  });
});
elements.finishButton.addEventListener("click", handleFinishTrip);
elements.destinationList.addEventListener("click", handleRemoveDestination);
elements.clearButton.addEventListener("click", handleClear);

elements.currentYear.textContent = String(new Date().getFullYear());
restoreForm();
renderDestinations();
