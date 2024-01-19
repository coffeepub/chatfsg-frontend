import { Box, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import axios from 'axios';
import { baseUrl } from '../config';
import { Button } from '@chakra-ui/button';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { Stack } from '@chakra-ui/layout';
import { Text } from '@chakra-ui/layout';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  // Initialize chats as an empty array
  const {
    selectedChat,
    setSelectedChat,
    users,
    chats, //: initialChats
    setChats,
  } = ChatState();

  //const [chats, setLocalChats] = useState(initialChats || []);

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${users.token}`,
        },
      };
      const { data } = await axios.get(baseUrl + `/api/chats`, config);
      //console.log('fetchChats data', data);
      // Ensure that data is always an array
      setChats(Array.isArray(data) ? data : []);
      //setLocalChats(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: 'Error Occured',
        description: 'Failed to Load the Chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'block' }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      width={{ base: '100%', md: '31%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        paddingBottom="2rem"
        paddingX="1rem"
        fontSize={{ base: '28px', md: '30px' }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        color={'black'}
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        width="100%"
        display="flex"
        flexDir="column"
        borderRadius="lg"
        overflow="hidden"
        padding={3}
        background="#F8F8F8"
      >
        {chats.length > 0 ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                background={selectedChat === chat ? '#3B82F6' : '#E8E8E8'}
                color={selectedChat === chat ? 'white' : 'black'}
                width="100%"
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                _hover={{ background: '#F0F0F0' }}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
