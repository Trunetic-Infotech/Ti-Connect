import "../global.css";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import TabHomeScreen from "./screens/BottomNavigation/TabHomeScreen";
import { View, Text, ActivityIndicator } from "react-native";
import { setOnlineUsers, setUser } from "./redux/features/auth";
// import { setSocket } from "./redux/features/socketSlice";
import {connectSocket, disconnectSocket} from "./services/socketService";


export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
const user = useSelector((state) => state.auth?.user);
const isloggedIn = useSelector((state) => state.auth?.isloggedIn);
  const dispatch = useDispatch();
  const UserProfile = async () => {
    try {
      // 1. Load token from SecureStore
        const token = await SecureStore.getItemAsync("token");
      if (!token) {
        console.log("No token found → redirecting to login");
        router.replace("/screens/home"); 
        return;
      }

      console.log("User Token:", token);

      const response = await axios.get(`${process.env.EXPO_API_URL}/users/profile`, {
        headers: {
        Authorization: `Bearer ${token}`
      },
      });

      // console.log("User profile fatch",response);
      
    if (response.status === 200 && response.data?.data) {
      const user = response.data.data;
      dispatch(setUser(user));
          dispatch(setOnlineUsers(user)); // only user object
             connectSocket(user.id); // connect socket with user id
 
        } else {
          console.error("Failed to fetch user profile");
          router.replace("/screens/home");
        }
      } catch (err) {
        console.error("AuthController error:", err);
        router.replace("/screens/home");
      } finally {
        setLoading(false);
      }
  };
 
  useEffect(() => {
    UserProfile();
  }, []);
  
  useEffect(() => {
    if(user){
      const socket =  connectSocket(user.id);

    socket.on("getOnlineUsers",(user) => {
      dispatch(setOnlineUsers(user));
    })

    return() =>disconnectSocket();

    }
  },[user]);

 if(isloggedIn && !user?.id){
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0000ff" />
      <Text className="mt-2">Loading...</Text>
    </View>
  );
 }


  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <TabHomeScreen />
      <Text className="mt-2"/>
    </>
  );
}