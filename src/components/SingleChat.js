import { ArrowBackIcon } from '@chakra-ui/icons';
import { Input } from '@chakra-ui/input';
import {
  Box,
  FormControl,
  IconButton,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ChatState } from '../Context/ChatProvider';
import { baseUrl } from '../config';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ScrollableChat from './ScrollableChat';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import './styles.css';
import { set } from 'mongoose';
import bing from '../audio/bing.mp3';

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const audio = new Audio(bing);

  useEffect(() => {
    // audio.play();
  });

  const toast = useToast();
  const {
    users,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${users.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        baseUrl + `/api/messages/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      toast({
        title: 'Error Occured',
        description: 'Failed to fetch messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${users.token}`,
          },
        };
        setNewMessage('');
        const { data } = await axios.post(
          baseUrl + `/api/messages`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit('new message', data);

        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: 'Error Occured',
          description: 'Failed to send message',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
      }
    }
  };

  useEffect(() => {
    socket = io(baseUrl);
    socket.emit('setup', users);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on('message received', (newMessageRecieved) => {
      //play
      audio.play();

      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([...notification, newMessageRecieved]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing Indicator Logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  /*
  const handleRemove = async (user1) => {
    //error is here=============
    if (selectedChat.groupAdmin._id !== users._id && user1._id !== users._id) {
      toast({
        title: 'Only Admin can remove users',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }
    try {
      console.log('selectedChat', selectedChat);
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${users.token}`,
        },
      };
      const { data } = await axios.put(
        baseUrl + `/api/chats/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      user1._id === users._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error Occured!',
        description: '', //error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };
*/
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: 'space-between' }}
            alignItems="center"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              color="black"
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {/* <Button onClick={handleRemove(users)}>Leave Group</Button> */}
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(users, selectedChat.users)}
                <ProfileModal
                  loggedInUser={users._id}
                  users={getSenderFull(users, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDirection={'column'}
            justifyContent="flex-end"
            p={3}
            background="#E8E8E8"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div style={{ maxHeight: '255px' }}>
                <ScrollableChat messages={messages} isTyping={isTyping} />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              isRequired
              style={{ position: 'relative', height: '60px' }}
            >
              <Input
                style={{ position: 'absolute', bottom: 0 }}
                variant={'filled'}
                background={'#E0E0E0E0'}
                placeholder="Enter your message here"
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Text>Click on a user to start Chatting</Text>
        </Box>
      )}
    </>
  );
};
export default SingleChat;
