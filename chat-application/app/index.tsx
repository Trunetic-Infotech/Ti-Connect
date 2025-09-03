
import "../global.css";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import * as SecureStore from "expo-secure-store";
import TabHomeScreen from "./screens/BottomNavigation/TabHomeScreen";
import { View, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { setUser } from "./redux/features/auth";


export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

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

      console.log("User profile fatch",response);
      
    if (response.status === 200 && response.data?.data) {
          dispatch(setUser(response.data.data)); // only user object
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
    console.log("UserProfile function called",UserProfile());

  }, []);

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
