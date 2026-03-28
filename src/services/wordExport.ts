import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, TextRun, BorderStyle } from "docx";

// Helper to parse markdown tables into docx tables
// This is a simplified parser for the specific 19-column and 16-column tables
function parseMarkdownTable(markdown: string) {
  const lines = markdown.trim().split("\n");
  if (lines.length < 3) return null;

  const rows = lines
    .filter((line) => line.includes("|") && !line.includes("---"))
    .map((line) => {
      return line
        .split("|")
        .filter((cell, index, array) => index > 0 && index < array.length - 1)
        .map((cell) => cell.trim());
    });

  if (rows.length === 0) return null;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row) => {
      return new TableRow({
        children: row.map((cell) => {
          return new TableCell({
            children: [new Paragraph({ text: cell, alignment: AlignmentType.CENTER })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          });
        }),
      });
    }),
  });
}

export async function exportToWord(markdown: string, filename: string = "De_Kiem_Tra.docx") {
  // Split markdown by sections (Step 1 to Step 6)
  const sections = markdown.split(/## Bước \d\./);
  
  const children: any[] = [];

  sections.forEach((section, index) => {
    if (!section.trim()) return;

    const title = `Bước ${index}. ${section.split("\n")[0].trim()}`;
    const content = section.split("\n").slice(1).join("\n").trim();

    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Check for tables in content
    const tableRegex = /\|(.+)\|/g;
    const parts = content.split(/\n\s*\n/);

    parts.forEach((part) => {
      if (part.includes("|") && part.includes("---")) {
        const table = parseMarkdownTable(part);
        if (table) {
          children.push(table);
        }
      } else {
        const lines = part.split("\n");
        lines.forEach((line) => {
          children.push(
            new Paragraph({
              children: [new TextRun(line)],
              spacing: { after: 120 },
            })
          );
        });
      }
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
