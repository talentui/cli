const path = require("path");
const metadata = require("read-metadata");
const exists = require("fs").existsSync;
const {
    userName,
    email,
    nameEmail
} = require("./git-user");
const validateName = require("validate-npm-package-name");
global['talentui_info'] = {};
/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */

module.exports = function options(name, dir) {
    const opts = getMetadata(dir);
    
    setDefault(opts, "name", name);
    setDefault(opts, "version", "1.0.0");
    setDefault(opts, "author name", userName || '');
    setDefault(opts, "author email", email || '');
    if(global['talentui_info']['pbComponents']){
        setDefault(opts, "appId", "");
    }
    if(global['talentui_info']['talentjs_component']){
        setDefault(opts, 'maintainers name', userName);
        setDefault(opts, 'maintainers email', email);
    }
    setDefault(opts, "repositor type", "git");
    setDefault(opts, "repository url", `https://github.com/${userName}/${name}.git`);
    setDefault(opts, "bugs url", `https://github.com/${userName}/${name}/issues`);
    setDefault(opts, "homePage", `https://github.com/${userName}/${name}#readme`)
    setValidateName(opts);
    setDefault(opts, "description", "");


    return opts;
};

/**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */

function getMetadata(dir) {
    const json = path.join(dir, "meta.json");
    const js = path.join(dir, "meta.js");
    let opts = {};

    if (exists(json)) {
        opts = metadata.sync(json);
    } else if (exists(js)) {
        const req = require(path.resolve(js));
        if (req !== Object(req)) {
            throw new Error("meta.js needs to expose an object");
        }
        opts = req;
    }

    return opts;
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */

function setDefault(opts, key, val) {
    if (opts.schema) {
        opts.prompts = opts.schema;
        delete opts.schema;
    }
    const prompts = opts.prompts || (opts.prompts = {});
    global['talentui_info'][key] = val;
    if (!prompts[key] || typeof prompts[key] !== "object") {
        prompts[key] = {
            type: "string",
            default: val
        };
    } else {
        prompts[key]["default"] = val;
    }
}

function setValidateName(opts) {
    const name = opts.prompts.name;
    const customValidate = name.validate;
    name.validate = name => {
        const its = validateName(name);
        if (!its.validForNewPackages) {
            const errors = (its.errors || []).concat(its.warnings || []);
            return "Sorry, " + errors.join(" and ") + ".";
        }
        if (typeof customValidate === "function") return customValidate(name);
        return true;
    };
}