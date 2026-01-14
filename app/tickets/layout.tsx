import { TicketsNavbar } from "@/components/tickets/navbar"

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
