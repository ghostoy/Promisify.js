(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // CommonJS
    if (typeof exports === "object") {
        module.exports = definition(require('q'));

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(['q'], definition);

    } else {
        Promisify = definition();
    }

})(function (Q) {
"use strict";

    function proxy(obj, events, callback) {
        // set default event binding callback
        callback = callback || function (obj, eventName, proxyObj) {
            var defer = Q.defer();
            if (typeof obj.on === 'function') {
                obj.on(eventName, function() {
                    defer.resolve(arguments[0]);
                });
            } else if (typeof obj.addEventListener === 'function') {
                obj.addEventListener(eventName, function() {
                    defer.resolve(arguments[0]);
                });
            } else {
                var handler = obj['on'+eventName];
                Object.defineProperty(obj, 'on'+eventName, {
                    get: function() {
                        return function() {
                            if (handler) {
                                handler.apply(obj, arguments);
                            }
                            defer.resolve(arguments[0]);
                        };
                    },
                    set: function(h) {
                        handler = h;
                    }
                });
            }

            proxyObj['on'+eventName] = defer.promise;
        };

        var proxyObj = {};
        events.forEach(function(eventName) {
            callback(obj, eventName, proxyObj);
        });
        return proxyObj;
    }

    return {
        proxy: proxy
    };
});