import { Redirect } from "expo-router";

// The auth gate in _layout handles unauthenticated users; default into the app.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
