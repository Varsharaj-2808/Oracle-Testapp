import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null, notice: null });
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.getOrders();
      setOrders(data);
      setStatus({ loading: false, error: null, notice: null });
    } catch (error) {
      setOrders([]);
      setStatus({
        loading: false,
        error: error.missing ? `${error.error} Missing: ${error.missing.join(', ')}` : error.message,
        notice: null,
      });
    }
  }, []);

  useEffect(() => {
    load();
    api.getCustomers().then(setCustomers).catch(() => setCustomers([]));
    api.getProducts().then(setProducts).catch(() => setProducts([]));
  }, [load]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus((prev) => ({ ...prev, error: null, notice: null }));
    try {
      const created = await api.createOrder({ customerId, productId, quantity: Number(quantity) });
      setStatus((prev) => ({ ...prev, notice: `Order created, total ${Number(created.total).toFixed(2)}.` }));
      await load();
    } catch (error) {
      setStatus((prev) => ({ ...prev, error: error.message }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <h2>Orders</h2>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <label>
            Customer
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label>
            Product
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" className="primary" disabled={saving || !customerId || !productId}>
          {saving ? 'Saving...' : 'Create order'}
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
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.customers?.name || '-'}</td>
                <td>{order.products?.name || '-'}</td>
                <td>{order.quantity}</td>
                <td>{Number(order.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
