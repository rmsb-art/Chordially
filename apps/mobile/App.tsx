import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Screen = "login" | "challenge" | "destination" | "account";
type Destination = "home" | "wallet" | "session";

function logAuthEvent(event: string, details: Record<string, string>) {
  // Privacy boundary: avoid email/device ids and raw tokens in client auth analytics.
  const safe = { ...details };
  console.log("[auth-event]", event, safe);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [pendingDestination, setPendingDestination] = useState<Destination>("wallet");

  const completeLogin = () => {
    logAuthEvent("login_success", { handoff: pendingDestination });
    setScreen("destination");
  };

  return (
    <View style={styles.container}>
      {screen === "login" && (
        <>
          <Text style={styles.title}>Chordially Mobile</Text>
          <Text style={styles.subtitle}>Sign in and continue to destination</Text>
          <View style={styles.row}>
            {(["home", "wallet", "session"] as Destination[]).map((d) => (
              <Pressable key={d} style={styles.smallBtn} onPress={() => setPendingDestination(d)}>
                <Text style={styles.btnText}>/{d}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.button} onPress={() => setScreen("challenge")}>
            <Text style={styles.btnText}>Sign in</Text>
          </Pressable>
        </>
      )}

      {screen === "challenge" && (
        <>
          <Text style={styles.title}>Security Challenge</Text>
          <Text style={styles.subtitle}>Future MFA or wallet-signature checkpoint</Text>
          <Pressable style={styles.button} onPress={completeLogin}>
            <Text style={styles.btnText}>Continue</Text>
          </Pressable>
        </>
      )}

      {screen === "destination" && (
        <>
          <Text style={styles.title}>Destination Handoff</Text>
          <Text style={styles.subtitle}>Continued to /{pendingDestination}</Text>
          <Pressable style={styles.button} onPress={() => setScreen("account")}>
            <Text style={styles.btnText}>Open Account Summary</Text>
          </Pressable>
        </>
      )}

      {screen === "account" && (
        <>
          <Text style={styles.title}>Signed-in Account</Text>
          <Text style={styles.subtitle}>Role: listener · Auth: active · Last refresh: just now</Text>
          <Pressable style={styles.button} onPress={() => setScreen("login")}>
            <Text style={styles.btnText}>Sign out</Text>
          </Pressable>
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: "#f4f0ff",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#c7c1d9",
    fontSize: 15,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  smallBtn: {
    backgroundColor: "#2a2a38",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
