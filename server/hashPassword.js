const bcrypt = require("bcrypt");

const password = "Tech@1234";  // Your actual password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Hashed Password:", hash);
    }
});
