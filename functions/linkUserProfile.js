const fetch = require("node-fetch");
const fs = require('fs');
const API_KEY = "KTD8BXN-57Y4Y7D-PD3JF2D-V5M2KQX";
const PROFILE_KEY = "PROFILE_KEY";

// Read in local private.key files - also can read from a DB
const privateKey = fs.readFileSync('private.key', 'utf8');

fetch("https://app.ayrshare.com/api/profiles/generateJWT", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
        domain: "ACME",          // required
        privateKey,              // required
        profileKey: PROFILE_KEY, // required
    }),
})
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch(console.error);