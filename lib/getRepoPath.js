const {
    TYPE_COMPOENT,
    TYPE_PB_COMPONENTS,
    TYPE_PROJECT
} = require("./constants");

const projectPath = {
    vue: "talentui/vue-project-template",
    react: "neove/project-template"
};

module.exports = function(type, engine) {
    if (type === TYPE_COMPOENT) {
        return "talentui/component-template";
    }
    if (type === TYPE_PROJECT) {
        return projectPath[engine];
    }
    if (type === TYPE_PB_COMPONENTS) {
        return 'talentui/pb-components-templates';
    }
};
