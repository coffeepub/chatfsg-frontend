import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useState } from "react";

const ChatPage = () => {
  const { users } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  console.log("user", users);
  return (
    // eslint-disable-next-line
    <div style={{ width: "100%" }}>
      {users && <SideDrawer />}
      <Box
        display="flex"
        justifyContent={"space-between"}
        width="100%"
        h="91.vh"
        p="10px"
        color="white"
      >
        {users && <MyChats fetchAgain={fetchAgain} />}
        {users && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
