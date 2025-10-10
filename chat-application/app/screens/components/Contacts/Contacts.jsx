// // components/Contacts/Contacts.jsx
// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
// import * as Contacts from "expo-contacts";

// const ContactsModal = ({ visible, onClose, onSend }) => {
//   const [contacts, setContacts] = useState([]);

//   useEffect(() => {
//     if (visible) {
//       (async () => {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status === "granted") {
//           const { data } = await Contacts.getContactsAsync({
//             fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
//           });
//           setContacts(data);
//         }
//       })();
//     }
//   }, [visible]);

//   const handleSelectContact = (contact) => {
//     const contactMessage = {
//       type: "contact",
//       name: contact.name,
//       phone: contact.phoneNumbers?.[0]?.number || "No number",
//       email: contact.emails?.[0]?.email || "No email",
//     };
//     onSend(contactMessage);
//     onClose();
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
//           <Text className="text-lg font-semibold mb-3 text-center">
//             Select Contact
//           </Text>
//           <FlatList
//             data={contacts}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 className="p-3 border-b border-gray-200"
//                 onPress={() => handleSelectContact(item)}
//               >
//                 <Text className="text-base font-medium text-gray-800">
//                   {item.name}
//                 </Text>
//                 {item.phoneNumbers && (
//                   <Text className="text-sm text-gray-500">
//                     {item.phoneNumbers[0]?.number}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             )}
//           />
//           <TouchableOpacity
//             className="mt-3 bg-red-500 py-2 rounded-xl"
//             onPress={onClose}
//           >
//             <Text className="text-white text-center font-semibold">Close</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default ContactsModal;

// components/Contacts/Contacts.jsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   Image,
// } from "react-native";
// import * as Contacts from "expo-contacts";

// const ContactsModal = ({ visible, onClose, onSend }) => {
//   const [contacts, setContacts] = useState([]);

//   useEffect(() => {
//     if (visible) {
//       (async () => {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status === "granted") {
//           const { data } = await Contacts.getContactsAsync({
//             fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
//           });
//           setContacts(data);
//         }
//       })();
//     }
//   }, [visible]);

//   const handleSelectContact = (contact) => {
//     const contactMessage = {
//       type: "contact",
//       name: contact.name,
//       phone: contact.phoneNumbers?.[0]?.number || "No number",
//       email: contact.emails?.[0]?.email || "No email",
//     };
//     onSend(contactMessage);
//     onClose();
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-3xl p-4 max-h-[70%]">
//           {/* Header */}
//           <Text className="text-lg font-bold text-center text-gray-800 mb-4">
//             Select Contact
//           </Text>

//           {/* Horizontal List */}
//           <FlatList
//             data={contacts}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 className="bg-blue-500/90 rounded-2xl p-4 m-2 w-36 items-center shadow-md"
//                 onPress={() => handleSelectContact(item)}
//               >
//                 {/* Avatar Placeholder */}
//                 <View className="w-16 h-16 rounded-full bg-white/20 mb-2 items-center justify-center">
//                   <Text className="text-lg font-bold text-white">
//                     {item.name?.[0] || "?"}
//                   </Text>
//                 </View>
//                 {/* Name */}
//                 <Text
//                   className="text-sm font-semibold text-white text-center"
//                   numberOfLines={1}
//                 >
//                   {item.name}
//                 </Text>
//                 {/* Phone */}
//                 {item.phoneNumbers && (
//                   <Text
//                     className="text-xs text-white/80 text-center mt-1"
//                     numberOfLines={1}
//                   >
//                     {item.phoneNumbers[0]?.number}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             )}
//           />

//           {/* Close Button */}
//           <TouchableOpacity
//             className="mt-4 bg-red-500 py-3 rounded-2xl"
//             onPress={onClose}
//           >
//             <Text className="text-white text-center font-semibold text-base">
//               Close
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default ContactsModal;




// components/Contacts/ContactsModal.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as Contacts from "expo-contacts";

const ContactsModal = ({ visible, onClose, onSend }) => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === "granted") {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
          });
          setContacts(data);
        }
      })();
    }
  }, [visible]);

  const handleSelectContact = (contact) => {
    onSend?.({
      type: "contact",
      name: contact.name,
      phone: contact.phoneNumbers?.[0]?.number || "No number",
      email: contact.emails?.[0]?.email || "No email",
    });
    onClose?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-4 max-h-[70%]">
          <Text className="text-lg font-bold text-center text-gray-800 mb-4">
            Select Contact
          </Text>

          <FlatList
            data={contacts}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-blue-500/90 rounded-2xl p-4 m-2 w-36 items-center shadow-md"
                onPress={() => handleSelectContact(item)}
              >
                <View className="w-16 h-16 rounded-full bg-white/20 mb-2 items-center justify-center">
                  <Text className="text-lg font-bold text-white">
                    {item.name?.[0] || "?"}
                  </Text>
                </View>
                <Text
                  className="text-sm font-semibold text-white text-center"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.phoneNumbers && (
                  <Text
                    className="text-xs text-white/80 text-center mt-1"
                    numberOfLines={1}
                  >
                    {item.phoneNumbers[0]?.number}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            className="mt-4 bg-red-500 py-3 rounded-2xl"
            onPress={onClose}
          >
            <Text className="text-white text-center font-semibold text-base">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ContactsModal;

























