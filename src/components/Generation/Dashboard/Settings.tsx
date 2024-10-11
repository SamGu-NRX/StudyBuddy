import Link from "next/link";
import { CircleUser, Menu, Package2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import Sidebar from "@/components/SidebarDash";
import Header from "@/components/HeaderDash";

import { PenLine } from "lucide-react";

export default function Settings() {
  const username = "guest";
  const name = "Arthur Shufer";

  const email = "arthnotoriety@gmail.com";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
      </div>

      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold"> Settings</h1>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
          >
            <Link href="/dashboard-force/settings" className="font-semibold text-primary">
              General
            </Link>
            <Link href="#">Security</Link> {/*use if we want to use 2fa or authenticator */}
            <Link href="#">Payment Information</Link>
            <Link href="#">Subscriptions</Link>
            <Link href="#">Advanced</Link>
          </nav>

          <div className="grid gap-6">
          <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Account Profile</CardTitle>
                <CardDescription>
                  Used to identify you while connecting with other studiers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>
                  Used to identify you while connecting with other studiers.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Username: {username}</span>
                      <div>
                        <Button variant="ghost" size="sm">
                          <PenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Name: {name}</span>
                      <div>
                        <Button variant="ghost" size="sm">
                          <PenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email address: {email}</span>
                      <div>
                        <Button variant="ghost" size="sm">
                          <PenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone Number: 111-111-1111</span>
                      <div>
                        <Button variant="ghost" size="sm">
                          <PenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </li>
                  </ul>
              </CardContent>
            </Card>

            {/* possibly use another card for more options, like dark mode or smth */}
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Plugins Directory</CardTitle>
                <CardDescription>
                  The directory within your project, in which your plugins are
                  located.
                </CardDescription>
              </CardHeader>

              <CardContent>
              <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Username: {username}</span>
                      <div>
                      </div>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Name: {name}</span>
                      <div>
                      </div>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email address: {email}</span>
                      <div>
                      </div>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Password: ******</span>
                      <div>
                      </div>
                    </li>
                  </ul>
              </CardContent>

            </Card>
            </div>
        </div>
      </main>
    </div>
  );
}