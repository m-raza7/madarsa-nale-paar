import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { downloadResult, downloadStudentICard } from "@/lib/pdf";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — Madarsa NALE-PAAR" },
      { name: "description", content: "Check exam results by roll number and download as PDF." },
      { property: "og:title", content: "Results" },
      { property: "og:description", content: "Student results lookup." },
    ],
  }),
  component: Results,
});

type ResultRow = {
  id: string;
  exam_name: string;
  exam_date: string | null;
  total_marks: number;
  obtained_marks: number;
  grade: string | null;
  remarks: string | null;
  subjects: Array<{ name: string; total: number; obtained: number }> | null;
};
type StudentRow = {
  id: string;
  roll_number: string;
  full_name: string;
  father_name: string;
  date_of_birth: string | null;
  mobile: string | null;
  address: string | null;
  enrollment_date: string;
  courses?: { name: string } | null;
};

function Results() {
  const [roll, setRoll] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roll.trim()) return;
    setLoading(true);
    setStudent(null);
    setResults([]);
    const { data: s } = await supabase
      .from("students")
      .select(
        "id, roll_number, full_name, father_name, date_of_birth, mobile, address, enrollment_date, courses(name)",
      )
      .eq("roll_number", roll.trim())
      .maybeSingle();
    if (!s) {
      toast.error("No student found with that roll number");
      setLoading(false);
      return;
    }
    setStudent(s as unknown as StudentRow);
    const { data: rs } = await supabase
      .from("results")
      .select("*")
      .eq("student_id", s.id)
      .order("exam_date", { ascending: false });
    setResults((rs ?? []) as ResultRow[]);
    setLoading(false);
  };

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">Results</h1>
          <p className="text-white/85 mt-3">Enter your roll number to view and download results.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="p-6 shadow-elegant">
          <form onSubmit={search} className="flex gap-3">
            <div className="flex-1">
              <Label>Roll Number</Label>
              <Input
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                placeholder="e.g. ALN-2024-001"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="self-end bg-primary-gradient">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </Card>

        {student && (
          <Card className="p-6 mt-6">
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">{student.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  Roll: <span className="font-medium text-foreground">{student.roll_number}</span> ·
                  Father: {student.father_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Course: {student.courses?.name ?? "—"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  downloadStudentICard({
                    roll_number: student.roll_number,
                    full_name: student.full_name,
                    father_name: student.father_name,
                    course_name: student.courses?.name,
                    date_of_birth: student.date_of_birth,
                    address: student.address ?? "",
                    mobile: student.mobile ?? "",
                    enrollment_date: student.enrollment_date,
                  })
                }
              >
                <Download className="h-4 w-4 mr-2" /> I-Card PDF
              </Button>
            </div>
          </Card>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-display text-xl font-bold">Exam Results</h3>
            {results.map((r) => {
              const pct = ((r.obtained_marks / r.total_marks) * 100).toFixed(1);
              return (
                <Card
                  key={r.id}
                  className="p-5 flex items-center justify-between hover:shadow-elegant"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gold-gradient grid place-items-center">
                      <FileText className="h-5 w-5 text-gold-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-bold">{r.exam_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.exam_date ?? "—"} · {r.obtained_marks}/{r.total_marks} ({pct}%) · Grade{" "}
                        {r.grade ?? "—"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      student &&
                      downloadResult({
                        student_name: student.full_name,
                        roll_number: student.roll_number,
                        course_name: student.courses?.name,
                        exam_name: r.exam_name,
                        exam_date: r.exam_date,
                        total_marks: r.total_marks,
                        obtained_marks: r.obtained_marks,
                        grade: r.grade,
                        remarks: r.remarks,
                        subjects: r.subjects,
                      })
                    }
                  >
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {student && results.length === 0 && (
          <Card className="p-8 mt-6 text-center text-muted-foreground">
            No results published yet for this student.
          </Card>
        )}
      </section>
    </div>
  );
}
