import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function ConfigStatus({ refreshKey }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.getConfig();
      setState({ loading: false, data, error: null });
    } catch (error) {
      setState({ loading: false, data: null, error: error.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (state.loading) return <div className="panel"><p className="muted">Checking configuration...</p></div>;
  if (state.error) return <div className="panel"><p className="message error">Could not reach the backend: {state.error}</p></div>;

  const { variables = [], features = {}, warnings = [] } = state.data;

  return (
    <div className="panel">
      <h2>Environment variables</h2>

      <p className="muted" style={{ marginTop: 0 }}>
        Only presence is reported. Values are never sent to the browser.
      </p>

      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Feature</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((variable) => (
            <tr key={variable.name}>
              <td>
                <code>{variable.name}</code>
                {variable.secret && <span className="muted"> (secret)</span>}
              </td>
              <td className="muted">{variable.feature}</td>
              <td>
                <span className={`badge ${variable.present ? 'set' : 'missing'}`}>
                  {variable.present ? 'set' : variable.required ? 'missing' : 'not set'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className={`badge ${features.supabase?.configured ? 'feature-on' : 'feature-off'}`}>
          supabase: {features.supabase?.configured ? 'ready' : 'not configured'}
        </span>
        <span className={`badge ${features.brevo?.configured ? 'feature-on' : 'feature-off'}`}>
          brevo: {features.brevo?.configured ? 'ready' : 'not configured'}
        </span>
        <button type="button" className="link" onClick={load}>re-check</button>
      </div>

      {warnings.map((warning) => (
        <p className="message error" key={warning}>{warning}</p>
      ))}
    </div>
  );
}
