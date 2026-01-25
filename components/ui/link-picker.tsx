'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui'
import { Input } from './input'
import { Button } from './button'
import { Spinner } from './spinner'
import { getAssignments } from '@/lib/actions/assignments'
import { getChallenges } from '@/lib/actions/challenges'

interface LinkItem {
  type: 'assignment' | 'challenge'
  id: string
  slug: string
  title: string
  subtitle?: string | null
}

interface LinkPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string, text: string) => void
}

export function LinkPicker({ open, onClose, onSelect }: LinkPickerProps) {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<LinkItem[]>([])
  const [filteredItems, setFilteredItems] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'assignments' | 'challenges'>('all')

  // Load data on open
  useEffect(() => {
    if (open) {
      loadData()
    } else {
      setSearch('')
      setActiveTab('all')
    }
  }, [open])

  // Filter items based on search and tab
  useEffect(() => {
    let filtered = items

    // Filter by tab
    if (activeTab === 'assignments') {
      filtered = filtered.filter(item => item.type === 'assignment')
    } else if (activeTab === 'challenges') {
      filtered = filtered.filter(item => item.type === 'challenge')
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.slug.toLowerCase().includes(searchLower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchLower))
      )
    }

    setFilteredItems(filtered)
  }, [search, items, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentsResult, challengesResult] = await Promise.all([
        getAssignments(),
        getChallenges()
      ])

      const loadedItems: LinkItem[] = []

      if (assignmentsResult.success && assignmentsResult.data) {
        assignmentsResult.data.forEach(a => {
          loadedItems.push({
            type: 'assignment',
            id: a.id,
            slug: a.slug,
            title: a.public_title || a.internal_title,
            subtitle: a.subtitle
          })
        })
      }

      if (challengesResult.success && challengesResult.data) {
        challengesResult.data.forEach(c => {
          loadedItems.push({
            type: 'challenge',
            id: c.id,
            slug: c.slug,
            title: c.public_title || c.internal_name,
            subtitle: c.client?.name
          })
        })
      }

      setItems(loadedItems)
    } catch (err) {
      console.error('Error loading link picker data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item: LinkItem) => {
    const url = item.type === 'assignment' ? `/a/${item.slug}` : `/c/${item.slug}`
    onSelect(url, item.title)
    onClose()
  }

  const tabClass = (tab: typeof activeTab) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Insert Link</DialogTitle>
      </DialogHeader>

      <div className="p-4 space-y-4">
        {/* Search */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments and challenges..."
          autoFocus
        />

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('all')} className={tabClass('all')}>
            All
          </button>
          <button onClick={() => setActiveTab('assignments')} className={tabClass('assignments')}>
            Assignments
          </button>
          <button onClick={() => setActiveTab('challenges')} className={tabClass('challenges')}>
            Challenges
          </button>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Spinner />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search ? 'No results found' : 'No items available'}
            </div>
          ) : (
            filteredItems.map(item => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                  item.type === 'assignment'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {item.type === 'assignment' ? 'A' : 'C'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                  )}
                </div>
                <code className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  /{item.type === 'assignment' ? 'a' : 'c'}/{item.slug}
                </code>
              </button>
            ))
          )}
        </div>

        {/* Manual URL input hint */}
        <p className="text-xs text-gray-500">
          Or type a URL directly in the link dialog. Internal links: <code className="bg-gray-100 px-1 rounded">/a/slug</code> or <code className="bg-gray-100 px-1 rounded">/c/slug</code>
        </p>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
