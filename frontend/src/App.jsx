import { useState, useEffect } from 'react'

const API = 'http://localhost:8080/api'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// ── Icono de franquicia ──────────────────────────────────────
const FranquiciaTag = ({ nombre }) => {
  const colores = {
    VISA: { bg: '#1a1f71', text: '#fff' },
    MASTERCARD: { bg: '#eb001b', text: '#fff' },
    AMEX: { bg: '#007bc1', text: '#fff' },
  }
  const c = colores[nombre] || { bg: '#555', text: '#fff' }
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: 1,
      fontFamily: "'IBM Plex Mono', monospace"
    }}>{nombre}</span>
  )
}

// ── Modal genérico ───────────────────────────────────────────
const Modal = ({ titulo, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: '#fff', borderRadius: 12, padding: 32, width: 480,
      maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#1a1a2e' }}>{titulo}</h2>
        <button onClick={onClose} style={{
          border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#888'
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
)

// ── Campo de formulario ──────────────────────────────────────
const Campo = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}{required && <span style={{ color: '#e53935' }}> *</span>}
    </label>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      style={{
        width: '100%', padding: '9px 12px', border: '1.5px solid #ddd',
        borderRadius: 8, fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif",
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s'
      }}
      onFocus={e => e.target.style.borderColor = '#1a1f71'}
      onBlur={e => e.target.style.borderColor = '#ddd'}
    />
  </div>
)

// ── Botón principal ──────────────────────────────────────────
const Btn = ({ onClick, children, color = '#1a1f71', type = 'button', disabled }) => (
  <button
    type={type} onClick={onClick} disabled={disabled}
    style={{
      background: disabled ? '#ccc' : color, color: '#fff',
      border: 'none', borderRadius: 8, padding: '10px 20px',
      fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: 0.3,
      transition: 'opacity 0.2s'
    }}
    onMouseOver={e => { if (!disabled) e.target.style.opacity = 0.85 }}
    onMouseOut={e => e.target.style.opacity = 1}
  >{children}</button>
)

// ═══════════════════════════════════════════════════════════════
// MODAL — Nuevo Cliente
// ═══════════════════════════════════════════════════════════════
const ModalCliente = ({ onClose, onGuardado }) => {
  const [form, setForm] = useState({ numeroId: '', nombre: '', correo: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    setError('')
    if (!form.numeroId || !form.nombre || !form.correo) {
      setError('Todos los campos son obligatorios.')
      return
    }
    setCargando(true)
    try {
      const res = await fetch(`${API}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar el cliente.'); return }
      onGuardado(data)
      onClose()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal titulo="Registrar Cliente" onClose={onClose}>
      <Campo label="N° Identificación" value={form.numeroId} onChange={set('numeroId')} placeholder="Ej: 1012345678" required />
      <Campo label="Nombre Completo" value={form.nombre} onChange={set('nombre')} placeholder="Ej: Ana García López" required />
      <Campo label="Correo Electrónico" type="email" value={form.correo} onChange={set('correo')} placeholder="Ej: ana@email.com" required />
      {error && <p style={{ color: '#e53935', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose} color="#888">Cancelar</Btn>
        <Btn onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Registrar Cliente'}</Btn>
      </div>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════
// MODAL — Nueva Tarjeta
// ═══════════════════════════════════════════════════════════════
const ModalTarjeta = ({ onClose, onGuardada, clientes }) => {
  const [form, setForm] = useState({
    numeroTarjeta: '', fechaVencimiento: '',
    cupoTotal: '', cupoDisponible: '', clienteId: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    setError('')
    if (!form.numeroTarjeta || !form.fechaVencimiento || !form.cupoTotal || !form.cupoDisponible || !form.clienteId) {
      setError('Todos los campos son obligatorios.')
      return
    }
    setCargando(true)
    try {
      const body = {
        ...form,
        cupoTotal: parseFloat(form.cupoTotal),
        cupoDisponible: parseFloat(form.cupoDisponible),
        clienteId: parseInt(form.clienteId)
      }
      const res = await fetch(`${API}/tarjetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar la tarjeta.'); return }
      onGuardada(data)
      onClose()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal titulo="Registrar Tarjeta de Crédito" onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Cliente <span style={{ color: '#e53935' }}>*</span>
        </label>
        <select
          value={form.clienteId}
          onChange={set('clienteId')}
          style={{
            width: '100%', padding: '9px 12px', border: '1.5px solid #ddd',
            borderRadius: 8, fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif",
            outline: 'none', boxSizing: 'border-box', background: '#fff'
          }}
        >
          <option value="">— Seleccione un cliente —</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} ({c.numeroId})</option>
          ))}
        </select>
      </div>
      <Campo label="Número de Tarjeta (15 o 16 dígitos)" value={form.numeroTarjeta} onChange={set('numeroTarjeta')} placeholder="Ej: 4111111111111111" required />
      <Campo label="Fecha de Vencimiento (MM/YYYY)" value={form.fechaVencimiento} onChange={set('fechaVencimiento')} placeholder="Ej: 08/2027" required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo label="Cupo Total ($)" type="number" value={form.cupoTotal} onChange={set('cupoTotal')} placeholder="Ej: 5000000" required />
        <Campo label="Cupo Disponible ($)" type="number" value={form.cupoDisponible} onChange={set('cupoDisponible')} placeholder="Ej: 3000000" required />
      </div>
      <p style={{ fontSize: 12, color: '#888', margin: '-8px 0 12px', fontStyle: 'italic' }}>
        * Franquicia, Estado y Cupo Utilizado se calculan automáticamente.
      </p>
      {error && <p style={{ color: '#e53935', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose} color="#888">Cancelar</Btn>
        <Btn onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Registrar Tarjeta'}</Btn>
      </div>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════
// MODAL — Editar Cupo Total
// ═══════════════════════════════════════════════════════════════
const ModalEditarCupo = ({ tarjeta, onClose, onActualizada }) => {
  const [cupoTotal, setCupoTotal] = useState(tarjeta.cupoTotal)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const guardar = async () => {
    setError('')
    if (!cupoTotal || parseFloat(cupoTotal) <= 0) {
      setError('Ingrese un cupo total válido.')
      return
    }
    setCargando(true)
    try {
      const res = await fetch(`${API}/tarjetas/${tarjeta.id}/cupo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cupoTotal: parseFloat(cupoTotal) })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al actualizar.'); return }
      onActualizada(data)
      onClose()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal titulo="Modificar Cupo Total" onClose={onClose}>
      <p style={{ fontSize: 13, color: '#555', margin: '0 0 16px' }}>
        Tarjeta: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {tarjeta.numeroTarjeta}
        </strong>
      </p>
      <Campo
        label="Nuevo Cupo Total ($)"
        type="number"
        value={cupoTotal}
        onChange={e => setCupoTotal(e.target.value)}
        placeholder="Ej: 8000000"
        required
      />
      <p style={{ fontSize: 12, color: '#888', margin: '-8px 0 12px', fontStyle: 'italic' }}>
        Cupo disponible actual: {fmt(tarjeta.cupoDisponible)} — El cupo utilizado se recalculará.
      </p>
      {error && <p style={{ color: '#e53935', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose} color="#888">Cancelar</Btn>
        <Btn onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Actualizar Cupo'}</Btn>
      </div>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [tarjetas, setTarjetas] = useState([])
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(null)       // 'cliente' | 'tarjeta' | 'editar'
  const [tarjetaEditar, setTarjetaEditar] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // ── Carga inicial ───────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${API}/tarjetas`).then(r => r.json()),
      fetch(`${API}/clientes`).then(r => r.json())
    ])
      .then(([t, c]) => { setTarjetas(t); setClientes(c) })
      .catch(() => setError('No se pudo conectar con el servidor. ¿Está corriendo el backend en :8080?'))
      .finally(() => setCargando(false))
  }, [])

  // ── Eliminar lógicamente ────────────────────────────────────
  const eliminar = async (id) => {
    if (!confirm('¿Desea marcar esta tarjeta como INACTIVA?')) return
    const res = await fetch(`${API}/tarjetas/${id}/estado`, { method: 'PATCH' })
    if (res.ok) {
      const actualizada = await res.json()
      setTarjetas(ts => ts.map(t => t.id === id ? actualizada : t))
    }
  }

  // ── Abrir modal de edición ──────────────────────────────────
  const abrirEditar = (tarjeta) => {
    setTarjetaEditar(tarjeta)
    setModal('editar')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f2f8 0%, #e8ecf5 100%)',
      fontFamily: "'IBM Plex Sans', sans-serif",
      margin: 0, padding: 0
    }}>
      {/* ── Header ── */}
      <header style={{
        background: '#1a1f71', color: '#fff',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(26,31,113,0.4)'
      }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.5 }}>
            💳 Sistema Financiero
          </span>
          <span style={{ fontSize: 12, opacity: 0.65, marginLeft: 12 }}>ISW1 — Universidad El Bosque</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={() => setModal('cliente')} color="#ffffff22">
            + Nuevo Cliente
          </Btn>
          <Btn onClick={() => setModal('tarjeta')} color="#eb001b">
            + Nueva Tarjeta
          </Btn>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main style={{ padding: '32px 40px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: '0 0 6px' }}>
          Tarjetas de Crédito Registradas
        </h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px' }}>
          {tarjetas.length} registro(s) en total · {tarjetas.filter(t => t.estado === 'ACTIVO').length} activo(s)
        </p>

        {/* Error de conexión */}
        {error && (
          <div style={{
            background: '#fdecea', border: '1px solid #f5c6cb',
            borderRadius: 8, padding: '12px 16px', color: '#721c24', marginBottom: 24
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabla */}
        {cargando ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>Cargando datos...</p>
        ) : (
          <div style={{
            background: '#fff', borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1f71', color: '#fff' }}>
                  {['N° Tarjeta','Vencimiento','Franquicia','Estado','Cupo Total','Cupo Disponible','Cupo Utilizado','Cliente','Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tarjetas.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                      No hay tarjetas registradas. Haga clic en <strong>+ Nueva Tarjeta</strong> para comenzar.
                    </td>
                  </tr>
                )}
                {tarjetas.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{
                      background: i % 2 === 0 ? '#fff' : '#f9fafb',
                      opacity: t.estado === 'INACTIVO' ? 0.6 : 1,
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#eef0fb'}
                    onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f9fafb'}
                  >
                    <td style={{ padding: '11px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                      {t.numeroTarjeta}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13 }}>{t.fechaVencimiento}</td>
                    <td style={{ padding: '11px 14px' }}><FranquiciaTag nombre={t.franquicia} /></td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: t.estado === 'ACTIVO' ? '#e8f5e9' : '#fce4ec',
                        color: t.estado === 'ACTIVO' ? '#2e7d32' : '#c62828'
                      }}>{t.estado}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13 }}>{fmt(t.cupoTotal)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13 }}>{fmt(t.cupoDisponible)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#e53935', fontWeight: 500 }}>
                      {fmt(t.cupoUtilizado)}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13 }}>
                      {t.cliente?.nombre || `ID ${t.cliente?.id}`}
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      {t.estado === 'ACTIVO' && (
                        <>
                          <button
                            title="Modificar cupo"
                            onClick={() => abrirEditar(t)}
                            style={{
                              background: '#e3f2fd', border: 'none', borderRadius: 6,
                              padding: '5px 10px', cursor: 'pointer', marginRight: 6, fontSize: 14
                            }}
                          >✏️</button>
                          <button
                            title="Eliminar (lógico)"
                            onClick={() => eliminar(t.id)}
                            style={{
                              background: '#fce4ec', border: 'none', borderRadius: 6,
                              padding: '5px 10px', cursor: 'pointer', fontSize: 14
                            }}
                          >🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── Modales ── */}
      {modal === 'cliente' && (
        <ModalCliente
          onClose={() => setModal(null)}
          onGuardado={(c) => setClientes(cs => [...cs, c])}
        />
      )}

      {modal === 'tarjeta' && (
        <ModalTarjeta
          onClose={() => setModal(null)}
          clientes={clientes}
          onGuardada={(t) => setTarjetas(ts => [t, ...ts])}
        />
      )}

      {modal === 'editar' && tarjetaEditar && (
        <ModalEditarCupo
          tarjeta={tarjetaEditar}
          onClose={() => { setModal(null); setTarjetaEditar(null) }}
          onActualizada={(t) => setTarjetas(ts => ts.map(x => x.id === t.id ? t : x))}
        />
      )}
    </div>
  )
}
