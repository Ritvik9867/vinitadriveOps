import { useState } from 'react'

function Drives() {
  const [drives, setDrives] = useState([
    { id: 1, date: '2023-07-20', distance: '45 km', status: 'Completed' },
    { id: 2, date: '2023-07-21', distance: '75 km', status: 'In Progress' }
  ])

  return (
    <div className="drives">
      <h2>Drive Operations</h2>
      <div className="drives-list">
        {drives.map(drive => (
          <div key={drive.id} className="drive-card">
            <div className="drive-info">
              <p className="date">{drive.date}</p>
              <p className="distance">{drive.distance}</p>
              <span className={`status ${drive.status.toLowerCase()}`}>
                {drive.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button className="add-drive-btn">
        Start New Drive
      </button>
    </div>
  )
}

export default Drives