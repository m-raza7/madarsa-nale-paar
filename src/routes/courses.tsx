import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Madarsa Al-Noor" },
      { name: "description", content: "Hifz, Nazra, Tajweed, Alim Course, Arabic Language and Islamic Studies — full curricula." },
      { property: "og:title", content: "Our Courses" },
      { property: "og:description", content: "Programs from beginner Nazra to the 8-year Alim Course." },
    ],
  }),
  component: Courses,
});

function Courses() {
  const { data: courses = [] } = useQuery({
    queryKey: ["courses-all"],
    queryFn: async () => (await supabase.from("courses").select("*").order("name")).data ?? [],
  });

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">Our Courses</h1>
          <p className="text-white/85 mt-4 max-w-2xl mx-auto">From beginner Quranic reading to advanced Islamic scholarship.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Card key={c.id} className="p-7 group hover:shadow-elegant hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary-gradient grid place-items-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <Badge className="bg-gold text-gold-foreground"><Clock className="h-3 w-3 mr-1" /> {c.duration}</Badge>
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">{c.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
            <div className="text-xs text-muted-foreground mb-5">
              <span className="font-semibold text-foreground">Eligibility:</span> {c.eligibility}
            </div>
            <Button asChild className="w-full bg-primary-gradient">
              <Link to="/admission">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
}
