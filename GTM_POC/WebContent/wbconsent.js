/**
 * The script file to be used with GTM implementation
 *
 */
function WBConsent () {};

WBConsent.serialize = function(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}

WBConsent.getQueryString = function(url) {
    var vars = [];

    // Get the start index of the query string
    var qsi = url.indexOf('?');
    if (qsi == -1)
        return vars;

    // Get the query string
    var qs = url.slice(qsi + 1);

    // Check if there is a subsection reference
    var sri = qs.indexOf('#');
    if (sri >= 0)
        qs = qs.slice(0, sri);

    // Build the associative array
    var hashes = qs.split('&');
    for (var i = 0; i < hashes.length; i++) {
        var sep = hashes[i].indexOf('=');
        if (sep <= 0)
            continue;
        var key = decodeURIComponent(hashes[i].slice(0, sep));
        var val = decodeURIComponent(hashes[i].slice(sep + 1));
        vars[key] = val;
    }

    return vars;
}

WBConsent.getDestUrl = function(srcUrl, arrParams) {
    var protocol = 'http:';
    if(window.location.protocol.toLowerCase() == 'https:') {
        protocol = window.location.protocol;
    }
    var baseUrl = protocol + '//consent.truste.com/notice';
    var arrDefaults = {
        'js': 'bb',
        'noticeType': 'bb',
        'gtm': 1,
        'c': 'teconsent'
    };
    var domain = arrParams['domain'], country = arrParams['country'], language = arrParams['language'], detectLang = arrParams['detectLang'];

    arrDefaults['domain'] = arrParams['domain'] ? arrParams['domain'] : window.location.hostname;

    WBConsent.merge(arrDefaults, arrParams);

    //populates language with locale
    if(!language & detectLang == 1) {
        var locale = window.navigator.userLanguage || window.navigator.language;
        var arrSplit = locale.split('-');
        language = arrSplit[0];
    }
    if(country) {
        arrDefaults['country'] = country;
    }
    if(language) {
        arrDefaults['language'] = language ? language : '';
        if(country) {
            arrDefaults['language'] = language + '_' + country;
        }
    }

    if(!arrParams['privacypolicylink']) {
        var link = WBConsent.getPrivacyPolicyLink(arrDefaults['language']);
        if(link) {
            arrDefaults['privacypolicylink'] = link;
        }
    }

    var url = baseUrl + '?' + WBConsent.serialize(arrDefaults);

    return url;
}

WBConsent.getPrivacyPolicyLink = function(locale) {
    var arrLinks = {
        'da': 'www.warnerbros.com/privacy/policy/da',
        'de': 'www.warnerbros.com/privacy/policy/de',
        'es': 'www.warnerbros.com/privacy/policy/es',
        'fr': 'www.warnerbros.com/privacy/policy/fr',
        'fi': 'www.warnerbros.com/privacy/policy/fi',
        'ja': 'www.warnerbros.com/privacy/policy/ja',
        'nl': 'www.warnerbros.com/privacy/policy/nl',
        'no': 'www.warnerbros.com/privacy/policy/no',
        'sv': 'www.warnerbros.com/privacy/policy/sv',
        'tr': 'www.warnerbros.com/privacy/policy/tr',
        'en_au': 'www.warnerbros.com/privacy/policy/en-au',
        'en_ca': 'www.warnerbros.com/privacy/policy/en-ca',
        'en_gb': 'www.warnerbros.com/privacy/policy/en-gb',
        'en_us': 'www.warnerbros.com/privacy-center-wb-privacy-policy',
        'es_latam': 'www.warnerbros.com/privacy/policy/es-latam',
        'es_mx': 'www.warnerbros.com/privacy/policy/es-mx',
        'fr_ca': 'www.warnerbros.com/privacy/policy/fr-ca',
        'fr_be': 'www.warnerbros.com/privacy/policy/fr-be',
        'nl_be': 'www.warnerbros.com/privacy/policy/nl-be',
        'pt_br': 'www.warnerbros.com/privacy/policy/pt-br',
    };
    var url = arrLinks[locale];
    if(url) {
        return location.protocol + '//' + url;
    } else {
        return false;
    }
}

/**
 * merge
 *
 * overwrite A's values with B's
 *
 * @return void
 */
WBConsent.merge = function(a, b) {
    for(var idx in b) {
        a[idx] = b[idx];
    }
}

WBConsent.injectHTML = function() {
    var scripts = document.getElementsByTagName('script');
    //Current file will always be the last file loaded

    var wbScript;
    for(var i = 0; i<scripts.length; i++) {
        if(scripts[i].src.indexOf('wbconsent') > -1) {
            wbScript = scripts[i];
        }
    }

    var arrParams = WBConsent.getQueryString(wbScript.src);
    var destUrl = WBConsent.getDestUrl(wbScript.src, arrParams);

    var target = document.getElementById("wb_consent");
    if(target) {
        var s = document.createElement('script');
        s.setAttribute('src', destUrl);
        document.head.appendChild(s);

        var blackbar = document.createElement("div");
        blackbar.id = "consent_blackbar";
        var teconsent = document.createElement("div");
        teconsent.id = "teconsent";
        teconsent.style.display = "none";
        target.appendChild(blackbar);
        target.appendChild(teconsent);
    }
}

if (window.addEventListener) { // W3C standard
    window.addEventListener('load', function(){ WBConsent.injectHTML(); }, false);
} else if (window.attachEvent) { // Microsoft
    window.attachEvent('onload', function(){ WBConsent.injectHTML(); });
}