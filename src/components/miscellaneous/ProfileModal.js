import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Image, Text } from "@chakra-ui/react";
import axios from "axios";
import { baseUrl } from "../../config";
import { useNavigate } from "react-router-dom";

const ProfileModal = ({ users, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const setupEditMode = () => {
    setIsEditMode(true);
    setName(users.name);
    setEmail(users.email);
    setPic(users.pic);
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "fsg_image");
      data.append("cloud_name", "die8agkfv");
      axios
        .post("https://api.cloudinary.com/v1_1/die8agkfv/image/upload", data)
        .then((response) => {
          console.log("Cloudinary response:", response);
          setPic(response.data.url.toString());
          setLoading(false);
          toast({
            title: "Image uploaded successfully!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        })
        .catch((error) => {
          console.log("Cloudinary error:", error);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    if (!name || !email) {
      toast({
        title: "Please Fill all the Fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${users.token}`,
        },
      };
      const url = baseUrl + `/api/user/update`;
      console.log("url", url);
      const { data } = await axios.post(url, { name, email, pic }, config);
      toast({
        title: "Changes Successfully saved!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      console.log("data", data);
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...users,
          name: data.name,
          email: data.email,
          pic: data.pic,
        })
      );

      setLoading(false);
      navigate("/chats");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {!isEditMode && users.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            {!isEditMode ? (
              <>
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={users.pic}
                  alt={users.name}
                  margin="10px"
                />

                <Text
                  fontSize={{ base: "28px", md: "30px" }}
                  fontFamily={"Work sans"}
                  margin="10px"
                >
                  Email: {users.email}
                </Text>
              </>
            ) : (
              <>
                <FormControl id="first-name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Enter Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                <FormControl id="email" isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>

                <FormControl id="pic">
                  <Image
                    borderRadius="full"
                    boxSize="150px"
                    src={pic}
                    alt={name}
                    margin="10px"
                  />

                  <FormLabel>Upload your Picture</FormLabel>
                  <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {isEditMode && (
              <Button
                colorScheme="blue"
                m={2}
                onClick={handleSaveChanges}
                disabled={loading}
              >
                Save Changes
              </Button>
            )}

            {!isEditMode && (
              <Button colorScheme="blue" m={2} onClick={setupEditMode}>
                Edit Profile
              </Button>
            )}

            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
