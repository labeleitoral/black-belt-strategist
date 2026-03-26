import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Camera, ArrowRight, ArrowLeft, Check, User, Briefcase, Share2, FileText } from "lucide-react";

const STEPS = [
  { title: "Boas-vindas", icon: User, description: "Vamos começar com o básico" },
  { title: "Profissional", icon: Briefcase, description: "Seus dados profissionais" },
  { title: "Redes Sociais", icon: Share2, description: "Conecte seus perfis" },
  { title: "Bio & Experiência", icon: FileText, description: "Conte sua história" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    specialty: "",
    location: "",
    marketing_political_areas: "",
    academic_background: "",
    instagram_url: "",
    linkedin_url: "",
    facebook_url: "",
    twitter_url: "",
    whatsapp_number: "",
    portfolio_url: "",
    bio: "",
    experience_summary: "",
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let avatar_url: string | null = null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...form,
          ...(avatar_url ? { avatar_url } : {}),
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil criado com sucesso! Bem-vindo à Black Belt.");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Comunidade <span className="text-primary">Black Belt</span>
          </h1>
          <p className="text-muted-foreground">Complete seu perfil para acessar o ecossistema</p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((s, i) => (
              <span key={i} className={i <= step ? "text-primary font-medium" : ""}>
                {s.title}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
            <div>
              <h2 className="text-lg font-semibold text-foreground">{STEPS[step].title}</h2>
              <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
            </div>
          </div>

          {/* Step 1: Avatar + Name */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-24 w-24 rounded-full bg-secondary border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center overflow-hidden group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-muted-foreground">Clique para adicionar sua foto</p>
              </div>
              <div>
                <Label>Nome completo</Label>
                <Input value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Seu nome completo" className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label>Headline</Label>
                <Input value={form.headline} onChange={e => update("headline", e.target.value)} placeholder="Ex: Estrategista de Campanhas Políticas" className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Especialidade</Label>
                  <Input value={form.specialty} onChange={e => update("specialty", e.target.value)} placeholder="Ex: Marketing Político" className="mt-1.5 bg-secondary border-border" />
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Ex: São Paulo, SP" className="mt-1.5 bg-secondary border-border" />
                </div>
              </div>
              <div>
                <Label>Áreas de atuação em marketing político</Label>
                <Input value={form.marketing_political_areas} onChange={e => update("marketing_political_areas", e.target.value)} placeholder="Ex: Campanhas municipais, comunicação digital" className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label>Background acadêmico</Label>
                <Textarea value={form.academic_background} onChange={e => update("academic_background", e.target.value)} placeholder="Sua formação acadêmica" rows={3} className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>
          )}

          {/* Step 3: Social Links */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input value={form.instagram_url} onChange={e => update("instagram_url", e.target.value)} placeholder="https://instagram.com/..." className="mt-1.5 bg-secondary border-border" />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={form.linkedin_url} onChange={e => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." className="mt-1.5 bg-secondary border-border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facebook</Label>
                  <Input value={form.facebook_url} onChange={e => update("facebook_url", e.target.value)} placeholder="https://facebook.com/..." className="mt-1.5 bg-secondary border-border" />
                </div>
                <div>
                  <Label>X (Twitter)</Label>
                  <Input value={form.twitter_url} onChange={e => update("twitter_url", e.target.value)} placeholder="https://x.com/..." className="mt-1.5 bg-secondary border-border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>WhatsApp (opcional)</Label>
                  <Input value={form.whatsapp_number} onChange={e => update("whatsapp_number", e.target.value)} placeholder="+55 11 99999-9999" className="mt-1.5 bg-secondary border-border" />
                </div>
                <div>
                  <Label>Portfólio</Label>
                  <Input value={form.portfolio_url} onChange={e => update("portfolio_url", e.target.value)} placeholder="https://meuportfolio.com" className="mt-1.5 bg-secondary border-border" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label>Biografia</Label>
                <Textarea value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Conte um pouco sobre você, sua trajetória e o que te motiva..." rows={5} className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label>Resumo de experiência</Label>
                <Textarea value={form.experience_summary} onChange={e => update("experience_summary", e.target.value)} placeholder="Principais experiências e resultados alcançados..." rows={5} className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="gold-gradient text-primary-foreground gap-2">
                Próximo <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving} className="gold-gradient text-primary-foreground gap-2">
                {saving ? "Salvando..." : <>Concluir <Check className="h-4 w-4" /></>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
