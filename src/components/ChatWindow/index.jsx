import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import "./index.scss";
import api from "../../services/api";

//Icones
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";

//components
import MessageItem from "../MessageItem";

export default function ChatWindow({ user, data }) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);

  const body = useRef();

  useEffect(() => {
    setList([]);
    let unsub = api.onChatContent(data.chatId, setList, setUsers);
    return unsub;
  }, [data.chatId]);

  useEffect(() => {
    if (body.current.scrollHeight > body.current.offsetHeight) {
      body.current.scrollTop =
        body.current.scrollHeight - body.current.offsetHeight;
    }
  }, [list]);

  let recognition = null;

  let SpeetRecognition =
    window.SpeetRecognition || window.webkitSpeechRecognition;
  if (SpeetRecognition !== undefined) {
    recognition = new SpeetRecognition();
  }

  function handleEmojiClick(e, emojiObject) {
    setText(text + emojiObject.emoji);
  }
  function handleOpenEmoji() {
    setEmojiOpen(true);
  }
  function handleCloseEmoji() {
    setEmojiOpen(false);
  }
  function handleMicClick() {
    if (recognition !== null) {
      recognition.onstart = () => {
        setListening(true);
      };
      recognition.onend = () => {
        setListening(false);
      };
      recognition.onresult = (e) => {
        setText(e.results[0][0].transcript);
      };

      recognition.start();
    }
  }

  function handleInputKeyUp(e) {
    if (e.keyCode == 13) handleSendClick();
  }

  function handleSendClick() {
    if (!!text) {
      api.sendMessage(data, user.id, "text", text, users);
      setText("");
      setEmojiOpen(false);
    }
  }

  return (
    <div className="chatWindow">
      <div className="chatWindow--header">
        <div className="chatWindow--headerinfo">
          <img src={data.image} alt="" className="chatWindow--avatar" />
          <div className="chatWindow--name">{data.title}</div>
        </div>
        <div className="chatWindow--headerbuttons">
          <div className="chatWindow--btn">
            <SearchIcon style={{ color: "#919191" }} />
          </div>
          <div className="chatWindow--btn">
            <AttachFileIcon style={{ color: "#919191" }} />
          </div>
          <div className="chatWindow--btn">
            <MoreVertIcon style={{ color: "#919191" }} />
          </div>
        </div>
      </div>
      <div className="chatWindow--body" ref={body}>
        {list.map((item, key) => (
          <MessageItem key={key} data={item} user={user} />
        ))}
      </div>
      <div
        className="chatWindow--emojiarea"
        style={{ height: emojiOpen ? "300px" : "0px" }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          disableSearchBar
          disableSkinTonePicker
        />
      </div>
      <div className="chatWindow--footer">
        <div className="chatWindow--pre">
          {emojiOpen ? (
            <div className="chatWindow--btn" onClick={handleCloseEmoji}>
              <CloseIcon style={{ color: "#919191" }} />
            </div>
          ) : (
            <div className="chatWindow--btn" onClick={handleOpenEmoji}>
              <InsertEmoticonIcon style={{ color: "#919191" }} />
            </div>
          )}
        </div>
        <div className="chatWindow--inputarea">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            type="text"
            placeholder="Digite uma mensagem"
            className="chatWindow--input"
            onKeyUp={handleInputKeyUp}
          />
        </div>
        <div className="chatWindow--pos">
          {!text ? (
            <div className="chatWindow--btn" onClick={handleMicClick}>
              <MicIcon style={{ color: listening ? "#126ec3" : "#919191" }} />
            </div>
          ) : (
            <div className="chatWindow--btn" onClick={handleSendClick}>
              <SendIcon style={{ color: "#919191" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
