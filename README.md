# Commitment Pipeline Dashboard

Front-end prototype for an internal commitment pipeline reporting workflow. The dashboard is intended to replace recurring PowerPoint draft updates with a live, structured view of expected commitments by fiscal year, asset class, and investment.

## Current Features

- Portfolio Overview with summary cards and fiscal-year stacked bar chart
- Asset Class Detail with compact senior-staff reporting layout
- Commitment Input with editable in-memory commitment rows
- Change Log that records in-session add, edit, and delete activity
- Snapshots view for saving point-in-time commitment views in React state
- Print-friendly snapshot output using browser print / Save as PDF
- Dummy anonymized data only
- React state only

## Tech Stack

- React
- Vite
- Recharts
- CSS in `src/App.css`
- Dummy data modules in `src/data`

## Local Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Commands

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

## Current Limitations

- No backend
- No database persistence
- No user authentication
- No role-based permissions
- No localStorage persistence
- No deployment configuration
- Snapshots and edits reset on page refresh
- Change log is in-memory only
- Data is anonymized dummy data only
- Print support uses browser print; no generated PDF library is included

## Future Roadmap

- Backend/database persistence
- User authentication
- Role-based permissions
- Permanent audit log
- Persistent snapshots
- Snapshot comparison
- Internal deployment
- Optional PDF/PPT export
