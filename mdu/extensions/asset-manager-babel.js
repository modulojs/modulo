/*
    Babel transpiling for Modulo 

    This patches the AssetManager to support transpiling of JS code using
    Babel. This can be enabled by passing an option "babel" when registering
    the function, which is in turn used as the Babel config object.
*/

modulo.registry.core.AssetManager.prototype.wrapFunctionText = (({ wrapFunctionText }) => {
    //const { wrapFunctionText } = Modulo.AssetManager.prototype;
    return function (params, text, opts = {}, hash = null) {
        if (opts.exports) { // TODO: probably should just do this in base
            text = `var exports = ${ opts.exports }.exports;\n${text}`;
        }

        let result = wrapFunctionText.call(this, params, text, opts, hash);
        if (opts.babel) {
            result = Babel.transform(result, opts.babel).code;
        }
        return result;

        // TODO: Double check that should transform BEFORE wrapping, so its
        // properly silo'ed
        /*
        if (opts.babel) {
            // Always wrap in iffe if it's Babel
            text = `(function () {\n${ text }\n})()`;
            text = Babel.transform(text, opts.babel).code
        }
        return wrapFunctionText.call(this, params, text, opts, hash);
        */
    }
})(modulo.registry.core.AssetManager.prototype);

