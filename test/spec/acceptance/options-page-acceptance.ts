'use strict';

import OptionsPageViewModel = require('app/scripts/pages/options-page');
import Domain = require('app/scripts/url-monitoring/domain');

describe('Acceptance: Options page', function () {
  describe("Distracting sites", function () {
    it("should be empty initially", function () {
      var viewModel = new OptionsPageViewModel();

      expect(viewModel.badDomains()).to.be.empty;
    });

    it("should accept new additions", function () {
      var viewModel = new OptionsPageViewModel();

      viewModel.enteredBadDomainPattern("google.com");
      viewModel.saveEnteredBadDomain();

      expect(viewModel.badDomains()).to.deep.equal([new Domain("google.com")]);
    });

    it("should allow domain deletion", function () {
      var viewModel = new OptionsPageViewModel();

      viewModel.enteredBadDomainPattern("google.com");
      viewModel.saveEnteredBadDomain();
      viewModel.deleteBadDomain(viewModel.badDomains()[0]);

      expect(viewModel.badDomains()).to.be.empty;
    });
  });
});