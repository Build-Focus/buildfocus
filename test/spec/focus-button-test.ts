import ko = require("knockout");

import FocusButton = require("app/scripts/focus-button");

import {
  POMODORO_COLOUR,
  BREAK_COLOUR,
  BADGE_TEXT_COLOUR,
  BADGE_BACKGROUND_COLOUR,
  getBadgePixel,
  badgeTextColour,
} from "test/helpers/badge-helper";

describe("Focus button", () => {
  var pomodoroService: {
    progress: KnockoutObservable<number>;
    isActive: KnockoutObservable<boolean>;
    isPaused: KnockoutObservable<boolean>;
    isBreakActive: KnockoutObservable<boolean>;
  };

  var button: FocusButton;

  beforeEach(() => {
    pomodoroService = {
      progress: ko.observable<number>(),
      isActive: ko.observable<boolean>(),
      isPaused: ko.observable<boolean>(),
      isBreakActive: ko.observable<boolean>()
    };
    button = new FocusButton(pomodoroService);
  });

  describe("initially", () => {
    it("should show the default background", () => {
      expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
    });

    it("should show the default text", () => {
      expect(badgeTextColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
    });
  });

  describe("when a pomodoro is started", () => {
    beforeEach(() => pomodoroService.isActive(true));

    it("should have no border straight away", () => {
      expect(getBadgePixel(0, 0)).to.be.transparent();
    });

    it("should have half a border half way through a pomodoro", () => {
      pomodoroService.progress(50);

      expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
      expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
      expect(getBadgePixel(0, 18)).to.be.transparent();
    });

    it("should have 99% progress when a pomodoro is 99% done", () => {
      pomodoroService.progress(99);

      expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
      expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
      expect(getBadgePixel(0, 18)).to.be.rgbPixel(POMODORO_COLOUR);
      expect(getBadgePixel(0, 5)).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should show the default background when the pomodoro is later finished", () => {
      pomodoroService.isActive(false);
      expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
    });
  });

  describe("when a break is started", () => {
    beforeEach(() => pomodoroService.isBreakActive(true));

    it("should be 0% after starting a break", () => {
      expect(getBadgePixel(0, 0)).to.be.transparent();
    });

    it("should have half a border half way through a break", () => {
      pomodoroService.progress(50);

      expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
      expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
      expect(getBadgePixel(0, 18)).to.be.transparent();
    });

    it("should have 99% of a border when 99% through a break", () => {
      pomodoroService.progress(99);

      expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
      expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
      expect(getBadgePixel(0, 18)).to.be.rgbPixel(BREAK_COLOUR);
      expect(getBadgePixel(0, 5)).to.be.rgbPixel(BREAK_COLOUR);
    });

    it("should show the default background after a break is completed", () => {
      pomodoroService.isBreakActive(false);
      expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
    });
  });
});