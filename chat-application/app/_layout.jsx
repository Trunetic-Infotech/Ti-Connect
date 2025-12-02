// import { Stack } from "expo-router";
// import "../global.css";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { io } from "socket.io-client";
// import { useEffect } from "react";
// import { Provider } from "react-redux";
// import { store } from "./redux/store/store";
// import { initSocket } from "./redux/features/socketService";

// export default function RootLayout() {
//   useEffect(() => {
//     const socket = initSocket("chat", "http://localhost:5000");
//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <Provider store={store}>
//       <SafeAreaProvider>
//         <Stack screenOptions={{ headerShown: false }} />;
//       </SafeAreaProvider>
//     </Provider>
//   );
// }

import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store/store";
import { PersistGate } from "redux-persist/integration/react";


export default function RootLayout() {

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </PersistGate>
    </Provider >
  );
}
