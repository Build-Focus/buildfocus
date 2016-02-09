function CalqClient(stub) {

    // The API server we talk to for submitting. Always end with /
    this._apiBaseUrl = "https://api.calq.io/";
    // Name of cookie 
    this._cookieName = "_calq_d";
    // Optional domain to use when writing cookies (if null, will be omitted)
    this._cookieDomain = null;

    // The write key used to submit updates to the server
    this._writeKey = null;

    // The name of the actor for this session.
    this.actor;

    // Info about the current browser
    this.browserInfo;

    // Action methods
    this.action = {

        // Reserved action property names
        reservedActionProperties: {
            saleCurrency: "$sale_currency",
            saleValue: "$sale_value",
            deviceAgent: "$device_agent",
            deviceMobile: "$device_mobile",
            deviceOS: "$device_os",
            deviceResolution: "$device_resolution",
            countryCode: "$country",
            region: "$region",
            city: "$city",
            utmCampaign: "$utm_campaign",
            utmSource: "$utm_source",
            utmMedium: "$utm_medium",
            utmContent: "$utm_content",
            utmTerm: "$utm_term"
        },

        // Global properties that we send with every action
        _globalProperties: {},

        // Reference back to CalqClient from track
        _client: this,

        // Have we sent an action this session
        _hasTracked: false,

        /// <summary>
        /// Tracks the given action for the current user.
        /// </summary>
        track: function (action, params, blocking) {
            if (action == null || action.length == 0) {
                throw("You must specify at least an action parameter in calls to track(...)")
            }
            if (params == null) {
                params = {};
            }
            // Merge all super properties into params data
            params = this._client._util._mergeObjects(params, this._globalProperties);
            // Wrap in payload
            var payload = {
                write_key: this._client._writeKey,
                action_name: action,
                actor: this._client.actor,
                properties: params
            };
            this._client._ajaxPost(this._client._apiBaseUrl + "Track", payload, null, this._onTrackAjaxFail, blocking);

            this._hasTracked = true;
            this._client._saveClientState();
        },

        /// <summary>
        /// Tracks the given action for the current user which is a sale.
        /// </summary>
        trackSale: function (action, params, currency, amount) {
            if (currency == null || currency.length != 3 || isNaN(amount)) {
                throw ("Calls to trackSale need a 3 letter currency code and a numerical amount");
            }
            if (params == null) {
                params = {};
            }
            params[this.reservedActionProperties.saleCurrency] = currency;
            params[this.reservedActionProperties.saleValue] = amount;
            this.track(action, params);
        },

        /// <summary>
        /// Tracks an action in a way that can be attached to an outbound link. This blocks
        /// until the API call has completed (otherwise the link would fire before we had time).
        /// </summary>
        trackHTMLLink: function (action, params) {
            this.track(action, params, true);
        },

        /// <summary>
        /// Tracks a view of the given page. Will use the default action name unless another is given.
        /// </summary>
        trackPageView: function (action, params) {
            if (!action) {
                action = "Page View";
            }

            if (!params) {
                params = {};
            }
            params["$view_url"] = document.URL.replace(/#.*$/, "");  // Strip anchor
            params["$view_name"] = document.title || "No title";

            this.track(action, params);
        },

        /// <summary>
        /// Sets the given global properties. Accepts either a name value pair, 
        //  or an object with (potentially) multiple properties).
        /// </summary>
        setGlobalProperty: function (name, value) {
            if (typeof name == 'string' || name instanceof String) {
                var obj = {};
                obj[name] = value;
                this.setGlobalProperty(obj);
                return;
            } else {
                var obj = name;
                this._client._util._mergeObjects(this._globalProperties, obj);
                this._client._util._deleteEmpty(this._globalProperties);
                this._client._saveClientState();
            }
        },

        /// <summary>
        /// Handles when tracking fails.
        /// </summary>
        _onTrackAjaxFail: function (response) {
            var msg = "A call to a /Track endpoint has failed!";
            if (response != null) {
                console.error(msg, response);
            } else {
                console.error(msg);
            }
        }
    };

    // User methods
    this.user = {

        // Reserved action property names
        reservedProfileProperties: {
            fullName: "$full_name",
            imageUrl: "$image_url",
            countryCode: "$country",
            region: "$region",
            city: "$city",
            gender: "$gender",
            age: "$age",
            email: "$email",
            phone: "$phone",
            sms: "$sms"
        },

        // Reference back to CalqClient from user
        _client: this,

        // Gets if the current user is anon (auto generated)
        _anon: true,

        /// <summary>
        /// Sets a new identity for this user.
        /// </summary>
        identify: function (identity) {
            if (identity == null || identity.length == 0) {
                throw ("You must pass an identity when calling identify(...)");
            }
            if (identity != this._client.actor || this._anon) { // Check anon in case they ID to the same (rare, but valid)
                var old = this._client.actor;
                this._client.actor = identity;
                if (this._client.action._hasTracked && identity != old) {
                    this._transfer(old, this._client.actor);
                }
                this._anon = false;
                this._client.action._hasTracked = false; // Not tracked since transfer
                this._client._saveClientState();
            }
        },

        /// <summary>
        /// Issues a transfer request for the current user to a new identity.
        /// </summary>
        _transfer: function (oldActor, newActor) {
            var payload = {
                old_actor: oldActor,
                new_actor: newActor,
                write_key: this._client._writeKey
            };
            this._client._ajaxPost(this._client._apiBaseUrl + "Transfer", payload, null, null);    // No handler. Can't do anything sensible if transfer fails
        },
        
        /// <summary>
        /// Clear's the current user. Further actions will not be associated with this user.
        /// Will also clear all global action properties.
        /// </summary>
        clear: function () {
            this._client.actor = this._client._util._newGUID();
            this._client.action._globalProperties = {};
            this._client._populateReservedProperties();
            this._anon = true;
            this._client._saveClientState();
        },

        /// <summary>
        /// Sets profile properties for the current user. These are not the same as global
        /// properties. A user must be identified before calling profile.
        /// </summary>
        profile: function (params) {
            if (params == null || params.length == 0) {
                throw ("You must pass some profile data when calling profile(...)");
            }
            if (this._anon) {
                throw ("A client must be identified before calling profile(...)");
            }
            var payload = {
                write_key: this._client._writeKey,
                actor: this._client.actor,
                properties: params
            };
            this._client._ajaxPost(this._client._apiBaseUrl + "Profile", payload, null, this._onProfileAjaxFail);
        },

        /// <summary>
        /// Handles when a profile calls fails.
        /// </summary>
        _onProfileAjaxFail: function (response) {
            var msg = "A call to a /Profile endpoint has failed!";
            if (response != null) {
                console.error(msg, response);
            } else {
                console.error(msg);
            }
        }
    };

    /// <summary>
    /// Utility functions used by the library.
    /// </summary>
    this._util = {

        /// <summary>
        /// Recursively merges the content of the source object into the target.
        /// </summary>
        _mergeObjects: function (target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    try {
                        // Property in destination object is set. Update its value.
                        if (source[p].constructor == Object) {
                            target[p] = this._mergeObjects(target[p], source[p]);
                        } else {
                            target[p] = source[p];
                        }
                    } catch (e) {
                        // Property in destination object not set. Create it and set value
                        target[p] = source[p];
                    }
                }
            }
            return target;
        },

        /// <summary>
        /// Recursively deletes any elements in the source object with null values.
        /// </summary>
        _deleteEmpty: function (source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    if (source[p] == null) {
                        delete source[p];
                    } else {
                        // Property in destination object is set. Update its value.
                        if (source[p].constructor == Object) {
                            this._deleteEmpty(source[p]);
                        }
                    }
                }
            }
            return source;
        },

        /// <summary>
        /// Sets the given cookie.
        /// </summary>
        _setCookie: function (cname, cvalue, exdays, domain) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toGMTString();
            var cookieDomain = (domain != null ? " domain=" + domain + ";" : "");
            document.cookie = cname + "=" + this._Base64.encode(cvalue) + "; " + expires + ";" + cookieDomain + /* ';' (added to cookieDomain) */ " path=/";
        },

        /// <summary>
        /// Gets a cookie by name.
        /// </summary>
        _getCookie: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) == 0) {
                    return this._Base64.decode(c.substring(name.length, c.length));
                }
            }
            return null;
        },

        /// <summary>
        /// Gets info about the browser.
        /// </summary>
        _getBrowserInfo: function () {
            var unknown = 'Unknown';

            // screen
            var screenSize = '';
            if (screen.width) {
                width = (screen.width) ? screen.width : '';
                height = (screen.height) ? screen.height : '';
                screenSize += '' + width + "x" + height;
            }

            //browser
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browser = navigator.appName;
            var version = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // Opera
            if ((verOffset = nAgt.indexOf('Opera')) != -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
                // MSIE
            else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
            }
                // IE 11 no longer identifies itself as MS IE, so trap it
                // http://stackoverflow.com/questions/17907445/how-to-detect-ie11
            else if ((browser == 'Netscape') && (nAgt.indexOf('Trident/') != -1)) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
                if ((verOffset = nAgt.indexOf('rv:')) != -1) {
                    version = nAgt.substring(verOffset + 3);
                }
            }
                // Chrome
            else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
                browser = 'Chrome';
                version = nAgt.substring(verOffset + 7);
            }
                // Safari
            else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
                browser = 'Safari';
                version = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }

                // Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
                //  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
                //  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
                //  can be keyed on to detect it.
                if (nAgt.indexOf('CriOS') != -1) {
                    //Chrome on iPad spoofing Safari...correct it.
                    browser = 'Chrome';
                    //Don't believe there is a way to grab the accurate version number, so leaving that for now.
                }
            }
                // Firefox
            else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
                browser = 'Firefox';
                version = nAgt.substring(verOffset + 8);
            }
                // Other browsers
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser = nAgt.substring(nameOffset, verOffset);
                version = nAgt.substring(verOffset + 1);
                if (browser.toLowerCase() == browser.toUpperCase()) {
                    browser = navigator.appName;
                }
            }
            // trim the version string
            if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
            if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
            if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

            majorVersion = parseInt('' + version, 10);
            if (isNaN(majorVersion)) {
                version = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            // mobile version
            var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

            // cookie support
            var cookieEnabled = false;
            try {
                // Create cookie
                document.cookie = 'cookietest=1';
                var ret = document.cookie.indexOf('cookietest=') != -1;
                // Delete cookie
                document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
                cookieEnabled = ret;
            }
            catch (e) {
            }

            // cors support
            var cors = true;
            if (browser.indexOf("Microsoft") >= 0 && majorVersion < 10) {
                cors = false;
            }

            // system
            var os = unknown;
            var clientStrings = [
                { s: 'Windows CE', r: /Windows CE/ },
                { s: 'Windows 3.11', r: /Win16/ },
                { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
                { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT)/ },
                { s: 'Windows 98', r: /(Windows 98|Win98)/ },
                { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
                { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
                { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
                { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
                { s: 'Windows Vista', r: /Windows NT 6.0/ },
                { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
                { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
                { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
                { s: 'Windows 10', r: /(Windows 10|Windows NT 10)/ },
                { s: 'Android', r: /Android/ },
                { s: 'Open BSD', r: /OpenBSD/ },
                { s: 'Sun OS', r: /SunOS/ },
                { s: 'Linux', r: /(Linux|X11)/ },
                { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
                { s: 'Mac OS X', r: /Mac OS X/ },
                { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
                { s: 'QNX', r: /QNX/ },
                { s: 'UNIX', r: /UNIX/ },
                { s: 'BeOS', r: /BeOS/ },
                { s: 'OS/2', r: /OS\/2/ },
                { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
            ];
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = unknown;

            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    break;
                case 'Android':
                    var result = /Android ([\.\_\d]+)/.exec(nAgt);
                    osVersion = [1];
                    if(result != null && result.length > 1) {   // Need to check in case it just says Android without version
                        osVersion = result[1];
                    }
                    break;
                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;
            }

            return {
                screen: screenSize,
                browser: browser,
                browserVersion: version,
                mobile: mobile,
                os: os,
                osVersion: osVersion,
                cookies: cookieEnabled,
                cors: cors
            };
        },

        /// <summary>
        /// Generates a new V4 GUID.
        /// </summary>
        _newGUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /// <summary>
        /// Base64 encoding library
        /// </summary>
        _Base64: {

            // private property
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

            // public method for encoding
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;

                input = this._utf8_encode(input);

                while (i < input.length) {

                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

                }

                return output;
            },

            // public method for decoding
            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;

                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                while (i < input.length) {

                    enc1 = this._keyStr.indexOf(input.charAt(i++));
                    enc2 = this._keyStr.indexOf(input.charAt(i++));
                    enc3 = this._keyStr.indexOf(input.charAt(i++));
                    enc4 = this._keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                }

                output = this._utf8_decode(output);

                return output;

            },

            // private method for UTF-8 encoding
            _utf8_encode: function (string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++) {

                    var c = string.charCodeAt(n);

                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    }
                    else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }

                return utftext;
            },

            // private method for UTF-8 decoding
            _utf8_decode: function (utftext) {
                var string = "";
                var i = 0;
                var c = c1 = c2 = 0;

                while (i < utftext.length) {

                    c = utftext.charCodeAt(i);

                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    }
                    else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    }
                    else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }

                }

                return string;
            }
        }
    };

    /// <summary>
    /// Gets all the URL params passed to us.
    /// </summary>
    this._getQueryStringParams = function () {
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query)) {
            urlParams[decode(match[1])] = decode(match[2]);
        }
        return urlParams;
    };

    /// <summary>
    /// Persists the current client state to local storage.
    /// </summary>
    this._saveClientState = function () {
        // Careful when modifying this! Server side libraries expect to be able read and write the same state.
        var state = {};
        this._util._mergeObjects(state,
            {
                actor: this.actor,
                hasAction: this.action._hasTracked,
                isAnon: this.user._anon,
                actionGlobal: this.action._globalProperties
            });
        this._util._setCookie(this._cookieName, JSON.stringify(state), 180, this._cookieDomain);
    };

    /// <summary>
    /// Loads any existing client state from local storage.
    /// </summary>
    this._loadClientState = function () {
        var data = this._util._getCookie(this._cookieName);
        if (data != null) {
            try {
                data = JSON.parse(data);
                if (data.actor != null) {
                    this.actor = data.actor;
                }
                if (data.hasAction != null) {
                    this.action._hasTracked = data.hasAction;
                }
                if (data.isAnon != null) {
                    this.user._anon = data.isAnon;
                }
                if (data.actionGlobal != null) {
                    this._util._mergeObjects(this.action._globalProperties, data.actionGlobal);
                }
            } catch (ex) {
                // Do nothing. No data was overwritten yet
            }
        }
    };

    /// <summary>
    /// Makes an AJAX post with the given data.
    /// </summary>
    this._ajaxPost = function (url, params, success, error, blocking) {
        if (this._writeKey == null) {
            // Will happen if client is loaded, but init never called.
            console.warn("Calq API method was called before init(...). Call was ignored.");
        } else {
            blocking = blocking != null ? blocking : false;
            // If we don't support CORS, then do this with JSONP instead
            if (!this._browserInfo.cors) {
                return this._jsonpPost(url, params, success, error);
            } else {
                var thisClosure = this;
                var xmlHttp = this._createXMLHttp();
                xmlHttp.open("POST", url, !blocking);
                xmlHttp.setRequestHeader("Content-Type", "application/json");
                // TODO: Base64 encode before sending to obscure payload (Once server supports it for POST)
                xmlHttp.send(/*this._util._Base64.encode*/(JSON.stringify(params)));
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState === 4 /* XMLHttpRequest.DONE */) {
                        var response = null
                        try {
                            response = JSON.parse(xmlHttp.responseText);
                        } catch (ex) {
                            // Ignore and have no null
                        }
                        if (xmlHttp.status === 200 && response != null && response.error == null) {
                            if (success != null) {
                                success.call(thisClosure, response);
                            }
                        } else {
                            if (error != null) {
                                error.call(thisClosure, response);
                                console.log("Error reported from Calq API server", response);
                            }
                        }
                    } else {
                        // Still processing
                    }
                };
            }
        }
    };

    /// <summary>
    /// Submits data using JSONP instead of AJAX for browsers with no CORS support.
    /// </summary>
    this._jsonpPost = function (url, params, success, error) {
        var el = document.createElement("script");
        el.type = "text/javascript";
        el.src = url + "?data=" + this._util._Base64.encode(JSON.stringify(params)) + "&callback=calq._jsonpCallback"
        el.async = !0;
        var existing = document.getElementsByTagName("body")[0];
        existing.appendChild(el);
    };

    /// <summary>
    /// Handles results of JSONP calls.
    /// </summary>
    this._jsonpCallback = function (result) {
        if (!result || result.error != null) {
            throw ("A Calq API call has failed." + (result != null ? " Err = " + result.error : ""));
        }
    };

    /// <summary>
    /// Creates the XMLHttp object for AJAX.
    /// </summary>
    this._createXMLHttp = function createXMLHttp() {
        // Native if available
        if (typeof XMLHttpRequest !== undefined) {
            return new XMLHttpRequest;
        } else if (window.ActiveXObject) {
            // IE (old) If so we have to create the newest version XMLHttp object
            var ieXMLHttpVersions = ['MSXML2.XMLHttp.5.0', 'MSXML2.XMLHttp.4.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp', 'Microsoft.XMLHttp'];
            var xmlHttp;
            // In this array we are starting from the first element (newest version) and trying to create it.
            for (var i = 0; i < ieXMLHttpVersions.length; i++) {
                try {
                    xmlHttp = new ActiveXObject(ieXMLHttpVersions[i]);
                    return xmlHttp;
                } catch (e) {
                    // Not this one. Try again
                }
            }
        }
    };

    /// <summary>
    /// Injects this over the top of the previous stub.
    /// </summary>
    this._overwriteStub = function (stub) {
        if(stub == null || stub.__SV == null) {
            throw("The Calq library was not initialised correctly. Please use the snippet provided on the Calq website.")
        }
        if (stub.__SV < 0) {
            console.warn("The Calq initialisation snippet is out of date. Please use the latest snippet from the Calq website.")
        }
        // If customer doesn't call init before we load (maybe they do something custom, or it's delayed) then we need to wait
        if (stub.writeKey == null) {
            // Wrap the init call so we call this method again on init
            this.init = function () {
                stub.init.apply(this, arguments);
                window.calq = new CalqClient(stub);  // Overwrite with stub as normal now init called
            }
        } else {
            // Init called. We should have the write key in the stub
            if (this._writeKey != null) {
                console.warn("Calq has already been initialised. You should not call init(...) more than once.")
                return;
            }
            if (stub.writeKey == null || stub.writeKey.length != 32) {
                throw ("Invalid key specified for Calq library.")
            }
            if (window.location.protocol === "file:") {
                console.warn("Source is offline. Calq will not process API calls.")
                return;
            }
            this._writeKey = stub.writeKey;
            if (stub._initOptions) {
                this._processInitOptions(stub._initOptions);
            }
            this._loadClientState();
            // New actor? Or loaded one
            if (this.actor == null) {
                this.actor = this._util._newGUID();
            }
            this._populateReservedProperties();

            // Ready to go
            this._flushStubQueue(stub._execQueue);
        }
    };

    /// <summary>
    /// Handles any extra init options we might have been given. Advanced behaviour options are set here.
    /// Options should be specified as an object. E.g. _processInitOptions( { cookieName: "_newName" } );
    ///
    /// Available options are:
    ///
    ///     * cookieName - Overrrides the cookie name this client library is using to persist data. Default is "_calq_d"
    ///     * cookieDomain - Overrides the domain for cookies set by this client. To use cross sub-domains set ".mydomain.com" (with the leading dot)
    ///
    /// </summary>
    this._processInitOptions = function (options) {
        if (options.cookieName) {
            this._cookieName = options.cookieName;
        }
        if (options.cookieDomain) {
            this._cookieDomain = options.cookieDomain;
        }
    };

    /// <summary>
    /// Sets the default reserved property values.
    /// </summary>
    this._populateReservedProperties = function() {
        var device = {};
        device[this.action.reservedActionProperties.deviceAgent] = window.navigator.userAgent;
        var bo = this._browserInfo = this._util._getBrowserInfo();
        // Only screen, rest is parsed from agent server side to be consistent
        if (bo.screen != null) {
            device[this.action.reservedActionProperties.deviceResolution] = bo.screen;
        }
        this.action.setGlobalProperty(device);

        // We only set these if not yet set
        if (this.action._globalProperties[this.action.reservedActionProperties.utmCampaign] == null && this.user._anon) {
            var params = this._getQueryStringParams();
            var referral = {};
            if (params["utm_campaign"]) {
                referral[this.action.reservedActionProperties.utmCampaign] = params["utm_campaign"];
            }
            if (params["utm_source"]) {
                referral[this.action.reservedActionProperties.utmSource] = params["utm_source"];
            }
            if (params["utm_medium"]) {
                referral[this.action.reservedActionProperties.utmMedium] = params["utm_medium"];
            }
            if (params["utm_content"]) {
                referral[this.action.reservedActionProperties.utmContent] = params["utm_content"];
            }
            if (params["utm_term"]) {
                referral[this.action.reservedActionProperties.utmTerm] = params["utm_term"];
            }
            this.action.setGlobalProperty(referral);
        }
    };

    /// <summary>
    /// Flushes the action queue for any actions made before init has happened.
    /// </summary>
    this._flushStubQueue = function (stubQueue) {
        var thisClosure = this;
        var findCall = function (ix, stack, call, args) {
            if (call == null) {
                call = thisClosure;
            }
            if (ix < stack.length - 1) {
                findCall(ix + 1, stack, call[stack[ix]], args);
            } else {
                var invoke = call[stack[ix]];
                if (typeof invoke === 'function') {
                    invoke.apply(call, args);
                } else {
                    throw ("Unknown call to stubbed function '" + stack.join(".") + "'");
                }
            }
        };
        for (var n = 0; n < stubQueue.length; n++) {
            var deferred = stubQueue[n];
            findCall(0, deferred.m.split("."), null, deferred.args);
        }
    };

    // Self init on startup
    this._overwriteStub(stub);
};
window.calq = new CalqClient(window.calq);