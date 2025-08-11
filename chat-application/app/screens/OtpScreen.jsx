import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

const OtpScreen = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 5) inputs.current[index + 1]?.focus();
    } else if (text === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleSubmitOtp = () => {
    const isComplete = otp.every((digit) => digit !== "");
    if (!isComplete) {
      Alert.alert("Incomplete OTP", "Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("../screens/UserName");
    }, 1500);
  };

  useEffect(() => {
    const isComplete = otp.every((digit) => digit !== "");
    if (isComplete) {
      handleSubmitOtp();
    }
  }, [otp]);

  return (
    <SafeAreaView className="flex-1 bg-[#e0f2fe] px-6 pt-16">
      <View className="space-y-4 mb-10">
        <Text className="text-center text-4xl font-extrabold text-indigo-700 tracking-wide">
          🔐 Verify OTP
        </Text>
        <Text className="text-center text-base text-gray-700">
          Enter the 6-digit code sent to your mobile.
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

      <TouchableOpacity
        activeOpacity={0.8}
        className="mb-6"
        onPress={() => Alert.alert("OTP Sent Again!")}
      >
        <Text className="text-center text-sm text-blue-600 font-semibold underline">
          Didn't receive the code? Resend
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmitOtp}
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
    </SafeAreaView>
  );
};

export default OtpScreen;
