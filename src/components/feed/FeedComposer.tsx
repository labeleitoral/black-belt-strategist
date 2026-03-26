import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Lightbulb, Briefcase, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FeedComposer({ onPublished }: { onPublished?: () => void }) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("BB");
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase
      .from("posts_lab")
      .insert({ content: content.trim(), author_id: user.id });
    setLoading(false);
    if (error) {
      toast.error("Erro ao publicar");
    } else {
      toast.success("Publicação criada!");
      setContent("");
      setIsOpen(false);
      onPublished?.();
    }
  };

  const quickActions = [
    { icon: Lightbulb, label: "Insight", to: "/insights" },
    { icon: Briefcase, label: "Case", to: "/cases" },
  ];

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border border-primary/30 shrink-0">
          <AvatarImage src={avatarUrl || undefined} />
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
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="O que você quer compartilhar?"
                className="bg-secondary/50 border-border focus:border-primary/30 min-h-[100px] resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setContent("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={!content.trim() || loading}
                >
                  {loading ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isOpen && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <action.icon className="h-4 w-4 text-primary" />
              {action.label}
            </Link>
          ))}
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            Discussão
          </button>
        </div>
      )}
    </div>
  );
}
