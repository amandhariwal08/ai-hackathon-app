"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { Database, FileIcon } from "lucide-react";
import { NavUser } from "./nav-user";
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const data = {
    user: {
      name: session?.user.firstname || "" + session?.user.lastname || "",
      email: session?.user.email || "",
      avatar: "",
    },
    navMain: [
      {
        title: "Schemas",
        url: "/column-schemas",
        icon: Database,
      },
      {
        title: "File Upload",
        url: "/file-upload",
        icon: FileIcon,
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/column-schemas">
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">Schema Sync</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
