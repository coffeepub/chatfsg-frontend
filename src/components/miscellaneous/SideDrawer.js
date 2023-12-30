import React, { useState } from "react";
import {
  Avatar,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  MenuItem,
  MenuList,
  Text,
  DrawerBody,
  Input,
  useToast,
} from "@chakra-ui/react";
import { Tooltip, Menu, MenuButton, MenuDivider } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { baseUrl } from "../../config";
import { Spinner } from "@chakra-ui/spinner";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, SetSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    users,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  console.log("notification", notification);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something to search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${users.token}`,
        },
      };
      const { data } = await axios.get(
        baseUrl + `/api/users?search=${search}`,
        config
      );

      setLoading(false);
      setSearchResults(data);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${users.token}`,
        },
      };

      const { data } = await axios.post(
        baseUrl + `/api/chats`,
        { userID: userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error Fetching Chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <FaSearch />
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2x1" fontFamily="Work sans">
          CHAT FSG
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              {notification.length > 0 && (
                <span
                  style={{
                    backgroundColor: "red",
                    borderRadius: "5px",
                    padding: "4px 8px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {notification.length}{" "}
                </span>
              )}
              <BellIcon fontSize="2x1" m="1" />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(users, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={users.name}
                src={users.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal users={users}>
                <MenuItem>MyProfile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Log Out</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
          <DrawerBody>
            <Box display="Flex" paddingBottom={2}>
              <Input
                placeholder="Search Users..."
                mr={2}
                value={search}
                onChange={(e) => SetSearch(e.target.value)}
              />
              <Button ml={2} onClick={handleSearch}>
                <FaSearch />
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResults?.map((users) => (
                <UserListItem
                  key={users._id}
                  user={users}
                  handleFunction={() => accessChat(users._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex " />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
