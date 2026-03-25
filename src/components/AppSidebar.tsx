import {
  LayoutDashboard,
  Brain,
  Lightbulb,
  Briefcase,
  Users,
  FlaskConical,
  BookOpen,
  Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Agentes", url: "/agentes", icon: Brain },
  { title: "Insights", url: "/insights", icon: Lightbulb },
  { title: "Cases", url: "/cases", icon: Briefcase },
  { title: "Rede", url: "/rede", icon: Users },
  { title: "Lab", url: "/lab", icon: FlaskConical },
  { title: "Biblioteca", url: "/biblioteca", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role } = useAuth();

  const allItems = role === "admin"
    ? [...items, { title: "Admin", url: "/admin", icon: Shield }]
    : items;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-3 px-4 py-6">
          <img src={logo} alt="Black Belt" className="h-8 w-auto" />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`transition-colors ${active ? "text-primary" : "text-sidebar-foreground hover:text-foreground"}`}
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
