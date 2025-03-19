import { ScheduleTime } from "../../utils/ScheduleTime";
import { createToaster } from "../../utils/createToaster";
import { validateUser } from "../../api/validateUser";
import { hideLoadingScreen } from "../../utils/loadingScreen";
import logo from "/assets/logo.png";
import "/assets/style.css";

const userPreferencesButton = document.querySelector("[data-js='user-preferences-button']");
const saveUserPreferencesButton = document.querySelector("[data-js='user-preferences-modal'] [data-js='save-button']");
const deleteSchedulesButton = document.querySelector("[data-js='delete-schedules']");
const copyTableButton = document.querySelector("[data-js='copy-table']");
const modalCloseButtons = Array.from(document.querySelectorAll("[data-js='close-button']"));
const translatedDaysOfTheWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const debouncedSaveDataOnLocalStorage = debounce(saveDataOnLocalStorage, 1500);

document.querySelector('[data-js="logo"]').src = logo;

function debounce(fn, delay) {
  let timeout;

  return function () {
    clearInterval(timeout);
    timeout = setTimeout(fn, delay);
  };
}

function showUserData(name, picture) {
  const userDataPlaceholder = document.querySelector('[data-js="user-data"]');
  const userInfoHtml = `
    <p class="font-semibold">${name}</p>
    ${
      picture
        ? `<img src="${picture}" alt="${name} foto" class="w-10 h-10 rounded-full" />`
        : `<div class="flex justify-center items-center w-10 h-10 rounded-full bg-blue-700 font-bold text-white">${getInittials(name)}</div>`
    }
  `;

  userDataPlaceholder.innerHTML = userInfoHtml;
}

function getInittials(name) {
  const separatedName = name.split(" ");
  return separatedName[0][0] + separatedName[1][0];
}

function parseUserData({ name, picture, created_at, is_premium }) {
  const accountAge = Date.now() - new Date(created_at).valueOf();
  const oneWeekInMs = 1000 * 60 * 60 * 24 * 7;

  if (accountAge > oneWeekInMs && !is_premium) {
    location.href = "/premium/";
    return;
  }

  showUserData(name, picture);
}

function saveDataOnLocalStorage() {
  // debounce save data on local storage
  const nameInputs = document.querySelectorAll('[data-js="schedule"] [data-js="name-input"]');
  let newSchedules = { data: {}, localUserPreferences: {} };

  for (const input of nameInputs) {
    newSchedules.data[input.previousElementSibling.textContent] = input.value;
  }

  showAmountOfFilledSchedules(returnAmountOfFilledSchedules(newSchedules.data));

  newSchedules.localUserPreferences = JSON.parse(localStorage.getItem("schedules")).localUserPreferences;

  localStorage.setItem("schedules", JSON.stringify(newSchedules));

  createToaster("Dados salvos");
}

function allocateSpaceForSchedulesInLocalStorage() {
  if (!localStorage.getItem("schedules")) {
    localStorage.setItem("schedules", '{"data": {}, "localUserPreferences": {}}');
  }
  if (!localStorage.getItem("userPreferences")) {
    localStorage.setItem("userPreferences", '{"openingTime": "08:00", "closingTime": "18:30", "sessionDuration": 30}');
  }
}

function defineIfLocalUserPreferencesWillGetOverwritten(savedSchedules, amountOfFilledSchedules) {
  // overwrite local user preferences with global user preferences if there are no filled schedules
  if (!amountOfFilledSchedules) {
    const globalUserPreferences = JSON.parse(localStorage.getItem("userPreferences"));

    savedSchedules.localUserPreferences = globalUserPreferences;
    localStorage.setItem("schedules", JSON.stringify(savedSchedules));
  }
}

function applyUserPreferences() {
  const userPreferencesSelects = document.querySelectorAll("[data-js='user-preferences-modal'] select");
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));

  for (const select of userPreferencesSelects) {
    select.value = userPreferences[select.name];
  }
}

function returnAmountOfFilledSchedules(savedSchedulesData) {
  let scheduleAmount = 0;

  for (const val in savedSchedulesData) {
    if (savedSchedulesData[val] !== "") {
      scheduleAmount++;
    }
  }

  return scheduleAmount;
}

function showAmountOfFilledSchedules(amountOfFilledSchedules) {
  const amountOfSchedules = document.querySelector('[data-js="amount-of-schedules"]');

  amountOfSchedules.textContent = amountOfFilledSchedules + " cliente(s) para hoje";
}

function reflectUserPreferencesOnPreferencsForm() {
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));
  const userPreferencesSelects = Array.from(document.querySelectorAll("[data-js='user-preferences-modal'] select"));

  userPreferencesSelects.forEach((select) => {
    select.value = userPreferences[select.name];
  });
}

