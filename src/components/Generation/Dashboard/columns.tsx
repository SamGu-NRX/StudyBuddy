import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"

import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {Check, X} from "lucide-react"

import Link from "next/link"

import FlashcardDrawer from "@/components/FlashcardDisplay"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Question = {
  title: string;
  id: string
  type: string
  date: Date
  accuracy: number,
  "set-size": number,
}

export const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "title",
    header: () => <div>Title</div>,
    cell: ({ row }) => {
        return (
            <div>
                <div className="font-medium">Gas Station</div>
            </div>
        )
    },
  },
  {
    accessorKey: "id",
    header: () => <div>Link</div>,
    cell: ({ row }) => {
        const linkId = (row.getValue("id"))
        return (
            <Drawer>
              <DrawerTrigger>
                <Button>Show</Button> 
              </DrawerTrigger>
              <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <FlashcardDrawer cardID = {row.getValue("id")}/>
                </div>
              </DrawerContent>
            </Drawer>
        )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const date = (row.getValue("date"))
        return (
            <div>
                {(date.getMonth()+1).toString().concat("-", (date.getDate()).toString()).concat("-", (date.getFullYear()).toString())}
            </div>
        )
    },
  },
  {
    accessorKey: "set-size",
    header: () => <div>Set Size</div>,
  },
  {
    accessorKey: "accuracy",
    header: () => <div>Accuracy</div>,
    cell: ({ row }) => {
      const accuracy = (row.getValue("accuracy"))
      return <div>{accuracy.toString().concat("/", row.getValue("set-size").toString())}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const question = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(question.id)}
            >
              Copy question set ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Flag</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]