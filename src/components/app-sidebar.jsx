"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, BotIcon, ShoppingBasket, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { hasPermission } from "@/authentication/hasPermission"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "eCommerce",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
    },

  ],
  navMain: [
  {
    title: "Products",
    url: "#",
    isActive: true,
    icon: <ShoppingBasket />,
    items: [
      {
        title: "Add Product",
        url: "/dashboard/addproduct",
        resource: "PRODUCTS",
        action: "CREATE",
      },
      {
        title: "Add Collection",
        url: "/dashboard/addcollection",
        resource: "COLLECTION",
        action: "CREATE",
      },
      {
        title: "Product List",
        url: "/dashboard/productlist",
        resource: "PRODUCTS",
        action: "READ",
      },
    ],
  },
  {
    title: "Users",
    url: "#",
    icon: <User />,
    items: [
      {
        title: "Add Users",
        url: "/dashboard/adduser",
        resource: "USER",
        action: "CREATE",
      },
      {
        title: "User List",
        url: "/dashboard/userlist",
        resource: "USER",
        action: "READ",
      },
    ],
  },
],
}


export function AppSidebar({
  ...props
}) {
  const { user } = useAuth()

  const filteredNavMain = data.navMain
  .map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      hasPermission(user, item.resource, item.action)
    ),
  }))
  .filter((section) => section.items.length > 0);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
