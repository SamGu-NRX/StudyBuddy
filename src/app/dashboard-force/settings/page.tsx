"use client";

import Link from "next/link";
import { CircleUser, Menu, Package2, Search, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/SidebarDash";
import Header from "@/components/HeaderDash";
import * as React from "react";
import { useSession } from "next-auth/react";

export default function Settings() {
  const [image, setImage] = React.useState<string>("");
  const [tempImage, setTempImage] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);


  // Get user session data
  const { data: session } = useSession();
  const userImage = session?.user?.image || "/default-avatar.png"; // Use the user's image or a default fallback
  const name = session?.user?.name || "Guest";
  const username = session?.user?.id || "Guest";
  const email = session?.user?.email || "no email";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmImage = () => {
    setImage(tempImage);
    setIsDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
      </div>

      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="pl-6 mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold"> Settings</h1>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="pl-6 grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
          >
            <Link href="/dashboard-force/settings" className="font-semibold text-primary">
              General
            </Link>
            <Link href="/dashboard-force/settings/security">Security</Link>
            <Link href="#">Subscriptions</Link>
            <Link href="#">Advanced</Link>
          </nav>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Profile</CardTitle>
                <CardDescription>
                  Used to identify you while connecting with other studiers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={userImage || "https://github.com/shadcn.png"}
                         alt="Avatar" 
                         className="overflow-hidden rounded-full"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="picture">Set new profile picture</Label>
                      <Input id="picture" type="file" onChange={handleImageChange} />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Profile picture</DialogTitle>
                          <DialogDescription>
                            Is this profile picture correct?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center space-x-2">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={tempImage} alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        </div>
                        <DialogFooter className="sm:justify-start">
                          <Button type="button" variant="secondary" onClick={handleConfirmImage}>
                            Yes
                          </Button>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                              No
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
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
          </div>
        </div>
      </main>
    </div>
  );
}
