import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ChevronsUpDown,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Bell,
  Settings,
  UserCircle,
  Image,
  Video,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "4rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween" ,
  ease: "easeOut" ,
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Revenue", url: "/admin/revenue", icon: DollarSign },
  { title: "Media", url: "/admin/media", icon: Image },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

const settingsItems = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Profile", url: "/admin/profile", icon: UserCircle },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div
      className="sidebar fixed left-0 z-40 h-full shrink-0 border-r border-border bg-card"
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div className="relative h-full" variants={contentVariants}>
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex h-full flex-col gap-4 py-4">
            <div className="px-2">
              {/* Organization Header */}
              <div className="flex h-fit flex-col gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex cursor-pointer flex-row items-center gap-2 rounded-lg p-2 hover:bg-muted/50">
                      <Avatar className="h-8 w-8 shrink-0 rounded-md bg-primary text-primary-foreground">
                        <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-sm font-semibold">
                          G
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="flex flex-row items-center gap-2 overflow-hidden"
                        variants={variants}
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                              Grovvest Academy
                            </p>
                            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </>
                        )}
                      </motion.div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="right"
                    className="w-52"
                  >
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> View Website
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Main Navigation */}
            <ScrollArea className="flex-1 px-2">
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-col gap-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.url);
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-2.5 transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <motion.span
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          variants={variants}
                        >
                          {!isCollapsed && item.title}
                        </motion.span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>

            {/* Bottom Section */}
            <div className="mt-auto px-2">
              <Separator className="mb-4 bg-border" />
              
              {/* Settings Links */}
              <div className="flex flex-col gap-1 mb-4">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-2.5 transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <motion.span
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        variants={variants}
                      >
                        {!isCollapsed && item.title}
                      </motion.span>
                    </Link>
                  );
                })}
              </div>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex cursor-pointer flex-row items-center gap-2 rounded-lg p-2 hover:bg-muted/50">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="flex flex-col overflow-hidden"
                      variants={variants}
                    >
                      {!isCollapsed && (
                        <>
                          <p className="text-sm font-medium text-foreground whitespace-nowrap">
                            Admin User
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            admin@grovvest.com
                          </span>
                        </>
                      )}
                    </motion.div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  className="w-52"
                >
                  <div className="flex flex-row items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-foreground">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Admin User</span>
                      <span className="text-xs text-muted-foreground">
                        admin@grovvest.com
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="flex items-center gap-2">
                    <Link to="/admin/profile">
                      <UserCircle className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-destructive"
                    onClick={() => navigate("/")}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}

export default AdminSidebar;