import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api, money } from './api';
import type { Category, Customer, Order, OrderStatus, Product } from './types';

type Page = 'home' | 'catalog' | 'cart' | 'track' | 'admin';
type Cart = Record<number, number>;

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente', PREPARING: 'En preparación', READY: 'Listo',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado'
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PREPARING', PREPARING: 'READY', READY: 'DELIVERED'
};

function productArtwork(product: Product) {
  const text = product.category.name.toLowerCase();
  if (text.includes('torta')) return '🎂';
  if (text.includes('galleta')) return '🍪';
  if (text.includes('bebida')) return '☕';
  return '🥖';
}

function Header({ page, cartCount, go }: { page: Page; cartCount: number; go: (page: Page) => void }) {
  return <header className="site-header">
    <button className="brand" onClick={() => go('home')} aria-label="Ir al inicio"><span className="brand__mark">PA</span><span><strong>Pan Artesano - sucre</strong><small>Horneado con cariño</small></span></button>
    <nav aria-label="Navegación principal"><button className={page === 'home' ? 'active' : ''} onClick={() => go('home')}>Inicio</button><button className={page === 'catalog' ? 'active' : ''} onClick={() => go('catalog')}>Productos</button><button className={page === 'track' ? 'active' : ''} onClick={() => go('track')}>Mi pedido</button><button className={page === 'admin' ? 'active' : ''} onClick={() => go('admin')}>Administración</button></nav>
    <button className="cart-button" onClick={() => go('cart')} aria-label="Abrir carrito">🧺 <span>{cartCount}</span></button>
  </header>;
}

function ProductCard({ product, add }: { product: Product; add: (product: Product) => void }) {
  return <article className="product-card"><div className="product-card__image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span role="img" aria-label={product.category.name}>{productArtwork(product)}</span>}<em>{product.category.name}</em></div><div className="product-card__body"><small>{product.sku}</small><h3>{product.name}</h3><p>{product.description ?? 'Elaborado artesanalmente cada día.'}</p><div className="product-card__footer"><div><strong>{money(product.price)}</strong><small>{product.stock} disponibles</small></div><button disabled={product.stock === 0} onClick={() => add(product)}>{product.stock === 0 ? 'Agotado' : 'Agregar'}</button></div></div></article>;
}

function Catalog({ products, categories, add }: { products: Product[]; categories: Category[]; add: (product: Product) => void }) {
  const [categoryId, setCategoryId] = useState(0);
  const [search, setSearch] = useState('');
  const filtered = products.filter((product) => (!categoryId || product.categoryId === categoryId) && (!search || `${product.name} ${product.description ?? ''}`.toLowerCase().includes(search.toLowerCase())));
  return <main className="page-shell"><div className="section-heading"><div><span className="eyebrow">Nuestro catálogo</span><h1>Sabores recién horneados</h1></div><p>Elige tus favoritos. Preparamos cada pedido con ingredientes frescos.</p></div><div className="catalog-tools"><label className="search-box">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar productos…" /></label><div className="chips"><button className={!categoryId ? 'selected' : ''} onClick={() => setCategoryId(0)}>Todos</button>{categories.map((category) => <button key={category.id} className={categoryId === category.id ? 'selected' : ''} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}</div></div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} add={add} />)}</div>{!filtered.length && <div className="empty-state"><span>🥐</span><h2>No encontramos productos</h2><p>Prueba con otra categoría o búsqueda.</p></div>}</main>;
}

