import { Text } from "react-native";
import "../global.css";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../app/redux/features/auth";

const socket = io("http://localhost:5000");
const API_URL = "http://192.168.1.41:5000";

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Fetch user profile
  const UserProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const userId = await SecureStore.getItemAsync("userId");

      if (!token || !userId) return;

      console.log("User ID:", userId, token);

      const response = await axios.get(
        `${API_URL}/api/v1/users/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const userData = response.data;
        dispatch(setUser(userData));
        console.log("User Profile:", userData);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Run once on mount
  useEffect(() => {
    UserProfile();
  }, []);

  // Check auth & redirect
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("token");
      console.log("Token:", token);

      if (token) {
        router.push("/screens/Chats");
      } else {
        router.push("/screens/home");
      }
    };
    checkAuth();
  }, []);

  // Example: test socket listeners
  useEffect(() => {
    socket.on("user_typing", (data) => {
      console.log("User typing:", data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("user_typing");
      socket.off("disconnect");
    };
  }, []);

  return <Text>Hello</Text>;
}
