export class ScheduleTime {
  constructor(hour, minute) {
    this.hour = hour;
    this.minute = minute;
  }

  toString() {
    return `${this.hour.toString().padStart(2, "0")}:${this.minute
      .toString()
      .padStart(2, "0")}`;
  }

  increaseTime(minutesIncrease) {
    const newMinute = (Number(this.minute) + Number(minutesIncrease.split(":")[1])) % 60;
    
    if (newMinute <= this.minute) {
      this.hour = this.hour + 1;
      this.minute = newMinute;
    } else {
      this.minute = newMinute;
    }

    return this.toString();
  }

  isSmallerThanOrEqual(time) {
    return (
      this.hour < time.hour ||
      (this.hour === time.hour && this.minute <= time.minute)
    );
  }
}
