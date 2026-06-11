"use client";

import Image from "next/image";
import Link from "next/link";
import type { User } from "next-auth";
import { RocketIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUpgradeCTA } from "@/components/sidebar-upgrade-cta";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({ user, isAdmin }: { user: User | undefined; isAdmin?: boolean }) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <Link
            className="flex flex-row items-center"
            href="/"
            onClick={() => {
              setOpenMobile(false);
            }}
          >
            <Image
              alt="Bedda Logo"
              className="h-8 w-8 shrink-0"
              height={32}
              priority
              src="/images/bedda-coral-icon-background-transparent.png"
              unoptimized
              width={32}
            />
            <span className="cursor-pointer rounded-md px-2 font-semibold text-lg hover:bg-muted">
              bedda.ai
            </span>
          </Link>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/projects"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M2 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/knowledge-base"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Knowledge Base</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/drive"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M3 7a2 2 0 0 1 2-2h9.586a1 1 0 0 1 .707.293l3.414 3.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Google Drive</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/notion"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M4 4h16v16H4V4zm4 4v8m4-8v8m0-8h4a2 2 0 0 1 0 4h-4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Notion</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      data-tour="image-studio-link"
                      href="/studio"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M4 16l4-4 4 4 4-8 4 4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <rect
                          height="18"
                          rx="2"
                          ry="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          width="20"
                          x="2"
                          y="3"
                        />
                      </svg>
                      <span>Image Studio</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      data-tour="compare-link"
                      href="/compare"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M12 3v18"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Compare Models</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      data-tour="video-studio-link"
                      href="/studio/video"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M15 10l4.553-2.069A1 1 0 0 1 21 8.88v6.24a1 1 0 0 1-1.447.95L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Video Studio</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/plugins"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Plugins</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/roadmap"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <RocketIcon />
                      <span>Roadmap</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin"
                        onClick={() => {
                          setOpenMobile(false);
                        }}
                      >
                        <svg
                          fill="none"
                          height="16"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          viewBox="0 0 24 24"
                          width="16"
                        >
                          <path
                            d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUpgradeCTA />
        {user && (
          <div data-tour="sidebar-user">
            <SidebarUserNav user={user} />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
