import admin from "firebase-admin";
/**
 * @type {admin.app.App}
 */
var firebaseAdmin;

function getFirebaseAdmin() {
    if (!firebaseAdmin) {
        if (admin.apps.length === 0) {
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
            });
        } else {
            if (admin.apps[0]) firebaseAdmin = admin.apps[0];
        }
    }

    return firebaseAdmin;
}

export { getFirebaseAdmin };
