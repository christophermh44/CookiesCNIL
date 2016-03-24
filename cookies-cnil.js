;(function(nav, win, doc) {

  var globals = {
    sessionKey: 'cmh-session-started',
    consentKey: 'consent',
    bannerBodyClass: 'cookie-banner',
    consentAfterNavigating: true
  };

  var wasAccepted = false;
  var acceptCB = function() {};
  var rejectCB = function() {};

  var isSessionFirstVisit = function() {
    return (null == win.sessionStorage.getItem(globals.sessionKey));
  };

  var sessionStart = function() {
    win.sessionStorage.setItem(globals.sessionKey, true);
  };

  var isDNT = function() {
    return (nav.doNotTrack && (nav.doNotTrack == 'yes' || nav.doNotTrack == 1))
      || (nav.msDoNotTrack && (nav.msDoNotTrack == 'yes' || nav.msDoNotTrack == 1));
  };

  var showBanner = function() {
    doc.body.className+= ' ' + globals.bannerBodyClass;
  };

  var hideBanner = function() {
    doc.body.className = doc.body.className.replace(globals.bannerBodyClass, '');
  };

  var reject = function() {
    console.log('Stats cookies are rejected.');
    win.localStorage.setItem(globals.consentKey, false);
    clearStatsCookies();
  };

  var accept = function() {
    console.log('Stats cookies are accepted.');
    win.localStorage.setItem(globals.consentKey, true);
    initScript();
  };

  var choiceMade = function() {
    var choice = win.localStorage.getItem(globals.consentKey);
    return choice === "true" || choice === "false";
  };

  var isConsenting = function() {
    return win.localStorage.getItem(globals.consentKey) === "true";
  };

  var initScript = function() {
    if (!wasAccepted) {
    	wasAccepted = true;
	acceptCB();
    }
  };

  var clearStatsCookies = function() {
    wasAccepted = false;
    var cookieNames = ["__utma","__utmb","__utmc","__utmt","__utmv","__utmz","_ga","_gat"];
    for (var i = 0; i < cookieNames.length; i++) {
      var path = ";path=" + "/";
      var hostname = document.location.hostname;
      if (hostname.indexOf("www.") === 0) {
        hostname = hostname.substring(4);
      }
      var domain = ";domain=" + "." + hostname;
      var expiration = "Thu, 01-Jan-1970 00:00:01 GMT";
      document.cookie = name + "=" + path + domain + ";expires=" + expiration;
    }
    rejectCB();
  };

  var cnilCheck = function() {
    // Si le "Do Not Track" est actif, on respecte le choix de l'utilisateur
    // = on  ne le tracke pas.
    if (isDNT()) {
      reject();
      return;
    }

    // Cas où le consentement se fait explicitement ou lors de la navigation sur
    // le site Internet
    if (globals.consentAfterNavigating) {
      // Si l'utilisateur a déjà donné (ou non) son consentement
      if (choiceMade()) {
        if (isConsenting()) {
          accept();
          return;
        } else {
          reject();
        }
      } else {
        // Si c'est la première fois que l'utilisateur arrive sur le site, on
        // affiche la bannière ; sinon, l'acceptation est automatique
        if (isSessionFirstVisit()) {
          sessionStart();
          showBanner();
        } else {
          accept();
        }
      }
    }
    // Cas où le consentement doit être explicité par l'utilisateur
    else {
      // Si l'utilisateur a fait son choix.
      if (choiceMade()) {
        if (isConsenting()) {
          accept();
        } else {
          reject();
        }
      } else {
        reject();
        showBanner();
      }
    }
  };

  window.CNILCookies = {
    init: function(bindsCB, a, r) {
      acceptCB = a;
      rejectCB = r;
      bindsCB(accept, reject, showBanner, hideBanner);
      cnilCheck();
    }
  };
})(navigator, window, document);

// Ci-dessous, un exemple d'intégration et d'appel du script.

CNILCookies.init(function binds(accept, reject, showBanner, hideBanner) {
  document.querySelector('#cookies-message .accept').onclick = function() {
    accept();
    hideBanner();
  };
  document.querySelector('#cookies-message .reject').onclick = function() {
    reject();
    hideBanner();
  };
}, function accept() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create', 'UA-XXXXXXXX-X', 'auto');ga('require', 'displayfeatures');ga('send', 'pageview');
}, function reject() {});
