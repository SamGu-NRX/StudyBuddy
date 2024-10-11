"use client";

import Link from "next/link";
import { CircleUser, Menu, Package2, Search, Mail, ChevronRight, Smartphone } from "lucide-react";

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

import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Security() {
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
            <Link href="/dashboard-force/settings">
              General
            </Link>
            <Link href="/dashboard-force/settings/security" className="font-semibold text-primary">Security</Link>
            <Link href="#">Subscriptions</Link>
            <Link href="#">Advanced</Link>
          </nav>

          <div className="grid gap-6">

            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Forgot your password? 
                  <Dialog>
                <DialogTrigger asChild>
                  <Link href="#" className="font-semibold"> Change your password another way.</Link>
                  </DialogTrigger>  
                  <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
                <DialogDescription>
                    Recover your password through other ways.
                </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Button className="justify-between"><Mail/>Send a recovery email<ChevronRight/></Button>
            <Button className="justify-between"><Smartphone/>Send a recovery text<ChevronRight/></Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
                  </Dialog>
                </CardDescription>
              </CardHeader>
              <CardContent>
              <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input id = "confirm" className = "max-w-md" onChange = {e => setId(e.target.value)} placeholder="Confirm Password" type="password" required/>
                    </li>
                    <li className="flex items-center justify-between">
                      <Label htmlFor="setPass">Set New Password</Label>
                      <Input id = "setPass" className = "max-w-md" onChange = {e => setId(e.target.value)} placeholder="Set Password" type="password" required/>
                    </li>
                  </ul>
              </CardContent>
              <CardFooter>
                <Button>Set New Password</Button>
                </CardFooter>
            </Card>

            {/* possibly use another card for more options, like dark mode or smth */}
            {/* <Card x-chunk="dashboard-04-chunk-2">
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

            </Card> */}
            </div>
        </div>
      </main>
    </div>
  );
}