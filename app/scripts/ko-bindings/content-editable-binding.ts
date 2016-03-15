import ko = require('raw-knockout');
import _ = require('lodash');

import keyPolyfill = require("keyboardevent-key-polyfill");
keyPolyfill.polyfill();

ko.bindingHandlers['contentEditable'] = {
  init: function (element: HTMLElement, valueAccessor: () => string) {
    element.addEventListener("keydown", function (e) {
      var keyName: string = e.key;

      if (keyName === "Enter" || keyName === "Escape" || keyName === "Tab") {
        e.preventDefault();
        element.blur();
        window.getSelection().removeAllRanges();
      }
    });

    element.setAttribute("contentEditable", valueAccessor())
  }
};