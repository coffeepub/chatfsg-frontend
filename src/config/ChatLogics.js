export const getSender = (loggedUser, users) => {
  console.log("loggedUser", loggedUser);
  console.log("users", users);
  // return alternate user name
  return users[0]._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
};

export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (m, i, userId) => {
  return userId === m.sender._id;
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender.id
  );
};
