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

    // Send changes through to the backing observable, but only after no changes have happened for 500ms.
    var nextObservableUpdate: number = null;
    element.addEventListener("keyup", function () {
      if (nextObservableUpdate) clearTimeout(nextObservableUpdate);
      nextObservableUpdate = setTimeout(() => {
        observableValue(element.textContent);
        clearTimeout(nextObservableUpdate);
      }, 500);
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