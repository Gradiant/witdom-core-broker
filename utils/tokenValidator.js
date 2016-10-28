module.exports.validateToken = function(user, token) {
    if (user == undefined) return false;
    else if (user == token) return true;
    return false;
}