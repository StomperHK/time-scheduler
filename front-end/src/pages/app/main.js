import { ScheduleTime } from "../../utils/ScheduleTime";
import { createToaster } from "../../utils/createToaster";
import { validateUser } from "../../api/validateUser";
import { returnUserExceededTestTime } from "../../utils/returnUserExceededTestTime";
import logo from "/assets/logo.png";
import "/assets/style.css";

const logofgButton = document.querySelector("[data-js='logoff-button']");
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

function logoffAccount() {
  localStorage.removeItem("token");
  window.location.href = "/login/";
}

function showUserData(name, picture, is_premium) {
  const userDataPlaceholder = document.querySelector('[data-js="user-data"]');
  const premiumLinks = document.querySelectorAll('[data-js="get-premium"]');
  const userInfoHtml = `
    <p class="flex items-center font-semibold">
      ${
        is_premium
          ? '<i class="fa-solid fa-web-awesome mr-2 text-yellow-500 text-xl" title="premium"></i>'
          : '<a data-js="get-premium" href="/premium/" class="btn btn-text mr-4 no-underline bg-yellow-400 text-black hidden md:inline">obter premium <i class="fa-solid fa-crown"></i></a>'
      } ${name}
    </p>
    ${
      picture
        ? `<button data-js="toggle-user-modal"><img src="${picture}" alt="${name} foto" class="w-10 h-10 rounded-full bg-blue-500" /></button>`
        : `<button data-js="toggle-user-modal" class="flex justify-center items-center w-10 h-10 rounded-full bg-blue-700 font-bold text-white">${getInittials(
            name
          )}</button>`
    }
  `;

  if (is_premium) {
    premiumLinks.forEach((node) => node.remove());
  }

  document.querySelector('[data-js="user-modal-username"]').textContent = name;

  userDataPlaceholder.innerHTML = userInfoHtml;
  userDataPlaceholder.querySelector('[data-js="toggle-user-modal"]').addEventListener("click", toggleUserModal)
}

function toggleUserModal() {
  const userModal = document.querySelector('[data-js="user-modal"]');
  userModal.classList.toggle("hidden");
}

function getInittials(name) {
  const separatedName = name.split(" ");
  return separatedName[0][0] + separatedName[1][0];
}

function parseUserData({ name, picture, created_at, is_premium }) {
  const userExceededTestTime = returnUserExceededTestTime(created_at, is_premium)

  if (userExceededTestTime) {
    location.href = "/premium/";
    return;
  }

  showUserData(name, picture, is_premium);
}

function saveDataOnLocalStorage() {
  // debounce save data on local storage
  const nameInputs = document.querySelectorAll('[data-js="schedule"] [data-js="name-input"]');
  const localUserPreferences = JSON.parse(localStorage.getItem("schedules")).localUserPreferences
  let newSchedules = { data: {}, localUserPreferences: localUserPreferences };

  for (const input of nameInputs) {
    const isDisabled = input.parentElement.dataset.disabled == "true"
    newSchedules.data[input.parentElement.firstElementChild.textContent] = {name: input.value, isDisabled: isDisabled, duration: localUserPreferences.sessionDuration};  // set time element as object key
  }

  showAmountOfFilledSchedules(returnAmountOfFilledSchedules(newSchedules.data));

  localStorage.setItem("schedules", JSON.stringify(newSchedules));

  createToaster("Dados salvos");
}

