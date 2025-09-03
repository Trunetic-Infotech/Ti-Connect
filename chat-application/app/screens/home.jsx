import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Entypo } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { setToken } from "./../redux/features/auth";

// const API_URL = "http://192.168.1.36:5000";
const Home = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // false = phone entry, true = OTP screen
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sendData, setSendData] = useState(null);
  const inputs = useRef([]);
  const [timer, setTimer] = useState(0);
  const router = useRouter();
  const [state, setState] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem("view").then((v) => {
      if (v) setState(v);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("view", state);
  }, [state]);

  // Countdown for resend
  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  const sendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit number.");
      return;
    }

    try {
      setLoading(true);
      console.log(process.env.EXPO_API_URL);
      const response = await axios.post(
        `${process.env.EXPO_API_URL}/otp/send/${phone}`
      );
      console.log("OTP Send Response:", response);
      if (response.status === 200) {
        Alert.alert("OTP Sent", "Please check your phone.");
        setTimer(60); // 60s cooldown
        setSendData(response.data.data);
        setOpen(true); // Go to OTP screen
      } else {
        Alert.alert("Error", "Failed to send message on server.");
      }
    } catch (error) {
      console.log("Error sending OTP:", error);
      Alert.alert("Error", "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 3) inputs.current[index + 1]?.focus();
    } else if (text === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      
      
      console.log(sendData);
      const res = await axios.post(
        `${process.env.EXPO_API_URL}/otp/verify/${sendData.phone_number}/${otp.join("")}`
      );
      if (res.status === 200 && res.data?.data?.token) {
            const token = res.data.data.token;

      // Persist
      await SecureStore.setItemAsync("token", token);

      // Put in Redux
      dispatch(setToken(token));

        router.push({
          pathname: "../screens/UserName",
          params: { phone_number: phone },
        });
      } else {
        Alert.alert("Error", "Invalid OTP or missing token.");
      }
    } catch (error) {
      Alert.alert("Error", "Verification failed.");
      console.log("Error verifying OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc] px-6 pt-14">
      {!open ? (
        // Phone Number Screen
        <>
          <View className="space-y-3 mb-10">
            <Text className="text-center text-4xl font-extrabold text-[#1e3a8a] tracking-wide">
              Welcome 👋
            </Text>
            <Text className="text-center text-base text-gray-500">
              Enter your mobile number to login or register
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm mb-6"
          >
            <Text className="text-base text-gray-800 font-medium">
              🇮🇳 India
            </Text>
            <Entypo name="chevron-down" size={22} color="#6b7280" />
          </TouchableOpacity>

          <View className="bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm mb-10">
            <Text className="text-xs text-gray-500 mb-1">Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(+91) 1234567890"
              keyboardType="phone-pad"
              placeholderTextColor="#cbd5e1"
              className="text-lg text-gray-900 font-semibold"
            />
          </View>

          <TouchableOpacity
            onPress={sendOtp}
            activeOpacity={0.9}
            disabled={phone.length !== 10 || loading}
            className={`py-4 rounded-full ${
              phone.length === 10 && !loading
                ? "bg-[#1d4ed8]"
                : "bg-[#93c5fd] opacity-60"
            } shadow-md`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-white font-semibold text-lg">
                Send OTP
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        // OTP Screen
        <>
          <View className="space-y-4 mb-10">
            <Text className="text-center text-4xl font-extrabold text-indigo-700 tracking-wide">
              🔐 Verify OTP
            </Text>
            <Text className="text-center text-base text-gray-700">
              Enter the 4-digit code sent to your mobile.
            </Text>
          </View>

          <View className="flex-row justify-between mb-8 px-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                className="w-12 h-14 text-center text-lg font-bold bg-white border border-gray-300 rounded-xl shadow-sm text-gray-800"
              />
            ))}
          </View>

          {timer > 0 ? (
            <Text className="text-center text-sm text-gray-500 mb-4">
              Resend OTP in {timer}s
            </Text>
          ) : (
            <TouchableOpacity
              onPress={sendOtp}
              activeOpacity={0.8}
              className="mb-6"
            >
              <Text className="text-center text-sm text-blue-600 font-semibold underline">
                Didn't receive the code? Resend
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={verifyOtp}
            disabled={loading}
            activeOpacity={0.9}
            className={`py-4 rounded-full ${
              loading ? "bg-gray-400" : "bg-indigo-600"
            } shadow-md`}
         
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-white font-semibold text-lg">
                Verify & Continue
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default Home;
