import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import PortfolioOverview from './components/PortfolioOverview'
import AssetClassDetail from './components/AssetClassDetail'
import CommitmentInput from './components/CommitmentInput'
import ChangeLog from './components/ChangeLog'
import Snapshots from './components/Snapshots'
import { assetClasses, fiscalYears } from './constants'
import { commitments } from './data/commitments'
import { changeLog } from './data/changes'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { formatTimestamp } from './utils/calculations'
import './App.css'

const views = [
  { key: 'overview', label: 'Portfolio Overview' },
  { key: 'asset-class', label: 'Asset Class Detail' },
  { key: 'commitment-input', label: 'Commitment Input' },
  { key: 'change-log', label: 'Change Log' },
  { key: 'snapshots', label: 'Snapshots' },
]

const changedByUser = 'Current User'

const getInitialCommitments = () =>
  commitments.map((commitment) => ({
    ...commitment,
    managerType: commitment.managerType || 'Current',
  }))

const mapSupabaseCommitment = (commitment) => ({
  id: commitment.id,
  fiscalYear: commitment.fiscal_year,
  assetClass: commitment.asset_class,
  managerType: commitment.manager_type,
  manager: commitment.manager_name,
  investmentName: commitment.investment_name,
  commitmentType: commitment.commitment_type,
  targetAmount: Number(commitment.target_amount || 0),
  status: commitment.status,
})

function App() {
  const [activeView, setActiveView] = useState(views[0].key)
  const [commitmentData, setCommitmentData] = useState(getInitialCommitments)
  const [changeLogRecords, setChangeLogRecords] = useState(changeLog)
  const [snapshots, setSnapshots] = useState([])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    const loadCommitments = async () => {
      const { data, error } = await supabase
        .from('commitments')
        .select(
          'id, fiscal_year, asset_class, manager_type, manager_name, investment_name, commitment_type, target_amount, status'
        )
        .order('fiscal_year', { ascending: true })
        .order('asset_class', { ascending: true })

      if (error) {
        console.error('Failed to load commitments from Supabase:', error)
        return
      }

      if (isMounted) {
        setCommitmentData((data || []).map(mapSupabaseCommitment))
      }
    }

    loadCommitments()

    return () => {
      isMounted = false
    }
  }, [])

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
        return <AssetClassDetail commitmentData={commitmentData} />
      case 'commitment-input':
        return (
          <CommitmentInput
            commitmentData={commitmentData}
            setCommitmentData={setCommitmentData}
            appendChange={appendChange}
          />
        )
      case 'change-log':
        return <ChangeLog changeLogRecords={changeLogRecords} />
      case 'snapshots':
        return <Snapshots snapshots={snapshots} onCreateSnapshot={createSnapshot} />
      default:
        return <PortfolioOverview />
    }
  }

  return (
    <Layout views={views} activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </Layout>
  )
}

export default App
