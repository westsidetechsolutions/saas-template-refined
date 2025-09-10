'use client'

import { useState } from 'react'
import { m, useFadeInUpVariants, viewport } from '@/lib/motion'
import { Stack, Grid } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { Textarea } from '@/app/(frontend)/components/ui/textarea'
import { Badge } from '@/app/(frontend)/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/(frontend)/components/ui/accordion'
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Search,
  BookOpen,
  Users,
  CreditCard,
  Shield,
  Settings,
} from 'lucide-react'

const faqData = [
  {
    category: 'Account & Login',
    icon: Users,
    items: [
      {
        question: 'How do I reset my password?',
        answer:
          'You can reset your password by clicking the "Forgot Password" link on the login page. We\'ll send you an email with a secure link to create a new password.',
      },
      {
        question: "I can't verify my email address",
        answer:
          "Check your spam folder for the verification email. If you don't see it, you can request a new verification email from your account settings.",
      },
      {
        question: 'How do I change my email address?',
        answer:
          'Go to your account settings and click "Change Email". You\'ll need to verify the new email address before the change takes effect.',
      },
    ],
  },
  {
    category: 'Billing & Subscriptions',
    icon: CreditCard,
    items: [
      {
        question: 'How do I update my payment method?',
        answer:
          'You can update your payment method in your billing settings. Go to Settings → Billing to manage your payment information.',
      },
      {
        question: 'Can I cancel my subscription?',
        answer:
          'Yes, you can cancel your subscription at any time from your billing settings. Your access will continue until the end of your current billing period.',
      },
      {
        question: 'How do I get a refund?',
        answer:
          "Refund requests are handled on a case-by-case basis. Please contact our support team with your request and we'll review it within 2-3 business days.",
      },
    ],
  },
  {
    category: 'Security & Privacy',
    icon: Shield,
    items: [
      {
        question: 'How secure is my data?',
        answer:
          'We use industry-standard encryption and security practices to protect your data. All data is encrypted in transit and at rest.',
      },
      {
        question: 'Can I enable two-factor authentication?',
        answer:
          "Two-factor authentication is currently in development and will be available soon. We'll notify all users when this feature is ready.",
      },
      {
        question: 'What happens if I suspect unauthorized access?',
        answer:
          'If you suspect unauthorized access to your account, immediately change your password and contact our support team. We can help secure your account.',
      },
    ],
  },
  {
    category: 'Features & Usage',
    icon: Settings,
    items: [
      {
        question: 'How do I use the scheduling feature?',
        answer:
          'The scheduling feature allows you to create and manage appointments. Navigate to the scheduler in your dashboard to get started.',
      },
      {
        question: 'Can I export my data?',
        answer:
          'Data export functionality is available for premium users. Go to your account settings to access this feature.',
      },
      {
        question: 'Is there a mobile app?',
        answer:
          'Our web application is fully responsive and works great on mobile devices. A native mobile app is planned for future release.',
      },
    ],
  },
]

const supportCategories = [
  { value: 'account', label: 'Account & Login', icon: Users },
  { value: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { value: 'technical', label: 'Technical Issues', icon: Settings },
  { value: 'feature', label: 'Feature Request', icon: BookOpen },
  { value: 'security', label: 'Security Issue', icon: Shield },
  { value: 'other', label: 'Other', icon: HelpCircle },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  const content = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

  const filteredFAQ = faqData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement contact form submission
    console.log('Contact form submitted:', contactForm)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    // Reset form
    setContactForm({
      name: '',
      email: '',
      category: '',
      subject: '',
      message: '',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <m.header
        className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24 }}
      >
        <div className="max-w-[1100px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <HelpCircle className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="heading-3 text-foreground">Support Center</h1>
              <p className="body-lg text-muted-foreground">
                Get help with your account, billing, and technical issues
              </p>
            </div>
          </div>
        </div>
      </m.header>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <Stack space="xl">
          {/* Quick Actions */}
          <m.div variants={title}>
            <Grid cols={{ base: 1, md: 3 }} gap="md">
              <Card className="p-6 text-center hover:shadow-lift transition-shadow cursor-pointer">
                <div className="p-3 bg-brand/10 rounded-lg w-fit mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-brand" />
                </div>
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Get help from our support team</p>
                <Button size="sm" className="w-full">
                  Send Message
                </Button>
              </Card>

              <Card className="p-6 text-center hover:shadow-lift transition-shadow cursor-pointer">
                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">Browse our help articles</p>
                <Button size="sm" variant="outline" className="w-full">
                  View Docs
                </Button>
              </Card>

              <Card className="p-6 text-center hover:shadow-lift transition-shadow cursor-pointer">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">System Status</h3>
                <p className="text-sm text-muted-foreground mb-4">Check service status</p>
                <Button size="sm" variant="outline" className="w-full">
                  Check Status
                </Button>
              </Card>
            </Grid>
          </m.div>

          {/* FAQ Section */}
          <m.div variants={content}>
            <Card className="p-8">
              <div className="mb-8">
                <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
                <p className="body-lg text-muted-foreground mb-6">
                  Find answers to common questions about your account, billing, and features.
                </p>

                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* FAQ Categories */}
              <div className="space-y-8">
                {filteredFAQ.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <category.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="heading-4">{category.category}</h3>
                      <Badge variant="secondary">{category.items.length}</Badge>
                    </div>

                    <Accordion type="single" collapsible className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <AccordionItem
                          key={itemIndex}
                          value={`${categoryIndex}-${itemIndex}`}
                          className="border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{item.question}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>

              {filteredFAQ.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No FAQ items found for "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                    Clear Search
                  </Button>
                </div>
              )}
            </Card>
          </m.div>

          {/* Contact Support Section */}
          <m.div variants={content}>
            <Card className="p-8">
              <div className="mb-8">
                <h2 className="heading-2 mb-4">Contact Support</h2>
                <p className="body-lg text-muted-foreground">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
              </div>

              <Grid cols={{ base: 1, lg: 2 }} gap="xl">
                {/* Contact Form */}
                <div>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={contactForm.category}
                        onValueChange={(value) =>
                          setContactForm((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <category.icon className="h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="Describe your issue or question in detail..."
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="heading-4 mb-4">Other Ways to Reach Us</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <Mail className="h-5 w-5 text-brand" />
                        <div>
                          <p className="font-medium">Email Support</p>
                          <p className="text-sm text-muted-foreground">support@example.com</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <Clock className="h-5 w-5 text-brand" />
                        <div>
                          <p className="font-medium">Response Time</p>
                          <p className="text-sm text-muted-foreground">Within 24 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-brand/5 rounded-lg border border-brand/10">
                    <h4 className="font-semibold mb-2">Before Contacting Support</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Check our FAQ section above
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Include relevant screenshots if applicable
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Provide your account email address
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Describe the steps to reproduce the issue
                      </li>
                    </ul>
                  </div>
                </div>
              </Grid>
            </Card>
          </m.div>
        </Stack>
      </div>
    </div>
  )
}
