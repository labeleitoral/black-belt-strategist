import { useState, useEffect, useRef } from "react";
import { Camera, Save, Instagram, Facebook, Linkedin, Twitter, MessageCircle, Globe, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileData {
  full_name: string;
  headline: string;
  bio: string;
  specialty: string;
  location: string;
  marketing_political_areas: string;
  academic_background: string;
  experience_summary: string;
  curriculum_cv: string;
  avatar_url: string;
  instagram_url: string;
  facebook_url: string;
  linkedin_url: string;
  twitter_url: string;
  whatsapp_number: string;
  portfolio_url: string;
}

const emptyProfile: ProfileData = {
  full_name: "", headline: "", bio: "", specialty: "", location: "",
  marketing_political_areas: "", academic_background: "", experience_summary: "",
  curriculum_cv: "", avatar_url: "", instagram_url: "", facebook_url: "",
  linkedin_url: "", twitter_url: "", whatsapp_number: "", portfolio_url: "",
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          headline: data.headline ?? "",
          bio: data.bio ?? "",
          specialty: data.specialty ?? "",
          location: data.location ?? "",
          marketing_political_areas: data.marketing_political_areas ?? "",
          academic_background: data.academic_background ?? "",
          experience_summary: data.experience_summary ?? "",
          curriculum_cv: data.curriculum_cv ?? "",
          avatar_url: data.avatar_url ?? "",
          instagram_url: (data as any).instagram_url ?? "",
          facebook_url: (data as any).facebook_url ?? "",
          linkedin_url: (data as any).linkedin_url ?? "",
          twitter_url: (data as any).twitter_url ?? "",
          whatsapp_number: (data as any).whatsapp_number ?? "",
          portfolio_url: (data as any).portfolio_url ?? "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 5MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao enviar imagem"); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setProfile(p => ({ ...p, avatar_url: publicUrl }));
    await supabase.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", user.id);
    toast.success("Foto atualizada!");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name || null,
      headline: profile.headline || null,
      bio: profile.bio || null,
      specialty: profile.specialty || null,
      location: profile.location || null,
      marketing_political_areas: profile.marketing_political_areas || null,
      academic_background: profile.academic_background || null,
      experience_summary: profile.experience_summary || null,
      curriculum_cv: profile.curriculum_cv || null,
      avatar_url: profile.avatar_url || null,
      instagram_url: profile.instagram_url || null,
      facebook_url: profile.facebook_url || null,
      linkedin_url: profile.linkedin_url || null,
      twitter_url: profile.twitter_url || null,
      whatsapp_number: profile.whatsapp_number || null,
      portfolio_url: profile.portfolio_url || null,
      updated_at: new Date().toISOString(),
    } as any).eq("id", user.id);

    if (error) toast.error("Erro ao salvar perfil");
    else toast.success("Perfil salvo com sucesso!");
    setSaving(false);
  };

  const set = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [field]: e.target.value }));

  if (loading) return <p className="text-muted-foreground p-8">Carregando...</p>;

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-display font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Configure seu perfil profissional na rede.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-border">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
                {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-medium">{profile.full_name || "Seu nome"}</p>
          <p className="text-sm text-muted-foreground">{profile.headline || "Adicione um headline"}</p>
        </div>
      </div>

      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-semibold border-b border-border pb-2">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={profile.full_name} onChange={set("full_name")} placeholder="Seu nome" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input value={profile.headline} onChange={set("headline")} placeholder="Ex: Estrategista político" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Especialidade</Label>
            <Input value={profile.specialty} onChange={set("specialty")} placeholder="Ex: Marketing Digital Político" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Localização</Label>
            <Input value={profile.location} onChange={set("location")} placeholder="Ex: São Paulo, SP" className="bg-secondary border-border" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Área de atuação em Marketing Político</Label>
          <Input value={profile.marketing_political_areas} onChange={set("marketing_political_areas")} placeholder="Ex: Campanhas municipais, comunicação institucional" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Biografia</Label>
          <Textarea value={profile.bio} onChange={set("bio")} placeholder="Conte um pouco sobre você..." rows={4} className="bg-secondary border-border" />
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-semibold border-b border-border pb-2">Experiência & Formação</h2>
        <div className="space-y-2">
          <Label>Resumo de experiência</Label>
          <Textarea value={profile.experience_summary} onChange={set("experience_summary")} placeholder="Principais experiências profissionais..." rows={4} className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Formação acadêmica</Label>
          <Textarea value={profile.academic_background} onChange={set("academic_background")} placeholder="Graduação, pós-graduação, cursos..." rows={3} className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Currículo (texto livre)</Label>
          <Textarea value={profile.curriculum_cv} onChange={set("curriculum_cv")} placeholder="Detalhes adicionais do currículo..." rows={4} className="bg-secondary border-border" />
        </div>
      </section>

      {/* Social Links */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-semibold border-b border-border pb-2">Redes Sociais & Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</Label>
            <Input value={profile.instagram_url} onChange={set("instagram_url")} placeholder="https://instagram.com/seu_perfil" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</Label>
            <Input value={profile.facebook_url} onChange={set("facebook_url")} placeholder="https://facebook.com/seu_perfil" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</Label>
            <Input value={profile.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/seu_perfil" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Twitter className="h-4 w-4" /> X (Twitter)</Label>
            <Input value={profile.twitter_url} onChange={set("twitter_url")} placeholder="https://x.com/seu_perfil" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Portfólio</Label>
            <Input value={profile.portfolio_url} onChange={set("portfolio_url")} placeholder="https://seusite.com" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp (opcional)</Label>
            <Input value={profile.whatsapp_number} onChange={set("whatsapp_number")} placeholder="5511999999999" className="bg-secondary border-border" />
          </div>
        </div>
      </section>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="gold-gradient text-primary-foreground w-full md:w-auto">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Salvar Perfil
      </Button>
    </div>
  );
}
