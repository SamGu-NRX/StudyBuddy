import { LucideProps, UserPlus } from 'lucide-react'

/**
 * Registry of icons used across the chat UI. Each entry is a component that
 * renders one SVG and accepts lucide props, so callers can either reference
 * an icon directly (`Icons.Logo`) or resolve it by key at runtime
 * (`Icons[option.Icon]` in MobileChatLayout).
 *
 * The keys of this object also define the `Icon` union used by the global
 * `SidebarOption` interface (src/types/typings.d.ts), which stores an icon
 * key on every sidebar entry.
 *
 * `Logo` renders an inline send-arrow `<svg>` with its own viewBox. It
 * ignores lucide stroke styling — the path is filled with `currentColor` —
 * and forwards all remaining props to the svg root.
 */
export const Icons = {
  Logo: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 2000 2000'>
      <path
        fill='currentColor'
        d='m1976.678 964.142-1921.534-852.468c-14.802-6.571-32.107-3.37-43.577 8.046-11.477 11.413-14.763 28.703-8.28 43.532l365.839 836.751-365.839 836.749c-6.483 14.831-3.197 32.119 8.28 43.532 7.508 7.467 17.511 11.417 27.677 11.417 5.37 0 10.785-1.103 15.9-3.371l1921.533-852.466c14.18-6.292 23.322-20.349 23.322-35.861.001-15.514-9.141-29.571-23.321-35.861zm-1861.042-739.791 1664.615 738.489h-1341.737zm321.069 816.954h1334.219l-1655.287 734.35z'
      />
    </svg>
  ),
  UserPlus
}

/**
 * Union of the allowed `Icons` keys, i.e. the string names that may be
 * stored in `SidebarOption.Icon` and looked up in the `Icons` registry to
 * obtain the matching icon component.
 */
export type Icon = keyof typeof Icons