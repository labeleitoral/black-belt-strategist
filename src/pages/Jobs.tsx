import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Job {
  id: string;
  content: string;
  created_at: string;
  image_url: string | null;
  link_url: string | null;
  author: {
    id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  };
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("posts_lab")
        .select("id, content, created_at, image_url, link_url, author_id")
        .eq("category", "vaga")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      const authorIds = [...new Set(data.map((j) => j.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, headline, avatar_url")
        .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"]);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      setJobs(
        data.map((j) => {
          const p = profileMap.get(j.author_id);
          return {
            id: j.id,
            content: j.content,
            created_at: j.created_at,
            image_url: j.image_url,
            link_url: j.link_url,
            author: {
              id: j.author_id,
              full_name: p?.full_name || null,
              headline: p?.headline || null,
              avatar_url: p?.avatar_url || null,
            },
          };
        })
      );
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Vagas de Trabalho</h1>
          <p className="text-sm text-muted-foreground">Oportunidades na área de marketing político</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma vaga publicada ainda.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Publique uma vaga no feed selecionando a categoria "Vaga de Trabalho"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const initials = job.author.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?";

            return (
              <div key={job.id} className="glass-card rounded-xl p-5 border border-border hover:border-primary/20 transition-colors animate-fade-in">
                <div className="flex items-start gap-4">
                  <Link to={`/rede/${job.author.id}`}>
                    <Avatar className="h-12 w-12 border border-primary/30">
                      <AvatarImage src={job.author.avatar_url || undefined} className="object-cover" />
                      <AvatarFallback className="bg-secondary text-primary font-bold">{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/rede/${job.author.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {job.author.full_name || "Membro"}
                      </Link>
                      <span className="text-xs text-muted-foreground">· {job.author.headline || "Membro Black Belt"}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{job.content}</p>

                    {job.image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img src={job.image_url} alt="" className="w-full max-h-64 object-cover" />
                      </div>
                    )}

                    {job.link_url && (
                      <a
                        href={job.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        Candidatar-se →
                      </a>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(job.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
