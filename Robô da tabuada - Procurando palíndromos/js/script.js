"use strict";

const multiplicationForm = document.querySelector("#multiplication-form");
const numberInput = document.querySelector("#number-input");
const numberError = document.querySelector("#number-error");
const multiplicationResults = document.querySelector("#multiplication-results");
const multiplicationPlaceholder = document.querySelector("#multiplication-placeholder");
const clearMultiplicationButton = document.querySelector("#clear-multiplication");

const palindromeForm = document.querySelector("#palindrome-form");
const wordInput = document.querySelector("#word-input");
const wordError = document.querySelector("#word-error");
const palindromeResult = document.querySelector("#palindrome-result");
const palindromePlaceholder = document.querySelector("#palindrome-placeholder");
const clearPalindromeButton = document.querySelector("#clear-palindrome");

multiplicationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  numberError.textContent = "";

  const rawNumber = numberInput.value.trim();
  const number = Number(rawNumber);

  if (rawNumber === "" || !Number.isFinite(number)) {
    numberError.textContent = "Digite um número válido para calcular a tabuada.";
    numberInput.focus();
    return;
  }

  let resultados = "";
  for (let multiplicador = 1; multiplicador <= 20; multiplicador += 1) {
    resultados += `${number} × ${multiplicador} = ${number * multiplicador}\n`;
  }

  multiplicationResults.replaceChildren();
  resultados.trimEnd().split("\n").forEach((linha) => {
    const [operacao, resultado] = linha.split(" = ");
    const equation = document.createElement("div");
    equation.className = "equation";
    equation.innerHTML = `${operacao} = <strong>${resultado}</strong>`;
    multiplicationResults.append(equation);
  });

  multiplicationPlaceholder.hidden = true;
  clearMultiplicationButton.disabled = false;
});

clearMultiplicationButton.addEventListener("click", () => {
  multiplicationForm.reset();
  numberError.textContent = "";
  multiplicationResults.replaceChildren();
  multiplicationPlaceholder.hidden = false;
  clearMultiplicationButton.disabled = true;
  numberInput.focus();
});

palindromeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  wordError.textContent = "";

  const originalWord = wordInput.value.trim();
  if (originalWord === "") {
    wordError.textContent = "Digite uma palavra antes de verificar.";
    wordInput.focus();
    return;
  }

  const normalizedWord = originalWord.toLocaleLowerCase("pt-BR");
  const reversedWord = [...normalizedWord].reverse().join("");
  const isPalindrome = normalizedWord === reversedWord;
  const banner = document.createElement("div");
  banner.className = `result-banner${isPalindrome ? "" : " result-banner--no"}`;

  const icon = document.createElement("span");
  icon.className = "result-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = isPalindrome ? "✓" : "↔";

  const copy = document.createElement("div");
  copy.className = "result-copy";

  const title = document.createElement("p");
  title.className = "result-title";
  title.textContent = isPalindrome ? "É um palíndromo!" : "Não é um palíndromo";

  const detail = document.createElement("p");
  detail.className = "result-detail";

  if (isPalindrome) {
    detail.textContent = `“${originalWord}” fica igual de trás para frente.`;
  } else {
    const original = document.createElement("span");
    original.className = "result-word";
    original.textContent = originalWord;

    const reversed = document.createElement("span");
    reversed.className = "result-word";
    reversed.textContent = reversedWord;

    detail.append("Original: ", original, " · Invertida: ", reversed);
  }

  copy.append(title, detail);
  banner.append(icon, copy);
  palindromeResult.replaceChildren(banner);
  palindromePlaceholder.hidden = true;
  clearPalindromeButton.disabled = false;
});

clearPalindromeButton.addEventListener("click", () => {
  palindromeForm.reset();
  wordError.textContent = "";
  palindromeResult.replaceChildren();
  palindromePlaceholder.hidden = false;
  clearPalindromeButton.disabled = true;
  wordInput.focus();
});
