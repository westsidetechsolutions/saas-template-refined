'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Send,
  Lightbulb,
  Bug,
  Star,
  TrendingUp,
} from 'lucide-react'

interface FeedbackItem {
  id: string
  title: string
  type: string
  description: string
  priority: string
  status: string
  createdAt: string
  tags?: { tag: string }[]
}

const typeOptions = [
  {
    value: 'bug',
    label: 'Bug Report',
    icon: Bug,
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  },
  {
    value: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    color: 'bg-brand/10 text-brand border-brand/20',
  },
  {
    value: 'feedback',
    label: 'General Feedback',
    icon: MessageSquare,
    color:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  },
  {
    value: 'improvement',
    label: 'Improvement',
    icon: TrendingUp,
    color:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-muted text-muted-foreground border-border' },
  {
    value: 'medium',
    label: 'Medium',
    color:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  },
  {
    value: 'high',
    label: 'High',
    color:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  },
  {
    value: 'critical',
    label: 'Critical',
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  },
]

const statusConfig = {
  submitted: {
    label: 'Submitted',
    icon: Clock,
    color:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    bgColor: 'bg-blue-50',
  },
  reviewing: {
    label: 'Under Review',
    icon: Clock,
    color:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    bgColor: 'bg-yellow-50',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-brand/10 text-brand border-brand/20',
    bgColor: 'bg-brand/5',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    bgColor: 'bg-green-50',
  },
  declined: {
    label: 'Declined',
    icon: AlertCircle,
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    bgColor: 'bg-red-50',
  },
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'feedback',
    description: '',
    priority: 'medium',
    tags: '',
  })

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map((tag) => ({ tag: tag.trim() })) : [],
        }),
      })

      if (response.ok) {
        setFormData({
          title: '',
          type: 'feedback',
          description: '',
          priority: 'medium',
          tags: '',
        })
        setShowForm(false)
        fetchFeedback()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getTypeIcon = (type: string) => {
    const option = typeOptions.find((opt) => opt.value === type)
    return option?.icon || MessageSquare
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="bg-radial-brand rounded-xl p-8 border border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-background rounded-lg shadow-soft border border-border">
                <MessageSquare className="h-6 w-6 text-brand" />
              </div>
              <h1 className="heading-2 text-foreground">Feedback & Feature Requests</h1>
            </div>
            <p className="body-lg max-w-2xl">
              Help us improve by sharing your thoughts, reporting bugs, or requesting new features.
              Your feedback directly shapes our product roadmap.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="lg" className="shadow-lift">
            <Plus className="mr-2 h-5 w-5" />
            {showForm ? 'Cancel' : 'Submit Feedback'}
          </Button>
        </div>
      </div>

      {/* Enhanced Feedback Form */}
      {showForm && (
        <Card className="p-8 border-2 border-border shadow-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Send className="h-5 w-5 text-brand" />
              </div>
              <h2 className="heading-3 text-foreground">Submit New Feedback</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief, descriptive title for your feedback"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-foreground">
                  Type *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide a detailed description of your feedback, including any relevant context, steps to reproduce (for bugs), or use cases (for features)..."
                rows={6}
                className="resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-foreground">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., ui, mobile, performance, accessibility"
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="shadow-lift">
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-foreground border-t-transparent"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Enhanced Feedback List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <Star className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="heading-3 text-foreground">Your Feedback History</h2>
          </div>
          {feedback.length > 0 && (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {feedback.length} {feedback.length === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your feedback...</p>
          </Card>
        ) : feedback.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-border bg-muted/30">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="heading-4 text-foreground mb-3">No feedback submitted yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Be the first to share your thoughts and help us improve! Your feedback is invaluable
              to our product development.
            </p>
            <Button onClick={() => setShowForm(true)} className="shadow-lift">
              <Plus className="mr-2 h-4 w-4" />
              Submit Your First Feedback
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => {
              const statusInfo = statusConfig[item.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon
              const TypeIcon = getTypeIcon(item.type)
              const typeInfo = typeOptions.find((opt) => opt.value === item.type)
              const priorityInfo = priorityOptions.find((opt) => opt.value === item.priority)

              return (
                <Card key={item.id} className="p-6 hover:shadow-lift transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${typeInfo?.color} border`}>
                              <TypeIcon className="mr-1 h-3 w-3" />
                              {typeInfo?.label}
                            </Badge>
                            <Badge className={`${priorityInfo?.color} border`}>
                              {priorityInfo?.label} Priority
                            </Badge>
                            <Badge className={`${statusInfo.color} border`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm text-muted-foreground font-medium">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-muted text-muted-foreground border-border"
                        >
                          #{tag.tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
