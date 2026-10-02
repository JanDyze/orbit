import type { Metadata } from "next";
import { OrbitMark } from "@/components/orbit-mark";
import { Wordmark } from "@/components/wordmark";
import { GoogleButton } from "./google-button";
import { signIn } from "./actions";

const LINK_MESSAGES = {
  expired: "That sign-in link has expired or was already used. Try again.",
  google: "Google sign-in isn't available right now. Try again in a moment.",
  cancelled: "Sign-in was cancelled.",
};

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, link } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <OrbitMark className="size-24" motion="intro" />
        <div>
          <h1>
            <Wordmark className="text-4xl" />
          </h1>
          <p className="mt-1 text-muted-foreground">Every birthday is one more trip around the sun.</p>
        </div>
      </div>
      {typeof link === "string" && link in LINK_MESSAGES && (
        <p role="alert" className="mb-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {LINK_MESSAGES[link as keyof typeof LINK_MESSAGES]}
        </p>
      )}
      <form action={signIn}>
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        <GoogleButton />
      </form>
    </main>
  );
}
