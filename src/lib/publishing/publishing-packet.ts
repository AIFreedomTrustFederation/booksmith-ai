import type { BooksmithManuscript } from "./manuscript-model";

export function createPublishingPacketReadme(book: BooksmithManuscript): string {
  return [
    `# ${book.config.title} Publishing Packet`,
    "",
    "This packet is intended to collect the files needed for human review, proofing, distribution, and long-term provenance.",
    "",
    "## Book",
    "",
    `- Slug: ${book.slug}`,
    `- Version: ${book.config.version}`,
    `- Series: ${book.config.series}`,
    `- Status: ${book.config.status}`,
    `- Provenance required: ${book.config.provenanceRequired ? "yes" : "no"}`,
    "",
    "## Current Phase One Status",
    "",
    "- LaTeX export folder generation: started",
    "- PDF proof dashboard: pending",
    "- EPUB/DOCX export: pending",
    "- Full publishing packet builder: pending",
    "",
  ].join("\n");
}
