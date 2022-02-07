import React, { useState, useEffect } from "react";
import "./App.scss";
import api from "./services/api";

//Icones
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

//components
import ChatListItem from "./components/ChatListItem";
import ChatIntro from "./components/ChatIntro";
import ChatWindow from "./components/ChatWindow";
import NewChat from "./components/NewChat";
import Login from "./components/Login";

export default function App() {
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState({});
  const [user, setUser] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (user !== null) {
      let unsub = api.onChatList(user.id, setChatList);
      return unsub;
    }
  }, [user]);

  function handleNewChat() {
    setShowNewChat(true);
  }

  async function handleLoginData(u) {
    let newUser = {
      id: u.uid,
      name: u.displayName,
      avatar: u.photoURL,
    };

    await api.addUser(newUser);
    setUser(newUser);
  }

  if (user === null) {
    return <Login onRecive={handleLoginData} />;
  } else {
    return (
      <div className="app-window">
        <div className="sidebar">
          <NewChat
            showNewChat={showNewChat}
            setShowNewChat={setShowNewChat}
            user={user}
            chatList={chatList}
          />
          <header>
            <img src={user.avatar} alt="" className="header--avatar" />
            <div className="header--buttons">
              <div className="header--btn">
                <DonutLargeIcon style={{ color: "#919191" }} />
              </div>
              <div className="header--btn">
                <ChatIcon
                  style={{ color: "#919191" }}
                  onClick={handleNewChat}
                />
              </div>
              <div className="header--btn">
                <MoreVertIcon style={{ color: "#919191" }} />
              </div>
            </div>
          </header>
          <div className="search">
            <div className="search--input">
              <SearchIcon fontSize="small" style={{ color: "#919191" }} />
              <input
                type="search"
                placeholder="Procurar ou começar uma nova conversa"
              />
            </div>
          </div>
          <div className="chatlist">
            {chatList.map((item, key) => (
              <ChatListItem
                key={key}
                data={item}
                active={activeChat.chatId === chatList[key].chatId}
                onClick={() => setActiveChat(chatList[key])}
              />
            ))}
          </div>
        </div>
        <div className="contentarea">
          {activeChat.chatId !== undefined ? (
            <ChatWindow user={user} data={activeChat} />
          ) : (
            <ChatIntro />
          )}
        </div>
      </div>
    );
  }
}
