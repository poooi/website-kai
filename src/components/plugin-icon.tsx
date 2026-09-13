import {
  Anchor,
  ArrowUpNarrowWide,
  BatteryMedium,
  BookOpen,
  Calculator,
  CalendarDays,
  ChartPie,
  ChevronsUp,
  Compass,
  FolderOpen,
  Heart,
  Image,
  Info,
  Languages,
  List,
  ListIndentIncrease,
  LockKeyhole,
  Mic,
  Network,
  Puzzle,
  Rocket,
  Ship,
  Smile,
  SquareCheckBig,
  Volume2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  anchor: Anchor,
  'angle-double-up': ChevronsUp,
  'battery-3': BatteryMedium,
  book: BookOpen,
  calculator: Calculator,
  calendar: CalendarDays,
  'check-square-o': SquareCheckBig,
  compass: Compass,
  'file-audio-o': Volume2,
  'folder-open': FolderOpen,
  heart: Heart,
  indent: ListIndentIncrease,
  'info-circle': Info,
  language: Languages,
  lock: LockKeyhole,
  microphone: Mic,
  odnoklassniki: ArrowUpNarrowWide,
  photo: Image,
  'pie-chart': ChartPie,
  rocket: Rocket,
  ship: Ship,
  sitemap: Network,
  'smile-o': Smile,
  'th-list': List,
  wrench: Wrench,
}

export function PluginIcon({ name }: { name: string }) {
  const Icon = icons[name.replace(/^fa\//, '')] ?? Puzzle
  return (
    <Icon
      className="mt-1 h-6 w-6 text-navigation"
      strokeWidth={1.5}
      aria-hidden="true"
    />
  )
}
