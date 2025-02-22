import { ScheduleTime } from "./ScheduleTime";

import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";

const userPreferencesButton = document.querySelector("[data-js='user-preferences-button']")
const saveUserPreferencesButton = document.querySelector("[data-js='user-preferences-modal'] [data-js='save-button']")
const deleteSchedulesButton = document.querySelector("[data-js='delete-schedules']")
const copyTableButton = document.querySelector("[data-js='copy-table']")
const modalCloseButtons = Array.from(document.querySelectorAll("[data-js='close-button']"));
const translatedDaysOfTheWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

const debouncedSaveDataOnLocalStorage = debounce(saveDataOnLocalStorage, 1000);

function debounce(fn, delay) {
  let timeout;

  return function () {
    clearInterval(timeout);
    timeout = setTimeout(fn, delay);
  };
}

function saveDataOnLocalStorage() {
  const nameInputs = document.querySelectorAll(
    '[data-js="schedule"] [data-js="name-input"]'
  );
  let namesAsJson = {};

  for (const input of nameInputs) {
    namesAsJson[input.previousElementSibling.textContent] = input.value;
  }

  namesAsJson = JSON.stringify(namesAsJson);
  localStorage.setItem("schedules", namesAsJson);
}

function showScheduleMenu(event) {
  const scheduleButton = event.target;
  const scheduleMenu = document.querySelector("schedule-menu");

  if (scheduleMenu) {
    scheduleMenu.remove();
  }
}

function allocateSpaceForSchedulesInLocalStorage() {
  if (!localStorage.getItem("schedules")) {
    localStorage.setItem("schedules", "{}");
  }
  if (!localStorage.getItem("userPreferences")) {
    localStorage.setItem("userPreferences", "{'openingTime': '08:00', 'closingTime': '18:30', 'sessionDuration': 30}");
  }
}

function applyUserPreferences() {
  const userPreferencesSelects = document.querySelectorAll("[data-js='user-preferences-modal'] select");
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));

  for (const select of userPreferencesSelects) {
    select.value = userPreferences[select.name];
  }
}

function populateAppWithSchedules() {
  const fragment = document.createDocumentFragment();
  const scheduleTemplate = document.getElementById("schedule");
  const schedules = document.getElementById("schedules");
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));

  const currentTime = new ScheduleTime(8, 0);
  const endTime = new ScheduleTime(18, 0);
  let firstBreakTimePassed = false
  let secondBreakTimePassed = false

  while (currentTime.isSmallerThanOrEqual(endTime)) {
    const schedule = scheduleTemplate.content.cloneNode(true);
    const time = schedule.querySelector('[data-js="time"]');
    const input = schedule.querySelector('[data-js="name-input"]');
    const scheduleButton = schedule.querySelector('[data-js="button"]');

    time.textContent = currentTime.toString();
    time.setAttribute("datetime", currentTime.toString());
    input.addEventListener("input", debouncedSaveDataOnLocalStorage);
    scheduleButton.addEventListener("click", showScheduleMenu);

    if (currentTime.toString() in savedSchedules) {
      input.value = savedSchedules[currentTime.toString()];
    }

    currentTime.increaseTime(30);

    fragment.appendChild(schedule);

    if (currentTime.hour >= 12 && !firstBreakTimePassed) {
      showBreakTime(currentTime, fragment)
      firstBreakTimePassed = true
    }

    if (currentTime.hour >= 16 && !secondBreakTimePassed) {
      showBreakTime(currentTime, fragment)
      secondBreakTimePassed = true
    }
  }

  showAmountOfSchedules(savedSchedules);

  schedules.appendChild(fragment);
}

function showBreakTime(currentTime, fragment) {
  const breakTime = document.createElement("li");
  const breakTimeText = document.createElement("time");

  breakTimeText.textContent = currentTime.toString();
  breakTime.setAttribute("datetime", currentTime.toString());
  breakTime.className = "!my-6 text-center font-bold";
  breakTimeText.className = "text-gray-500 text-xl";

  breakTime.appendChild(breakTimeText);
  fragment.appendChild(breakTime);
}

function showAmountOfSchedules(savedSchedules) {
  const amountOfSchedules = document.querySelector(
    '[data-js="amount-of-schedules"]'
  );
  let scheduleAmount = 0

  for (const val in savedSchedules) {
    if (savedSchedules[val] !== "") {
      scheduleAmount++;
    }
  }

  amountOfSchedules.textContent = scheduleAmount + " cliente(s) para hoje";
}

function openUserPreferences() {
  const userPreferencesModal = document.querySelector("[data-js='user-preferences-modal']");
  userPreferencesModal.show();
}

function saveUserPreferences() {
  const newUserPreferences = {}
  const userPreferencesSelects = Array.from(document.querySelectorAll("[data-js='user-preferences-modal'] select")).forEach((select) => {
      newUserPreferences[select.name] = select.value;
    }
  )

  localStorage.setItem("userPreferences", JSON.stringify(newUserPreferences));
}

function deleteSchedules() {
  const nameInputs = document.querySelectorAll(
    '[data-js="schedule"] [data-js="name-input"]'
  );

  for (const input of nameInputs) {
    input.value = "";
  }

  localStorage.setItem("schedule", "{}");
  showAmountOfSchedules({});
}

function copyTable() {
  let outputText = "        "  + translatedDaysOfTheWeek[new Date().getDay()] + "\n";
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));

  for (schedule in savedSchedules) {

    outputText += `${schedule} - ${savedSchedules[schedule]}\n`
  }

  navigator.clipboard.writeText(outputText)
    .then(() => {
      alert("Tabela copiada com sucesso!")
    })
    .catch(() => {
      alert("Erro ao copiar a tabela!")
    })
}

function closeAssociatedModal(event) {
  const modal = event.target.closest(".modal");

  modal.close()
  
}

function main() {
  allocateSpaceForSchedulesInLocalStorage();
  applyUserPreferences();
  populateAppWithSchedules();
}

main();

userPreferencesButton.addEventListener("click", openUserPreferences)
saveUserPreferencesButton.addEventListener("click", saveUserPreferences)
deleteSchedulesButton.addEventListener("click", deleteSchedules)
copyTableButton.addEventListener("click", copyTable)
modalCloseButtons.forEach((button) => button.addEventListener("click", closeAssociatedModal));