'use strict';

import OptionsPageViewModel = require('app/scripts/pages/options-page');
import Domain = require('app/scripts/url-monitoring/domain');
import BadTabsWarningActions = require('app/scripts/bad-tabs-warning/bad-tabs-warning-action');

describe('Acceptance: Options page', () => {
  describe("Distracting sites", () => {
    it("should be empty initially", () => {
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
  
  describe("Bad tabs default action picker", () => {
    it("should be set to 'Prompt' initially", () => {
      var viewModel = new OptionsPageViewModel();
      expect(viewModel.badTabsWarningAction()).to.equal(BadTabsWarningActions.Prompt);
    });

    it("should build a list of options with names", () => {
      var viewModel = new OptionsPageViewModel();
      viewModel.allBadTabsWarningActions.forEach((option) => expect(option.name).to.be.a('string'));
    });

    it("should build a list of options with numeric ids", () => {
      var viewModel = new OptionsPageViewModel();
      viewModel.allBadTabsWarningActions.forEach((option) => expect(option.id).to.be.a('number'));
    });
  });
});