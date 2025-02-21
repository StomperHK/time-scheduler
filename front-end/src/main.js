import { ScheduleTime } from "./ScheduleTime";

import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";

function showScheduleMenu(event) {
  const scheduleButton = event.target;
  const scheduleMenu = document.querySelector("schedule-menu");

  if (scheduleMenu) {
    scheduleMenu.remove();
  }
}

function populateAppWithSchedules() {
  const fragment = document.createDocumentFragment();
  const scheduleTemplate = document.getElementById("schedule");
  const schedules = document.getElementById("schedules");

  const currentTime = new ScheduleTime(8, 0);
  const endTime = new ScheduleTime(18, 0);
  let count = 0;

  while (currentTime.isSmallerThanOrEqual(endTime)) {
    const schedule = scheduleTemplate.content.cloneNode(true);
    const time = schedule.querySelector('[data-js="time"]');
    const scheduleButton = schedule.querySelector('[data-js="button"]');

    time.textContent = currentTime.toString();
    time.setAttribute("datetime", currentTime.toString());
    scheduleButton.addEventListener("click", showScheduleMenu);

    currentTime.increaseTime(30);

    fragment.appendChild(schedule);

    showBreakTime(currentTime, fragment)
  }

  schedules.appendChild(fragment);
}

function showBreakTime(currentTime, fragment) {
  if (currentTime.toString() === "12:00" || currentTime.toString() === "16:00") {
    const breakTime = document.createElement("li");
    const breakTimeText = document.createElement("time");
    console.log(breakTimeText);
    
    breakTimeText.textContent = currentTime.toString();
    breakTime.setAttribute("datetime", currentTime.toString());
    breakTime.className = "!my-6 text-center font-bold";

    breakTime.appendChild(breakTimeText);
    fragment.appendChild(breakTime);
  }
}

function main() {
  populateAppWithSchedules();
}

main();
