import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CMS Dashboard",
  description: "Manage your dealership content",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">CMS Dashboard</h1>
      </div>
    </main>
  )
}
