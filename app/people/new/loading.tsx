import { Screen } from "@/components/screen";
import { OrbitLoader } from "@/components/skeletons";

// Adding someone, while the ring loads everyone already on it: the name line and the ring, where
// they'll be.
export default function Loading() {
  return (
    <Screen back="/" title="Add someone">
      <div aria-hidden className="mb-6 h-12 border-b-2 border-input" />
      <OrbitLoader className="max-w-[22.5rem]" />
    </Screen>
  );
}
