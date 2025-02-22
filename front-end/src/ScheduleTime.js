export class ScheduleTime {
  constructor(hour, minute) {
    this.hour = hour
    this.minute = minute
  }

  toString() {
    return `${this.hour.toString().padStart(2, "0")}:${this.minute.toString().padStart(2, "0")}`
  }

  increaseTime(minutesIncrease) {
    minutesIncrease = 60 % minutesIncrease ? minutesIncrease : 30

    if (!((this.minute + minutesIncrease) % 60)) {
      this.hour = this.hour + 1
      this.minute = 0
    }
    else {
      this.minute = this.minute + minutesIncrease
    }

    return this.toString()
  }

  isSmallerThanOrEqual(time) {
    return this.hour < time.hour || (this.hour === time.hour && this.minute <= time.minute)
  }
}