import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Building2, Eye, Target, History, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Madarsa NALE-PAAR" },
      {
        name: "description",
        content: "History, vision, mission and management of Madarsa NALE-PAAR.",
      },
      { property: "og:title", content: "About Madarsa NALE-PAAR" },
      {
        property: "og:description",
        content: "Two decades of Islamic scholarship and character building.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="font-arabic text-2xl text-gold mb-3">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold">About NALE-PAAR</h1>
          <p className="text-white/85 mt-4 max-w-2xl mx-auto">
            A journey of two decades preserving sacred knowledge and shaping righteous scholars.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: History,
            title: "Our History",
            body: "Founded in 2005 by Mufti Abdullah ibn Yusuf with just 15 students, NALE-PAAR has grown into a leading seminary serving hundreds of seekers each year.",
          },
          {
            icon: Eye,
            title: "Our Vision",
            body: "To revive the prophetic tradition of learning and produce God-conscious scholars and leaders for the Ummah.",
          },
          {
            icon: Target,
            title: "Our Mission",
            body: "Provide authentic Islamic education combining classical Dars-e-Nizami with modern skills, free of cost to those in need.",
          },
        ].map((b) => (
          <Card
            key={b.title}
            className="p-7 hover:shadow-elegant transition-shadow border-t-4 border-t-gold"
          >
            <div className="h-12 w-12 rounded-xl bg-primary-gradient grid place-items-center mb-4">
              <b.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">{b.title}</h3>
            <p className="text-sm text-muted-foreground">{b.body}</p>
          </Card>
        ))}
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Our <span className="gradient-text">Journey</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              ["2005", "Founded with 15 students in a small rented building."],
              ["2010", "Established the Hifz department with 60 huffaz graduates to date."],
              ["2015", "Launched full 8-year Alim course following classical Dars-e-Nizami."],
              ["2020", "Expanded campus with library, hostel, and computer lab."],
              ["2026", "Serving 850+ students across 12 programs with 45 dedicated teachers."],
            ].map(([year, text]) => (
              <div key={year} className="flex gap-5">
                <div className="shrink-0">
                  <div className="h-14 w-14 rounded-full bg-gold-gradient grid place-items-center font-display font-bold text-gold-foreground shadow-gold">
                    {year}
                  </div>
                </div>
                <Card className="flex-1 p-5">
                  <p className="text-sm">{text}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold text-center mb-10">Management Committee</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            ["Mufti Abdullah ibn Yusuf", "Founder & Principal"],
            ["Sh. Imran Ahmed", "Vice Principal"],
            ["Hafiz Bilal Khan", "Head of Hifz"],
            ["Dr. Yasmin Siddiqui", "Academic Director"],
          ].map(([name, role]) => (
            <Card key={name} className="p-6 text-center hover:shadow-elegant">
              <div className="h-20 w-20 rounded-full bg-primary-gradient mx-auto grid place-items-center mb-3">
                <Users className="h-9 w-9 text-primary-foreground" />
              </div>
              <h4 className="font-display font-bold">{name}</h4>
              <p className="text-xs text-gold uppercase tracking-wider mt-1">{role}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <Card className="p-10 bg-primary-gradient text-primary-foreground text-center">
          <Sparkles className="h-8 w-8 text-gold mx-auto mb-3" />
          <p className="font-arabic text-2xl text-gold mb-2">
            إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ
          </p>
          <p className="italic">
            "Indeed, it is only those of His servants who have knowledge that fear Allah." — Quran
            35:28
          </p>
        </Card>
      </section>
    </div>
  );
}
