import { DraftVault } from "@/app/studio/components/draft-vault";

export default function DraftVaultPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Draft Vault</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">Your uncommitted writing should never become invisible.</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">
            The Living Manuscript deliberately keeps working drafts on this device until a governed repository-save path exists. Draft Vault makes that boundary visible: inspect the local drafts, copy or export them, and deliberately discard them when you no longer want them. Nothing here is represented as committed canon.
          </p>
        </header>
        <div className="mt-6"><DraftVault /></div>
      </section>
    </main>
  );
}
