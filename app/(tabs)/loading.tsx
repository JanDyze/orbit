import { FindLink } from "@/components/find-link";
import { Screen } from "@/components/screen";
import { OrbitLoader, RowBones } from "@/components/skeletons";

// Your year while it loads: the dial's ring at the dial's size, then the lens list.
export default function Loading() {
  return (
    <Screen tabBar action={<FindLink />}>
      <OrbitLoader className="max-w-[26rem]" />
      <div className="mt-3 flex h-11 items-center justify-center">
        <h2 className="font-brand text-lg font-extrabold tracking-tight text-muted-foreground">Next 30 days</h2>
      </div>
      <div className="mt-3">
        <RowBones count={4} />
      </div>
    </Screen>
  );
}
