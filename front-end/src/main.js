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

    
  }

  schedules.appendChild(fragment);
}

function main() {
  populateAppWithSchedules();
}

main();
