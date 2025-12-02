import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
// Screens
import Chats from "../Chats";
// import UnRead from "../pages/UnRead";
import Groups from "../pages/Groups";
// import CallList from "../pages/CallList";
import Setting from "../pages/Setting";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");
// const iconNames = ["comment-dots", "users", "phone-alt", "cog"];

const iconNames = ["comment-dots", "users", "cog"];

// ✅ Custom background with dynamic notch + border
const TabBg = ({
  color = "#f8f9fa", // background color of bar
  borderColor = "#d1d5db", // border line color (default gray-300)
  borderWidth = 2, // border thickness
  height = 70,
  activeIndex = 0,
  notchWidth = 100,
  notchDepth = 40,
}) => {
  const itemWidth = width / iconNames.length;
  const centerX = itemWidth * activeIndex + itemWidth / 2;

  const d = `
    M0 0 
    H${centerX - notchWidth / 2}
    C${centerX - notchWidth / 2 + 20} 0, ${centerX - notchWidth / 4} ${notchDepth}, ${centerX} ${notchDepth}
    C${centerX + notchWidth / 4} ${notchDepth}, ${centerX + notchWidth / 2 - 20} 0, ${centerX + notchWidth / 2} 0
    H${width} 
    V${height} 
    H0 
    Z
  `;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0 }}>
      {/* Background fill */}
      <Path fill={color} d={d} />
      {/* Border stroke */}
      <Path
        d={d}
        fill="transparent"
        stroke={borderColor}
        strokeWidth={borderWidth}
      />
    </Svg>
  );
};

const CustomTabBar = ({ state, navigation }) => {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const tabBarBgColor = darkMode ? "#111111" : "#f8f9fa";        // dark or light bg
  const inactiveIconColor = darkMode ? "#ffffff" : "#333333";   // inactive icons
  const animations = state.routes.map(() => ({
    translateY: useSharedValue(0),
  }));

  return (
    <View style={styles.tabBar}>
      {/* ✅ Curve notch with border */}
      <TabBg
        color={tabBarBgColor}
        activeIndex={state.index}
        notchWidth={110}
        notchDepth={45}
        borderColor="#6366f1" // 👈 Indigo border
        borderWidth={3}
      />

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { translateY } = animations[index];

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        if (isFocused) {
          translateY.value = withSpring(-25, { damping: 12 });
        } else {
          translateY.value = withTiming(0, { duration: 200 });
        }

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }],
        }));

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <Animated.View style={animatedStyle}>
              {isFocused ? (
                <LinearGradient
                  colors={["#6366f1", "#60a5fa"]}
                  style={styles.activeCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome5
                    name={iconNames[index]}
                    size={24}
                    color={inactiveIconColor}
                  />
                </LinearGradient>
              ) : (
                <FontAwesome5 name={iconNames[index]} size={20} color={inactiveIconColor} />
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabHomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Chats" component={Chats} />
      {/* <Tab.Screen name="UnRead" component={UnRead} /> */}
      <Tab.Screen name="Groups" component={Groups} />
      {/* <Tab.Screen name="Calls" component={CallList} /> */}
      <Tab.Screen name="Settings" component={Setting} />
    </Tab.Navigator>
  );
};

export default TabHomeScreen;

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeCircle: {
    width: 50,
    height: 50,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 8,
  },
});
