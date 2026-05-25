'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Loader2, Activity, Users, MousePointerClick, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, subDays, startOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const CHART_COLORS = {
  primary: '#e11d48',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  emerald: '#10b981',
  amber: '#f59e0b',
  violet: '#8b5cf6',
}

interface AnalyticsData {
  totalEvents: number
  activeUsers: number
  topEvents: { name: string, value: number }[]
  recentEvents: any[]
  chartData: any[]
}

interface AdminAnalyticsTabProps {
  currentUser: any
}

export function AdminAnalyticsTab({ currentUser }: AdminAnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [preset, setPreset] = useState('30d')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchData = async () => {
    setLoading(true)
    try {
      let url = `/api/admin/analytics?requesterId=${currentUser?.id}`
      if (dateRange.from) url += `&startDate=${dateRange.from.toISOString()}`
      if (dateRange.to) url += `&endDate=${dateRange.to.toISOString()}`
      
      const res = await fetch(url)
      const result = await res.json()
      if (res.ok) {
        setData(result)
        setCurrentPage(1)
      } else {
        console.error('Erreur analytiques:', result.error, result.details)
        alert(`Erreur analytiques: ${result.error}\nDétails: ${result.details}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.id) {
      fetchData()
    }
  }, [dateRange, currentUser?.id])

  const handlePresetChange = (val: string) => {
    setPreset(val)
    const today = new Date()
    switch (val) {
      case 'today':
        setDateRange({ from: today, to: today })
        break
      case '7d':
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case '30d':
        setDateRange({ from: subDays(today, 30), to: today })
        break
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: today })
        break
      case 'lastMonth':
        const lmStart = startOfMonth(subMonths(today, 1))
        const lmEnd = subDays(startOfMonth(today), 1)
        setDateRange({ from: lmStart, to: lmEnd })
        break
      case 'allTime':
        // A long time ago
        setDateRange({ from: new Date('2024-01-01'), to: today })
        break
      case 'custom':
        // Just let it be what it is
        break
    }
  }

  const handleDateSelect = (range: any) => {
    setDateRange(range)
    setPreset('custom')
  }

  // Derived calculations for recent events pagination
  const paginatedEvents = useMemo(() => {
    if (!data?.recentEvents) return []
    const start = (currentPage - 1) * itemsPerPage
    return data.recentEvents.slice(start, start + itemsPerPage)
  }, [data?.recentEvents, currentPage])
  
  const totalPages = data?.recentEvents ? Math.ceil(data.recentEvents.length / itemsPerPage) : 0

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytiques d'Utilisation</h2>
          <p className="text-sm text-muted-foreground">
            Suivez les moindres actions de vos utilisateurs sur la plateforme.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
              <SelectItem value="lastMonth">Mois précédent</SelectItem>
              <SelectItem value="allTime">Depuis toujours</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "d LLL y", { locale: fr })} -{" "}
                      {format(dateRange.to, "d LLL y", { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, "d LLL y", { locale: fr })
                  )
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange as any}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des données...</p>
        </div>
      ) : data ? (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Événements</p>
                  <h3 className="text-3xl font-bold">{data.totalEvents.toLocaleString('fr-FR')}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs Actifs (Uniques)</p>
                  <h3 className="text-3xl font-bold">{data.activeUsers.toLocaleString('fr-FR')}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <MousePointerClick className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Moyenne / Utilisateur</p>
                  <h3 className="text-3xl font-bold">
                    {data.activeUsers > 0 ? Math.round(data.totalEvents / data.activeUsers) : 0}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle>Évolution de l'Activité</CardTitle>
                <CardDescription>Volume d'événements quotidiens sur la période</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                      />
                      <Area type="monotone" dataKey="total" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorTotal)" name="Total Événements" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Top Actions</CardTitle>
                <CardDescription>Les événements les plus fréquents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topEvents}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {data.topEvents.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TABLE */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Dernières Actions Trackées</CardTitle>
              <CardDescription>Détail granulaire des derniers événements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Détails (Métadonnées)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvents.map((evt: any) => (
                      <TableRow key={evt.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(evt.createdAt), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {evt.user ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={evt.user.photos?.[0]?.url} />
                                <AvatarFallback>{evt.user.firstName?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{evt.user.firstName} {evt.user.lastName}</span>
                                <span className="text-xs text-muted-foreground">{evt.user.email}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Anonyme</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted font-normal text-xs">
                            {evt.eventName}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          {evt.metadata ? (
                            <pre className="text-xs text-muted-foreground bg-muted p-1.5 rounded-md overflow-x-auto whitespace-pre-wrap font-mono">
                              {evt.metadata}
                            </pre>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucun événement trouvé pour cette période.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
