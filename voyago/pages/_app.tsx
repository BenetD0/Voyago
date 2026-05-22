import "../styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../src/components/layout/Header";
import Footer from "../src/components/layout/Footer";
import AppProviders from "@/context/AppProviders";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <AppProviders session={session}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-16 md:pt-20">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AppProviders>
  );
}
