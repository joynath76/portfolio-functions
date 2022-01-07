const admin = require('firebase-admin');

var serviceAccount = require("./portfolio-app-d2190-487c62d9d58f.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://portfolio-app-d2190.firebaseio.com"
// });
admin.initializeApp();
const db = admin.firestore();

module.exports = { admin, db};