import { Link, Stack } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Txt } from "@/components/ui/Text";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <ScreenContainer className="items-center justify-center gap-4">
        <Txt variant="title">This screen doesn&apos;t exist.</Txt>
        <Link href="/">
          <Txt variant="label" className="text-brand">
            Go home
          </Txt>
        </Link>
      </ScreenContainer>
    </>
  );
}