function CartPage({ products, cart, update, clear, go }: { products: Product[]; cart: Cart; update: (id: number, quantity: number) => void; clear: () => void; go: (page: Page) => void }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const items = products.filter((product) => cart[product.id]);
  const total = items.reduce((sum, product) => sum + Number(product.price) * cart[product.id], 0);

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setMessage(''); const form = new FormData(event.currentTarget);
    try {
      const customer = await api<Customer>('/customers', { method: 'POST', body: JSON.stringify({ firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'), phone: form.get('phone'), address: form.get('address') }) });
      const order = await api<Order>('/orders', { method: 'POST', body: JSON.stringify({ customerId: customer.id, notes: form.get('notes'), items: items.map((product) => ({ productId: product.id, quantity: cart[product.id] })) }) });
      setCompletedOrder(order); clear();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo crear el pedido.'); }
    finally { setSending(false); }
  }

  if (completedOrder) return <main className="page-shell"><section className="success-card"><span>✓</span><h1>¡Pedido confirmado!</h1><p>Tu número de pedido es <strong>#{completedOrder.id}</strong>.</p><p>Total: {money(completedOrder.total)}</p><button onClick={() => go('track')}>Consultar mi pedido</button></section></main>;
  if (!items.length) return <main className="page-shell"><div className="empty-state"><span>🧺</span><h1>Tu carrito está vacío</h1><p>Agrega panes, tortas o galletas desde nuestro catálogo.</p><button onClick={() => go('catalog')}>Ver productos</button></div></main>;

  return <main className="page-shell checkout-layout"><section><span className="eyebrow">Tu selección</span><h1>Carrito de compra</h1><div className="cart-list">{items.map((product) => <article className="cart-item" key={product.id}><span className="cart-item__art">{productArtwork(product)}</span><div><h3>{product.name}</h3><p>{money(product.price)} por unidad</p></div><div className="quantity"><button onClick={() => update(product.id, cart[product.id] - 1)}>−</button><strong>{cart[product.id]}</strong><button disabled={cart[product.id] >= product.stock} onClick={() => update(product.id, cart[product.id] + 1)}>+</button></div><strong>{money(Number(product.price) * cart[product.id])}</strong></article>)}</div><div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div></section><form className="form-card" onSubmit={checkout}><h2>Datos para el pedido</h2><div className="form-row"><label>Nombre<input name="firstName" required /></label><label>Apellido<input name="lastName" required /></label></div><label>Correo electrónico<input name="email" type="email" required /></label><label>Teléfono<input name="phone" /></label><label>Dirección<input name="address" /></label><label>Indicaciones<textarea name="notes" rows={3} /></label>{message && <p className="form-error">{message}</p>}<button className="primary-button" disabled={sending}>{sending ? 'Procesando…' : `Confirmar pedido · ${money(total)}`}</button></form></main>;
}

function TrackOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setMessage(''); try { setOrder(await api<Order>(`/orders/track?id=${form.get('id')}&email=${encodeURIComponent(String(form.get('email')))}`)); } catch (error) { setOrder(null); setMessage(error instanceof Error ? error.message : 'No encontramos el pedido.'); } }
  return <main className="page-shell track-page"><section className="track-intro"><span className="eyebrow">Seguimiento</span><h1>¿Cómo va tu pedido?</h1><p>Ingresa el número de pedido y el correo que utilizaste al comprar.</p></section><form className="form-card track-form" onSubmit={submit}><label>Número de pedido<input name="id" type="number" min="1" required placeholder="Ej. 12" /></label><label>Correo electrónico<input name="email" type="email" required /></label>{message && <p className="form-error">{message}</p>}<button className="primary-button">Consultar pedido</button></form>{order && <section className="order-result"><div><span>Pedido #{order.id}</span><strong className={`status status--${order.status.toLowerCase()}`}>{STATUS_LABELS[order.status]}</strong></div><h2>{order.customer.firstName}, estamos preparando algo delicioso</h2><p>Realizado el {new Date(order.createdAt).toLocaleString('es-BO')} · Total {money(order.total)}</p>{order.items?.map((item) => <div className="order-line" key={item.id}><span>{item.quantity} × {item.product.name}</span><strong>{money(item.subtotal)}</strong></div>)}</section>}</main>;
}

function AdminPanel({ categories }: { categories: Category[] }) {
  const [token, setToken] = useState(() => localStorage.getItem('panaderia_token') ?? '');
  const [tab, setTab] = useState<'summary' | 'products' | 'categories' | 'orders' | 'customers'>('summary');
  const [products, setProducts] = useState<Product[]>([]), [adminCategories, setAdminCategories] = useState<Category[]>(categories), [orders, setOrders] = useState<Order[]>([]), [customers, setCustomers] = useState<Customer[]>([]);
  const [message, setMessage] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function logout() { localStorage.removeItem('panaderia_token'); setToken(''); }
  async function loadAdmin(currentToken = token) { if (!currentToken) return; try { const [productData, categoryData, orderData, customerData] = await Promise.all([api<Product[]>('/products?includeInactive=true', { token: currentToken }), api<Category[]>('/categories?includeInactive=true', { token: currentToken }), api<Order[]>('/orders', { token: currentToken }), api<Customer[]>('/customers?includeInactive=true', { token: currentToken })]); setProducts(productData); setAdminCategories(categoryData); setOrders(orderData); setCustomers(customerData); setMessage(''); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cargar el panel.'); if (error instanceof Error && /sesión|token|iniciar/i.test(error.message)) logout(); } }
  useEffect(() => { void loadAdmin(); }, [token]);
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setMessage(''); try { const result = await api<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); localStorage.setItem('panaderia_token', result.token); setToken(result.token); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.'); } }
  async function saveCategory(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api('/categories', { method: 'POST', token, body: JSON.stringify({ name: form.get('name'), description: form.get('description') }) }); event.currentTarget.reset(); await loadAdmin(); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar.'); } }
  async function saveProduct(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = { sku: form.get('sku'), name: form.get('name'), description: form.get('description'), price: Number(form.get('price')), stock: Number(form.get('stock')), categoryId: Number(form.get('categoryId')), imageUrl: form.get('imageUrl') }; try { await api(`/products${editingProduct ? `/${editingProduct.id}` : ''}`, { method: editingProduct ? 'PUT' : 'POST', token, body: JSON.stringify(payload) }); setEditingProduct(null); event.currentTarget.reset(); await loadAdmin(); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar.'); } }
  async function deactivate(kind: 'products' | 'categories', id: number) { if (!confirm('¿Deseas desactivar este registro?')) return; try { await api(`/${kind}/${id}`, { method: 'DELETE', token }); await loadAdmin(); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo desactivar.'); } }
  async function changeStatus(order: Order, status: OrderStatus) { try { await api(`/orders/${order.id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status }) }); await loadAdmin(); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo actualizar.'); } }

  if (!token) return <main className="login-page"><form className="login-card" onSubmit={login}><span className="brand__mark">PA</span><span className="eyebrow">Acceso privado</span><h1>Administración</h1><p>Gestiona el catálogo y los pedidos de la panadería.</p><label>Correo<input name="email" type="email" defaultValue="admin@panaderia.com" required /></label><label>Contraseña<input name="password" type="password" required /></label>{message && <p className="form-error">{message}</p>}<button className="primary-button">Iniciar sesión</button></form></main>;

  const titles = { summary: 'Resumen del negocio', products: 'Productos', categories: 'Categorías', orders: 'Pedidos', customers: 'Clientes' };
  return <main className="admin-shell"><aside className="admin-sidebar"><div className="admin-title"><span className="brand__mark">PA</span><strong>Panel de gestión</strong></div>{(Object.keys(titles) as (keyof typeof titles)[]).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{titles[item]}</button>)}<button className="logout" onClick={logout}>Cerrar sesión</button></aside><section className="admin-content"><div className="admin-heading"><div><span className="eyebrow">Pan Artesano</span><h1>{titles[tab]}</h1></div><button onClick={() => void loadAdmin()}>↻ Actualizar</button></div>{message && <p className="form-error">{message}</p>}
    {tab === 'summary' && <div className="stats-grid"><article><span>Productos activos</span><strong>{products.filter((p) => p.active).length}</strong><small>en el catálogo</small></article><article><span>Pedidos pendientes</span><strong>{orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length}</strong><small>requieren atención</small></article><article><span>Clientes</span><strong>{customers.filter((c) => c.active).length}</strong><small>registrados</small></article><article><span>Ventas registradas</span><strong>{money(orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + Number(o.total), 0))}</strong><small>total histórico</small></article></div>}
    {tab === 'products' && <div className="admin-two-columns"><form className="admin-form" onSubmit={saveProduct}><h2>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2><label>SKU<input name="sku" required defaultValue={editingProduct?.sku} /></label><label>Nombre<input name="name" required defaultValue={editingProduct?.name} /></label><label>Descripción<textarea name="description" defaultValue={editingProduct?.description ?? ''} /></label><div className="form-row"><label>Precio<input name="price" type="number" min="0.01" step="0.01" required defaultValue={editingProduct ? Number(editingProduct.price) : ''} /></label><label>Stock<input name="stock" type="number" min="0" required defaultValue={editingProduct?.stock ?? 0} /></label></div><label>Categoría<select name="categoryId" required defaultValue={editingProduct?.categoryId}>{adminCategories.filter((c) => c.active).map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>URL de imagen<input name="imageUrl" defaultValue={editingProduct?.imageUrl ?? ''} /></label><button className="primary-button">{editingProduct ? 'Guardar cambios' : 'Crear producto'}</button>{editingProduct && <button type="button" onClick={() => setEditingProduct(null)}>Cancelar edición</button>}</form><div className="admin-list">{products.map((product) => <article key={product.id} className={!product.active ? 'inactive' : ''}><span className="mini-art">{productArtwork(product)}</span><div><strong>{product.name}</strong><small>{product.sku} · {product.category.name} · Stock {product.stock}</small></div><b>{money(product.price)}</b><button onClick={() => setEditingProduct(product)}>Editar</button>{product.active && <button className="danger" onClick={() => void deactivate('products', product.id)}>Desactivar</button>}</article>)}</div></div>}
    {tab === 'categories' && <div className="admin-two-columns"><form className="admin-form" onSubmit={saveCategory}><h2>Nueva categoría</h2><label>Nombre<input name="name" required /></label><label>Descripción<textarea name="description" /></label><button className="primary-button">Crear categoría</button></form><div className="admin-list">{adminCategories.map((category) => <article key={category.id} className={!category.active ? 'inactive' : ''}><span className="mini-art">◇</span><div><strong>{category.name}</strong><small>{category.description ?? 'Sin descripción'} · {category._count?.products ?? 0} productos</small></div>{category.active && <button className="danger" onClick={() => void deactivate('categories', category.id)}>Desactivar</button>}</article>)}</div></div>}
    {tab === 'orders' && <div className="orders-table">{orders.map((order) => <article key={order.id}><div><strong>Pedido #{order.id}</strong><small>{order.customer.firstName} {order.customer.lastName} · {new Date(order.createdAt).toLocaleString('es-BO')}</small></div><span className={`status status--${order.status.toLowerCase()}`}>{STATUS_LABELS[order.status]}</span><b>{money(order.total)}</b><div className="row-actions">{NEXT_STATUS[order.status] && <button onClick={() => void changeStatus(order, NEXT_STATUS[order.status]!)}>Avanzar</button>}{!['DELIVERED', 'CANCELLED'].includes(order.status) && <button className="danger" onClick={() => void changeStatus(order, 'CANCELLED')}>Cancelar</button>}</div></article>)}</div>}
    {tab === 'customers' && <div className="orders-table">{customers.map((customer) => <article key={customer.id} className={!customer.active ? 'inactive' : ''}><div><strong>{customer.firstName} {customer.lastName}</strong><small>{customer.email} · {customer.phone || 'Sin teléfono'}</small></div><span>{customer._count?.orders ?? 0} pedidos</span><span>{customer.active ? 'Activo' : 'Inactivo'}</span></article>)}</div>}
  </section></main>;
}

function App() {
  const [page, setPage] = useState<Page>('home'), [products, setProducts] = useState<Product[]>([]), [categories, setCategories] = useState<Category[]>([]), [cart, setCart] = useState<Cart>({}), [notice, setNotice] = useState('');
  useEffect(() => { Promise.all([api<Product[]>('/products'), api<Category[]>('/categories')]).then(([productData, categoryData]) => { setProducts(productData); setCategories(categoryData); }).catch(() => setNotice('No pudimos conectar con el servidor. Comprueba que Docker esté ejecutándose.')); }, []);
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0), [cart]);
  function go(next: Page) { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function add(product: Product) { setCart((current) => ({ ...current, [product.id]: Math.min((current[product.id] ?? 0) + 1, product.stock) })); setNotice(`${product.name} se agregó al carrito.`); setTimeout(() => setNotice(''), 2200); }
  function update(id: number, quantity: number) { setCart((current) => { const next = { ...current }; if (quantity <= 0) delete next[id]; else next[id] = quantity; return next; }); }
  if (page === 'admin') return <><Header page={page} cartCount={cartCount} go={go} /><AdminPanel categories={categories} /></>;
  return <><Header page={page} cartCount={cartCount} go={go} />{notice && <div className="toast">{notice}</div>}{page === 'home' && <main><section className="hero"><div className="hero__content"><span className="eyebrow">Desde el horno a tu mesa</span><h1>El sabor de lo <em>hecho a mano</em></h1><p>Panes de masa lenta, tortas memorables y pequeños antojos. Elaboramos cada pieza fresca, todos los días.</p><div className="hero__actions"><button className="primary-button" onClick={() => go('catalog')}>Explorar productos</button><button onClick={() => go('track')}>Seguir mi pedido</button></div><div className="hero__facts"><span><strong>100%</strong> artesanal</span><span><strong>Cada día</strong> recién horneado</span><span><strong>Ingredientes</strong> seleccionados</span></div></div><div className="hero__visual"><div className="bread bread--one">🥖</div><div className="bread bread--two">🥐</div><div className="bread bread--three">🍞</div><span>Hecho con<br />tiempo y cariño</span></div></section><section className="featured page-shell"><div className="section-heading"><div><span className="eyebrow">Favoritos de la casa</span><h2>Una pausa que sabe mejor</h2></div><button onClick={() => go('catalog')}>Ver todo el catálogo →</button></div><div className="product-grid">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} add={add} />)}</div></section><section className="promise"><span>🌾</span><div><small>Nuestra promesa</small><h2>Menos prisa. Más sabor.</h2><p>Respetamos los tiempos de cada masa y horneamos en cantidades pequeñas para ofrecerte productos frescos y auténticos.</p></div></section></main>}{page === 'catalog' && <Catalog products={products} categories={categories} add={add} />}{page === 'cart' && <CartPage products={products} cart={cart} update={update} clear={() => setCart({})} go={go} />}{page === 'track' && <TrackOrder />}<footer><div className="brand brand--footer"><span className="brand__mark">PA</span><span><strong>Pan Sucre</strong><small>Horneado con cariño</small></span></div><p>Proyecto académico full stack · React, TypeScript, Express, Prisma y PostgreSQL.</p><span>© 2026 Pan Artesano</span></footer></>;
}

export default App;
