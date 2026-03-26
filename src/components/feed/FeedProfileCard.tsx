import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Users, Lightbulb, Briefcase, Brain } from "lucide-react";

interface Profile {
  full_name: string | null;
  headline: string | null;
  specialty: string | null;
  avatar_url: string | null;
  location: string | null;
}

export function FeedProfileCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, headline, specialty, avatar_url, location")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "BB";

  const navLinks = [
    { icon: User, label: "Meu Perfil", to: "/perfil" },
    { icon: Users, label: "Rede", to: "/rede" },
    { icon: Lightbulb, label: "Insights", to: "/insights" },
    { icon: Briefcase, label: "Cases", to: "/cases" },
    { icon: Brain, label: "Agentes", to: "/agentes" },
  ];

  return (
    <>
      {/* Desktop version */}
      <div className="hidden lg:block sticky top-6">
        <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
          {/* Progressive blur header */}
          <div className="relative h-20 gold-gradient">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
          </div>

          <div className="px-4 pb-4 -mt-8 relative z-10">
            <Avatar className="h-16 w-16 border-2 border-primary ring-2 ring-background">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="mt-3">
              <h3 className="font-display font-bold text-foreground truncate">
                {profile?.full_name || "Membro Black Belt"}
              </h3>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {profile?.headline || "Estrategista Político"}
              </p>
              {profile?.specialty && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {profile.specialty}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile banner */}
      <div className="lg:hidden glass-card rounded-xl p-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-primary font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-sm truncate">
              {profile?.full_name || "Membro Black Belt"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.headline || "Estrategista Político"}
            </p>
          </div>
          <Link
            to="/perfil"
            className="text-xs text-primary hover:underline shrink-0"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </>
  );
}
