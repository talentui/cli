const repoObj = {
    "vue":"neove/vue-project-template",
    "react": "neove/project-template"
}
module.exports = function(key){
    return repoObj[key];
}