// Optional: load sample categories/products so the storefront isn't empty.
// Usage: node scripts/seed.js http://<EC2_PUBLIC_IP>      (Node 18+)
const base = (process.argv[2] || 'http://localhost:8080').replace(/\/$/, '');
const api = (path, body) =>
  fetch(`${base}/svc/product/api/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then(r => r.json());

(async () => {
  const cats = {};
  for (const name of ['Electronics', 'Books', 'Clothing']) {
    const r = await api('categories', { name, slug: name.toLowerCase(), description: `${name} category` });
    cats[name] = r.category && r.category._id;
    console.log('category', name, cats[name] || r);
  }
  const items = [
    ['Wireless Headphones', 'Over-ear Bluetooth headphones', 79.99, 'Electronics', 'SoundMax', 'ELE-001'],
    ['Mechanical Keyboard', 'RGB mechanical keyboard', 59.5, 'Electronics', 'KeyPro', 'ELE-002'],
    ['DevOps Handbook', 'Guide to DevOps practices', 29.99, 'Books', 'TechPress', 'BOK-001'],
    ['Cotton T-Shirt', 'Plain cotton t-shirt', 14.99, 'Clothing', 'BasicWear', 'CLO-001'],
  ];
  for (const [name, description, price, cat, brand, sku] of items) {
    const r = await api('products', {
      name, description, price, brand, category: cats[cat],
      images: [{ url: 'https://via.placeholder.com/300', alt: name }],
      inventory: { stock: 50, sku }, featured: true,
    });
    console.log('product', name, r.product ? 'created' : r);
  }
})();
