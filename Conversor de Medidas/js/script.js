"use strict";

const conversionForm = document.querySelector("#converter-form");
const metersInput = document.querySelector("#meters-input");
const unitSelect = document.querySelector("#unit-select");
const convertButton = document.querySelector("#convert-button");
const clearButton = document.querySelector("#clear-button");
const formError = document.querySelector("#form-error");
const resultPanel = document.querySelector("#result-panel");
const resultNumber = document.querySelector("#result-number");
const resultUnit = document.querySelector("#result-unit");
const resultEquation = document.querySelector("#result-equation");
const copyButton = document.querySelector("#copy-button");
const historyList = document.querySelector("#history-list");
const historyCount = document.querySelector("#history-count");
const toast = document.querySelector("#toast");

const unitNames = {
  mm: "Milímetro",
  cm: "Centímetro",
  dm: "Decímetro",
  dam: "Decâmetro",
  hm: "Hectômetro",
  km: "Quilômetro"
};
const conversionHistory = [];
let currentResult = "";
let toastTimeout;

function convertFromMeters(meters, unit) {
  let convertedValue;

  switch (unit) {
    case "mm":
      convertedValue = meters * 1000;
      break;
    case "cm":
      convertedValue = meters * 100;
      break;
    case "dm":
      convertedValue = meters * 10;
      break;
    case "dam":
      convertedValue = meters / 10;
      break;
    case "hm":
      convertedValue = meters / 100;
      break;
    case "km":
      convertedValue = meters / 1000;
      break;
    default:
      return null;
  }

  return convertedValue;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 10
  }).format(value);
}

function showError(message, invalidField = metersInput) {
  formError.textContent = message;
  invalidField.setAttribute("aria-invalid", "true");
}

function clearError() {
  formError.textContent = "";
  metersInput.removeAttribute("aria-invalid");
  unitSelect.removeAttribute("aria-invalid");
}

function setLoading(isLoading) {
  convertButton.disabled = isLoading;
  convertButton.classList.toggle("is-loading", isLoading);
  convertButton.querySelector(".button-label").textContent = isLoading ? "Convertendo..." : "Converter agora";
  convertButton.setAttribute("aria-busy", String(isLoading));
}

function renderResult(meters, value, unit) {
  const formattedMeters = formatNumber(meters);
  const formattedValue = formatNumber(value);
  currentResult = `${formattedValue} ${unit}`;
  resultNumber.textContent = formattedValue;
  resultUnit.textContent = unit;
  resultEquation.textContent = `${formattedMeters} m = ${formattedValue} ${unit} · ${unitNames[unit]}`;
  resultPanel.hidden = false;
}

function renderHistory() {
  historyCount.textContent = String(conversionHistory.length);

  if (conversionHistory.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty">
        <span class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 7v5l3 2m5-2a8 8 0 1 1-2.34-5.66M20 4v5h-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <strong>Seu histórico começa aqui</strong>
        <span>As conversões recentes aparecem neste espaço.</span>
      </div>`;
    return;
  }

  historyList.replaceChildren(...conversionHistory.map((entry) => {
    const item = document.createElement("div");
    const conversion = document.createElement("span");
    const time = document.createElement("span");
    const result = document.createElement("span");
    const resultUnitLabel = document.createElement("span");

    item.className = "history-item";
    conversion.className = "history-conversion";
    conversion.textContent = `${entry.input} m →`;
    time.className = "history-time";
    time.textContent = entry.time;
    result.className = "history-result";
    result.textContent = entry.value;
    resultUnitLabel.textContent = ` ${entry.unit}`;
    result.append(resultUnitLabel);
    item.append(conversion, time, result);
    return item;
  }));
}

function addToHistory(meters, value, unit) {
  conversionHistory.unshift({
    input: formatNumber(meters),
    value: formatNumber(value),
    unit,
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date())
  });

  if (conversionHistory.length > 5) {
    conversionHistory.pop();
  }

  renderHistory();
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function handleConversion(event) {
  event.preventDefault();
  clearError();

  const rawValue = metersInput.value.trim();
  const meters = Number(rawValue);
  const unit = unitSelect.value;

  if (rawValue === "") {
    showError("Informe um valor em metros para continuar.");
    metersInput.focus();
    return;
  }

  if (!Number.isFinite(meters)) {
    showError("Digite um número válido para fazer a conversão.");
    metersInput.focus();
    return;
  }

  if (meters < 0) {
    showError("Use um valor igual ou maior que zero.");
    metersInput.focus();
    return;
  }

  const convertedValue = convertFromMeters(meters, unit);
  if (convertedValue === null) {
    showError("Opção inválida. Selecione uma unidade disponível.", unitSelect);
    unitSelect.focus();
    return;
  }

  if (!Number.isFinite(convertedValue)) {
    showError("O resultado é grande demais para ser representado.");
    metersInput.focus();
    return;
  }

  setLoading(true);
  window.setTimeout(() => {
    renderResult(meters, convertedValue, unit);
    addToHistory(meters, convertedValue, unit);
    setLoading(false);
  }, 420);
}

async function copyResult() {
  if (!currentResult) {
    return;
  }

  try {
    await navigator.clipboard.writeText(currentResult);
    showToast("Resultado copiado para a área de transferência.");
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = currentResult;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand("copy");
    temporaryInput.remove();

    if (copied) {
      showToast("Resultado copiado para a área de transferência.");
    } else {
      showToast("Não foi possível copiar. Selecione o resultado manualmente.");
    }
  }
}

function clearConverter() {
  conversionForm.reset();
  clearError();
  resultPanel.hidden = true;
  resultNumber.textContent = "";
  resultUnit.textContent = "";
  resultEquation.textContent = "";
  currentResult = "";
  metersInput.focus();
}

conversionForm.addEventListener("submit", handleConversion);
clearButton.addEventListener("click", clearConverter);
copyButton.addEventListener("click", copyResult);
metersInput.addEventListener("input", clearError);
unitSelect.addEventListener("change", () => {
  const selectShell = unitSelect.closest(".select-shell");
  selectShell.classList.remove("is-changing");
  void selectShell.offsetWidth;
  selectShell.classList.add("is-changing");
  window.setTimeout(() => selectShell.classList.remove("is-changing"), 350);
});

renderHistory();
