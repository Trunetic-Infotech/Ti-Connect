import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const OtpScreen = () => {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#e0f2fe", "#fefce8", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 px-6 pt-16">
        <View className="space-y-4 mb-10">
          <Text className="text-center text-4xl font-extrabold text-indigo-700 drop-shadow-xl tracking-wide">
            🔐 Verify OTP
          </Text>
          <Text className="text-center text-base text-gray-700">
            Enter the 6-digit code sent to your mobile.
          </Text>
        </View>

        <View className="bg-white/90 rounded-2xl px-5 py-4 shadow-md border border-gray-100 mb-10 backdrop-blur-md">
          <Text className="text-xs text-gray-500 mb-1">OTP Code</Text>
          <TextInput
            placeholder="------"
            keyboardType="numeric"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            className="text-2xl tracking-widest text-center text-gray-900 font-bold"
            placeholderTextColor="#bbb"
          />
        </View>

        <TouchableOpacity activeOpacity={0.8} className="mb-6">
          <Text className="text-center text-sm text-blue-600 font-semibold underline">
            Didn't receive the code? Resend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          className="rounded-2xl shadow-xl disabled:opacity-50"
          disabled={otp.length < 6}
          onPress={() => {
            {
              otp.length === 6
                ? router.push("../screens/BottomNavigation/TabHomeScreen")
                : Alert.alert("Invalid Otp");
            }
          }}
        >
          <LinearGradient
            colors={["#6366f1", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-2xl"
          >
            <Text className="text-center text-white font-bold text-lg tracking-wide">
              Verify & Continue
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OtpScreen;
