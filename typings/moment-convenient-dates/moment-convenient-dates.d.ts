declare namespace moment {
  interface MomentStatic {
    today(): Moment;
    yesterday(): Moment;
    tomorrow(): Moment;

    daysAgo(number: number): Moment;
    daysAway(number: number): Moment;

    aWeekAgo(): Moment;
    weeksAgo(number: number): Moment;
    weeksAway(number: number): Moment;

    aMonthAgo(): Moment;
    monthsAgo(number: number): Moment;
    monthsAway(number: number): Moment;

    aYearAgo(): Moment;
    yearsAgo(number: number): Moment;
    yearsAway(number: number): Moment;
  }
}