import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Lightbulb, Briefcase, MessageSquare, Image, Video, LinkIcon, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "discussao", label: "Discussão", icon: MessageSquare },
  { value: "insight", label: "Insight", icon: Lightbulb },
  { value: "recomendacao", label: "Recomendação", icon: Lightbulb },
  { value: "pesquisa", label: "Pesquisa", icon: Lightbulb },
  { value: "case", label: "Case", icon: Briefcase },
  { value: "vaga", label: "Vaga de Trabalho", icon: Briefcase },
];

export function FeedComposer({ onPublished }: { onPublished?: () => void }) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("BB");
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("discussao");

  // Media state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setInitials(
            data.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "BB"
          );
        }
      });
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    const ext = imageFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("post-media")
      .upload(path, imageFile);
    if (error) {
      toast.error("Erro ao enviar imagem");
      return null;
    }
    const { data } = supabase.storage.from("post-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);

    let image_url: string | null = null;
    if (imageFile) {
      image_url = await uploadImage();
    }

    const { error } = await supabase.from("posts_lab").insert({
      content: content.trim(),
      author_id: user.id,
      category,
      image_url,
      video_url: videoUrl.trim() || null,
      link_url: linkUrl.trim() || null,
    });

    setLoading(false);
    if (error) {
      toast.error("Erro ao publicar");
    } else {
      toast.success("Publicação criada!");
      resetForm();
      onPublished?.();
    }
  };

  const resetForm = () => {
    setContent("");
    setIsOpen(false);
    setCategory("discussao");
    setImageFile(null);
    setImagePreview(null);
    setVideoUrl("");
    setLinkUrl("");
    setShowLinkInput(false);
    setShowVideoInput(false);
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border border-primary/30 shrink-0">
          <AvatarImage src={avatarUrl || undefined} className="object-cover" />
          <AvatarFallback className="bg-secondary text-primary font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {!isOpen ? (
            <button
              onClick={() => setIsOpen(true)}
              className="w-full text-left text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-lg px-4 py-2.5 transition-colors"
            >
              Compartilhe algo com a comunidade...
            </button>
          ) : (
            <div className="space-y-3">
              {/* Category selector */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      category === cat.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <cat.icon className="h-3 w-3" />
                    {cat.label}
                  </button>
                ))}
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="O que você quer compartilhar?"
                className="bg-secondary/50 border-border focus:border-primary/30 min-h-[100px] resize-none"
                autoFocus
              />

              {/* Image preview */}
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Video URL input */}
              {showVideoInput && (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="URL do vídeo (YouTube, Vimeo...)"
                    className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/30"
                  />
                  <button onClick={() => { setShowVideoInput(false); setVideoUrl(""); }}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Link URL input */}
              {showLinkInput && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Cole um link aqui..."
                    className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/30"
                  />
                  <button onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Media buttons */}
              <div className="flex items-center gap-1">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                  title="Adicionar imagem"
                >
                  <Image className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowVideoInput(!showVideoInput)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                  title="Adicionar vídeo"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                  title="Adicionar link"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={resetForm}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <Button size="sm" onClick={handlePost} disabled={!content.trim() || loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Publicando...</>
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
    </div>
  );
}
