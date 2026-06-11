import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const EMERALD = "#15803d";
const GOLD = "#b8860b";

function header(doc: jsPDF, title: string) {
  doc.setFillColor(EMERALD);
  doc.rect(0, 0, 210, 32, "F");
  doc.setFillColor(GOLD);
  doc.rect(0, 32, 210, 2, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("MADARSA NALE-PAAR", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Light of Knowledge  •  Est. 2005  •  Lucknow, India", 14, 21);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), 14, 28);
}

function footer(doc: jsPDF) {
  doc.setFontSize(8);
  doc.setTextColor("#555");
  doc.text(
    `Generated ${new Date().toLocaleDateString()} • This document is computer-generated.`,
    14,
    285,
  );
}

export type StudentICardData = {
  roll_number: string;
  full_name: string;
  father_name: string;
  course_name?: string;
  date_of_birth?: string | null;
  address?: string;
  mobile?: string;
  enrollment_date?: string;
  photo_url?: string | null;
};

export function downloadStudentICard(s: StudentICardData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  header(doc, "Student Identity Card");

  // Card outline
  doc.setDrawColor(EMERALD);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, 50, 170, 95, 4, 4);

  // Photo placeholder
  doc.setFillColor("#f3f4f6");
  doc.roundedRect(28, 58, 35, 45, 2, 2, "F");
  doc.setTextColor("#888");
  doc.setFontSize(8);
  doc.text("PHOTO", 39, 82);

  // Details
  doc.setTextColor("#111");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(s.full_name, 72, 66);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const rows: [string, string][] = [
    ["Roll No.", s.roll_number],
    ["Father's Name", s.father_name],
    ["Course", s.course_name ?? "—"],
    ["Date of Birth", s.date_of_birth ?? "—"],
    ["Enrolled", s.enrollment_date ?? "—"],
    ["Mobile", s.mobile ?? "—"],
  ];
  let y = 76;
  rows.forEach(([k, v]) => {
    doc.setTextColor("#666");
    doc.text(`${k}:`, 72, y);
    doc.setTextColor("#111");
    doc.setFont("helvetica", "bold");
    doc.text(String(v), 105, y);
    doc.setFont("helvetica", "normal");
    y += 7;
  });

  // Signature
  doc.setDrawColor("#999");
  doc.line(140, 135, 185, 135);
  doc.setFontSize(8);
  doc.setTextColor("#666");
  doc.text("Principal Signature", 150, 140);

  // Note
  doc.setFontSize(9);
  doc.setTextColor("#444");
  doc.text(
    "This card is the property of Madarsa NALE-PAAR and must be carried at all times.",
    20,
    160,
  );
  doc.text("If found, please return to the address above.", 20, 166);

  footer(doc);
  doc.save(`ICard-${s.roll_number}.pdf`);
}

export type ResultData = {
  student_name: string;
  roll_number: string;
  course_name?: string;
  exam_name: string;
  exam_date?: string | null;
  total_marks: number;
  obtained_marks: number;
  grade?: string | null;
  remarks?: string | null;
  subjects?: Array<{ name: string; total: number; obtained: number }> | null;
};

export function downloadResult(r: ResultData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  header(doc, `Result — ${r.exam_name}`);

  doc.setTextColor("#111");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const meta: [string, string][] = [
    ["Student", r.student_name],
    ["Roll Number", r.roll_number],
    ["Course", r.course_name ?? "—"],
    ["Exam Date", r.exam_date ?? "—"],
  ];
  let y = 46;
  meta.forEach(([k, v]) => {
    doc.setTextColor("#666");
    doc.text(`${k}:`, 14, y);
    doc.setTextColor("#111");
    doc.setFont("helvetica", "bold");
    doc.text(String(v), 55, y);
    doc.setFont("helvetica", "normal");
    y += 7;
  });

  const subjects = r.subjects ?? [
    { name: r.exam_name, total: r.total_marks, obtained: r.obtained_marks },
  ];
  autoTable(doc, {
    startY: y + 4,
    head: [["Subject", "Total", "Obtained", "Percentage"]],
    body: subjects.map((s) => [
      s.name,
      String(s.total),
      String(s.obtained),
      `${((s.obtained / s.total) * 100).toFixed(1)}%`,
    ]),
    headStyles: { fillColor: EMERALD, textColor: "#fff", fontStyle: "bold" },
    alternateRowStyles: { fillColor: "#f4f9f4" },
    margin: { left: 14, right: 14 },
  });

  const pct = ((r.obtained_marks / r.total_marks) * 100).toFixed(1);
  const finalY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFillColor("#f4f9f4");
  doc.roundedRect(14, finalY, 182, 26, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(EMERALD);
  doc.text(`Total: ${r.obtained_marks} / ${r.total_marks}   (${pct}%)`, 20, finalY + 10);
  doc.setTextColor(GOLD);
  doc.text(`Grade: ${r.grade ?? "—"}`, 20, finalY + 19);
  if (r.remarks) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#333");
    doc.text(`Remarks: ${r.remarks}`, 90, finalY + 14);
  }

  footer(doc);
  doc.save(`Result-${r.roll_number}-${r.exam_name.replace(/\s+/g, "_")}.pdf`);
}
