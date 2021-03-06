/**
 * @library Router
 * @version 0.1.1
 *
 * @author Petr Nevyhoštěný
 * @license MIT <https://github.com/nevyk/router/blob/master/LICENSE>
 */

(function (win) {
    
    var Parser = (function () {
        var iterate = function (definition, iteration) {
            var levels = definition.split('/').slice(1),
                opt = {};
            
            levels.forEach(function (level, index) {
                opt.wildcard = /^\:.+$/.test(level);
                opt.star = /^\*$/.test(level);
                opt.optional = /^.+\?/.test(level);
                iteration(level, opt, index);
            });
        };
        
        var getRegExp = function (definition) {
            var output = '^';
            
            iterate(definition, function (level, opt) {
                if (opt.optional) { output += '(?:[\/](?=[^\/]+)'; }
                else { output += '\/'; }
                
                if (opt.wildcard) { output += '([^\/]+)'; }
                else if (opt.star) { output += '[^\/]+'; }
                else { output += level; }
                
                if (opt.optional) { output += ')?'; }
            });
            
            output += '$';
            
            return new RegExp(output);
        };
        
        var getParams = function (definition) {
            var output = [];
            
            iterate(definition, function (level, opt) {
                if (opt.wildcard) { output.push(level.replace(/\:|\?/g, '')); }
            });
            
            return output;
        };
        
        return {
            getRegExp : getRegExp,
            getParams : getParams
        };
    })();
    
    var HashbangProvider = (function (win) {
        var listeners = [];
        
        var globalListener = function () {
            notifyListeners();
        };
        
        var init = function () {
            location.hash = location.hash || '/';
            win.addEventListener('hashchange', globalListener, false);
        };
        
        var stop = function () {
            win.removeEventListener('hashchange', globalListener);
            listeners = [];
        };
        
        var notifyListeners = function () {
            listeners.forEach(function (callback) {
                callback(location.hash.substring(1));
            });
        };
        
        var listen = function (callback) {
            listeners.push(callback);
        };
        
        var go = function (path) {
            win.location.hash = path;
        };
        
        return {
            init : init,
            stop : stop,
            listen : listen,
            go : go
        };
    })(win);
    
    var HTML5Provider = (function (win) {
        var basePath = '',
            listeners = [];
            
        var globalListener = function () {
            notifyListeners();
        };
        
        var init = function (base) {
            basePath = base;
            win.addEventListener('popstate', globalListener, false);
        };
        
        var stop = function () {
            win.removeEventListener('popstate', globalListener);
            basePath = '';
            listeners = [];
        };
        
        var prependBase = function (path) {
            return ('/' + basePath + '/' + path).replace('//', '/');
        };
        
        var cleanPath = function (path) {
            return path.replace(basePath, '').replace('//', '/');
        };
        
        var notifyListeners = function () {
            listeners.forEach(function (callback) {
                callback(cleanPath(location.pathname.replace(basePath, '')));
            });
        };
        
        var isSupported = (function (win) {
            return !!(win.history && win.history.pushState);
        })(win);
        
        var listen = function (callback) {
            listeners.push(callback);
        };
        
        var go = function (path) {
            win.history.pushState(null, '', prependBase(path));
            notifyListeners();
        };
        
        return {
            init : init,
            stop : stop,
            isSupported : isSupported,
            listen : listen,
            go : go
        };
    })(win);
    
    var RouterProvider = (function (HTML5Provider, HashbangProvider) {
        return HTML5Provider.isSupported ? HTML5Provider : HashbangProvider;
    })(HTML5Provider, HashbangProvider);
    
    var Context = function (location, title, state, params) {
        this.location = location || '';
        this.title = title || '';
        this.state = state || {};
        this.params = params || {};
    };
    
    var SpecialRoutes = (function () {
        var routes = {};
        
        var add = function (name, action) {
            routes[name] = action;
        };
        
        var trigger = function (name, context) {
            if (typeof routes[name] !== 'undefined') {
                routes[name](context);
            }
        };
        
        return {
            add : add,
            trigger : trigger
        };
    })();
    
    var routes = [],
        basePath = '',
        specialRouteRegexp = /^@.+$/;
        
    var providerListener = function (url) {
        var regexp,
            paramsArray,
            params = {},
            context,
            found = false;
        
        routes.forEach(function (route) {
            regexp = Parser.getRegExp(route.definition);
            
            if (!regexp.test(url)) { return; }
            
            found = true;
            paramsArray = Parser.getParams(route.definition);
            
            paramsArray.forEach(function (param, index) {
                params[param] = url.replace(regexp, '$' + (index + 1));
            });
            
            context = new Context(url, '', {}, params);
            Object.freeze(context);
            
            route.callback(context);
        });
        
        if (!found) {
            context = new Context(url, '', {}, params);
            Object.freeze(context);
            SpecialRoutes.trigger('404', context);
        }
    };
    
    var route = function (definition, callback) {
        if (typeof definition === 'function') {
            SpecialRoutes.add('404', definition);
            return;
        }
        
        if (specialRouteRegexp.test(definition)) {
            SpecialRoutes.add(definition.substring(1), callback);
            return;
        }
        
        routes.push({
            definition : definition,
            callback : callback
        });
    };
    
    var go = function (path, context) {
        if (specialRouteRegexp.test(path)) {
            SpecialRoutes.trigger(path.substring(1), context);
            return;
        }
        
        RouterProvider.go(path);
    };
    
    var base = function (path) {
        basePath = path;
        RouterProvider.init(basePath);
    };
    
    var switchProvider = function () {
        RouterProvider.stop();
        
        RouterProvider = RouterProvider.isSupported === undefined ?
                             HTML5Provider : HashbangProvider;

        RouterProvider.init(basePath);
        RouterProvider.listen(providerListener);
    };
    
    win.router = {
        route : route,
        go : go,
        base : base,
        switchProvider : switchProvider
    };
    
    //wait for finishing routes definition
    win.setTimeout(function () {
        RouterProvider.init(basePath);
        RouterProvider.listen(providerListener);
    }, 0);
    
})(window);