import { useState } from 'react'
import { assetClasses, fiscalYears } from '../constants'
import { formatMillions } from '../utils/calculations'

function SnapshotTotals({ title, totals, keys }) {
  return (
    <div className="snapshot-total-panel">
      <h3>{title}</h3>
      <table className="snapshot-total-table">
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{formatMillions(totals[key] || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SnapshotDetails({ snapshot }) {
  if (!snapshot) {
    return (
      <div className="empty-table-state">
        Select a snapshot to review saved commitment details.
      </div>
    )
  }

  return (
    <section className="snapshot-detail-panel">
      <div className="snapshot-detail-header">
        <div>
          <h3>{snapshot.name}</h3>
          <span>{snapshot.createdAt}</span>
        </div>
        <span>{snapshot.createdBy}</span>
      </div>

      <div className="snapshot-summary-grid">
        <div>
          <span>Total Commitments</span>
          <strong>{formatMillions(snapshot.totalCommitments)}</strong>
        </div>
        <div>
          <span>Commitment Count</span>
          <strong>{snapshot.commitmentCount}</strong>
        </div>
      </div>

      <div className="snapshot-total-grid">
        <SnapshotTotals
          title="Totals by Asset Class"
          totals={snapshot.totalByAssetClass}
          keys={assetClasses}
        />
        <SnapshotTotals
          title="Totals by Fiscal Year"
          totals={snapshot.totalByFiscalYear}
          keys={fiscalYears}
        />
      </div>

      <div className="commitment-table-wrap">
        <table className="commitment-table snapshot-commitment-table">
          <thead>
            <tr>
              <th>Fiscal Year</th>
              <th>Asset Class</th>
              <th>Manager</th>
              <th>Investment</th>
              <th>Commitment Type</th>
              <th>Target ($mm)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.commitments.map((commitment) => (
              <tr key={commitment.id}>
                <td>{commitment.fiscalYear}</td>
                <td>{commitment.assetClass}</td>
                <td>{commitment.manager}</td>
                <td>{commitment.investmentName}</td>
                <td>{commitment.commitmentType}</td>
                <td>{formatMillions(commitment.targetAmount)}</td>
                <td>{commitment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Snapshots({ snapshots, onCreateSnapshot, onRenameSnapshot, onDeleteSnapshot }) {
  const [snapshotName, setSnapshotName] = useState('')
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(null)
  const [renameDraft, setRenameDraft] = useState({ snapshotId: null, value: '' })
  const [managementError, setManagementError] = useState('')
  const [isManagingSnapshot, setIsManagingSnapshot] = useState(false)
  const selectedSnapshot = snapshots.find((snapshot) => snapshot.id === selectedSnapshotId)
  const renameValue =
    selectedSnapshot && renameDraft.snapshotId === selectedSnapshot.id
      ? renameDraft.value
      : selectedSnapshot?.name || ''

  const handleCreateSnapshot = async () => {
    const snapshotId = await onCreateSnapshot(snapshotName.trim())
    if (!snapshotId) return

    setSelectedSnapshotId(snapshotId)
    setSnapshotName('')
  }

  const selectSnapshot = (snapshotId) => {
    setSelectedSnapshotId(snapshotId)
    setManagementError('')
  }

  const handleRenameSnapshot = async () => {
    if (!selectedSnapshot) return

    const nextName = renameValue.trim()
    if (!nextName) {
      setManagementError('Snapshot name is required.')
      return
    }

    setIsManagingSnapshot(true)
    const didRename = await onRenameSnapshot(selectedSnapshot.id, nextName)
    setIsManagingSnapshot(false)

    if (!didRename) {
      setManagementError('Snapshot could not be renamed.')
      return
    }

    setManagementError('')
    setRenameDraft({ snapshotId: selectedSnapshot.id, value: nextName })
  }

  const handleDeleteSnapshot = async () => {
    if (!selectedSnapshot) return
    if (!window.confirm(`Delete "${selectedSnapshot.name}"?`)) return

    setIsManagingSnapshot(true)
    const didDelete = await onDeleteSnapshot(selectedSnapshot.id)
    setIsManagingSnapshot(false)

    if (!didDelete) {
      setManagementError('Snapshot could not be deleted.')
      return
    }

    setSelectedSnapshotId(null)
    setRenameDraft({ snapshotId: null, value: '' })
  }

  return (
    <section className="view-panel">
      <div className="view-header-row">
        <h2>Snapshots</h2>
        {selectedSnapshot && (
          <button type="button" className="primary-action-button print-action-button" onClick={() => window.print()}>
            Print Snapshot
          </button>
        )}
      </div>

      <div className="snapshot-create-panel">
        <label className="filter-control">
          <span>Snapshot Name</span>
          <input
            type="text"
            value={snapshotName}
            placeholder="Meeting view"
            onChange={(event) => setSnapshotName(event.target.value)}
          />
        </label>
        <button type="button" className="primary-action-button" onClick={handleCreateSnapshot}>
          Create Snapshot
        </button>
      </div>

      {selectedSnapshot && (
        <div className="snapshot-management-panel">
          <label className="filter-control">
            <span>Selected Snapshot</span>
            <input
              type="text"
              value={renameValue}
              onChange={(event) =>
                setRenameDraft({
                  snapshotId: selectedSnapshot.id,
                  value: event.target.value,
                })
              }
            />
          </label>
          <button
            type="button"
            className="primary-action-button"
            onClick={handleRenameSnapshot}
            disabled={isManagingSnapshot}
          >
            Rename
          </button>
          <button
            type="button"
            className="danger-action-button"
            onClick={handleDeleteSnapshot}
            disabled={isManagingSnapshot}
          >
            Delete
          </button>
          {managementError && <div className="snapshot-management-error">{managementError}</div>}
        </div>
      )}

      <div className="commitment-input-panel">
        <div className="input-table-meta">
          <span>{snapshots.length} saved snapshots</span>
        </div>

        <div className="commitment-table-wrap">
          <table className="commitment-table snapshot-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th>Created By</th>
                <th>Total Commitments</th>
                <th>Commitment Count</th>
                <th>FY26 Total</th>
                <th>FY27 Total</th>
                <th>FY28 Total</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snapshot) => (
                <tr
                  key={snapshot.id}
                  className={selectedSnapshotId === snapshot.id ? 'selected-row' : ''}
                  onClick={() => selectSnapshot(snapshot.id)}
                >
                  <td>{snapshot.name}</td>
                  <td>{snapshot.createdAt}</td>
                  <td>{snapshot.createdBy}</td>
                  <td>{formatMillions(snapshot.totalCommitments)}</td>
                  <td>{snapshot.commitmentCount}</td>
                  <td>{formatMillions(snapshot.totalByFiscalYear.FY26 || 0)}</td>
                  <td>{formatMillions(snapshot.totalByFiscalYear.FY27 || 0)}</td>
                  <td>{formatMillions(snapshot.totalByFiscalYear.FY28 || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {snapshots.length === 0 && (
          <div className="empty-table-state">
            No snapshots have been created.
          </div>
        )}
      </div>

      <SnapshotDetails snapshot={selectedSnapshot} />
    </section>
  )
}

export default Snapshots
