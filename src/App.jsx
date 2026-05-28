import { useEffect, useState } from 'react'
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
import { commitmentSelectColumns, mapSupabaseCommitment } from './utils/commitmentMapping'
import {
  mapSupabasePortfolioMetricsToTargetsActuals,
  portfolioMetricSelectColumns,
} from './utils/portfolioMetricMapping'
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

function App() {
  const [activeView, setActiveView] = useState(views[0].key)
  const [commitmentData, setCommitmentData] = useState(getInitialCommitments)
  const [changeLogRecords, setChangeLogRecords] = useState(changeLog)
  const [targetsActuals, setTargetsActuals] = useState(() =>
    createTargetsActualsRows(portfolioMetrics, fiscalYears, assetClasses)
  )
  const [snapshots, setSnapshots] = useState([])
  const [commitmentsLoadedFromSupabase, setCommitmentsLoadedFromSupabase] = useState(false)
  const [targetsActualsLoadedFromSupabase, setTargetsActualsLoadedFromSupabase] =
    useState(false)

  const targetActualMetrics = targetsActualsRowsToPortfolioMetrics(
    targetsActuals,
    fiscalYears,
    assetClasses
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    const loadCommitments = async () => {
      const { data, error } = await supabase
        .from('commitments')
        .select(commitmentSelectColumns)
        .order('fiscal_year', { ascending: true })
        .order('asset_class', { ascending: true })

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

    loadCommitments()
    loadPortfolioMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  const persistTargetActual = async ({ fiscalYear, assetClass, metric, amount }) => {
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

  const createSnapshot = (snapshotName) => {
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

    setSnapshots((currentSnapshots) => [snapshot, ...currentSnapshots])
    return snapshot.id
  }

  const renderView = () => {
    switch (activeView) {
      case 'asset-class':
        return (
          <AssetClassDetail
            commitmentData={commitmentData}
            portfolioMetrics={targetActualMetrics}
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
            onPersistTargetActual={persistTargetActual}
          />
        )
      case 'change-log':
        return <ChangeLog changeLogRecords={changeLogRecords} />
      case 'snapshots':
        return <Snapshots snapshots={snapshots} onCreateSnapshot={createSnapshot} />
      default:
        return (
          <PortfolioOverview
            commitmentData={commitmentData}
            portfolioMetrics={targetActualMetrics}
          />
        )
    }
  }

  return (
    <Layout views={views} activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </Layout>
  )
}

export default App
