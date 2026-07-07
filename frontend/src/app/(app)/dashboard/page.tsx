'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  FileText, Users, AlertCircle, TrendingUp, CheckCircle,
  Clock, Activity, BarChart3
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mockChartData = [
  { name: 'Jan', cases: 4, evidence: 24, analyzed: 18 },
  { name: 'Feb', cases: 3, evidence: 13, analyzed: 9 },
  { name: 'Mar', cases: 2, evidence: 9, analyzed: 8 },
  { name: 'Apr', cases: 5, evidence: 39, analyzed: 32 },
  { name: 'May', cases: 4, evidence: 28, analyzed: 22 },
  { name: 'Jun', cases: 6, evidence: 40, analyzed: 35 },
]

const caseStatusData = [
  { name: 'Open', value: 12, color: '#10b981' },
  { name: 'In Progress', value: 8, color: '#f59e0b' },
  { name: 'Closed', value: 5, color: '#ef4444' },
]

const priorityDistribution = [
  { name: 'Critical', value: 2, color: '#dc2626' },
  { name: 'High', value: 5, color: '#ea580c' },
  { name: 'Medium', value: 10, color: '#f59e0b' },
  { name: 'Low', value: 8, color: '#3b82f6' },
]

interface StatCard {
  title: string
  value: string
  change: string
  icon: any
  color: string
  bgColor: string
}

const stats: StatCard[] = [
  {
    title: 'Total Cases',
    value: '25',
    change: '+4 this month',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    title: 'Evidence Analyzed',
    value: '142',
    change: '+23 this week',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    title: 'Active Investigations',
    value: '8',
    change: '-1 from last week',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    title: 'Pending Review',
    value: '12',
    change: '+3 waiting',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back, Detective"
      />

      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                          {stat.value}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          {stat.change}
                        </p>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Activity Chart */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Activity Overview</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cases and evidence analyzed over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="analyzed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Case Status Distribution */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Case Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={caseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {caseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Priority */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Recent Cases */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Recent Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Case #{2024000 + i}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Updated 2 hours ago
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Open
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={priorityDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
