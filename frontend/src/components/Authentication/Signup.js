import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react';
import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import axios from "axios";

const Signup = () => {

    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [picloading, setPicLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleClick = () => setShow(!show);


    const postDetails = (pics) =>{
        setPicLoading(true);
        if(pics === undefined){
            toast({
                title: 'Please Select an Image!',
                status: 'warning',
                duration: 1700,
                isClosable: true,
              });
              return;
        }
        console.log(pics);
        if(pics.type === "image/jpeg" || pics.type === "image/png"){
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "Mern Chat");
            data.append("cloud_name", "codewithharry");

            fetch("https://api.cloudinary.com/v1_1/codewithharry/image/upload", {
                method : "post",
                body : data,
            }).then((res) => res.json())
              .then((data) => {
                setPic(data.url.toString());
                console.log(data.url.toString());
                setPicLoading(false);
            })
            .catch((err) =>{
                console.log(err);
                setPicLoading(false);
            })
        }
        else{
            toast({
                title: 'Please Select an Image!',
                status: 'warning',
                duration: 1700,
                isClosable: true,
              });
              setPicLoading(false);
              return;
        }
    }
    
    const submitHandler = async () =>{
        setPicLoading(true);
        if(!name || !email || !password || !confirmPassword){
            toast({
                title: 'Please Fill all the fields!',
                status: 'warning',
                duration: 1700,
                isClosable: true,
              });
              setPicLoading(false);
              return;   
        }
        
        if(password !== confirmPassword){
            toast({
                title: 'Passwords Do not Match!',
                status: 'warning',
                duration: 1700,
                isClosable: true,
              });
              return;
        }
        console.log(name, email, password, pic);
        try {
            const config = {
                headers : {
                    "Content-type" : "application/json"
                }
            };
            const {data} = await axios.post("/api/user", {name, email, password, pic}, config);
            console.log(data);  
            toast({
                title: 'Registration Successful!',
                status: 'success',
                duration: 1700,
                isClosable: true,
              });
              localStorage.setItem("userInfo", JSON.stringify(data));
              setPicLoading(false);
              navigate("/chats");
              
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 1700,
                isClosable: true,
              });
              setPicLoading(false);
        }
    }    

  return (
    <VStack spacing="5px" color="black">
        <FormControl id="first-name" isRequired>
            <FormLabel>Name</FormLabel>
                <Input placeholder="Enter your name" onChange={(e) => setName(e.target.value)}/>
        </FormControl>


        <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
                <Input placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)}/>
        </FormControl>


        <FormControl id={"password"} isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}/>
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" 
                    onClick={handleClick}
                    >
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <FormControl id={"password"} isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder="Enter your password" onChange={(e) => setConfirmPassword(e.target.value)}/>
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" 
                    onClick={handleClick}
                    >
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>


        <FormControl>
            <FormLabel>Upload your Picture</FormLabel>
            <Input type="file" p={1.5} accept="image/*" onChange={(e) => postDetails(e.target.files[0])}/>
        </FormControl>

        <Button colorScheme="blue"  width="100%" style={{marginTop : "15px"}} onClick={submitHandler} isLoading={picloading}>Signup</Button>
    </VStack>
  );
}

export default Signup;
