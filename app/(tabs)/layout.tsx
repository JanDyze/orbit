import { TabBar } from "@/components/tab-bar";

// The main pages (your year, the calendar) share one bottom bar that stays put as you move between
// them, as an installed app's does, rather than being drawn again with each page.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
