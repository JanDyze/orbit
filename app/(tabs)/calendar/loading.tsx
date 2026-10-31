import { FindLink } from "@/components/find-link";
import { Screen } from "@/components/screen";
import { Bone, OrbitLoader } from "@/components/skeletons";

// The calendar while it loads: the month heading, the year strip and the month's grid in outline.
export default function Loading() {
  return (
    <Screen tabBar action={<FindLink />}>
      <div className="mb-4 flex h-11 items-center justify-center">
        <Bone className="h-6 w-40 rounded-lg" />
      </div>
      <div aria-hidden className="mb-5 grid grid-cols-12 gap-1">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="flex flex-col items-center gap-1 py-1.5">
            <span className="h-8 w-2.5 rounded-full bg-muted" />
            <Bone className="h-2 w-2" />
          </span>
        ))}
      </div>
      <div className="relative rounded-3xl border border-border bg-card p-2">
        <div aria-hidden className="grid grid-cols-7 gap-0.5 pt-8">
          {Array.from({ length: 35 }, (_, i) => (
            <span key={i} className="aspect-square rounded-xl bg-muted/60" />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 rounded-full bg-card p-3">
            <OrbitLoader sun={false} />
          </div>
        </div>
      </div>
    </Screen>
  );
}
