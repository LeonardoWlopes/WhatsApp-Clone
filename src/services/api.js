import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import firebaseConfig from "./firebaseConfig";

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

export default {
  GhPopUp: async () => {
    var provider = new firebase.auth.GithubAuthProvider();
    let result = await firebaseApp.auth().signInWithPopup(provider);
    return result;
  },
  addUser: async (u) => {
    await db.collection("Users").doc(u.id).set(
      {
        name: u.name,
        avatar: u.avatar,
      },
      { merge: true }
    );
  },
  getContactList: async (userId) => {
    let list = [];

    let results = await db.collection("Users").get();
    results.forEach((result) => {
      let data = result.data();
      if (result.id !== userId) {
        list.push({
          id: result.id,
          name: data.name,
          avatar: data.avatar,
        });
      }
    });

    return list;
  },
  addNewChat: async (user, user2) => {
    let userData = await db.collection("Users").doc(user.id).get();

    let parsedData = userData.data();

    if (!parsedData.chats) {
      addItem();
    } else {
      let exist = parsedData.chats.map((item) => item.title === user2.name);
      if (!exist) {
        addItem();
      }
    }

    async function addItem() {
      let newChat = await db.collection("Chats").add({
        messages: [],
        users: [user.id, user2.id],
      });

      db.collection("Users")
        .doc(user.id)
        .update({
          chats: firebase.firestore.FieldValue.arrayUnion({
            chatId: newChat.id,
            title: user2.name,
            image: user2.avatar,
            with: user2.id,
          }),
        });

      db.collection("Users")
        .doc(user2.id)
        .update({
          chats: firebase.firestore.FieldValue.arrayUnion({
            chatId: newChat.id,
            title: user.name,
            image: user.avatar,
            with: user.id,
          }),
        });
    }
  },
  onChatList: (userId, setChatList) => {
    return db
      .collection("Users")
      .doc(userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          let data = doc.data();
          if (data.chats) {
            // let chats = [...data.chats];

            // chats.sprt((a, b) => {
            //   if (a.lastMessageDate === undefined) {
            //     return -1;
            //   }
            //   if (a.lastMessageDate === undefined) {
            //     return -1;
            //   }
            //   if (a.lastMessageDate.seconds < b.lastMessageDate.seconds) {
            //     return 1;
            //   } else {
            //     return -1;
            //   }

            // });
            setChatList(data.chats);
          }
        }
      });
  },
  onChatContent: (chatId, setList, setUsers) => {
    return db
      .collection("Chats")
      .doc(chatId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          let data = doc.data();
          setList(data.messages);
          setUsers(data.users);
        }
      });
  },

  sendMessage: async (chatData, userId, type, body, users) => {
    let now = new Date();

    db.collection("Chats")
      .doc(chatData.chatId)
      .update({
        messages: firebase.firestore.FieldValue.arrayUnion({
          type,
          author: userId,
          body,
          date: now,
        }),
      });

    for (let i in users) {
      let u = await db.collection("Users").doc(users[i]).get();
      let uData = u.data();
      if (uData.chats) {
        let chats = [...uData.chats];

        for (let e in chats) {
          if (chats[e].chatId == chatData.chatId) {
            chats[e].lastMessage = body;
            chats[e].lastMessageDate = now;
          }

          await db.collection("Users").doc(users[i]).update({
            chats,
          });
        }
      }
    }
  },
};
