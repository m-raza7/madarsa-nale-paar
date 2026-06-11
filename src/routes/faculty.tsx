import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty — Madarsa NALE-PAAR" },
      {
        name: "description",
        content: "Meet our scholars and teachers — qualifications, specializations and experience.",
      },
      { property: "og:title", content: "Faculty" },
      { property: "og:description", content: "Expert scholars dedicated to sacred learning." },
    ],
  }),
  component: Faculty,
});

const sample = [
  {
    name: "Mufti Abdullah ibn Yusuf",
    qualification: "Mufti (Darul Uloom Deoband)",
    specialization: "Fiqh & Usool",
    experience: "25+ years",
  },
  {
    name: "Sh. Imran Ahmed",
    qualification: "Alim (Al-Azhar)",
    specialization: "Hadith Sciences",
    experience: "18 years",
  },
  {
    name: "Hafiz Bilal Khan",
    qualification: "Hafiz, Qari (Madinah)",
    specialization: "Hifz & Tajweed",
    experience: "15 years",
  },
  {
    name: "Dr. Yasmin Siddiqui",
    qualification: "PhD Islamic Studies",
    specialization: "Tafseer & Arabic",
    experience: "20 years",
  },
  {
    name: "Maulana Saif Rahman",
    qualification: "Alim (Nadwa)",
    specialization: "Seerah & History",
    experience: "12 years",
  },
  {
    name: "Qari Hamza Ali",
    qualification: "Qari (Egypt)",
    specialization: "Qiraat",
    experience: "10 years",
  },
];

function Faculty() {
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => (await supabase.from("teachers").select("*").order("name")).data ?? [],
  });
  const list = teachers.length ? teachers : sample;

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">Our Faculty</h1>
          <p className="text-white/85 mt-4 max-w-2xl mx-auto">
            Scholars of authentic transmission and lived practice.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((t, i) => (
          <Card
            key={i}
            className="p-7 text-center group hover:shadow-elegant hover:-translate-y-1 transition-all"
          >
            <div className="h-24 w-24 mx-auto rounded-full bg-primary-gradient grid place-items-center mb-4 shadow-elegant group-hover:scale-105 transition">
              <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold">{t.name}</h3>
            <p className="text-xs text-gold uppercase tracking-wider mt-1 mb-3">
              {t.qualification}
            </p>
            <Badge variant="secondary" className="mb-2">
              {t.specialization}
            </Badge>
            <p className="text-xs text-muted-foreground">{t.experience} of teaching</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
