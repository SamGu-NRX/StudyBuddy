import { Button } from "@/components/ui/button";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Define the shape of your data.
export type Question = {
  // title: Array<string>;
  title: string;
  id: string;
  type: string;
  date: Date;
  accuracy: number;
  "set-size": number;
};

export const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "title",
    header: () => <div>Title</div>,
    cell: ({ row }) => {
      const title = row.getValue<string>("title")[0]; // Assuming title is an array
      return <div className="font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "id",
    header: () => <div>Link</div>,
    cell: ({ row }) => {
      const linkId = row.getValue("id");
      return (
        <Button>
          <Link href={`/dashboard-force/review?id=${linkId}`}>Show</Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div>Type</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date: Date = row.getValue("date");
      return (
        <div>
          {(date.getMonth() + 1).toString().padStart(2, '0')}-{date.getDate().toString().padStart(2, '0')}-{date.getFullYear()}
        </div>
      );
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
      const accuracy: number = row.getValue("accuracy");
      const setSize: number = row.getValue("set-size");
      return <div>{accuracy}/{setSize}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const question = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(question.id)}>
              Copy question set ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Flag</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
