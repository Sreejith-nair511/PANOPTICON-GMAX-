'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, Clock, AlertCircle, Archive } from 'lucide-react'
import { getCases, createCase } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

type CaseStatus = 'open' | 'closed' | 'archived'
type CasePriority = 'low' | 'medium' | 'high' | 'critical'

interface Case {
  id: string
  title: string
  description: string
  status: CaseStatus
  priority: CasePriority
  created_at: string
  tags: string[]
}

const priorityColors: Record<CasePriority, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const statusIcons: Record<CaseStatus, any> = {
  open: Clock,
  closed: AlertCircle,
  archived: Archive,
}

const statusColors: Record<CaseStatus, string> = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadCases()
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchTerm, filterStatus])

  const loadCases = async () => {
    try {
      setLoading(true)
      const { data, error } = await getCases()
      if (error) throw error
      setCases(data || [])
    } catch (error) {
      toast.error('Failed to load cases')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterCases = () => {
    let filtered = cases

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    setFilteredCases(filtered)
  }

  const handleCreateCase = async () => {
    setIsCreating(true)
    try {
      const { data, error } = await createCase({
        title: 'New Case',
        description: 'Case description',
        status: 'open',
        priority: 'medium',
        created_by: 'current-user',
        tags: [],
      })
      if (error) throw error
      toast.success('Case created successfully')
      loadCases()
    } catch (error) {
      toast.error('Failed to create case')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <DashboardHeader
        title="Cases"
        subtitle={`${cases.length} total cases`}
      />

      <main className="p-6">
        {/* Controls */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleCreateCase}
              disabled={isCreating}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="w-4 h-4" />
              New Case
            </Button>
          </motion.div>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2 flex-wrap"
        >
          {(['all', 'open', 'closed', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </motion.div>

        {/* Cases Grid */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
              </div>
            </div>
          ) : filteredCases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800"
            >
              <p className="text-slate-600 dark:text-slate-400 mb-4">No cases found</p>
              <Button onClick={handleCreateCase} variant="outline" size="sm">
                Create your first case
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredCases.map((caseItem, idx) => {
                const StatusIcon = statusIcons[caseItem.status]
                return (
                  <motion.div
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Link href={`/cases/${caseItem.id}`}>
                      <div className="h-full p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {caseItem.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                              {caseItem.description}
                            </p>
                          </div>
                          <StatusIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[caseItem.priority]}`}>
                            {caseItem.priority}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[caseItem.status]}`}>
                            {caseItem.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(caseItem.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
