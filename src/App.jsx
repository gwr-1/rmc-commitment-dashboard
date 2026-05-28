import { useEffect, useState } from 'react'
import AuthGate from './components/AuthGate'
import Layout from './components/Layout'
import PortfolioOverview from './components/PortfolioOverview'
import AssetClassDetail from './components/AssetClassDetail'
import CommitmentInput from './components/CommitmentInput'
import ChangeLog from './components/ChangeLog'
import Snapshots from './components/Snapshots'
import TargetsActuals from './components/TargetsActuals'
import { assetClasses, fiscalYears } from './constants'
import { commitments } from './data/commitments'
import { changeLog } from './data/changes'
import { portfolioMetrics } from './data/portfolioMetrics'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import {
  createTargetsActualsRows,
  formatTimestamp,
  targetsActualsRowsToPortfolioMetrics,
} from './utils/calculations'
import { mapSupabaseChange } from './utils/changeLogMapping'
import { commitmentSelectColumns, mapSupabaseCommitment } from './utils/commitmentMapping'
import {
  mapSupabasePortfolioMetricsToTargetsActuals,
  portfolioMetricSelectColumns,
} from './utils/portfolioMetricMapping'
import {
  mapSnapshotToSupabase,
  mapSupabaseSnapshot,
  snapshotSelectColumns,
} from './utils/snapshotMapping'
import './App.css'

const views = [
  { key: 'overview', label: 'Portfolio Overview' },
  { key: 'asset-class', label: 'Asset Class Detail' },
  { key: 'commitment-input', label: 'Commitment Input' },
  { key: 'targets-actuals', label: 'Targets & Actuals' },
  { key: 'change-log', label: 'Change Log' },
  { key: 'snapshots', label: 'Snapshots' },
]

const changedByUser = 'Current User'

const getInitialCommitments = () =>
  commitments.map((commitment) => ({
    ...commitment,
    managerType: commitment.managerType || 'Current',
  }))

const isMissingColumnError = (error, columnName) =>
  error?.message?.toLowerCase().includes(columnName.toLowerCase())

