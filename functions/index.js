
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


exports.newUserSignup = functions.auth.user().onCreate((user)=> {
   return admin.firestore().collection('users').doc(user.uid).set({
        upVotedOn: [],
        downVotedOn: []
    })
});

exports.addRequest = functions.https.onCall((data, context) => {
    return admin.firestore().collection('requests').add({
        text: data.text,
        songN: data.songN,
        upVotes: 0,
        downVotes: 0,
        showGreen: false
    });
});

exports.upvote = functions.https.onCall(async (data, context) => {
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);

    const doc = await user.get();

    if(doc.data().upVotedOn.includes(data.id)) {
        throw new functions.https.HttpsError(
            'failed-precondition', 'You can only upvote a song once'
        );
    }
    await user.update({
        upVotedOn: [...doc.data().upVotedOn, data.id]
    });

    return request.update({
        upVotes: admin.firestore.FieldValue.increment(1),
        showGreen: true
    });
});

exports.downvote = functions.https.onCall(async (data, context) => {
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);

    const doc = await user.get();

    if(doc.data().downVotedOn.includes(data.id)) {
        throw new functions.https.HttpsError(
            'failed-precondition', 'You can only downvote a song once'
        );
    }
    await user.update({
        downVotedOn: [...doc.data().upVotedOn, data.id]
    });
    
    return request.update({
        downVotes: admin.firestore.FieldValue.increment(1)
    });
});

exports.upColored = functions.https.onCall(async (data, context) => {
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);

    const doc = await user.get();

    if(doc.data().upVotedOn.includes(data.id)) {
        await request.update({
            showGreen: true
        });
        throw new functions.https.HttpsError(
            'failed-precondition', 'You can only downvote a song once'
        );
    }
});
