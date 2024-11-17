import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Authentication - Dezy",
    template: "%s - Dezy Authentication",
  },
  description: "Authentication pages for Dezy marketplace",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
