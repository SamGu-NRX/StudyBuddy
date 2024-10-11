// src/components/SubjectSelection.tsx
"use client"

import * as React from "react"
import { useMediaQuery } from '@react-hook/media-query'
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Subject = {
  value: string
  label: string
}

const subjects: Subject[] = [
  { value: "math", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "english", label: "English" },
  { value: "geography", label: "Geography" },
  { value: "spanish", label: "Spanish" },
  { value: "art", label: "Art" },
  { value: "music", label: "Music" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "psychology", label: "Psychology" },
  { value: "computer_science", label: "Computer Science" },
  { value: "environmental_science", label: "Environmental Science" },
  { value: "economics", label: "Economics" },
  // Add more subjects as needed
]

interface SubjectSelectionProps {
  onSubjectSelect: (subject: Subject | null) => void
}

export function SubjectSelection({ onSubjectSelect }: SubjectSelectionProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedSubject, setSelectedSubject] = React.useState<Subject | null>(null)

  const handleSelectSubject = (subject: Subject | null) => {
    setSelectedSubject(subject)
    setOpen(false)
    onSubjectSelect(subject) // Call the parent callback with the selected subject
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start ">
            {selectedSubject ? <>{selectedSubject.label}</> : <>+ Select Subject</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <SubjectList onSelect={handleSelectSubject} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          {selectedSubject ? <>{selectedSubject.label}</> : <>+ Select Subject</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 p-4 border-t">
          <SubjectList onSelect={handleSelectSubject} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SubjectList({
  onSelect,
}: {
  onSelect: (subject: Subject | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter subjects..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {subjects.map((subject) => (
            <CommandItem
              key={subject.value}
              value={subject.value}
              onSelect={(value) => {
                onSelect(
                  subjects.find((s: { value: string }) => s.value === value) || null
                )
              }}
            >
              {subject.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export default SubjectSelection;
