import React, { useState, useEffect } from "react";
import "./index.scss";
import api from "../../services/api";

//Icones
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function NewChat({
  chatList,
  user,
  showNewChat,
  setShowNewChat,
}) {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function getList() {
      if (user !== null) {
        const result = await api.getContactList(user.id);
        setList(result);
      }
    }
    getList();
  }, [user]);

  const addNewchat = async (user2) => {
    await api.addNewChat(user, user2);

    handleClose()
  };

  function handleClose() {
    setShowNewChat(false);
  }

  return (
    <div className="newChat" style={{ left: showNewChat ? 0 : -415 }}>
      <div className="newChat--header">
        <div className="newChat--backButton">
          <ArrowBackIcon style={{ color: "white" }} onClick={handleClose} />
        </div>
        <div className="newChat--headerTitle">Nova Conversa</div>
      </div>
      <div className="newChat--list">
        {list.map((item, key) => (
          <div
            onClick={() => addNewchat(item)}
            className="newChat--Item"
            key={key}
          >
            <img src={item.avatar} alt="" className="newChat--Itemavatar" />
            <div className="newChat--Itemname">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
