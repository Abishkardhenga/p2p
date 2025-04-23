import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Send, CheckCircle } from "lucide-react"

const Contact = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
        variant: "default",
      })

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
        setSubmitted(false)
      }, 2000)
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-cyber-grid opacity-5 pointer-events-none z-0"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink mb-4">
              Get In Touch
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have questions about our platform? Want to partner with us? Fill
              out the form below and our team will get back to you shortly.
            </p>
          </div>

          {/* Centered Contact Form */}
          <div className="mx-auto max-w-2xl">
            <Card className="border border-neon-purple/20 bg-background/50 backdrop-blur-sm neo-glow">
              <CardHeader>
                <CardTitle>Send Us A Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll respond as soon as possible.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="bg-background/80 border-neon-purple/20 focus:border-neon-purple"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="bg-background/80 border-neon-purple/20 focus:border-neon-purple"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      value={formState.subject}
                      onChange={handleChange}
                      required
                      className="bg-background/80 border-neon-purple/20 focus:border-neon-purple"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us what you need help with..."
                      rows={6}
                      value={formState.message}
                      onChange={handleChange}
                      required
                      className="bg-background/80 border-neon-purple/20 focus:border-neon-purple resize-none"
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    disabled={loading || submitted}
                    className="w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 text-white py-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : submitted ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Optional contact details - centered below form */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-2">You can also reach us at:</p>
              <a
                href="mailto:support@promptsui.io"
                className="text-neon-purple hover:text-neon-blue transition-colors"
              >
                support@promptsui.io
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Contact
