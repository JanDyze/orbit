import { Screen } from "@/components/screen";
import { Bone } from "@/components/skeletons";

// The edit form while it loads: its fields in outline.
export default function Loading() {
  return (
    <Screen back="/" title={<Bone className="h-5 w-44 rounded-lg" />}>
      <p role="status" className="sr-only">
        Loading
      </p>
      <div aria-hidden className="flex flex-col gap-6">
        {[24, 20, 28, 16].map((w, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Bone className="h-3.5 rounded-md" style={{ width: `${w * 0.25}rem` }} />
            <span className="h-12 rounded-xl border border-input bg-card dark:bg-input/30" />
          </div>
        ))}
      </div>
    </Screen>
  );
}
