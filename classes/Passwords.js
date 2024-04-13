class Password {
    #password;

    /**
     * @param {String} password 
     */
    constructor(password) {
        this.#password = password;
    }

    /**
     * Returns true if guess matches password, else false.
     * 
     * @param {String} guess
     * @returns {Boolean}
     */
    guessPassword(guess) {
        return this.#password === guess;
    }
}

module.exports.Admin = new Password(process.env.ADMIN_PASSWORD);

module.exports.TrustedUser = new Password(process.env.TRUSTED_USER_PASSWORD);