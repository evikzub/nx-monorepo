import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Profile Portal</h1>
      <div className="space-y-4">
        <Link 
          href="/login"
          className="block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login with Email
        </Link>
      </div>
    </main>
  )
}