function populateAppWithSchedules(savedSchedules, recalculate = false) {
  const fragment = document.createDocumentFragment();
  const scheduleTemplate = document.getElementById("schedule");
  const schedules = document.getElementById("schedules");

  const { openingTime, closingTime, sessionDuration } = savedSchedules.localUserPreferences;
  const currentTime = new ScheduleTime(...openingTime.split(":").map((n) => Number(n)));
  const endTime = new ScheduleTime(...closingTime.split(":").map((n) => Number(n)));
  const firstBreakTime = { time: new ScheduleTime(12, 0), wasCreated: false };
  const secondBreakTime = { time: new ScheduleTime(16, 0), wasCreated: false };

  while (currentTime.isSmallerThanOrEqual(endTime)) {
    const schedule = scheduleTemplate.content.cloneNode(true);
    const time = schedule.querySelector('[data-js="time"]');
    const input = schedule.querySelector('[data-js="name-input"]');
    const deleteCustomerButton = schedule.querySelector('[data-js="delete-button"]');

    time.textContent = currentTime.toString();
    time.setAttribute("datetime", currentTime.toString());
    input.addEventListener("input", debouncedSaveDataOnLocalStorage);
    deleteCustomerButton.addEventListener("click", deleteCustomer);

    if (currentTime.toString() in savedSchedules.data) {
      input.value = savedSchedules.data[currentTime.toString()];
    }

    currentTime.increaseTime(sessionDuration);

    fragment.appendChild(schedule);

    showBreakTime(currentTime, firstBreakTime, fragment);
    showBreakTime(currentTime, secondBreakTime, fragment);
  }

  if (recalculate) {
    schedules.innerHTML = "";
  }

  schedules.appendChild(fragment);
}

function showBreakTime(currentTime, breakTime, fragment) {
  if (breakTime.time.isSmallerThanOrEqual(currentTime) && !breakTime.wasCreated) {
    breakTime.wasCreated = true;
    const breakTimeLi = document.createElement("li");
    const breakTimeText = document.createElement("time");

    breakTimeText.textContent = breakTime.time.toString();
    breakTimeText.setAttribute("datetime", breakTime.time.toString());
    breakTimeLi.className = "!my-6 text-center font-bold";
    breakTimeText.className = "text-gray-500 text-xl";

    breakTimeLi.appendChild(breakTimeText);
    fragment.appendChild(breakTimeLi);
  }
}

function deleteCustomer(event) {
  const scheduleItem = event.target.closest('[data-js="schedule"]');
  const nameInput = scheduleItem.querySelector('[data-js="name-input"]');
  nameInput.value = "";

  debouncedSaveDataOnLocalStorage();
}

function openUserPreferences() {
  const userPreferencesModal = document.querySelector("[data-js='user-preferences-modal']");
  userPreferencesModal.show();

  localStorage.setItem("openedUserPreferences", true);
}

function saveUserPreferences() {
  const newUserPreferences = {};
  const userPreferencesSelects = Array.from(document.querySelectorAll("[data-js='user-preferences-modal'] select")).forEach((select) => {
    newUserPreferences[select.name] = select.name === "sessionDuration" ? Number(select.value) : select.value;
  });

  applyUserPreferencesEffects(newUserPreferences);

  localStorage.setItem("userPreferences", JSON.stringify(newUserPreferences));

  createToaster("Preferências salvas");
}

function applyUserPreferencesEffects(newUserPreferences) {
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));
  const filledSchedules = returnAmountOfFilledSchedules(savedSchedules.data);

  if (!filledSchedules) {
    savedSchedules.localUserPreferences = newUserPreferences || JSON.parse(localStorage.getItem("userPreferences"));
    localStorage.setItem("schedules", JSON.stringify(savedSchedules));

    populateAppWithSchedules(savedSchedules, true);
  }
}

function deleteSchedules() {
  const nameInputs = document.querySelectorAll('[data-js="schedule"] [data-js="name-input"]');

  for (const input of nameInputs) {
    input.value = "";
  }

  localStorage.setItem("schedules", '{"data": {}, "localUserPreferences": {}}');
  applyUserPreferencesEffects();
  showAmountOfFilledSchedules(0);
}

function copyTable() {
  let outputText = "        " + translatedDaysOfTheWeek[new Date().getDay()] + "\n";
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));

  for (let schedule in savedSchedules) {
    outputText += `${schedule} - ${savedSchedules[schedule]}\n`;
  }

  navigator.clipboard
    .writeText(outputText)
    .then(() => {
      createToaster("Tabela copiada com sucesso");
    })
    .catch(() => {
      createToaster("Erro ao copiar a tabela", "error");
    });
}

function closeAssociatedModal(event) {
  const modal = event.target.closest(".modal");

  modal.close();
}

let deferredPrompt;
const installButton = document.querySelector('[data-js="install-pwa-button"]');

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.classList.remove("hidden");

  installButton.addEventListener("click", () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        installButton.classList.add("hidden");
      } else {
        console.log("User dismissed the install prompt");
      }
      deferredPrompt = null;
    });
  });
});

async function main() {
  const userData = await validateUser(true)
  hideLoadingScreen();
  
  if (!userData) {
    window.location.href = "/login/"
  }

  parseUserData(userData)
  allocateSpaceForSchedulesInLocalStorage();

  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));
  const openedUserPreferencesOnce = localStorage.getItem("openedUserPreferences");
  const amountOfFilledSchedules = returnAmountOfFilledSchedules(savedSchedules.data);

  if (!openedUserPreferencesOnce) {
    openUserPreferences();
  }

  showAmountOfFilledSchedules(amountOfFilledSchedules);
  defineIfLocalUserPreferencesWillGetOverwritten(
    savedSchedules,

    amountOfFilledSchedules
  );
  reflectUserPreferencesOnPreferencsForm();
  populateAppWithSchedules(savedSchedules, amountOfFilledSchedules);
}

main();

userPreferencesButton.addEventListener("click", openUserPreferences);
saveUserPreferencesButton.addEventListener("click", saveUserPreferences);
deleteSchedulesButton.addEventListener("click", deleteSchedules);
copyTableButton.addEventListener("click", copyTable);
modalCloseButtons.forEach((button) => button.addEventListener("click", closeAssociatedModal));
