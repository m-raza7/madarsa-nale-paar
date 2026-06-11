import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/admission")({
  head: () => ({
    meta: [
      { title: "Admission — Madarsa NALE-PAAR" },
      {
        name: "description",
        content: "Apply for admission to our Hifz, Alim, Tajweed and Arabic programs.",
      },
      { property: "og:title", content: "Admission" },
      { property: "og:description", content: "Begin your journey of sacred learning." },
    ],
  }),
  component: Admission,
});

const schema = z.object({
  student_name: z.string().trim().min(2).max(100),
  father_name: z.string().trim().min(2).max(100),
  mobile: z.string().trim().min(7).max(20),
  address: z.string().trim().min(5).max(500),
  date_of_birth: z.string().optional(),
  previous_education: z.string().max(500).optional(),
  course_id: z.string().uuid(),
});

function Admission() {
  const { data: courses = [] } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () =>
      (await supabase.from("courses").select("id,name").order("name")).data ?? [],
  });

  const [form, setForm] = useState({
    student_name: "",
    father_name: "",
    mobile: "",
    address: "",
    date_of_birth: "",
    previous_education: "",
    course_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("admissions")
      .insert({ ...parsed.data, date_of_birth: parsed.data.date_of_birth || null });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      setDone(true);
      toast.success("Application submitted!");
    }
  };

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">Admission</h1>
          <p className="text-white/85 mt-3">Begin a lifetime of sacred learning.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {done ? (
            <Card className="p-10 text-center">
              <CheckCircle className="h-14 w-14 text-primary mx-auto mb-3" />
              <h2 className="font-display text-2xl font-bold mb-2">Jazak Allah Khair</h2>
              <p className="text-muted-foreground">
                Your application has been received. Our team will contact you within 3 working days,
                in sha Allah.
              </p>
              <Button onClick={() => setDone(false)} className="mt-5 bg-primary-gradient">
                Submit Another
              </Button>
            </Card>
          ) : (
            <Card className="p-7 shadow-elegant">
              <h2 className="font-display text-2xl font-bold mb-1">Admission Form</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Fill the form below — we'll get back to you soon.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Student Name *</Label>
                    <Input
                      value={form.student_name}
                      onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Father's Name *</Label>
                    <Input
                      value={form.father_name}
                      onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Mobile *</Label>
                    <Input
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Address *</Label>
                  <Textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Previous Education</Label>
                  <Textarea
                    rows={2}
                    value={form.previous_education}
                    onChange={(e) => setForm({ ...form, previous_education: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Course *</Label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  >
                    <option value="">Select a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">Guidelines</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Submit a recent photograph at the interview.</li>
              <li>Carry original birth certificate and previous mark sheets.</li>
              <li>Two parent guardians required at interview.</li>
              <li>Hifz program requires basic Nazra fluency.</li>
            </ul>
          </Card>
          <Card className="p-6 bg-secondary/40">
            <h3 className="font-display font-bold mb-3">Fee Structure</h3>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt>Registration</dt>
                <dd className="font-medium">₹500</dd>
              </div>
              <div className="flex justify-between">
                <dt>Monthly tuition</dt>
                <dd className="font-medium">₹1,500</dd>
              </div>
              <div className="flex justify-between">
                <dt>Hostel (optional)</dt>
                <dd className="font-medium">₹3,000</dd>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <dt className="text-muted-foreground">Need-based</dt>
                <dd className="text-primary font-semibold">Full scholarships available</dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>
    </div>
  );
}