function allocateSpaceForSchedulesInLocalStorage() {
  const schedulesData = JSON.parse(localStorage.getItem("schedules"))?.data
  const schedulesDataIsInRightFormat = schedulesData && typeof schedulesData[Object.keys(schedulesData)[0]] === "object"   // In case scheduler data is on the old format, with key/string pairs
  console.log(schedulesDataIsInRightFormat)

  if (!schedulesDataIsInRightFormat) {
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

function getNewUserPreferences() {
  const userPreferencesSelects = document.querySelectorAll("[data-js='user-preferences-modal'] select");
  const newUserPreferences = {}

  for (const select of userPreferencesSelects) {
    newUserPreferences[select.name] = select.value;
  }

  return newUserPreferences
}

function returnAmountOfFilledSchedules(savedSchedulesData) {
  let scheduleAmount = 0;

  for (const val in savedSchedulesData) {
    if (savedSchedulesData[val].name !== "") {
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
  const thirdBreakTime = { time: new ScheduleTime(20, 0), wasCreated: false };

  while (currentTime.isSmallerThanOrEqual(endTime)) {
    const schedule = scheduleTemplate.content.cloneNode(true);
    const time = schedule.querySelector('[data-js="time"]');
    const input = schedule.querySelector('[data-js="name-input"]');
    const deleteCustomerButton = schedule.querySelector('[data-js="delete-button"]');
    const disableScheduleButton = schedule.querySelector('[data-js="disable-button"]')

    time.textContent = currentTime.toString();
    time.setAttribute("datetime", currentTime.toString());
    input.addEventListener("input", debouncedSaveDataOnLocalStorage);
    deleteCustomerButton.addEventListener("click", deleteCustomer);
    disableScheduleButton.addEventListener("click", disableSchedule)

    if (currentTime.toString() in savedSchedules.data) {    // in case theres no schedules in localStorage
      input.value = savedSchedules.data[currentTime.toString()].name;

      if (savedSchedules.data[currentTime.toString()].isDisabled) {  // apply disabled state if schedule is disabled in storage
        schedule.firstElementChild.setAttribute("data-disabled", "true");
        disableScheduleButton.firstElementChild.textContent = "ativar"
        input.disabled = true
        disableScheduleButton.lastElementChild.setAttribute("class", "fa-solid fa-eye-slash")
      }
    }

    currentTime.increaseTime(sessionDuration);

    fragment.appendChild(schedule);

    showBreakTime(currentTime, firstBreakTime, fragment);
    showBreakTime(currentTime, secondBreakTime, fragment);
    showBreakTime(currentTime, thirdBreakTime, fragment);
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

    breakTimeText.innerHTML = `<i class="fa-solid fa-clock mr-1"></i> ${breakTime.time.toString()}`;
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

function disableSchedule(event) {
  const clickedButton = event.target.matches('[data-js="disable-button"]') 
    ? event.target 
    : event.target.closest('[data-js="disable-button"]');
  const scheduleItem = clickedButton.closest('[data-js="schedule"]');
  const input = scheduleItem.querySelector('[data-js="name-input"]')
  const isDisabled = scheduleItem.getAttribute("data-disabled") === "true";

  if (isDisabled) {
    scheduleItem.setAttribute("data-disabled", "false");
    clickedButton.firstElementChild.textContent = "desativar";
    input.disabled = false
    clickedButton.lastElementChild.setAttribute("class", "fa-solid fa-eye");
  } else {
    scheduleItem.setAttribute("data-disabled", "true");
    clickedButton.firstElementChild.textContent = "ativar";
    input.disabled = true
    clickedButton.lastElementChild.setAttribute("class", "fa-solid fa-eye-slash");
  }

  saveDataOnLocalStorage();
}

function openUserPreferences() {
  const userPreferencesModal = document.querySelector("[data-js='user-preferences-modal']");
  userPreferencesModal.show();

  localStorage.setItem("openedUserPreferences", true);
}

function saveUserPreferences() {
  const newUserPreferences = getNewUserPreferences();
  applyUserPreferencesEffects(newUserPreferences);
  populateSchedulesDataOnLocalStorage(newUserPreferences);

  createToaster("Preferências salvas");
}

function applyUserPreferencesEffects(newUserPreferences) {
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));
  const filledSchedules = returnAmountOfFilledSchedules(savedSchedules.data);

  if (!filledSchedules) {
    savedSchedules.localUserPreferences = newUserPreferences;
    localStorage.setItem("schedules", JSON.stringify(savedSchedules));

    populateAppWithSchedules(savedSchedules, true);
  }
}

function populateSchedulesDataOnLocalStorage(newUserPreferences) {
  newUserPreferences = newUserPreferences ? newUserPreferences  : JSON.parse(localStorage.getItem("userPreferences"))

  const schedulesObject = Array.from(document.querySelectorAll('[data-js="schedule"]'))
    .reduce((curr, schedule) => {
      curr[schedule.firstElementChild.textContent] = {
        name: schedule.querySelector("input").value,
        isDisabled: schedule.dataset.disabled === "true",
        duration: newUserPreferences.sessionDuration
      };
      return curr
    }, {})

  localStorage.setItem("schedules", JSON.stringify({data: schedulesObject, localUserPreferences: newUserPreferences}))
}

function populateSchedulesDataOnLocalStorageIfItsEmpty() {
  if (!Object.keys(JSON.parse(localStorage.getItem("schedules")).data).length) {
    populateSchedulesDataOnLocalStorage()
  }
}

function deleteSchedules() {
  const nameInputs = document.querySelectorAll('[data-js="schedule"] [data-js="name-input"]');

  for (const input of nameInputs) {
    input.value = "";
  }

  const globalUserPreferences = localStorage.getItem("userPreferences");
  localStorage.setItem("schedules", `{"data": {}, "localUserPreferences": ${globalUserPreferences}}`);
  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));
  populateAppWithSchedules(savedSchedules, true);
  showAmountOfFilledSchedules(0);
}

function openConfirmDeleteModal() {
  const confirmDeleteModal = document.querySelector("[data-js='confirm-delete-modal']");
  confirmDeleteModal.classList.remove("hidden");

  const deleteX = confirmDeleteModal.querySelector('[data-js="close-delete-modal"]');
  const confirmButton = confirmDeleteModal.querySelector('[data-js="confirm-delete"]');
  const cancelButton = confirmDeleteModal.querySelector('[data-js="cancel-delete"]');

  deleteX.addEventListener("click", () => confirmDeleteModal.classList.add("hidden"));

  confirmButton.addEventListener("click", () => {
    deleteSchedules();
    confirmDeleteModal.classList.add("hidden");
  });

  cancelButton.addEventListener("click", () => {
    confirmDeleteModal.classList.add("hidden");
  });
}

function copyTable() {
  let outputText = `       ${String.fromCodePoint("0x1F488")} ${translatedDaysOfTheWeek[new Date().getDay()]} ${String.fromCodePoint("0x1F488")}\n`;
  const savedSchedules = JSON.parse(localStorage.getItem("schedules")).data;

  for (let schedule in savedSchedules) {
    const scheduleIsNotDisabled = savedSchedules[schedule].isDisabled != true

    if (scheduleIsNotDisabled) outputText += `${schedule} - ${savedSchedules[schedule].name}\n`;
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
  validateUser(true).then((userData) => {
    if (!userData) {
      window.location.href = "/login/";
    }

    parseUserData(userData);
  });

  allocateSpaceForSchedulesInLocalStorage();

  const savedSchedules = JSON.parse(localStorage.getItem("schedules"));
  const openedUserPreferencesOnce = localStorage.getItem("openedUserPreferences");
  const amountOfFilledSchedules = returnAmountOfFilledSchedules(savedSchedules.data);

  if (!openedUserPreferencesOnce) {
    openUserPreferences();
  }

  showAmountOfFilledSchedules(amountOfFilledSchedules);
  defineIfLocalUserPreferencesWillGetOverwritten(savedSchedules, amountOfFilledSchedules);
  reflectUserPreferencesOnPreferencsForm();
  populateAppWithSchedules(savedSchedules, amountOfFilledSchedules);
  populateSchedulesDataOnLocalStorageIfItsEmpty()

  window.toggleUserModal = toggleUserModal;
}

main();

logofgButton.addEventListener("click", logoffAccount);
userPreferencesButton.addEventListener("click", openUserPreferences);
saveUserPreferencesButton.addEventListener("click", saveUserPreferences);
deleteSchedulesButton.addEventListener("click", openConfirmDeleteModal);
copyTableButton.addEventListener("click", copyTable);
modalCloseButtons.forEach((button) => button.addEventListener("click", closeAssociatedModal));
