function setUpCalc() {
  (function(e, t) {
    if (!t.__SV) {
      (<any>window).calq = t;
      var n = e.createElement("script");
      n.type = "text/javascript";
      n.src = chrome.extension.getURL("scripts/dependencies/calq-core-1.0.js");
      n.async = !0;
      var r = e.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(n, r);
      t.init = function(e, o) {
        if (t.writeKey) return;
        t.writeKey = e;
        t._initOptions = o;
        t._execQueue = [];
        var m = "action.track action.trackSale action.trackHTMLLink action.trackPageView action.setGlobalProperty user.profile user.identify user.clear".split(" ");
        for (var n = 0; n < m.length; n++) {
          var f = function() {
            var r = m[n];
            var s = function() {
              t._execQueue.push({
                m: r,
                args: arguments
              })
            };
            var i = r.split(".");
            if (i.length == 2) {
              if (!t[i[0]]) {
                t[i[0]] = []
              }
              t[i[0]][i[1]] = s
            } else {
              t[r] = s
            }
          }();
        }
      };
      t.__SV = 1
    }
  })(document, (<any>window).calq || []);

  calq.init("752a1760a1724a0f4fbf8de0c70b0caf");
  calq.action.trackPageView(); // [Optional] Leave if you want to automatically create a "Page View" action
}

function identifyCurrentUser() {
  // TODO: Track a unique id for this user, tie it to chrome login data maybe if possible?
}

setUpCalc();
identifyCurrentUser();

export = {
  trackEvent: function(eventName: string, eventData?: { [key: string]: any }): void {
    calq.action.track(eventName, eventData);
  }
};