function App() {
  const [activeView, setActiveView] = useState(views[0].key)
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured)
  const [commitmentData, setCommitmentData] = useState(getInitialCommitments)
  const [changeLogRecords, setChangeLogRecords] = useState(changeLog)
  const [targetsActuals, setTargetsActuals] = useState(() =>
    createTargetsActualsRows(portfolioMetrics, fiscalYears, assetClasses)
  )
  const [snapshots, setSnapshots] = useState([])
  const [commitmentsLoadedFromSupabase, setCommitmentsLoadedFromSupabase] = useState(false)
  const [targetsActualsLoadedFromSupabase, setTargetsActualsLoadedFromSupabase] =
    useState(false)

  const chartPortfolioMetrics = targetsActualsRowsToPortfolioMetrics(
    targetsActuals,
    fiscalYears,
    assetClasses
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Failed to load Supabase auth session:', error)
      }

      if (isMounted) {
        setSession(data?.session || null)
        setIsAuthLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsAuthLoading(false)
    })

    loadSession()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return

    let isMounted = true

    const loadCommitments = async () => {
      const fetchCommitments = (excludeDeleted) => {
        let query = supabase
          .from('commitments')
          .select(commitmentSelectColumns)
          .order('fiscal_year', { ascending: true })
          .order('asset_class', { ascending: true })

        if (excludeDeleted) {
          query = query.is('deleted_at', null)
        }

        return query
      }

      let { data, error } = await fetchCommitments(true)

      if (error && isMissingColumnError(error, 'deleted_at')) {
        const fallbackResult = await fetchCommitments(false)
        data = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) {
        console.error('Failed to load commitments from Supabase:', error)
        return
      }

      if (isMounted) {
        setCommitmentData((data || []).map(mapSupabaseCommitment))
        setCommitmentsLoadedFromSupabase(true)
      }
    }

    const loadPortfolioMetrics = async () => {
      const { data, error } = await supabase
        .from('portfolio_metrics')
        .select(portfolioMetricSelectColumns)
        .order('fiscal_year', { ascending: true })
        .order('asset_class', { ascending: true })
        .order('metric', { ascending: true })

      if (error) {
        console.error('Failed to load portfolio metrics from Supabase:', error)
        return
      }

      if (isMounted) {
        setTargetsActuals(
          mapSupabasePortfolioMetricsToTargetsActuals(
            data || [],
            fiscalYears,
            assetClasses
          )
        )
        setTargetsActualsLoadedFromSupabase(true)
      }
    }

    const loadChangeLog = async () => {
      const { data, error } = await supabase
        .from('commitment_changes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load commitment changes from Supabase:', error)
        return
      }

      if (isMounted) {
        setChangeLogRecords((data || []).map(mapSupabaseChange))
      }
    }

    const loadSnapshots = async () => {
      const { data, error } = await supabase
        .from('snapshots')
        .select(snapshotSelectColumns)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load snapshots from Supabase:', error)
        return
      }

      if (isMounted) {
        setSnapshots((data || []).map(mapSupabaseSnapshot))
      }
    }

    loadCommitments()
    loadPortfolioMetrics()
    loadChangeLog()
    loadSnapshots()

    return () => {
      isMounted = false
    }
  }, [session])

  const persistPortfolioMetric = async ({ fiscalYear, assetClass, metric, amount }) => {
    if (!isSupabaseConfigured || !targetsActualsLoadedFromSupabase) return

    try {
      const { error } = await supabase
        .from('portfolio_metrics')
        .update({
          amount,
          updated_at: new Date().toISOString(),
        })
        .eq('fiscal_year', fiscalYear)
        .eq('asset_class', assetClass)
        .eq('metric', metric)

      if (error) {
        console.error('Failed to update portfolio metric in Supabase:', error)
      }
    } catch (error) {
      console.error('Failed to persist portfolio metric to Supabase:', error)
    }
  }

  const appendChange = (change) => {
    setChangeLogRecords((currentChanges) => [
      {
        id: `CHG-DRAFT-${currentChanges.length + 1}`,
        timestamp: formatTimestamp(new Date()),
        changedBy: changedByUser,
        ...change,
      },
      ...currentChanges,
    ])
  }

  const createSnapshot = async (snapshotName) => {
    const copiedCommitments = commitmentData.map((commitment) => ({ ...commitment }))
    const totalByFiscalYear = fiscalYears.reduce((totals, fiscalYear) => {
      totals[fiscalYear] = copiedCommitments
        .filter((commitment) => commitment.fiscalYear === fiscalYear)
        .reduce((total, commitment) => total + commitment.targetAmount, 0)
      return totals
    }, {})
    const totalByAssetClass = assetClasses.reduce((totals, assetClass) => {
      totals[assetClass] = copiedCommitments
        .filter((commitment) => commitment.assetClass === assetClass)
        .reduce((total, commitment) => total + commitment.targetAmount, 0)
      return totals
    }, {})
    const snapshot = {
      id: `SNP-${Date.now()}`,
      name: snapshotName || `Snapshot ${snapshots.length + 1}`,
      createdAt: formatTimestamp(new Date()),
      createdBy: 'Investment Team',
      commitments: copiedCommitments,
      totalCommitments: copiedCommitments.reduce(
        (total, commitment) => total + commitment.targetAmount,
        0
      ),
      commitmentCount: copiedCommitments.length,
      totalByFiscalYear,
      totalByAssetClass,
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('snapshots')
          .insert(mapSnapshotToSupabase(snapshot))
          .select(snapshotSelectColumns)
          .single()

        if (error) {
          console.error('Failed to insert snapshot in Supabase:', error)
          return null
        }

        const insertedSnapshot = mapSupabaseSnapshot(data)
        setSnapshots((currentSnapshots) => [insertedSnapshot, ...currentSnapshots])
        return insertedSnapshot.id
      } catch (error) {
        console.error('Failed to persist snapshot to Supabase:', error)
        return null
      }
    }

    setSnapshots((currentSnapshots) => [snapshot, ...currentSnapshots])
    return snapshot.id
  }

  const renameSnapshot = async (snapshotId, snapshotName) => {
    const nextName = snapshotName.trim()
    if (!nextName) return false

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('snapshots')
          .update({ name: nextName })
          .eq('id', snapshotId)
          .select(snapshotSelectColumns)
          .single()

        if (error) {
          console.error('Failed to rename snapshot in Supabase:', error)
          return false
        }

        const updatedSnapshot = mapSupabaseSnapshot(data)
        setSnapshots((currentSnapshots) =>
          currentSnapshots.map((snapshot) =>
            snapshot.id === snapshotId ? updatedSnapshot : snapshot
          )
        )
        return true
      } catch (error) {
        console.error('Failed to persist snapshot rename to Supabase:', error)
        return false
      }
    }

    setSnapshots((currentSnapshots) =>
      currentSnapshots.map((snapshot) =>
        snapshot.id === snapshotId ? { ...snapshot, name: nextName } : snapshot
      )
    )
    return true
  }

  const deleteSnapshot = async (snapshotId) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('snapshots').delete().eq('id', snapshotId)

        if (error) {
          console.error('Failed to delete snapshot in Supabase:', error)
          return false
        }
      } catch (error) {
        console.error('Failed to persist snapshot delete to Supabase:', error)
        return false
      }
    }

    setSnapshots((currentSnapshots) =>
      currentSnapshots.filter((snapshot) => snapshot.id !== snapshotId)
    )
    return true
  }

  const renderView = () => {
    switch (activeView) {
      case 'asset-class':
        return (
          <AssetClassDetail
            commitmentData={commitmentData}
            portfolioMetrics={chartPortfolioMetrics}
          />
        )
      case 'commitment-input':
        return (
          <CommitmentInput
            commitmentData={commitmentData}
            setCommitmentData={setCommitmentData}
            appendChange={appendChange}
            persistEditsToSupabase={commitmentsLoadedFromSupabase}
          />
        )
      case 'targets-actuals':
        return (
          <TargetsActuals
            targetsActuals={targetsActuals}
            setTargetsActuals={setTargetsActuals}
            onPersistPortfolioMetric={persistPortfolioMetric}
          />
        )
      case 'change-log':
        return <ChangeLog changeLogRecords={changeLogRecords} />
      case 'snapshots':
        return (
          <Snapshots
            snapshots={snapshots}
            onCreateSnapshot={createSnapshot}
            onRenameSnapshot={renameSnapshot}
            onDeleteSnapshot={deleteSnapshot}
          />
        )
      default:
        return (
          <PortfolioOverview
            commitmentData={commitmentData}
            portfolioMetrics={chartPortfolioMetrics}
          />
        )
    }
  }

  const logout = async () => {
    if (!isSupabaseConfigured) return

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Failed to sign out of Supabase:', error)
    }
  }

  if (isAuthLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-panel auth-loading-panel">
          <div className="brand-block auth-brand">
            <span className="brand-tag">RMC</span>
            <h1>Commitment Pipeline Dashboard</h1>
          </div>
          <div className="auth-message">Checking session...</div>
        </section>
      </main>
    )
  }

  if (isSupabaseConfigured && !session) {
    return <AuthGate />
  }

  return (
    <Layout
      views={views}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={logout}
      userEmail={session?.user?.email}
    >
      {renderView()}
    </Layout>
  )
}

export default App
