// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   FlatList,
//   Pressable,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons, Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import axios from "axios";

// const GroupProfile = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const [groupMembers, setGroupMembers] = useState([]);
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [loading, setLoading] = useState(true);

//   let GroupDetails = params.GroupDetails;

//   // Parse GroupDetails if passed as a string
//   try {
//     if (typeof GroupDetails === "string") {
//       GroupDetails = JSON.parse(GroupDetails);
//     }
//   } catch (e) {
//     console.log("Failed to parse group param:", e);
//   }

//   //  console.log("GroupDetails", GroupDetails);

//   // Fetch group members from backend
//   const fetchGroupMembers = async () => {
//     try {
//       setLoading(true);
//       const token = await SecureStore.getItemAsync("token");
//       if (!token) return router.replace("/screens/home");
//       //  console.log("group_ID:", GroupDetails.id);

//       const response = await axios.get(
//         `${process.env.EXPO_API_URL}/groups/members/list/${GroupDetails.id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.success) {
//         setGroupMembers(response.data.data);
//       } else {
//         Alert.alert("Error", response.data.message || "Failed to load members");
//       }
//     } catch (error) {
//       console.log("fetchGroupMembers error", error);
//       Alert.alert("Error", "Something went wrong while fetching members");
//     } finally {
//       setLoading(false);
//     }
//   }; 

//   useEffect(() => {
//     fetchGroupMembers();
//   }, []);

//   // Add newly added members if passed via params
//   useEffect(() => {
//     if (params.newMembers) {
//       try {
//         const newMembers = JSON.parse(params.newMembers);
//         setGroupMembers((prev) => {
//           const existingIds = new Set(prev.map((m) => m.id));
//           const filteredNew = newMembers.filter((m) => !existingIds.has(m.id));
//           return [...prev, ...filteredNew];
//         });
//       } catch (e) {
//         console.log("Failed to parse new members from params", e);
//       }
//     }
//   }, [params.newMembers]);

  
  
//   // console.log("asas",groupMembers);
//   const removeMember = async (memberId) => {
//     console.log("sadsd",memberId);
    
//     try {
//     const token = await SecureStore.getItemAsync("token");
//     const response = await axios.delete(
//       `${process.env.EXPO_API_URL}/groups/members/remove`,
//       {
//         data: { 
//           groupId: GroupDetails.id,
//           memberId: memberId 
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
    
//     if (response.data.success) {
//       setGroupMembers(prev => prev.filter(m => m.id !== memberId));
//       Alert.alert("Success", "Member removed");
//     }
//   } catch (error) {
//     Alert.alert("Error", error.response?.data?.message || "Failed to remove member");
//   }
// };

// // console.log("skldfc",item);

//   const handleDeleteMember = (memberId) => {
//   Alert.alert(
//     "Remove Member",
//     "Are you sure you want to remove this member?",
//     [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Remove",
//         style: "destructive",
//         onPress: () => removeMember(memberId),
//       },
//     ]
//   );
// };

 

// const bloackGroupeMemberandUnblock = async (toggle) => {

//   try {
//     const token = await SecureStore.getItemAsync("token");
//     const status = toggle ? "block" : "unblock"; // toggle is boolean
    
