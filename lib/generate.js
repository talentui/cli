const chalk = require("chalk");
const Metalsmith = require("metalsmith");
const Handlebars = require("handlebars");
const async = require("async");
const render = require("consolidate").handlebars.render;
const path = require("path");
const multimatch = require("multimatch");
const getOptions = require("./options");
const ask = require("./ask");
const filter = require("./filter");
const logger = require("./logger");

// register handlebars helper
Handlebars.registerHelper("if_eq", function(a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper("unless_eq", function(a, b, opts) {
    return a === b ? opts.inverse(this) : opts.fn(this);
});

/**
 * Generate a template given a `src` and `dest`.
 *
 * @param {String} name 项目目录名称
 * @param {String} src  下载模版的临时路径
 * @param {String} dest 项目目录路径
 * @param {Function} done 回调函数  用于在项目生成之后在终端输出一些提示信息
 */

module.exports = function generate(name, src, dest, done) {
    const opts = getOptions(name, src); //读取一些配置信息  如git
    const metalsmith = Metalsmith(path.join(src)); //读取临时文件内下载的项目模版信息
    const data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
    });
    opts.helpers &&
        Object.keys(opts.helpers).map(key => {
            Handlebars.registerHelper(key, opts.helpers[key]);
        });

    const helpers = { chalk, logger };

    if (opts.metalsmith && typeof opts.metalsmith.before === "function") {
        opts.metalsmith.before(metalsmith, opts, helpers);
    }

    metalsmith
        .use(askQuestions(opts.prompts))
        .use(filterFiles(opts.filters))
        .use(renderTemplateFiles(opts.skipInterpolation));

    if (typeof opts.metalsmith === "function") {
        opts.metalsmith(metalsmith, opts, helpers);
    } else if (opts.metalsmith && typeof opts.metalsmith.after === "function") {
        opts.metalsmith.after(metalsmith, opts, helpers);
    }

    metalsmith
        .clean(false)
        .source(".") // start from template root instead of `./src` which is Metalsmith's default for `source`
        .destination(dest)
        .build((err, files) => {
            done(err);
            if (typeof opts.complete === "function") {
                const helpers = { chalk, logger, files };
                opts.complete(data, helpers);
            } else {
                logMessage(opts.completeMessage, data);
            }
        });

    return data;
};

/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */

function askQuestions(prompts) {
    return (files, metalsmith, done) => {
        ask(prompts, metalsmith.metadata(), done);
    };
}

/**
 * Create a middleware for filtering files.
 *
 * @param {Object} filters
 * @return {Function}
 */

function filterFiles(filters) {
    return (files, metalsmith, done) => {
        filter(files, filters, metalsmith.metadata(), done);
    };
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function renderTemplateFiles(skipInterpolation) {
    skipInterpolation =
        typeof skipInterpolation === "string"
            ? [skipInterpolation]
            : skipInterpolation;
    return (files, metalsmith, done) => {
        const keys = Object.keys(files);
        const metalsmithMetadata = metalsmith.metadata();
        async.each(
            keys,
            (file, next) => {
                // skipping files with skipInterpolation option
                if (
                    skipInterpolation &&
                    multimatch([file], skipInterpolation, { dot: true }).length
                ) {
                    return next();
                }
                const str = files[file].contents.toString();
                // do not attempt to render files that do not have mustaches
                if (!/{{([^{}]+)}}/g.test(str) &&  !/'package.json'|'vender-list.js'/g.test(file)) {
                    return next();
                }
                render(str, metalsmithMetadata, (err, res) => {
                    if (err) {
                        err.message = `[${file}] ${err.message}`;
                        return next(err);
                    }
                    if (file === "package.json") {
                        const packageFile = generatePackageJson(res);
                        files[file].contents = new Buffer(packageFile);
                        return next();
                    }
                    //如果是dll项目的话
                    if (file === "vender-list.js" && global["talentui_info"]["dllList"]) {
                        const dllListFile = renderDllListFile(res);
                        files[file].contents = new Buffer(dllListFile);
                        return next();
                    }
                    files[file].contents = new Buffer(res);
                    next();
                });
            },
            done
        );
    };
}
function renderDllListFile(res){

  const str = global["talentui_info"]["dllList"].map(item => `"${item.split('@')[0]}"`).toString()
  return `module.exports = [${str}];`
}
function generatePackageJson(res) {
    let contentJson = JSON.parse(res);
    let {
        name,
        version,
        author,
        repository_type,
        repository_url,
        bugs_url,
        homePage,
        description
    } = global["talentui_info"];
    contentJson.name = name;
    contentJson.version = version;
    contentJson.author = author;
    contentJson.repository = {
        type: repository_type,
        url: repository_url
    };
    contentJson.bugs = {
        url: bugs_url
    };
    contentJson.homepage = homePage;
    contentJson.description = description;
    //如果是打包dll的项目
    if (global["talentui_info"]["dllList"]) {
      let dllList = global["talentui_info"]["dllList"];
      dllList.map(item => {
        let name = item.split('@')[0];
        let version = item.split('@')[1];
        contentJson.devDependencies[name] = version;
        contentJson.peerDependencies[name] = version;        
      })
    }
    return JSON.stringify(contentJson, null, 4);
}
/**
 * Display template complete message.
 *
 * @param {String} message
 * @param {Object} data
 */

function logMessage(message, data) {
    if (!message) return;
    render(message, data, (err, res) => {
        if (err) {
            console.error(
                "\n   Error when rendering template complete message: " +
                    err.message.trim()
            );
        } else {
            console.log(
                "\n" +
                    res
                        .split(/\r?\n/g)
                        .map(line => "   " + line)
                        .join("\n")
            );
        }
    });
}
