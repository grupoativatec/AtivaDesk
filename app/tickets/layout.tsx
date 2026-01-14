import { TicketsNavbar } from "@/components/features/tickets/user/navbar"

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TicketsNavbar />
      {children}
    </>
  )
}
