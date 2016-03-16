import ko = require('raw-knockout');
import _ = require('lodash');

import keyPolyfill = require("keyboardevent-key-polyfill");
keyPolyfill.polyfill();

ko.bindingHandlers['contentEditable'] = {
  init: function (element: HTMLElement, valueAccessor: () => KnockoutObservable<string>) {
    var observableValue = valueAccessor();

    function deselectElement() {
      if (element.contains(<HTMLElement> document.activeElement)) {
        element.blur();
        window.getSelection().removeAllRanges();
      }
    }

    element.addEventListener("keydown", function (e) {
      var keyName: string = e.key;

      if (keyName === "Enter" || keyName === "Escape" || keyName === "Tab") {
        e.preventDefault();
        deselectElement();
      }
    });

    element.addEventListener("keyup", function () {
      observableValue(element.textContent);
    });

    window.addEventListener("click", (e) => {
      if (!element.contains(<HTMLElement> e.target)) {
        deselectElement();
      }
    });

    element.setAttribute("contentEditable", "true");
  },
  update: function (element: HTMLElement, valueAccessor: () => string|KnockoutObservable<string>) {
    element.textContent = ko.unwrap(valueAccessor());
  }
};