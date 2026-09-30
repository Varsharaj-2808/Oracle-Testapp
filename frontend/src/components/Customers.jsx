import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: true, error: null, notice: null });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.getCustomers();
      setCustomers(data);
      setStatus({ loading: false, error: null, notice: null });
    } catch (error) {
      setCustomers([]);
      setStatus({
        loading: false,
        error: error.missing ? `${error.error} Missing: ${error.missing.join(', ')}` : error.message,
        notice: null,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus((prev) => ({ ...prev, error: null, notice: null }));
    try {
      const created = await api.createCustomer({ name, email });
      setName('');
      setEmail('');
      setStatus((prev) => ({ ...prev, notice: `Created ${created.name}.` }));
      await load();
    } catch (error) {
      setStatus((prev) => ({ ...prev, error: error.message }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <h2>Customers</h2>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@example.com" />
          </label>
        </div>
        <button type="submit" className="primary" disabled={saving || status.loading}>
          {saving ? 'Saving...' : 'Add customer'}
        </button>
      </form>

      {status.error && <p className="message error">{status.error}</p>}
      {status.notice && !status.error && <p className="message success">{status.notice}</p>}

      {!status.error && (status.loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td className="muted">{new Date(customer.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
