import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { Provider } from 'react-redux';
import { store } from './redux/store/store';

const socket = io("http://localhost:5000");

export default function RootLayout() {

//   useEffect(() => {
//   socket.on("connection", () => {
//     console.log("Connected to server");
//   });


//   socket.on("user_online", (data) => {
//     console.log("User online:", data);
//   });


//   socket.on("user_typing", (data) => {
//     console.log("User typing:", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("Disconnected from server");
//   });

//   return () => {
//     socket.off("connect");
//     socket.off("disconnect");
//   };
// }, []);
  

return (

    <Provider store={store}>
      
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />;
    </SafeAreaProvider>
    </Provider>
  );
}
