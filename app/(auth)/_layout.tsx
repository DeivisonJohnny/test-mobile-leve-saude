import React from "react";
import { View } from "react-native";

import Login from "./Login";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Login />
    </View>
  );
}
