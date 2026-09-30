import { useState } from 'react';
import ConfigStatus from './components/ConfigStatus.jsx';
import Customers from './components/Customers.jsx';
import Products from './components/Products.jsx';
import Orders from './components/Orders.jsx';
import EmailTest from './components/EmailTest.jsx';

const TABS = [
  { id: 'config', label: 'Config', render: (refreshKey) => <ConfigStatus refreshKey={refreshKey} /> },
  { id: 'customers', label: 'Customers', render: () => <Customers /> },
  { id: 'products', label: 'Products', render: () => <Products /> },
  { id: 'orders', label: 'Orders', render: () => <Orders /> },
  { id: 'email', label: 'Send email', render: () => <EmailTest /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('config');
  const [refreshKey, setRefreshKey] = useState(0);

  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <div className="app">
      <header>
        <h1>Secret Management Test App</h1>
        <p>Sample full-stack app for verifying environment-variable and secret handling.</p>
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>
          Refresh config
        </button>
      </nav>

      {active.render(refreshKey)}
    </div>
  );
}
