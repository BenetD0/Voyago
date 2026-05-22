import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { AppShellProvider } from "@/context/AppShellContext";

type AppProvidersProps = {
  children: React.ReactNode;
  session?: Session | null;
};

export default function AppProviders({ children, session }: AppProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AppShellProvider>{children}</AppShellProvider>
    </SessionProvider>
  );
}
