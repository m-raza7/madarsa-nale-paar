import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Quote,
  Heart,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-madrasa.jpg";
import quranImg from "@/assets/quran.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Madarsa Al-Noor — Premier Islamic Seminary" },
      {
        name: "description",
        content:
          "Hifz, Alim, Tajweed, Arabic and Islamic Studies under expert scholars. Admissions open for the new academic session.",
      },
      { property: "og:title", content: "Madarsa Al-Noor — Light of Knowledge" },
      {
        property: "og:description",
        content: "Premier Islamic seminary with 20+ years of service.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { icon: Users, label: "Students", value: "850+" },
  { icon: GraduationCap, label: "Teachers", value: "45" },
  { icon: BookOpen, label: "Courses", value: "12" },
  { icon: Award, label: "Years of Service", value: "20+" },
];

function Home() {
  const { data: notices } = useQuery({
    queryKey: ["notices-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses-home"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").limit(4);
      return data ?? [];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Madarsa Al-Noor majestic Islamic architecture"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative container mx-auto px-4 py-28 md:py-40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 mb-6 text-gold text-sm">
              <Sparkles className="h-4 w-4" /> Admissions Open 2026
            </div>
            <p className="font-arabic text-3xl md:text-5xl text-gold mb-4">
              طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
              Madarsa <span className="gradient-text">Nale-paar</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8 italic">
              "Seeking knowledge is an obligation upon every Muslim."
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gold-gradient text-gold-foreground hover:opacity-90 shadow-gold"
              >
                <Link to="/admission">
                  Apply for Admission <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/40 hover:bg-white/20 backdrop-blur-sm"
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 text-center glass shadow-elegant hover:shadow-gold transition-shadow">
                <s.icon className="h-7 w-7 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold gradient-text font-display">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {s.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WELCOME */}
      <section className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-3">Welcome</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            A Sanctuary of <span className="gradient-text">Sacred Knowledge</span>
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            For over two decades, Madarsa Al-Noor has nurtured generations of students in the
            timeless tradition of Islamic scholarship — combining classical curricula with modern
            pedagogy, character building, and community service.
          </p>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Our graduates serve as imams, scholars, teachers and leaders across the world, carrying
            forward the light of the Quran and Sunnah.
          </p>
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link to="/about">
              Learn Our Story <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <img
            src={quranImg}
            alt="Open Holy Quran on rehal"
            width={1280}
            height={896}
            loading="lazy"
            className="rounded-2xl shadow-elegant w-full h-auto"
          />
          <div className="absolute -bottom-6 -right-6 glass rounded-2xl p-5 shadow-gold hidden md:block">
            <Quote className="h-6 w-6 text-gold mb-2" />
            <p className="text-sm max-w-[14rem]">
              "The best of you is the one who learns the Quran and teaches it."
            </p>
            <p className="text-xs text-muted-foreground mt-1">— Sahih al-Bukhari</p>
          </div>
        </motion.div>
      </section>

      {/* COURSES PREVIEW */}
      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-3">
              What We Teach
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Our Sacred <span className="gradient-text">Curricula</span>
            </h2>
            <p className="text-muted-foreground">
              From Nazra to the full Alim Course — every path begins here.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(courses ?? []).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 h-full group hover:border-primary transition-all hover:shadow-elegant">
                  <div className="h-12 w-12 rounded-xl bg-primary-gradient grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1">{c.name}</h3>
                  <p className="text-xs text-gold mb-2">{c.duration}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{c.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild className="bg-primary-gradient">
              <Link to="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NOTICES */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-2">
              Stay Informed
            </p>
            <h2 className="font-display text-4xl font-bold">
              Latest <span className="gradient-text">Announcements</span>
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/events">All News</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {(notices ?? []).map((n) => (
            <Card
              key={n.id}
              className="p-6 hover:shadow-elegant transition-shadow border-l-4 border-l-gold"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(n.created_at).toLocaleDateString()}
                <span className="ml-auto rounded-full bg-primary/10 text-primary px-2 py-0.5 uppercase tracking-wider">
                  {n.category}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{n.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{n.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* DONATION CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-10 md:p-16 text-center shadow-elegant">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <Heart className="h-10 w-10 text-gold mx-auto mb-4 relative" />
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-3 relative">
            Support Sacred Knowledge
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-6 relative">
            Your contribution sponsors students, builds classrooms, and preserves the legacy of
            Islamic learning for future generations.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gold-gradient text-gold-foreground hover:opacity-90 shadow-gold relative"
          >
            <Link to="/donation">
              Donate Now <Heart className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* VISIT */}
      <section className="container mx-auto px-4 pb-20 text-center">
        <MapPin className="h-8 w-8 mx-auto text-primary mb-2" />
        <h3 className="font-display text-2xl font-bold mb-2">Visit Us</h3>
        <p className="text-muted-foreground">
          123 Rahmat Road, Lucknow, India · Open Saturday–Thursday
        </p>
      </section>
    </div>
  );
}
