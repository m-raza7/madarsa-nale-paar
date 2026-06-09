import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Sparkles, Facebook, Instagram, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-bold gradient-text">Madarsa Al-Noor</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Light of Knowledge</div>
            </div>
          </div>
          <p className="text-sm text-sidebar-foreground/70 font-arabic text-lg mb-2">طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ</p>
          <p className="text-xs text-sidebar-foreground/60">"Seeking knowledge is an obligation upon every Muslim."</p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-gold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[["About","/about"],["Courses","/courses"],["Faculty","/faculty"],["Admission","/admission"],["Results","/results"]].map(([l,h])=>(
              <li key={h}><Link to={h} className="text-sidebar-foreground/80 hover:text-gold transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-gold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            {[["Gallery","/gallery"],["News & Events","/events"],["Donate","/donation"],["Contact","/contact"]].map(([l,h])=>(
              <li key={h}><Link to={h} className="text-sidebar-foreground/80 hover:text-gold transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-gold mb-3">Contact</h4>
          <ul className="space-y-3 text-sm text-sidebar-foreground/80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold" /><span>123 Rahmat Road, Lucknow, India</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold" /><span>+91 90000 00000</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold" /><span>info@madrasaalnoor.edu</span></li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent hover:bg-gold hover:text-gold-foreground transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent hover:bg-gold hover:text-gold-foreground transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent hover:bg-gold hover:text-gold-foreground transition-colors"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-sidebar-border py-5 text-center text-xs text-sidebar-foreground/60">
        © {new Date().getFullYear()} Madarsa Al-Noor. All rights reserved.
      </div>
    </footer>
  );
}