//     const response = await axios.post(
//       `${process.env.EXPO_API_URL}/groups/members/block`,
//       {
//         groupId: GroupDetails.id,
//         Block_Group: status, 
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (response.data.success) {
//       setIsBlocked(toggle);  // <<--- FIXED

//       Alert.alert(
//         "Success",
//         toggle ? "Member blocked" : "Member unblocked"
//       );
//     } else {
//       Alert.alert("Error", response.data.message || "Failed to update status");
//     }
//   } catch (error) {
//     Alert.alert(
//       "Error",
//       error.response?.data?.message || "Failed to update status"
//     );
//   }
// };


   
//       //  console.log("groupMembers.user_id",item);

//   const handleBlockToggle = () => {
//     Alert.alert(
//       isBlocked ? "Unblock Group" : "Block Group",
//       isBlocked
//         ? "Do you want to unblock this group?"
//         : "Are you sure you want to block this group?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: isBlocked ? "Unblock" : "Block",
//           style: isBlocked ? "default" : "destructive",
//           onPress: () => bloackGroupeMemberandUnblock(!isBlocked),
//         },
//       ]
//     );
//   };

//   const renderMember = ({ item }) => (
//     <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-md mb-4">
//     <Pressable >

//       <View className="flex-row items-center gap-2 relative">
//   {item.profile_picture ? (
//     <View>
//       <Image
//         source={{ uri: item.profile_picture }}
//         className="w-14 h-14 rounded-full"
//       />
//       <View
//         className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
//           item.status === "active" ? "bg-green-500" : "bg-gray-500"
//         }`}
//       />
//     </View>
//   ) : (
//     <View className="relative">
//       <FontAwesome5
//         name="user-circle"
//         size={40}
//         color="#6b7280"
//         style={{ marginRight: 8 }}
//       />
//       <View
//         className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
//           item.status === "active" ? "bg-green-500" : "bg-gray-500"
//         }`}
//       />
//     </View>
//   )}
//         <View>
//           <Text className="text-lg font-semibold text-gray-900">
//             {item.username}
//           </Text>
//           <Text className="text-sm text-gray-500">{item.member_role}</Text>
//         </View>
//       </View>
//             </Pressable>

//       {GroupDetails?.role === "Admin" || GroupDetails?.role === "admin" && (
//         <Pressable
//           onPress={() => handleDeleteMember(item.user_id)}

//           android_ripple={{ color: "#fee2e2" }}
//           className="p-2 rounded-full bg-red-100"
//         >
//           <Entypo name="trash" size={22} color="#dc2626" />
//         </Pressable>
//       )}
//     </View>
//   );

//   if (!GroupDetails) {
//     return (
//       <SafeAreaView className="flex-1 items-center justify-center">
//         <Text className="text-gray-500">Loading group...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       {/* Header */}
//       <LinearGradient
//         colors={["#3b82f6", "#2563eb"]}
//         className="py-4 px-2 rounded-b-3xl shadow-lg"
//       >
//         {/* Back button */}
//         <View className="flex-row justify-between items-center ">
//           <Pressable
//             onPress={() => router.back()}
//             android_ripple={{ color: "rgba(255,255,255,0.3)" }}
//             className="p-2 rounded-full bg-white/10"
//           >
//             <Ionicons name="arrow-back" size={26} color="white" />
//           </Pressable>
//         </View>

//         {/* Group Image */}
//         <View className="items-center">
//           {groupMembers.groupImage ? (
//             <Image
//               source={{ uri: groupMembers.groupImage }}
//               className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
//             />
//           ) : (
//             <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white shadow-lg">
//               <FontAwesome5 name="users" size={32} color="white" />
//             </View>
//           )}

//           {/* Group Name & Member Count in a Row */}
//           <View className="flex-row items-center mt-4">
//             <Text className="text-2xl font-bold text-white">
//               {groupMembers.name}
//             </Text>
//             <Text className="ml-3 text-white/80 text-lg">
//             • {groupMembers.length} {groupMembers.length === 1 ? "Member" : "Members"}
//             </Text>
//           </View>

//           {/* Blocked Badge */}
//           {isBlocked && (
//             <View className="mt-2 bg-red-600 px-3 py-1 rounded-full">
//               <Text className="text-white font-semibold text-sm">
//                 Group Blocked
//               </Text>
//             </View>
//           )}
//         </View>
//       </LinearGradient>

       
//       {/* Members List */}
//       <View className="flex-1 px-6 pt-6">
//         <Text className="text-2xl font-semibold text-gray-900 mb-6">
//           Group Members
//         </Text>

//         {loading ? (
//           <ActivityIndicator size="large" color="#2563eb" />
//         ) : (
//           <FlatList
//             data={groupMembers}
//             // keyExtractor={(item) => item.user_id.toString()}
//             keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//             renderItem={renderMember}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 32 }}
//           />
//         )}

//         {/* Action Buttons */}
//         <View className="mt-auto mb-8 gap-4 px-4">
//           {GroupDetails?.role === "admin" && (
//             <Pressable
//               onPress={() =>
//                 router.push({
//                   pathname: "/screens/pages/AddContact",
//                   params: {
//                     GroupDetails: JSON.stringify(GroupDetails),
//                     type: "group",
//                   },
//                 })
//               }
//               disabled={isBlocked}
//               className={`rounded-full overflow-hidden shadow-lg ${
//                 isBlocked ? "opacity-50" : "opacity-100"
//               }`}
//             >
//               <LinearGradient
//                 colors={["#3b82f6", "#2563eb"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 className="py-3 items-center justify-center"
//               >
//                 <View className="flex-row items-center justify-center gap-2">
//                   <Ionicons name="person-add" size={20} color="#fff" />
//                   <Text className="text-white font-semibold text-base">
//                     Add Members
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </Pressable>
//           )}

//           <View className="flex-row items-center justify-center gap-2 mt-4">
//             {/* Leave Group Button */}
//             <Pressable
//               onPress={() => {
//                 if (isBlocked) {
//                   Alert.alert("Blocked", "You cannot leave a blocked group.");
//                   return;
//                 }
//                 Alert.alert("Leave Group", "You have left the group.");
//               }}
//               className="flex-row items-center justify-center gap-2 bg-gray-100 rounded-full shadow-lg px-5 py-3 flex-1"
//             >
//               <Entypo name="log-out" size={20} color="#1f2937" />
//               <Text className="text-gray-900 font-semibold text-base">
//                 Leave Group
//               </Text>
//             </Pressable>

//             {/* Block/Unblock Button */}
//             <Pressable
//               onPress={handleBlockToggle}
//               className={`flex-row items-center justify-center gap-2 rounded-full shadow-md px-5 py-3 flex-1 border-2 ${
//                 isBlocked
//                   ? "border-green-500 bg-green-50"
//                   : "border-red-500 bg-red-50"
//               }`}
//             >
//               <Feather
//                 name={isBlocked ? "unlock" : "lock"}
//                 size={20}
//                 color={isBlocked ? "#16a34a" : "#dc2626"}
//               />
//               <Text
//                 className={`font-semibold text-base ${
//                   isBlocked ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {isBlocked ? "Unblock" : "Block"}
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default GroupProfile;
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const GroupProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 👉 Group members array (members only, not group info)
  const [groupMembers, setGroupMembers] = useState([]);
  // 👉 Whether the group is blocked for the current user
  const [isBlocked, setIsBlocked] = useState(false);
  // 👉 Loading state for fetching members
  const [loading, setLoading] = useState(true);

  /**
   * ✅ Parse GroupDetails from params safely
   * - Previously you were mutating `let GroupDetails`
   * - Now we parse once and keep it as a stable object
   */
  const GroupDetails = useMemo(() => {
    try {
      if (typeof params.GroupDetails === "string") {
        return JSON.parse(params.GroupDetails);
      }
      return params.GroupDetails || null;
    } catch (e) {
      console.log("Failed to parse group param:", e);
      return null;
    }
  }, [params.GroupDetails]);

  // Convenience: current user role in group
  const userRole = GroupDetails?.role;

  // Helper: check if current user is admin (handles "admin" and "Admin")
  const isAdmin = userRole === "admin" || userRole === "Admin";

  /**
   * 🔄 Fetch group members from backend
   */
  const fetchGroupMembers = async () => {
    if (!GroupDetails?.id) {
      console.log("GroupDetails.id is missing, skipping fetch.");
      return;
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        // If no token, redirect to home / login
        router.replace("/screens/home");
        return;
      }

      const response = await axios.get(
        `${process.env.EXPO_API_URL}/groups/members/list/${GroupDetails.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        // Expecting array of members
        setGroupMembers(response.data.data || []);
      } else {
        Alert.alert(
          "Error",
          response.data?.message || "Failed to load members"
        );
      }
    } catch (error) {
      console.log("fetchGroupMembers error", error);
      Alert.alert("Error", "Something went wrong while fetching members");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔁 Initial load of members when screen mounts
   */
  useEffect(() => {
    fetchGroupMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GroupDetails?.id]); // Refetch if group id changes

  /**
   * ➕ Merge newly added members from params (if AddContact screen returns them)
   */
  useEffect(() => {
    if (!params.newMembers) return;

    try {
      const newMembers = JSON.parse(params.newMembers);

      // Avoid duplicates by ID
      setGroupMembers((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const filteredNew = newMembers.filter((m) => !existingIds.has(m.id));
        return [...prev, ...filteredNew];
      });
    } catch (e) {
      console.log("Failed to parse new members from params", e);
    }
  }, [params.newMembers]);

  /**
   * 🗑 Remove member from group (API + state update)
   */
  const removeMember = async (memberId) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace("/screens/home");
        return;
      }

      const response = await axios.delete(
        `${process.env.EXPO_API_URL}/groups/members/remove`,
        {
          // NOTE: axios.delete supports `data` field
          data: {
            groupId: GroupDetails.id,
            memberId: memberId,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        // Remove from UI
       setGroupMembers((prev) => prev.filter((m) => m.user_id !== memberId));


        Alert.alert("Success", "Member removed");
      } else {
        Alert.alert(
          "Error",
          response.data?.message || "Failed to remove member"
        );
      }
    } catch (error) {
      console.log("removeMember error", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to remove member"
      );
    }
  };

  /**
   * 🗑 Show confirmation before removing member
   */
  const handleDeleteMember = (memberId) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeMember(memberId),
        },
      ]
    );
  };

  /**
   * 🔒 Block / 🔓 Unblock Group (for current user)
   * - This is group-level block, not per member
   * - toggle: boolean -> true = block, false = unblock
   */
  const toggleGroupBlockStatus = async (toggle) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace("/screens/home");
        return;
      }

      const status = toggle ? "block" : "unblock"; // value used by backend

      const response = await axios.patch(
        `${process.env.EXPO_API_URL}/groups/members/block`,
        {
          groupId: GroupDetails.id,
          Block_Group: status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        setIsBlocked(toggle); // update local UI state
        Alert.alert(
          "Success",
          toggle ? "Group blocked successfully" : "Group unblocked successfully"
        );
      } else {
        Alert.alert(
          "Error",
          response.data?.message || "Failed to update group status"
        );
      }
    } catch (error) {
      console.log("toggleGroupBlockStatus error", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update status"
      );
    }
  };

  /**
   * 🧠 Ask confirmation before toggling block/unblock
   */
  const handleBlockToggle = () => {
    Alert.alert(
      isBlocked ? "Unblock Group" : "Block Group",
      isBlocked
        ? "Do you want to unblock this group?"
        : "Are you sure you want to block this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isBlocked ? "Unblock" : "Block",
          style: isBlocked ? "default" : "destructive",
          onPress: () => toggleGroupBlockStatus(!isBlocked),
        },
      ]
    );
  };

  const LeaveGroupMember = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      router.replace("/screens/home");
      return;
    }

    const response = await axios.delete(
      `${process.env.EXPO_API_URL}/groups/leave`,
      {
        data: { groupId: GroupDetails.id },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data?.success) {
      // Remove yourself from UI
      setGroupMembers((prev) =>
        prev.filter((m) => m.user_id !== response.data.removedUserId)
      );

      Alert.alert("Success", "You left the group");
      router.replace("/screens/pages/Groupes");
    } else {
      Alert.alert("Error", response.data?.message || "Failed to leave group");
    }
  } catch (error) {
    console.log("leaveGroup error", error);
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to leave group"
    );
  }
};


 const handleLeaveGroup = () => {
  Alert.alert(
    "Leave Group",
    "Are you sure you want to leave this group?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => LeaveGroupMember(),
      },
    ]
  );
};


  /**
   * 👤 Render a single member item
   */
  const renderMember = ({ item }) => (
    <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-md mb-4">
      <Pressable>
        <View className="flex-row items-center gap-2 relative">
          {/* Avatar */}
          {item.profile_picture ? (
            <View>
              <Image
                source={{ uri: item.profile_picture }}
                className="w-14 h-14 rounded-full"
              />
              {/* Online / offline status indicator */}
              <View
                className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
                  item.status === "active" ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </View>
          ) : (
            <View className="relative">
              <FontAwesome5
                name="user-circle"
                size={40}
                color="#6b7280"
                style={{ marginRight: 8 }}
              />
              <View
                className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
                  item.status === "active" ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </View>
          )}

          {/* Name + role */}
          <View>
            <Text className="text-lg font-semibold text-gray-900">
              {item.username}
            </Text>
            <Text className="text-sm text-gray-500">{item.member_role}</Text>
          </View>
        </View>
      </Pressable>

      {/* 🗑 Show remove button only for admins */}
      {isAdmin && (
        <Pressable
  onPress={() => handleDeleteMember(item.user_id)}
  android_ripple={{ color: "#fee2e2" }}
  className="p-2 rounded-full bg-red-100"
>
  <Entypo name="trash" size={22} color="#dc2626" />
</Pressable>

      )}
    </View>
  );

  // 🔐 If no group details, show simple loading UI
  if (!GroupDetails) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading group...</Text>
      </SafeAreaView>
    );
  }

  // Derived data for header
  const memberCount = groupMembers.length;
  const groupName = GroupDetails.name || "Group";
  const groupImage = GroupDetails.groupImage; // assume backend sends this

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 🔹 Header */}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        className="py-4 px-2 rounded-b-3xl shadow-lg"
      >
        {/* Back button */}
        <View className="flex-row justify-between items-center">
          <Pressable
            onPress={() => router.back()}
            android_ripple={{ color: "rgba(255,255,255,0.3)" }}
            className="p-2 rounded-full bg-white/10"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
        </View>

        {/* Group Image + Name + Count */}
        <View className="items-center mt-2">
          {groupImage ? (
            <Image
              source={{ uri: groupImage }}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white shadow-lg">
              <FontAwesome5 name="users" size={32} color="white" />
            </View>
          )}

          {/* Name & Member Count */}
          <View className="flex-row items-center mt-4">
            <Text className="text-2xl font-bold text-white">{groupName}</Text>
            <Text className="ml-3 text-white/80 text-lg">
              • {memberCount} {memberCount === 1 ? "Member" : "Members"}
            </Text>
          </View>

          {/* Blocked Badge */}
          {isBlocked && (
            <View className="mt-2 bg-red-600 px-3 py-1 rounded-full">
              <Text className="text-white font-semibold text-sm">
                Group Blocked
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* 🔹 Members List */}
      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-semibold text-gray-900 mb-6">
          Group Members
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : groupMembers.length === 0 ? (
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-500">No members in this group yet.</Text>
          </View>
        ) : (
          <FlatList
            data={groupMembers}
            keyExtractor={(item, index) =>
              item.id?.toString() || item.user_id?.toString() || index.toString()
            }
            renderItem={renderMember}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}

        {/* 🔹 Action Buttons */}
        <View className="mt-auto mb-8 gap-4 px-4">
          {/* Add Members – only admins can see this */}
          {isAdmin && (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/screens/pages/AddContact",
                  params: {
                    GroupDetails: JSON.stringify(GroupDetails),
                    type: "group",
                  },
                })
              }
              disabled={isBlocked}
              className={`rounded-full overflow-hidden shadow-lg ${
                isBlocked ? "opacity-50" : "opacity-100"
              }`}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-3 items-center justify-center"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text className="text-white font-semibold text-base">
                    Add Members
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          )}

          <View className="flex-row items-center justify-center gap-2 mt-4">
            {/* Leave Group Button */}
            <Pressable
              onPress={() => handleLeaveGroup()}
              className="flex-row items-center justify-center gap-2 bg-gray-100 rounded-full shadow-lg px-5 py-3 flex-1"
            >
              <Entypo name="log-out" size={20} color="#1f2937" />
              <Text className="text-gray-900 font-semibold text-base">
                Leave Group
              </Text>
            </Pressable>

            {/* Block / Unblock Group Button */}
            <Pressable
              disabled={isBlocked}
               onPress={() => handleBlockToggle()}
              className={`flex-row items-center justify-center gap-2 rounded-full shadow-md px-5 py-3 flex-1 border-2 ${
                isBlocked
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <Feather
                name={isBlocked ? "unlock" : "lock"}
                size={20}
                color={isBlocked ? "#16a34a" : "#dc2626"}
              />
              <Text
                className={`font-semibold text-base ${
                  isBlocked ? "text-green-600" : "text-red-600"
                }`}
              >
                {isBlocked ? "Unblock" : "Block"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GroupProfile;
