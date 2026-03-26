import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Instagram, Facebook, Linkedin, Twitter, Globe, MessageCircle, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const roleLabels: Record<string, string> = { admin: "Admin", mentor: "Mentor", membro: "Membro" };

const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&q=80";

interface MemberProfile {
  id: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  specialty: string | null;
  location: string | null;
  avatar_url: string | null;
  marketing_political_areas: string | null;
  academic_background: string | null;
  experience_summary: string | null;
  curriculum_cv: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  whatsapp_number: string | null;
  portfolio_url: string | null;
  role?: string;
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/80 border border-border hover:border-primary/30 hover:bg-secondary transition-all text-sm text-foreground"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </a>
  );
}

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchMember = async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (!profile) { setLoading(false); return; }

      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", id).single();
      setMember({
        ...profile,
        instagram_url: (profile as any).instagram_url,
        facebook_url: (profile as any).facebook_url,
        linkedin_url: (profile as any).linkedin_url,
        twitter_url: (profile as any).twitter_url,
        whatsapp_number: (profile as any).whatsapp_number,
        portfolio_url: (profile as any).portfolio_url,
        role: roleData?.role ?? "membro",
      });
      setLoading(false);
    };
    fetchMember();
  }, [id]);

  if (loading) return <p className="text-muted-foreground p-8">Carregando...</p>;
  if (!member) return <p className="text-muted-foreground p-8">Membro não encontrado.</p>;

  const isVerified = member.role === "admin" || member.role === "mentor";
  const socialLinks = [
    member.instagram_url && { href: member.instagram_url, icon: Instagram, label: "Instagram" },
    member.facebook_url && { href: member.facebook_url, icon: Facebook, label: "Facebook" },
    member.linkedin_url && { href: member.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    member.twitter_url && { href: member.twitter_url, icon: Twitter, label: "X" },
    member.portfolio_url && { href: member.portfolio_url, icon: Globe, label: "Portfólio" },
  ].filter(Boolean) as { href: string; icon: any; label: string }[];

  return (
    <div className="max-w-4xl space-y-0 pb-12">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate("/rede")} className="mb-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Rede
      </Button>

      {/* Hero */}
      <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden">
        <img
          src={member.avatar_url || defaultAvatar}
          alt={member.full_name || "Membro"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Progressive blur overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 backdrop-blur-[3px]"
          style={{ maskImage: "linear-gradient(to top, black 40%, transparent)" }}
        />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {member.full_name || "Sem nome"}
            </h1>
            {isVerified && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              {roleLabels[member.role ?? "membro"]}
            </Badge>
          </div>
          {member.headline && (
            <p className="text-white/70 text-sm md:text-base">{member.headline}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-white/60 text-sm">
            {member.specialty && (
              <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{member.specialty}</span>
            )}
            {member.location && (
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{member.location}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {member.bio && (
            <section className="glass-card rounded-xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Biografia</h2>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line">{member.bio}</p>
            </section>
          )}

          {member.marketing_political_areas && (
            <section className="glass-card rounded-xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Áreas de Atuação</h2>
              <p className="text-foreground/90 text-sm leading-relaxed">{member.marketing_political_areas}</p>
            </section>
          )}

          {member.experience_summary && (
            <section className="glass-card rounded-xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Experiência</h2>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line">{member.experience_summary}</p>
            </section>
          )}

          {member.academic_background && (
            <section className="glass-card rounded-xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Formação Acadêmica
              </h2>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line">{member.academic_background}</p>
            </section>
          )}

          {member.curriculum_cv && (
            <section className="glass-card rounded-xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Currículo</h2>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line">{member.curriculum_cv}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {socialLinks.length > 0 && (
            <section className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Redes Sociais</h2>
              <div className="space-y-2">
                {socialLinks.map(link => (
                  <SocialLink key={link.label} {...link} />
                ))}
              </div>
            </section>
          )}

          {member.whatsapp_number && (
            <a
              href={`https://wa.me/${encodeURIComponent(member.whatsapp_number.replace(/\D/g, ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl gold-gradient text-primary-foreground font-medium text-sm transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
