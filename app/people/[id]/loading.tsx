import { Screen } from "@/components/screen";
import { Bone } from "@/components/skeletons";

// A person's page while it loads: the countdown panel, their checklist and the sections below.
export default function Loading() {
  return (
    <Screen back="/" title={<Bone className="h-5 w-40 rounded-lg" />}>
      <p role="status" className="sr-only">
        Loading
      </p>
      <div className="mb-4 flex flex-col gap-2 px-1">
        <Bone className="h-3.5 w-36" />
      </div>
      <div className="flex flex-col gap-3 rounded-3xl bg-orbit-soft p-5">
        <Bone className="h-7 w-48 rounded-lg bg-primary/10" />
        <Bone className="h-3.5 w-32 bg-primary/10" />
      </div>
      <Bone className="mt-8 mb-3 ml-1 h-4 w-44 rounded-md" />
      <div aria-hidden className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="h-14 rounded-xl border border-border" />
          ))}
        </div>
        <span className="h-11 rounded-xl border border-border" />
      </div>
      <Bone className="mt-8 mb-3 ml-1 h-4 w-24 rounded-md" />
      <span aria-hidden className="h-14 rounded-2xl border border-border bg-card" />
    </Screen>
  );
}
