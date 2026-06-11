import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { downloadStudentICard, downloadResult } from "@/lib/pdf";
import {
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  Download,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Madarsa NALE-PAAR" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, roles, hasRole, refreshRoles } = useAuth();
  const isAdmin = hasRole("admin");
  const isTeacher = hasRole("teacher");
  const isStaff = isAdmin || isTeacher;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold font-semibold">Portal</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">As-salāmu ʿalaykum</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <Badge key={r} className="capitalize bg-primary-gradient">
              {r}
            </Badge>
          ))}
          {roles.length === 0 && <Badge variant="outline">No role yet</Badge>}
        </div>
      </div>

      <Tabs defaultValue={isStaff ? "students" : "me"} className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="me">My Profile</TabsTrigger>
          {isStaff && <TabsTrigger value="students">Students</TabsTrigger>}
          {isStaff && <TabsTrigger value="results">Results</TabsTrigger>}
          {isStaff && <TabsTrigger value="admissions">Admissions</TabsTrigger>}
          {isStaff && <TabsTrigger value="notices">Notices</TabsTrigger>}
          {isAdmin && <TabsTrigger value="roles">Role Manager</TabsTrigger>}
        </TabsList>

        <TabsContent value="me" className="mt-6">
          <MyProfile />
        </TabsContent>
        {isStaff && (
          <TabsContent value="students" className="mt-6">
            <StudentsAdmin />
          </TabsContent>
        )}
        {isStaff && (
          <TabsContent value="results" className="mt-6">
            <ResultsAdmin />
          </TabsContent>
        )}
        {isStaff && (
          <TabsContent value="admissions" className="mt-6">
            <AdmissionsAdmin />
          </TabsContent>
        )}
        {isStaff && (
          <TabsContent value="notices" className="mt-6">
            <NoticesAdmin />
          </TabsContent>
        )}
        {isAdmin && (
          <TabsContent value="roles" className="mt-6">
            <RolesAdmin onChanged={refreshRoles} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function MyProfile() {
  const { user, roles } = useAuth();
  const { data: student } = useQuery({
    queryKey: ["my-student", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("students")
        .select("*, courses(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const { data: results = [] } = useQuery({
    queryKey: ["my-results", student?.id],
    queryFn: async () => {
      if (!student) return [];
      const { data } = await supabase
        .from("results")
        .select("*")
        .eq("student_id", student.id)
        .order("exam_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!student,
  });

  return (
    <div className="grid md:grid-cols-3 gap-5">
      <Card className="p-6 md:col-span-1">
        <div className="h-20 w-20 rounded-full bg-primary-gradient grid place-items-center mb-3">
          <Users className="h-10 w-10 text-primary-foreground" />
        </div>
        <h3 className="font-display text-xl font-bold">{user?.user_metadata?.full_name || "—"}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {roles.map((r) => (
            <Badge key={r} className="capitalize">
              {r}
            </Badge>
          ))}
        </div>
      </Card>
      <Card className="p-6 md:col-span-2">
        <h3 className="font-display text-lg font-bold mb-3">Student Record</h3>
        {!student ? (
          <p className="text-sm text-muted-foreground">
            No student record linked to your account yet. Ask the office to link your roll number.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Roll No.</dt>
              <dd className="font-medium">{student.roll_number}</dd>
              <dt className="text-muted-foreground">Course</dt>
              <dd>{student.courses?.name ?? "—"}</dd>
              <dt className="text-muted-foreground">Father</dt>
              <dd>{student.father_name}</dd>
              <dt className="text-muted-foreground">Enrolled</dt>
              <dd>{student.enrollment_date}</dd>
            </dl>
            <div className="flex gap-2 mt-4 flex-wrap">
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
                <Download className="h-4 w-4 mr-1" /> Download I-Card
              </Button>
            </div>
            {results.length > 0 && (
              <div className="mt-5">
                <h4 className="font-semibold mb-2">My Results</h4>
                <div className="space-y-2">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border rounded-md p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{r.exam_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.obtained_marks}/{r.total_marks} · Grade {r.grade ?? "—"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
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
                            subjects: r.subjects as never,
                          })
                        }
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function StudentsAdmin() {
  const { data: students = [], refetch } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () =>
      (
        await supabase
          .from("students")
          .select("*, courses(name)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["c-list"],
    queryFn: async () => (await supabase.from("courses").select("id,name")).data ?? [],
  });
  const [f, setF] = useState({
    roll_number: "",
    full_name: "",
    father_name: "",
    mobile: "",
    course_id: "",
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("students").insert(f);
    if (error) toast.error(error.message);
    else {
      toast.success("Student added");
      setF({ roll_number: "", full_name: "", father_name: "", mobile: "", course_id: "" });
      refetch();
    }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      refetch();
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-6 lg:col-span-1">
        <h3 className="font-display font-bold mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Add Student
        </h3>
        <form onSubmit={add} className="space-y-3">
          <div>
            <Label>Roll Number</Label>
            <Input
              value={f.roll_number}
              onChange={(e) => setF({ ...f, roll_number: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input
              value={f.full_name}
              onChange={(e) => setF({ ...f, full_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Father's Name</Label>
            <Input
              value={f.father_name}
              onChange={(e) => setF({ ...f, father_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Mobile</Label>
            <Input value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} />
          </div>
          <div>
            <Label>Course</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={f.course_id}
              onChange={(e) => setF({ ...f, course_id: e.target.value })}
            >
              <option value="">— select —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full bg-primary-gradient">
            Add
          </Button>
        </form>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-display font-bold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> All Students ({students.length})
        </h3>
        <div className="space-y-2 max-h-[600px] overflow-auto">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <p className="font-medium text-sm">
                  {s.full_name}{" "}
                  <span className="text-xs text-muted-foreground">({s.roll_number})</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.courses?.name ?? "—"} · {s.mobile ?? "—"}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ResultsAdmin() {
  const { data: students = [] } = useQuery({
    queryKey: ["s-list"],
    queryFn: async () =>
      (await supabase.from("students").select("id, roll_number, full_name").order("roll_number"))
        .data ?? [],
  });
  const { data: results = [], refetch } = useQuery({
    queryKey: ["all-results"],
    queryFn: async () =>
      (
        await supabase
          .from("results")
          .select("*, students(roll_number, full_name)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const [f, setF] = useState({
    student_id: "",
    exam_name: "",
    exam_date: "",
    total_marks: "100",
    obtained_marks: "",
    grade: "",
    remarks: "",
  });
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("results").insert({
      student_id: f.student_id,
      exam_name: f.exam_name,
      exam_date: f.exam_date || null,
      total_marks: Number(f.total_marks),
      obtained_marks: Number(f.obtained_marks),
      grade: f.grade || null,
      remarks: f.remarks || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Result added");
      refetch();
    }
  };
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-6 lg:col-span-1">
        <h3 className="font-display font-bold mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Upload Result
        </h3>
        <form onSubmit={add} className="space-y-3">
          <div>
            <Label>Student</Label>
            <select
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={f.student_id}
              onChange={(e) => setF({ ...f, student_id: e.target.value })}
            >
              <option value="">— select —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.roll_number} · {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Exam Name</Label>
            <Input
              value={f.exam_name}
              onChange={(e) => setF({ ...f, exam_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={f.exam_date}
              onChange={(e) => setF({ ...f, exam_date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Total</Label>
              <Input
                type="number"
                value={f.total_marks}
                onChange={(e) => setF({ ...f, total_marks: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Obtained</Label>
              <Input
                type="number"
                value={f.obtained_marks}
                onChange={(e) => setF({ ...f, obtained_marks: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Grade</Label>
            <Input
              value={f.grade}
              onChange={(e) => setF({ ...f, grade: e.target.value })}
              placeholder="A+"
            />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input value={f.remarks} onChange={(e) => setF({ ...f, remarks: e.target.value })} />
          </div>
          <Button type="submit" className="w-full bg-primary-gradient">
            Save Result
          </Button>
        </form>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-display font-bold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Published Results ({results.length})
        </h3>
        <div className="space-y-2 max-h-[600px] overflow-auto">
          {results.map((r) => (
            <div key={r.id} className="border rounded-md p-3 text-sm">
              <p className="font-medium">{r.exam_name}</p>
              <p className="text-xs text-muted-foreground">
                {r.students?.roll_number} · {r.students?.full_name} · {r.obtained_marks}/
                {r.total_marks} · {r.grade ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AdmissionsAdmin() {
  const { data: items = [], refetch } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () =>
      (
        await supabase
          .from("admissions")
          .select("*, courses(name)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("admissions").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      refetch();
    }
  };
  return (
    <Card className="p-6">
      <h3 className="font-display font-bold mb-3 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary" /> Admission Applications ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((a) => (
          <div
            key={a.id}
            className="border rounded-md p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="text-sm">
              <p className="font-medium">
                {a.student_name}{" "}
                <Badge variant="outline" className="ml-2 capitalize">
                  {a.status}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Father: {a.father_name} · {a.mobile} · {a.courses?.name ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">{a.address}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => update(a.id, "approved")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => update(a.id, "rejected")}>
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NoticesAdmin() {
  const { data: notices = [], refetch } = useQuery({
    queryKey: ["n-list"],
    queryFn: async () =>
      (await supabase.from("notices").select("*").order("created_at", { ascending: false })).data ??
      [],
  });
  const [f, setF] = useState({ title: "", body: "", category: "news", pinned: false });
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("notices").insert(f);
    if (error) toast.error(error.message);
    else {
      toast.success("Posted");
      setF({ title: "", body: "", category: "news", pinned: false });
      refetch();
    }
  };
  const del = async (id: string) => {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) toast.error(error.message);
    else refetch();
  };
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-6 lg:col-span-1">
        <h3 className="font-display font-bold mb-3">New Notice</h3>
        <form onSubmit={add} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Body</Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={f.body}
              onChange={(e) => setF({ ...f, body: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={f.category}
              onChange={(e) => setF({ ...f, category: e.target.value })}
            >
              <option value="news">News</option>
              <option value="announcement">Announcement</option>
              <option value="circular">Circular</option>
              <option value="event">Event</option>
              <option value="exam">Exam</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.pinned}
              onChange={(e) => setF({ ...f, pinned: e.target.checked })}
            />{" "}
            Pin to top
          </label>
          <Button type="submit" className="w-full bg-primary-gradient">
            Publish
          </Button>
        </form>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-display font-bold mb-3">Published ({notices.length})</h3>
        <div className="space-y-2 max-h-[600px] overflow-auto">
          {notices.map((n) => (
            <div key={n.id} className="border rounded-md p-3 flex justify-between gap-2">
              <div>
                <p className="font-medium text-sm">
                  {n.title}{" "}
                  {n.pinned && <Badge className="ml-1 bg-gold text-gold-foreground">Pinned</Badge>}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(n.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RolesAdmin({ onChanged }: { onChanged: () => void }) {
  const { data: rows = [], refetch } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () =>
      (
        await supabase
          .from("user_roles")
          .select("id, user_id, role, created_at")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("teacher");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) toast.error(error.message);
    else {
      toast.success("Role assigned");
      setUid("");
      refetch();
      onChanged();
    }
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      refetch();
      onChanged();
    }
  };
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-6 lg:col-span-1">
        <h3 className="font-display font-bold mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Assign Role
        </h3>
        <form onSubmit={add} className="space-y-3">
          <div>
            <Label>User ID (UUID)</Label>
            <Input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
              placeholder="paste user id"
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "teacher" | "student")}
            >
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-primary-gradient">
            Assign
          </Button>
          <p className="text-xs text-muted-foreground">
            Find user IDs in the Cloud dashboard → Users.
          </p>
        </form>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-display font-bold mb-3">All Role Assignments</h3>
        <div className="space-y-2 max-h-[600px] overflow-auto">
          {rows.map((r) => (
            <div
              key={r.id}
              className="border rounded-md p-3 flex justify-between items-center text-sm"
            >
              <div>
                <p className="font-mono text-xs">{r.user_id}</p>
                <Badge className="capitalize mt-1">{r.role}</Badge>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// silence unused import
void Link;
