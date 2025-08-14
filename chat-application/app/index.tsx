import { Text, View } from "react-native";
import "../global.css";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
const socket = io("http://localhost:5000");



export default function Index() {
  const router = useRouter();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.push("./screens/home");
      } else {
        router.push("./screens/Chats");
         socket.on("connection", () => {
    console.log("Connected to server");
    socket.on("user_online", (data) => {
    console.log("User online:", data);
  });
  });

      }
    };
    checkAuth();
  }, []);
 







  
  useEffect(() => {
 

  


  socket.on("user_typing", (data) => {
    console.log("User typing:", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
  };
}, []);

  return (
    <>
      <Text>Hello</Text>
    </>
  );
}
