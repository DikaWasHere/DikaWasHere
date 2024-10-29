require("dotenv").config();

const cekJwtSecret = process.env.JWT_SECRET;
console.log(cekJwtSecret, "=> ini valuenya");
