import { useState } from 'react';
import { api } from '../api.js';

const DEFAULT_SUBJECT = 'Test email from the secret-management sample app';
const DEFAULT_BODY =
  'This message was sent by the sample app to confirm that the Brevo API key ' +
  'is being read from the environment on the server and never exposed to the browser.';

export default function EmailTest() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [text, setText] = useState(DEFAULT_BODY);
  const [status, setStatus] = useState({ sending: false, error: null, notice: null });
  const [lastResult, setLastResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ sending: true, error: null, notice: null });
    setLastResult(null);
    try {
      const result = await api.sendTestEmail({ to, subject, text });
      setLastResult(result);
      setStatus({ sending: false, error: null, notice: `Email sent to ${result.to}.` });
    } catch (error) {
      setStatus({
        sending: false,
        error: error.missing ? `${error.error} Missing: ${error.missing.join(', ')}` : error.message,
        notice: null,
      });
    }
  }

  return (
    <div className="panel">
      <h2>Send a test email (Brevo)</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Recipient
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label>
          Message
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="submit" className="primary" disabled={status.sending || !to}>
          {status.sending ? 'Sending...' : 'Send test email'}
        </button>
      </form>

      {status.error && <p className="message error">{status.error}</p>}
      {status.notice && <p className="message success">{status.notice}</p>}

      {lastResult && (
        <p className="message info">
          Sender: {lastResult.sender} | Brevo message ID: {lastResult.messageId || 'n/a'}
        </p>
      )}

      <p className="message info" style={{ marginTop: 14 }}>
        The Brevo API key is sent by the backend in the <code>api-key</code> header.
        It is never present in this bundle, in the request, or in any response.
      </p>
    </div>
  );
}
