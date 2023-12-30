import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import React from "react";

const UserListItem = ({ handleFunction, user }) => {

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{ backgorund: "#38B2AC", color: "white" }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px="4"
      py="3"
      md="2"
      borderRadius="1g"
    >
      <Avatar mr={2} size="sm" name={user.name} src={user.pic} />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
