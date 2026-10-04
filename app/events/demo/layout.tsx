import { ReactNode } from "react";
import { DemoEventProvider } from "../../context/DemoEventContext";

export default function DemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DemoEventProvider>
      {children}
    </DemoEventProvider>
  );
}
