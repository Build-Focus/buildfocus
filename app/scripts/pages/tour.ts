import $ = require('jquery');
import hopscotch = require('hopscotch');
import tracking = require('tracking/tracking');

const tourLevelsKey = "intro-tour-levels";

function ifTourRequired(callback: () => void) {
  chrome.storage.local.get(tourLevelsKey, function (data) {
    if (!data[tourLevelsKey]) {
      callback();
    }
  });
}

function tourCompleted() {
  // We track the *list of each tour version* you've completed (not just a boolean)
  // As new tours are added for new features, we can use this to show single steps to
  // existing users without rerunning the whole tour.
  chrome.storage.local.set({ [tourLevelsKey]: [1] });
}

var tourDefinition = {
  id: 'intro-tour',
  steps: [
    {
      target: '.city canvas',
      placement: 'bottom',
      title: 'Welcome to Build Focus',
      content: `<p>This is your city. It's pretty empty right now, but it'll grow quickly soon.</p>
                <p>
                Every time you get 25 minutes of work done without getting distracted a new building (or upgrade)
                will appear, from houses to shops to airports.
                </p>
                <p>
                Lose your focus though, and a random building will be destroyed, leaving only wreckage behind.
                Let's avoid that!
                </p>`,

      xOffset: window.innerWidth/2 - 200,
      width: 400
    },
    {
      target: '.browser-action-standin',
      placement: 'bottom',
      title: 'Pop in any time',
      content: `<p>You now have a new Build Focus icon in your browser, so you can get back here and check on your city
                   (or your settings) whenever you like.</p>
                <p>This will also transform  into a timer to track your focus and breaks as you go
                   (as you'll see in just a second).</p>`,
      yOffset: 10,
      width: 400,
      xOffset: -420,
      arrowOffset: 380
    },
    {
      target: '.settings-button',
      placement: 'left',
      title: "Let's get set up",
      content: `<p>Before you start focusing you need to tell Build Focus what normally distracts you.</p>
                <p>Click 'Settings' to set this up now.</p>`,
      multipage: true,
      nextOnTargetClick: true,
      showNextButton: false
    },
    {
      target: '.domain-patterns form',
      placement: 'right',
      title: 'What distracts you?',
      content: `<p>Enter the URLs of a few sites that normally distract you.</p>
                <p>Try Facebook.com, Twitter.com or anything else that stops you getting things done.</p>
                <p>Press next below when you're done (you can always come back and change this later)</p>`,
      onShow: () => $(".domain-patterns input[type=text]").focus()
    },
    {
      target: '.home-button',
      placement: 'left',
      title: "Let's get started",
      content: "Great, you're ready! Click Home to go back to your city and get started.",
      multipage: true,
      nextOnTargetClick: true,
      showNextButton: false
    },
    {
      target: '.controls',
      placement: 'top',
      title: 'Start focusing',
      content: `<p>The controls here let you get started.</p>
                <ul>
                  <li><strong>Focus</strong> will start you focusing for the next 25 minutes (watch for a timer in the top right)</li>
                  <li><strong>Take a break</strong> lets you take a 5 minute break, and relax (with a little nudge once you're done)</li>
                  <li><strong>Not now</strong> closes Build Focus for the moment, when you want to stop focusing completely</li>
                </ul>
                <p>When you're ready, click 'Focus', and then concentrate for 25 minutes to get your first building.</p>
                <p>Good luck!</p>`,
      showNextButton: false,
      nextOnTargetClick: true,
      onShow: () => {
        tracking.trackEvent("tour.completed").then(() => tourCompleted());
      }
    }
  ],
  skipIfNoElement: false,
  onClose: () => {
    tracking.trackEvent("tour.closed");
    tourCompleted();
  },
  onEnd: () => {
    tourCompleted();
  }
};

// TODO: Actually test this (with Selenium, realistically)
export = function runTourIfRequired() {
  ifTourRequired(() => {
    tracking.trackEvent("tour.started");
    hopscotch.startTour(tourDefinition);
  });
};