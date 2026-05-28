import { useState } from 'react'
import Layout from './components/Layout'
import PortfolioOverview from './components/PortfolioOverview'
import AssetClassDetail from './components/AssetClassDetail'
import CommitmentInput from './components/CommitmentInput'
import ChangeLog from './components/ChangeLog'
import { commitments } from './data/commitments'
import { changeLog } from './data/changes'
import { formatTimestamp } from './utils/calculations'
import './App.css'

const views = [
  { key: 'overview', label: 'Portfolio Overview' },
  { key: 'asset-class', label: 'Asset Class Detail' },
  { key: 'commitment-input', label: 'Commitment Input' },
  { key: 'change-log', label: 'Change Log' },
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
