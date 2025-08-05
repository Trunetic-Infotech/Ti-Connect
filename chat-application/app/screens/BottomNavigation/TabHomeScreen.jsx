import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import Chats from "../Chats";
import Groups from "../pages/Groups";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import CallList from "../pages/CallList";
import Setting from "../pages/Setting";

const Tab = createBottomTabNavigator();

const iconNames = ["comment-dots", "users", "phone-alt", "cog"];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const animations = state.routes.map((_, index) => ({
    translateY: useSharedValue(0),
    scale: useSharedValue(1),
  }));

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { translateY, scale } = animations[index];

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        if (isFocused) {
          translateY.value = withSpring(-8, { damping: 10 });
          scale.value = withSequence(
            withTiming(1.2, { duration: 150 }),
            withTiming(1, { duration: 150 })
          );
        } else {
          translateY.value = withTiming(0, { duration: 200 });
          scale.value = withTiming(1, { duration: 200 });
        }

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }, { scale: scale.value }],
        }));

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            {isFocused && (
              <Animated.View style={styles.gradientWrapper}>
                <LinearGradient
                  colors={["#6366f1", "#60a5fa"]}
                  style={styles.gradientBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>
            )}
            <Animated.View style={animatedStyle}>
              <FontAwesome5
                name={iconNames[index]}
                size={26}
                color={isFocused ? "#fff" : "#9CA3AF"}
              />
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
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen name="Calls" component={CallList} />
      <Tab.Screen name="Settings" component={Setting} />
    </Tab.Navigator>
  );
};

export default TabHomeScreen;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gradientWrapper: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: -1,
  },
  gradientBg: {
    flex: 1,
    borderRadius: 25,
  },
});
