"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";

import Image from "next/image";
import Link from "next/link";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession to get user info

export default function Header() {
  const pathName = usePathname();
  const list = pathName.split("/");
  list.shift();

  // Get user session data
  const { data: session } = useSession();
  const userImage = session?.user?.image || "/default-avatar.png"; // Use the user's image or a default fallback

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard-force">Dashboard</Link>
          </BreadcrumbItem>
          {list.length > 1 ? (
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink asChild>
                <Link href={"/dashboard-force/".concat("", list[1])}>
                  {list[1].replace(
                    list[1].charAt(0),
                    list[1].charAt(0).toUpperCase()
                  )}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ) : null}
          {list.length > 2 ? (
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink asChild>
                <Link
                  href={"/dashboard-force/"
                    .concat("", list[1])
                    .concat("/", list[2])}
                >
                  {list[2].replace(
                    list[2].charAt(0),
                    list[2].charAt(0).toUpperCase()
                  )}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        /> */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Image
              src={userImage} // Dynamically use the user's image
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="dashboard-force/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
