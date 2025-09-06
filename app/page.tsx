"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Leaf, Recycle, Heart, Users } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-primary">EcoFinds</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Empowering Sustainable Consumption</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Discover unique second-hand treasures and give products a new life. Join our community of conscious
            consumers making a positive impact on the planet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/signup")}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg bg-card">
            <Recycle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sustainable Shopping</h3>
            <p className="text-muted-foreground">
              Extend product lifecycles and reduce waste by choosing pre-owned items
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unique Finds</h3>
            <p className="text-muted-foreground">Discover one-of-a-kind items with character and history</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
            <p className="text-muted-foreground">
              Connect with like-minded individuals committed to sustainable living
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
