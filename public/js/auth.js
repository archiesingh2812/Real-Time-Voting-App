window.addEventListener("load", ()=> {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(function() {
                    firebase.auth().signInAnonymously();
            });
        }
    });
});