import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react'

export default async function DashboardPage() {
  const headersList = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-2 text-foreground">Welcome back!</h1>
          <p className="body-lg text-muted-foreground">
            Hello {user.firstName || user.email}, here's what's happening with your account.
          </p>
        </div>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
              <p className="heading-3 text-foreground">12</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-brand" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Members</p>
              <p className="heading-3 text-foreground">8</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">API Calls</p>
              <p className="heading-3 text-foreground">2.4k</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uptime</p>
              <p className="heading-3 text-foreground">99.9%</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-3 text-foreground">Recent Activity</h3>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Schedule created', time: '2 minutes ago', user: 'John Doe' },
              { action: 'Team member added', time: '1 hour ago', user: 'Jane Smith' },
              { action: 'API key generated', time: '3 hours ago', user: 'Mike Johnson' },
              { action: 'Settings updated', time: '1 day ago', user: 'Sarah Wilson' },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-brand"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">by {item.user}</p>
                </div>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-3 text-foreground">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Create New Schedule
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* Account Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="heading-3 text-foreground">Account Status</h3>
            <div className="body-lg text-muted-foreground">
              You're currently on the <Badge variant="outline">Pro Plan</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next billing date</p>
            <p className="font-medium text-foreground">March 15, 2024</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
