'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowRight, Flame, Layers, Search, Sparkles } from 'lucide-react'

interface Language {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
}

export default function LearnPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [languages, setLanguages] = useState<Language[]>([])
  const [loadingLangs, setLoadingLangs] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchLanguages()
    }
  }, [isAuthenticated])

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/languages?lang=en')
      setLanguages(response.data.languages)
    } catch (error) {
      console.error('Error fetching languages:', error)
    } finally {
      setLoadingLangs(false)
    }
  }

  const resolveText = (value?: string | { en?: string; vi?: string }) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value.en || value.vi || ''
  }

  const categories = useMemo(() => {
    const map = new Set<string>()
    languages.forEach((lang) => {
      if (!lang.slug) return
      const parts = lang.slug.split('-')[0]
      if (parts) {
        map.add(parts)
      }
    })
    return ['all', ...Array.from(map)]
  }, [languages])

  const filteredLanguages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return languages.filter((lang) => {
      const matchesSearch = (() => {
        if (!normalizedSearch) return true
        const name = resolveText(lang.name).toLowerCase()
        const description = resolveText(lang.description).toLowerCase()
        const slug = (lang.slug || '').toLowerCase()
        return (
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          slug.includes(normalizedSearch)
        )
      })()
      const matchesCategory =
        selectedCategory === 'all' ||
        (lang.slug || '').toLowerCase().startsWith(selectedCategory.toLowerCase())
      return matchesSearch && matchesCategory
    })
  }, [languages, searchTerm, selectedCategory])

  const totalLanguages = languages.length || 0
  const trendingLanguage = languages[0]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(200_80%_94%)_0%,_white_50%)] dark:bg-[radial-gradient(circle_at_top,_hsl(215_30%_15%)_0%,_hsl(220_30%_10%)_60%)]">
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <div className="rounded-3xl border border-blue-100/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-[0_25px_60px_rgba(15,23,42,0.08)] p-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-200 text-xs font-semibold tracking-[0.4em] uppercase">
              <Sparkles className="h-3 w-3" />
              Learn
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Build your stack step-by-step with curated language roadmaps.
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Learn with bite-sized lessons, real projects, and progress tracking. Pick a language to unlock its full learning journey.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 px-4 py-2 font-medium text-slate-700 dark:text-white">
                <Layers className="h-4 w-4" />
                {totalLanguages}+ tracks
              </div>
              {trendingLanguage && (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2 font-medium text-emerald-700 dark:text-emerald-200">
                  <Flame className="h-4 w-4" />
                  Hot pick: {resolveText(trendingLanguage.name)}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100/70 dark:border-white/5 bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-slate-900/60 dark:to-slate-900/40 shadow-xl p-8 space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                Quick filters
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                Find a language that matches your focus
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Search
              </label>
              <Input
                className="h-11 bg-white/80 dark:bg-slate-900/70 border-transparent focus-visible:ring-primary/40"
                placeholder="HTML, CSS, React..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      selectedCategory === category
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-transparent bg-white/70 text-slate-600 dark:bg-white/5 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {category === 'all' ? 'All paths' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Languages grid */}
        {loading || loadingLangs ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-60 rounded-2xl border-2 border-dashed border-border/60 animate-pulse bg-card/40" />
            ))}
          </div>
        ) : filteredLanguages.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-lg font-semibold mb-2">No language matches your filters</p>
              <p className="text-muted-foreground mb-4">
                Try selecting a different category or clearing your search to explore all paths.
              </p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}>
                Reset filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredLanguages.map((lang) => (
              <Card
                key={lang._id}
                className="relative overflow-hidden border border-border/60 bg-card/80 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 group flex h-full flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{lang.icon || '🌐'}</div>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                      {lang.slug || 'path'}
                    </span>
                  </div>
                  <CardTitle className="text-2xl mt-3 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {resolveText(lang.name)}
                  </CardTitle>
                  <CardDescription className="overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                    {resolveText(lang.description) || 'Embark on a guided learning journey tailored for this language.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pt-0 mt-auto">
                  <Link href={`/learn/${lang._id}`}>
                    <Button className="w-full group/btn">
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



