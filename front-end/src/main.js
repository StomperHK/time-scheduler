import { ScheduleTime } from "./ScheduleTime";

import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";

const deleteSchedulesButton = document.querySelector("[data-js='delete-schedules']")
const copyTableButton = document.querySelector("[data-js='copy-table']")
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
}

function populateAppWithSchedules() {
  const fragment = document.createDocumentFragment();
  const scheduleTemplate = document.getElementById("schedule");
  const schedules = document.getElementById("schedules");
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));

  const currentTime = new ScheduleTime(8, 0);
  const endTime = new ScheduleTime(18, 0);
  let count = 0;

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

    showBreakTime(currentTime, fragment);
  }

  showAmountOfSchedules(savedSchedules);

  schedules.appendChild(fragment);
}

function showBreakTime(currentTime, fragment) {
  if (
    currentTime.toString() === "12:00" ||
    currentTime.toString() === "16:00"
  ) {
    const breakTime = document.createElement("li");
    const breakTimeText = document.createElement("time");
    console.log(breakTimeText);

    breakTimeText.textContent = currentTime.toString();
    breakTime.setAttribute("datetime", currentTime.toString());
    breakTime.className = "!my-6 text-center font-bold";
    breakTimeText.className = "text-gray-500 text-xl";

    breakTime.appendChild(breakTimeText);
    fragment.appendChild(breakTime);
  }
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

function deleteSchedules() {
  const nameInputs = document.querySelectorAll(
    '[data-js="schedule"] [data-js="name-input"]'
  );

  for (const input of nameInputs) {
    input.value = "";
  }

  saveDataOnLocalStorage();
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

function main() {
  allocateSpaceForSchedulesInLocalStorage();
  populateAppWithSchedules();
}

main();

deleteSchedulesButton.addEventListener("click", deleteSchedules)
copyTableButton.addEventListener("click", copyTable)