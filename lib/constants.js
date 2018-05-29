const chalk = require('chalk');

//这个主要用于用户提示选取列表
const TALENTUI_PROJECT = '项目'
const TALENTUI_COMPONENT = '组件'
const TALENTUI_PB_COMPONENTS = 'pageBuilder组件包开发'
const TALENTUI_DLL_BUILDER = '打包dll的模版项目'
const TALENTJS_COMPONENT = '组件项目'//袁园姐的模版

//type的主要用于拼接生成临时下载路径
const TYPE_COMPOENT = 'component'
const TYPE_PROJECT = 'project'
const TYPE_PB_COMPONENTS = 'page-builder-components'
const TYPE_DLL_BUILDER = 'dll-builder'
const TYPE_TALENTJS_COMPONENT = 'talent-js-componet'
module.exports = {
    TALENTUI_PB_COMPONENTS,
    TALENTUI_PROJECT,
    TALENTUI_COMPONENT,
    TALENTUI_DLL_BUILDER,    
    TYPE_COMPOENT,
    TYPE_PB_COMPONENTS,
    TYPE_PROJECT,
    TYPE_DLL_BUILDER,
    TALENTJS_COMPONENT,
    TYPE_TALENTJS_COMPONENT
}