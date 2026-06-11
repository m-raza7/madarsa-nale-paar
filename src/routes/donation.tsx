import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Building, Users, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import emailjs from "@emailjs/browser";

export const Route = createFileRoute("/donation")({
  head: () => ({
    meta: [
      { title: "Donate — Madarsa NALE-PAAR" },
      {
        name: "description",
        content: "Support sacred education through Zakat, Sadaqah and Lillah donations.",
      },
      { property: "og:title", content: "Donate to Madarsa NALE-PAAR" },
      {
        property: "og:description",
        content: "Your contribution sponsors students and preserves Islamic learning.",
      },
    ],
  }),
  component: Donation,
});

const schema = z.object({
  donor_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional(),
  amount: z.number().positive().max(10_000_000),
  purpose: z.string(),
  message: z.string().max(500).optional(),
});

function Donation() {
  const [form, setForm] = useState({
    donor_name: "",
    email: "",
    phone: "",
    amount: "",
    purpose: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // const submit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const parsed = schema.safeParse({ ...form, amount: Number(form.amount) });
  //   if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
  //   setLoading(true);
  //   const { error } = await supabase.from("donations").insert(parsed.data);
  //   setLoading(false);
  //   if (error) toast.error(error.message);
  //   else {
  //     toast.success("Jazak Allah Khair! Your pledge is recorded. Please complete the transfer using the details on this page.");
  //     setForm({ donor_name: "", email: "", phone: "", amount: "", purpose: "general", message: "" });
  //   }
  // };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      ...form,
      amount: Number(form.amount),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("donations").insert(parsed.data);

    // Send notification email via EmailJS
    const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (SERVICE && TEMPLATE && PUBLIC) {
      try {
        await emailjs.send(
          SERVICE,
          TEMPLATE,
          {
            donor_name: parsed.data.donor_name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            amount: parsed.data.amount,
            purpose: parsed.data.purpose,
            message: parsed.data.message,
          },
          {
            publicKey: PUBLIC,
          },
        );
      } catch (err) {
        console.error("EmailJS error:", err);
        // non-fatal, donation is already saved
      }
    }

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Jazak Allah Khair! Your pledge is recorded and notification has been sent.");

      setForm({
        donor_name: "",
        email: "",
        phone: "",
        amount: "",
        purpose: "general",
        message: "",
      });
    }
  };

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-10 w-10 text-gold mx-auto mb-3" />
          <h1 className="font-display text-5xl md:text-6xl font-bold">Donate</h1>
          <p className="font-arabic text-2xl text-gold mt-3">
            مَنْ ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا
          </p>
          <p className="text-white/85 mt-2 italic">
            "Who is it that will lend Allah a goodly loan..."
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="font-display text-3xl font-bold">Ongoing Campaigns</h2>
          {[
            { icon: Building, name: "Building Fund", pct: 75, raised: "₹37.5L", goal: "₹50L" },
            { icon: Users, name: "Student Scholarships", pct: 40, raised: "₹8L", goal: "₹20L" },
            {
              icon: Heart,
              name: "Daily Meals (Iftar Sponsorship)",
              pct: 60,
              raised: "₹6L",
              goal: "₹10L",
            },
          ].map((c) => (
            <Card key={c.name} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary-gradient grid place-items-center">
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {c.raised} of {c.goal}
                  </p>
                </div>
                <span className="ml-auto gradient-text font-bold text-xl">{c.pct}%</span>
              </div>
              <Progress value={c.pct} className="h-2" />
            </Card>
          ))}

          <Card className="p-6 bg-secondary/40">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold">Bank Details</h3>
            </div>
            <dl className="text-sm grid grid-cols-3 gap-y-1.5">
              <dt className="text-muted-foreground">Account Name</dt>
              <dd className="col-span-2 font-medium">Madarsa NALE-PAAR Trust</dd>
              <dt className="text-muted-foreground">Account No.</dt>
              <dd className="col-span-2 font-medium">00000000000000</dd>
              <dt className="text-muted-foreground">IFSC</dt>
              <dd className="col-span-2 font-medium">SBIN0000000</dd>
              <dt className="text-muted-foreground">UPI</dt>
              <dd className="col-span-2 font-medium">alnoor@upi</dd>
            </dl>
          </Card>
        </div>

        <Card className="p-7 shadow-elegant">
          <h2 className="font-display text-2xl font-bold mb-1">Pledge Your Support</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Record your intent — we'll follow up with payment confirmation.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={form.donor_name}
                  onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Donation </Label>
                <label htmlFor="purpose" className="text-sm font-medium">
                  Purpose
                </label>
                <select
                  id="purpose"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="building">Building Fund</option>
                  <option value="scholarship">Student Scholarship</option>
                  <option value="zakat">Zakat</option>
                  <option value="sadaqah">Sadaqah</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">
              {loading ? "Submitting..." : "Pledge Now"}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
