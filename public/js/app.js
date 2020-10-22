var form = document.querySelector(".form101");
var spotifyInput = document.getElementById("spotifyembd");
var songName = document.getElementById("songname");
var spotifyEmbed = document.getElementById("spotifyEmbed");
var songTitle = document.getElementById("title");
let up = document.getElementById("up");
let down = document.getElementById("down");

var app = new Vue({
  el: "#unitWrapper",
  data: {
    requests: [],
  },
  methods: {
    upV(id) {
      const upvote = firebase.functions().httpsCallable("upvote");
      upvote({ id: id }).catch((err) => {
        showNotification();
      });
    },
    downV(id) {
      const downvote = firebase.functions().httpsCallable("downvote");
      downvote({ id: id }).catch((err) => {
        showNotification();
      });
    },
  },
  created() {
    const ref = firebase
      .firestore()
      .collection("requests")
      .orderBy("upVotes", "desc");
    ref.onSnapshot((snapshot) => {
      let requests = [];
      snapshot.forEach((doc) => {
        var obj = {};
        obj = {
          ...doc.data(),
          id: doc.id,
        };
        var user = firebase.auth().currentUser;
        if (user != null) {
          firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get()
            .then((val) => {
              if (val.exists) {
                if (val.data().upVotedOn.includes(doc.id)) {
                  obj.isUpvoted = true;
                } else if (val.data().downVotedOn.includes(doc.id)) {
                  obj.isDownvoted = true;
                } else {
                  obj.isUpvoted = false;
                  obj.isDownvoted = false;
                }
              } else {
                obj.isUpvoted = false;
                obj.isDownvoted = false;
              }
              requests.push(obj);
            })
            .catch((err) => console.log(err));
        } else {
          obj.isUpvoted = false;
          obj.isDownvoted = false;
          requests.push(obj);
        }
      });

      // console.log(requests);
      this.requests = requests;
    });
  },
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  var songInput = `https://open.spotify.com/embed/track/${spotifyInput.value}`;

  const addRequest = firebase.functions().httpsCallable("addRequest");
  addRequest({
    text: songInput,
    songN: songName.value,
  }).then(() => {
    form.reset();
  });
});

const notification = document.querySelector(".notification");
const showNotification = () => {
  notification.textContent = "You can only upvote or downvote a song once";
  notification.classList.add("active");
  setTimeout(() => {
    notification.classList.remove("active");
    notification.textContent = "";
  }, 4000);
};
