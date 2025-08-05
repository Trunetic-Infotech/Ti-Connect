import { Text, View } from "react-native";
import "../global.css";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("./screens/home");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Text>Hello</Text>
    </>
  );
}
