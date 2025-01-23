
import { HeroUIProvider } from "@heroui/react";

export function ClientHeroProvider({ children }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
} 