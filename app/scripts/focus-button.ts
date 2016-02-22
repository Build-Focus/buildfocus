'use strict';

import ko = require("knockout");
import _ = require("lodash");
import subscribableEvent = require("subscribable-event");
import observableImage = require('observables/observable-image');
import PomodoroState = require("pomodoro/pomodoro-state");

interface PresentablePomodoroService {
  progress: KnockoutObservable<number>;

  isActive: KnockoutObservable<boolean>;
  isPaused: KnockoutObservable<boolean>;
  isBreakActive: KnockoutObservable<boolean>;
}

export = function FocusButton(pomodoroService: PresentablePomodoroService) {
  this.onClick = subscribableEvent();
  chrome.browserAction.onClicked.addListener(this.onClick.trigger);

  var logoIcon = observableImage("/images/icon-19.png");
  var pomodoroIcon = observableImage("/images/icon-19-red.png");
  var breakIcon = observableImage("/images/icon-19-green.png");

  function drawBackground(context: CanvasRenderingContext2D, image) {
    if (image()) {
      context.drawImage(image(), 0, 0, 19, 19);
    } else {
      context.clearRect(0, 0, 19, 19);
    }
  }

  function drawOutline(context: CanvasRenderingContext2D,
                       color: string,
                       length: number,
                       width: number) {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;

    outlineBadge(context, length, width);
  }

  function clearOutline(context: CanvasRenderingContext2D, length: number, width: number) {
    context.globalCompositeOperation = "destination-out";
    outlineBadge(context, length, width);
  }

  function outlineBadge(context: CanvasRenderingContext2D, length: number, width: number) {
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

  var badgeIcon = ko.computed(function () {
    var canvas = document.createElement('canvas');
    canvas.setAttribute("style", "width: 19px; height: 19px");

    var context = <CanvasRenderingContext2D> canvas.getContext('2d');

    var fullDistance = 19*4;
    var progressDistance = (pomodoroService.progress() || 0) * (fullDistance / 100);

    if (pomodoroService.isActive() || pomodoroService.isPaused()) {
      drawBackground(context, pomodoroIcon);
      clearOutline(context, fullDistance, 5);
      drawOutline(context, "#e00505", progressDistance, 3);
    } else if (pomodoroService.isBreakActive()) {
      drawBackground(context, breakIcon);
      clearOutline(context, fullDistance, 5);
      drawOutline(context, "#22bb04", progressDistance, 3);
    } else {
      drawBackground(context, logoIcon);
    }

    return context.getImageData(0, 0, 19, 19);
  });

  function updateBadgeIcon(imageData: ImageData) {
    chrome.browserAction.setIcon({
      imageData: imageData
    });
  }

  badgeIcon.subscribeAndUpdate(updateBadgeIcon);
};