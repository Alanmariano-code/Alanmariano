"use strict";

const recruitForm = document.querySelector("#recruit-form");
const birthYearInput = document.querySelector("#birth-year");
const recruitResult = document.querySelector("#recruit-result");
const numberOneInput = document.querySelector("#number-one");
const numberTwoInput = document.querySelector("#number-two");
const calculatorHint = document.querySelector("#calculator-hint");

function getCurrentYear() {
  return new Date().getFullYear();
}

function displayRecruit(firstName, lastName, studyArea, birthYear) {
  const fullName = `${firstName.trim()} ${lastName.trim()}`;
  const age = getCurrentYear() - birthYear;

  recruitResult.querySelector(".result-avatar").textContent = firstName.trim().charAt(0).toUpperCase();
  recruitResult.querySelector(".result-name").textContent = fullName;
  recruitResult.querySelector(".result-study").textContent = studyArea.trim();
  recruitResult.querySelector(".result-age").textContent = String(age);
  recruitResult.hidden = false;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 10 }).format(value);
}

function calculateResults() {
  const firstValue = numberOneInput.value.trim();
  const secondValue = numberTwoInput.value.trim();
  const results = {
    sum: document.querySelector("#sum-result"),
    subtract: document.querySelector("#subtract-result"),
    multiply: document.querySelector("#multiply-result"),
    divide: document.querySelector("#divide-result")
  };

  if (firstValue === "" || secondValue === "") {
    Object.values(results).forEach((result) => {
      result.textContent = "—";
    });
    calculatorHint.textContent = "Digite dois números para ver os resultados.";
    calculatorHint.classList.remove("error");
    return;
  }

  const firstNumber = Number(firstValue);
  const secondNumber = Number(secondValue);
  if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
    Object.values(results).forEach((result) => {
      result.textContent = "—";
    });
    calculatorHint.textContent = "Digite números válidos para realizar as operações.";
    calculatorHint.classList.add("error");
    return;
  }

  results.sum.textContent = formatNumber(firstNumber + secondNumber);
  results.subtract.textContent = formatNumber(firstNumber - secondNumber);
  results.multiply.textContent = formatNumber(firstNumber * secondNumber);
  results.divide.textContent = secondNumber === 0 ? "Indefinido" : formatNumber(firstNumber / secondNumber);

  calculatorHint.textContent = secondNumber === 0
    ? "Divisão por zero não é permitida."
    : "Os resultados são atualizados automaticamente.";
  calculatorHint.classList.toggle("error", secondNumber === 0);
}

birthYearInput.max = String(getCurrentYear());
document.querySelector("#current-date").textContent = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(new Date());

recruitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!recruitForm.reportValidity()) {
    return;
  }

  const formData = new FormData(recruitForm);
  const birthYear = Number(formData.get("birthYear"));
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > getCurrentYear()) {
    birthYearInput.setCustomValidity(`Informe um ano entre 1900 e ${getCurrentYear()}.`);
    birthYearInput.reportValidity();
    birthYearInput.addEventListener("input", () => birthYearInput.setCustomValidity(""), { once: true });
    return;
  }

  displayRecruit(
    String(formData.get("firstName")),
    String(formData.get("lastName")),
    String(formData.get("studyArea")),
    birthYear
  );
});

numberOneInput.addEventListener("input", calculateResults);
numberTwoInput.addEventListener("input", calculateResults);
