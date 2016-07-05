'use strict';

import ko = require("knockout");
import _ = require("lodash");
import { subscribableEvent } from "data-synchronization/subscribable-event";
import observableImage = require('ko-extensions/observable-image');
import PomodoroState = require("pomodoro/pomodoro-state");

interface PresentablePomodoroService {
  progress: KnockoutObservable<number>;

  isActive: KnockoutObservable<boolean>;
  isPaused: KnockoutObservable<boolean>;
  isBreakActive: KnockoutObservable<boolean>;
}

const LOGO_ICON = observableImage("/images/icon-19.png");
const POMODORO_ICON = observableImage("/images/icon-19-red.png");
const BREAK_ICON = observableImage("/images/icon-19-green.png");
const PAUSED_ICON = observableImage("/images/icon-19-paused.png");

class FocusButton {
  onClick = subscribableEvent();

  constructor(private pomodoroService: PresentablePomodoroService) {
    chrome.browserAction.onClicked.addListener(this.onClick.trigger);
    this.badgeIcon.subscribeAndUpdate((imageData) => chrome.browserAction.setIcon({ imageData: imageData }));
  }

  private badgeIcon = ko.computed(() => {
    var canvas = document.createElement('canvas');
    canvas.setAttribute("style", "width: 19px; height: 19px");

    var context = <CanvasRenderingContext2D> canvas.getContext('2d');

    var fullDistance = 19*4;
    var progressDistance = (this.pomodoroService.progress() || 0) * (fullDistance / 100);

    var borderColour: string;
    var centerIcon: KnockoutObservable<HTMLImageElement>;

    if (this.pomodoroService.isActive()) {
      centerIcon = POMODORO_ICON;
      borderColour = "#E00505";
    } else if (this.pomodoroService.isPaused()) {
      centerIcon = PAUSED_ICON;
      borderColour = "#F896A9";
    } else if (this.pomodoroService.isBreakActive()) {
      centerIcon = BREAK_ICON;
      borderColour = "#22BB04";
    } else {
      centerIcon = LOGO_ICON;
      borderColour = null;
    }

    this.drawBackground(context, centerIcon);
    if (borderColour) {
      this.clearOutline(context, fullDistance, 5);
      this.drawOutline(context, borderColour, progressDistance, 3);
    }

    return context.getImageData(0, 0, 19, 19);
  });

  private drawBackground(context: CanvasRenderingContext2D, image: KnockoutObservable<HTMLImageElement>) {
    if (image()) {
      context.drawImage(image(), 0, 0, 19, 19);
    } else {
      context.clearRect(0, 0, 19, 19);
    }
  }

  private drawOutline(context: CanvasRenderingContext2D, color: string, length: number, width: number) {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;

    this.outlineBadge(context, length, width);
  }

  private clearOutline(context: CanvasRenderingContext2D, length: number, width: number) {
    context.globalCompositeOperation = "destination-out";
    this.outlineBadge(context, length, width);
  }

  private outlineBadge(context: CanvasRenderingContext2D, length: number, width: number) {
    context.setLineDash([length, 1000]);
    context.lineWidth = width;

    context.beginPath();

    context.moveTo(0, 0);
    context.lineTo(19, 0);
    context.lineTo(19, 19);
    context.lineTo(0, 19);
    context.lineTo(0, 0);

    context.stroke();
  }
}

export = FocusButton;
