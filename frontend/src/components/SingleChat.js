import React, { useState, useEffect } from "react";
import { ChatState } from "../context/chatProvider";
import { Box, FormControl, IconButton, Input, Spinner, Text} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import UpdateGroupChatModal from "../components/miscellaneous/UpdateGroupChatModal";
import ProfileModal from "./miscellaneous/ProfileModal";
import { getSender, getSenderFull } from "../components/config/ChatLogic";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "lottie-react";
import animationData from "../animation/Typing.json";

const ENDPOINT = "http://localhost:5200/";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      console.log(data);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 1600,
        isClosable: true,
        position: "bottom",
      });
    }
  };


  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage || event.type === "click" && newMessage) {
        socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        console.log(data);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 1600,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", ()=>{
      setSocketConnected(true);
    })
    socket.on("typing", ()=> setIsTyping(true));
    socket.on("stop typing", ()=> setIsTyping(false));
  }, []);


  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  console.log(notification, "------------------");

  useEffect(()=>{
    socket.on("message received",(newMessageReceived) =>{
      if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        if(!notification.includes(newMessageReceived)){
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      }
      else{
        setMessages([...messages, setNewMessage]);
      }
    })
  })

  

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg="#E8E8E8"
            w={"100%"}
            h="100%"
            borderRadius={"lg"}
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf={"center"}
                margin="auto"
              />
            ) : (
              <div className="messages"style={{display :"flex", flexDirection: "column", overflowY: "scroll",scrollbarWidth: "none"}} >
                <ScrollableChat messages={messages}/>
                </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}
              display="flex"
              justifyContent="space-between"
              w="100%"
            >
              {isTyping ? <div><Lottie options={defaultOptions} width={70} style={{marginBottom: 15, marginLeft: 0}}/></div> : (<></>)}
              <Input
                variant={"filled"}
                bg="#E0E0E0"
                placeholder="Enter a message.."
                onChange={typingHandler}
                value={newMessage}
              />
              <i
                className="fa fa-paper-plane"
                aria-hidden="true"
                style={{
                  padding: "0px",
                  margin: "0px",
                  position: "absolute",
                  right: "20px",
                  bottom: "15px",
                  opacity: "0.5",
                  cursor: "pointer",
                }}
                onClick={sendMessage}
              ></i>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          h="100%"
        >
          <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
            Click on a user to Start Chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
