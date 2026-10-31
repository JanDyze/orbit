import { Screen } from "@/components/screen";
import { Bone, RowBones } from "@/components/skeletons";

// Everyone, while the list loads: the search box in its place, then rows.
export default function Loading() {
  return (
    <Screen back="/" title="Everyone">
      <div className="-mx-4 -mt-5 px-4 pt-3 pb-3">
        <div aria-hidden className="flex h-12 items-center rounded-xl border border-input bg-card px-11 dark:bg-input/30">
          <Bone className="h-3 w-32" />
        </div>
      </div>
      <p role="status" className="sr-only">
        Loading everyone
      </p>
      <Bone className="mt-2 mb-2 ml-1 h-3.5 w-4 rounded-md" />
      <RowBones count={8} />
    </Screen>
  );
}
