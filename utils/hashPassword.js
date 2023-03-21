const bcrypt = require('bcryptjs')

exports.hashPassword = async (passWord) => {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(passWord, salt);
    return hash;
}