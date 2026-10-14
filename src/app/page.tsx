import { Panel } from "@/components/panel/Panel";
import { Header } from "@/components/ui/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <Panel />
      </main>
    </>
  );
}
