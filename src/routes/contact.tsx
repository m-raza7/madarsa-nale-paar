import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Madarsa Al-Noor" },
      {
        name: "description",
        content: "Reach Madarsa Al-Noor by phone, email, WhatsApp or visit our campus.",
      },
      { property: "og:title", content: "Contact" },
      { property: "og:description", content: "Get in touch with Madarsa Al-Noor." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(5).max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contacts").insert(parsed.data);
    // Optionally send via EmailJS if configured (publishable IDs are safe in client)
    const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (SERVICE && TEMPLATE && PUBLIC) {
      try {
        await emailjs.send(SERVICE, TEMPLATE, parsed.data, { publicKey: PUBLIC });
      } catch {
        /* non-fatal */
      }
    }
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Message received. We'll reply soon, in sha Allah.");
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">Contact Us</h1>
          <p className="text-white/85 mt-3">We'd love to hear from you.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: MapPin, label: "Address", value: "123 Rahmat Road, Lucknow, India" },
            { icon: Phone, label: "Phone", value: "+91 90000 00000" },
            { icon: Mail, label: "Email", value: "info@madrasaalnoor.edu" },
          ].map((c) => (
            <Card key={c.label} className="p-5 flex items-center gap-4 hover:shadow-elegant">
              <div className="h-12 w-12 rounded-xl bg-primary-gradient grid place-items-center">
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </div>
                <div className="font-medium">{c.value}</div>
              </div>
            </Card>
          ))}
          <a href="https://wa.me/919000000000" target="_blank" rel="noopener noreferrer">
            <Card className="p-5 flex items-center gap-4 bg-[#25D366]/10 border-[#25D366]/30 hover:shadow-elegant transition">
              <div className="h-12 w-12 rounded-xl bg-[#25D366] grid place-items-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  WhatsApp
                </div>
                <div className="font-medium">Chat with us</div>
              </div>
            </Card>
          </a>
          <Card className="overflow-hidden">
            <iframe
              title="map"
              className="w-full h-64"
              src="https://www.google.com/maps?q=Lucknow+India&output=embed"
              loading="lazy"
            />
          </Card>
        </div>

        <Card className="p-7 shadow-elegant">
          <h2 className="font-display text-2xl font-bold mb-4">Send a Message</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
