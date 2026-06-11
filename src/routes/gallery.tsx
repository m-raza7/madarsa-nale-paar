import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Madarsa NALE-PAAR" },
      {
        name: "description",
        content: "Photos from classrooms, events, Quran competitions and annual programs.",
      },
      { property: "og:title", content: "Gallery" },
      { property: "og:description", content: "Moments from Madarsa NALE-PAAR." },
    ],
  }),
  component: Gallery,
});

const cats = ["all", "classrooms", "events", "competitions", "programs", "sports"];

const samples = [
  {
    id: "s1",
    category: "classrooms",
    image_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
    title: "Quran class",
  },
  {
    id: "s2",
    category: "events",
    image_url: "https://images.unsplash.com/photo-1564769625392-651b2c376b78?w=800",
    title: "Annual gathering",
  },
  {
    id: "s3",
    category: "competitions",
    image_url: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800",
    title: "Hifz competition",
  },
  {
    id: "s4",
    category: "programs",
    image_url: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800",
    title: "Ramadan program",
  },
  {
    id: "s5",
    category: "classrooms",
    image_url: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800",
    title: "Library study",
  },
  {
    id: "s6",
    category: "events",
    image_url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",
    title: "Graduation",
  },
  {
    id: "s7",
    category: "competitions",
    image_url: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800",
    title: "Tajweed contest",
  },
  {
    id: "s8",
    category: "sports",
    image_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
    title: "Annual sports",
  },
];

function Gallery() {
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () =>
      (await supabase.from("gallery").select("*").order("created_at", { ascending: false })).data ??
      [],
  });
  const list = data.length ? data : samples;
  const filtered = active === "all" ? list : list.filter((i) => i.category === active);

  return (
    <div>
      <section className="bg-primary-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold">Gallery</h1>
          <p className="text-white/85 mt-4">Glimpses from our journey of learning.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <Tabs value={active} onValueChange={setActive} className="mb-8">
          <TabsList className="flex-wrap h-auto">
            {cats.map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((img) => (
            <button
              key={img.id}
              onClick={() => setLightbox(img.image_url)}
              className="block w-full break-inside-avoid overflow-hidden rounded-xl shadow-elegant group"
            >
              <img
                src={img.image_url}
                alt={img.title ?? ""}
                loading="lazy"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      </section>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
