import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import "../src/fonts.css";
import "../src/App.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
