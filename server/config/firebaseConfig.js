import admin from 'firebase-admin';

export const initializeFirebase = async () => {
    const serviceAccountKey = await import("../prepinsights-523c5-firebase-adminsdk-7wqhl-4b30957308.json", {
        assert: { type: "json" }
    });
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey.default),
    });
};

export const getFirebaseAdmin = () => {
    return admin;
};
