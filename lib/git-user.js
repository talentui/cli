//读取用户的git信息：name && email
const exec = require('child_process').execSync

let name
let email
let nameEmail
try {
	name = exec('git config --get user.name')
	email = exec('git config --get user.email')
} catch (e) {}

name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
email = email && (' <' + email.toString().trim() + '>')
nameEmail = (name || '') + (email || '')
module.exports = {
	userName: name,
	email:email,
	nameEmail:nameEmail
}