import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

export default function TabsLayout() {
  const handleLogout = async () => {
    Alert.alert(
      "Confirmar Logout",
      "Tem certeza que deseja sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert(
                "Erro",
                "Não foi possível fazer logout. Tente novamente."
              );
            }
          },
        },
      ]
    );
  };

  const LogoutButton = () => (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginRight: Platform.OS === "ios" ? 16 : 12,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={20} color="#EF4444" />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },

        headerStyle: {
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
          color: "#111827",
        },
        headerTitleAlign: "center",
        headerStatusBarHeight: Platform.OS === "ios" ? 44 : 24,
        headerRight: () => <LogoutButton />,
      }}
    >
      <Tabs.Screen
        name="ListFeedback"
        options={{
          title: "Meus Feedbacks",
          tabBarLabel: "Avaliações",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={color}
            />
          ),
          headerTitle: "Meus Feedbacks",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#111827",
          },
        }}
      />

      <Tabs.Screen
        name="FormFeedback"
        options={{
          title: "Novo Feedback",
          tabBarLabel: "Novo Feedback",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "add-circle" : "add-circle-outline"}
              color={color}
            />
          ),
          headerTitle: "Enviar Feedback",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#111827",
          },
        }}
      />
    </Tabs>
  );
}
