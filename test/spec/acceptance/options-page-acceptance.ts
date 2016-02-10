'use strict';

import OptionsPageViewModel = require('app/scripts/pages/options-page');
import Domain = require('app/scripts/url-monitoring/domain');
import BadTabsWarningActions = require('app/scripts/components/bad-tabs-warning/bad-tabs-warning-action');

describe('Acceptance: Options page', function () {
  describe("Distracting sites", function () {
    it("should be empty initially", function () {
      var viewModel = new OptionsPageViewModel();

      expect(viewModel.badDomains()).to.be.empty;
    });

    it("should accept new additions", () => {
      var viewModel = new OptionsPageViewModel();

      viewModel.enteredBadDomainPattern("google.com");
      viewModel.saveEnteredBadDomain();

      expect(viewModel.badDomains()).to.deep.equal([new Domain("google.com")]);
    });

    it("should allow domain deletion", () => {
      var viewModel = new OptionsPageViewModel();

      viewModel.enteredBadDomainPattern("google.com");
      viewModel.saveEnteredBadDomain();
      viewModel.deleteBadDomain(viewModel.badDomains()[0]);

      expect(viewModel.badDomains()).to.be.empty;
    });
  });
  
  describe("Bad tabs default action", () => {
    it("should be 'Prompt' initially", () => {
      var viewModel = new OptionsPageViewModel();
      expect(viewModel.badTabsWarningAction()).to.equal(BadTabsWarningActions.Prompt);
    });

    it("should have names for all available options", () => {
      var viewModel = new OptionsPageViewModel();

      var actionOptions = viewModel.allBadTabsWarningActions;
      actionOptions.forEach((option) => expect(viewModel.getBadTabsWarningActionName(option)).to.be.a('string'));
    });
  })
});