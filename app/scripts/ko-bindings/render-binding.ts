import ko = require('knockout');

ko.bindingHandlers['render'] = {
  init: function (element, valueAccessor) {
    var vm = valueAccessor();
    vm.render();
  }
};