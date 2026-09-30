import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  const load = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.getProducts();
      setProducts(data);
      setStatus({ loading: false, error: null });
    } catch (error) {
      setProducts([]);
      setStatus({
        loading: false,
        error: error.missing ? `${error.error} Missing: ${error.missing.join(', ')}` : error.message,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="panel">
      <h2>Products</h2>

      {status.error && <p className="message error">{status.error}</p>}

      {!status.error && (status.loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td className="muted">{product.description}</td>
                <td>{Number(product.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
