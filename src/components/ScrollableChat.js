import { Divider, Tooltip } from '@chakra-ui/react';
import React from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isSameSender } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';
import { isLastMessage } from '../config/ChatLogics';
import { Avatar } from '@chakra-ui/avatar';
import Lottie from 'lottie-react';

import animationData from '../animations/typing.json';

const ScrollableChat = ({ messages, isTyping }) => {
  const { users } = ChatState();

  //console.log(isTyping, "typing....");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div
            style={{
              display: 'flex',
              flexDirection: isSameSender(m, i, users._id)
                ? 'row-reverse'
                : 'row',
            }}
            key={`unique${i}`}
          >
            <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
              <Avatar
                mt="7px"
                mr={1}
                size="sm"
                cursor="pointer"
                name="m.sender.name"
                src={m.sender.pic}
              />
            </Tooltip>
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === users._id ? '#BEE3F8' : '#B9F5D0'
                }`,
                borderRadius: '20px',
                padding: '5px 15px',
                maxWidth: '75%',
                margin: '5px 0',
              }}
            >
              {m.content}
            </span>
          </div>
        ))}

      {isTyping && (
        <div>
          <Lottie
            animationData={animationData}
            loop={true}
            option={defaultOptions}
            style={{
              marginLeft: '10px',
              width: '70px',
              height: '70px',
            }}
          />
        </div>
      )}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
