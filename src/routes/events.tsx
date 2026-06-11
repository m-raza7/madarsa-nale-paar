import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Pin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "News & Events — Madarsa NALE-PAAR" },
      {
        name: "description",
        content: "Announcements, circulars, exam notices and upcoming events.",
      },
      { property: "og:title", content: "News & Events" },
      { property: "og:description", content: "Stay informed about Madarsa NALE-PAAR." },
    ],
  }),
  component: Events,
});

function Events() {
  const { data: notices = [] } = useQuery({
    queryKey: ["notices-all"],
    queryFn: async () =>
      (
        await supabase
          .from("notices")
          .select("*")
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">News & Events</h1>
          <p className="text-white/85 mt-4">Latest announcements, circulars and updates.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-5">
        {notices.map((n) => (
          <Card
            key={n.id}
            className={`p-6 hover:shadow-elegant transition-shadow ${n.pinned ? "border-l-4 border-l-gold" : ""}`}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(n.created_at).toLocaleDateString()}
              {n.pinned && <Pin className="h-3.5 w-3.5 text-gold ml-1" />}
              <Badge variant="secondary" className="ml-auto capitalize">
                {n.category}
              </Badge>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">{n.title}</h3>
            <p className="text-sm text-muted-foreground">{n.body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
