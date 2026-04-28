import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { clearAuthSession } from "../auth/persisted-auth";

export function BannedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Suspended</Text>
      <Text style={styles.body}>
        Your account has been suspended due to a violation of our community guidelines or terms of
        service.
      </Text>
      <Text
        style={styles.link}
        onPress={() => Linking.openURL("mailto:support@chordially.com")}
      >
        Contact support to appeal
      </Text>
      <Text
        style={styles.link}
        onPress={async () => {
          await clearAuthSession();
        }}
      >
        Sign out
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  body: { fontSize: 16, textAlign: "center", marginBottom: 24, color: "#555" },
  link: { fontSize: 16, color: "#0066cc", marginTop: 12 }
});
