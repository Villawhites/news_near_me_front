import { useState, useEffect } from 'react'

// API Base URL - change to your Render URL in production
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

function App() {
    const [location, setLocation] = useState(null)
    const [categories, setCategories] = useState([])
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(false)
    const [healthStatus, setHealthStatus] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [newsLimit, setNewsLimit] = useState(5)
    const [activeService, setActiveService] = useState(null)
    const [responseData, setResponseData] = useState(null)

    // Services definition
    const services = [
        {
            id: 'news-auto',
            name: 'Noticias por Ubicación',
            description: 'Obtiene noticias basadas en tu ubicación detectada automáticamente por IP',
            icon: '📍',
            method: 'GET',
            endpoint: '/news/'
        },
        {
            id: 'news-custom',
            name: 'Noticias Personalizadas',
            description: 'Busca noticias de cualquier ciudad o país que especifiques',
            icon: '🌍',
            method: 'POST',
            endpoint: '/news/'
        },
        {
            id: 'location',
            name: 'Ver Mi Ubicación',
            description: 'Muestra la ubicación detectada basándose en tu IP',
            icon: '📌',
            method: 'GET',
            endpoint: '/news/location'
        },
        {
            id: 'categories',
            name: 'Categorías Disponibles',
            description: 'Lista todas las categorías de noticias para filtrar',
            icon: '🏷️',
            method: 'GET',
            endpoint: '/news/categories'
        },
        {
            id: 'health',
            name: 'Estado del Sistema',
            description: 'Verifica que la API esté funcionando correctamente',
            icon: '💚',
            method: 'GET',
            endpoint: '/health'
        }
    ]

    // Check API health on mount
    useEffect(() => {
        checkHealth()
        fetchCategories()
        fetchLocation()
    }, [])

    const checkHealth = async () => {
        try {
            const res = await fetch(`${API_BASE}/health`)
            const data = await res.json()
            setHealthStatus(data.status === 'healthy')
        } catch (err) {
            setHealthStatus(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/news/categories`)
            const data = await res.json()
            setCategories(data)
        } catch (err) {
            console.error('Error fetching categories:', err)
        }
    }

    const fetchLocation = async () => {
        try {
            const res = await fetch(`${API_BASE}/news/location`)
            const data = await res.json()
            setLocation(data)
        } catch (err) {
            console.error('Error fetching location:', err)
        }
    }

    const fetchNews = async () => {
        setLoading(true)
        setActiveService('news-auto')
        try {
            let url = `${API_BASE}/news/?limit=${newsLimit}`
            if (selectedCategory) {
                url += `&categories=${encodeURIComponent(selectedCategory)}`
            }
            const res = await fetch(url)
            const data = await res.json()
            setNews(data.news || [])
            setResponseData(data)
        } catch (err) {
            console.error('Error fetching news:', err)
            setResponseData({ error: err.message })
        }
        setLoading(false)
    }

    const handleServiceClick = async (service) => {
        setActiveService(service.id)
        setLoading(true)

        try {
            let data
            switch (service.id) {
                case 'news-auto':
                    await fetchNews()
                    return
                case 'location':
                    const locRes = await fetch(`${API_BASE}/news/location`)
                    data = await locRes.json()
                    setLocation(data)
                    break
                case 'categories':
                    const catRes = await fetch(`${API_BASE}/news/categories`)
                    data = await catRes.json()
                    setCategories(data)
                    break
                case 'health':
                    const healthRes = await fetch(`${API_BASE}/health`)
                    data = await healthRes.json()
                    setHealthStatus(data.status === 'healthy')
                    break
                default:
                    break
            }
            setResponseData(data)
        } catch (err) {
            setResponseData({ error: err.message })
        }
        setLoading(false)
    }

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="logo">🗞️</div>
                <h1>News Near Me</h1>
                <p>Noticias inteligentes basadas en tu ubicación, potenciadas por IA</p>

                <div style={{ marginTop: '1rem' }}>
                    {healthStatus !== null && (
                        <span className={`status-badge ${healthStatus ? 'status-online' : 'status-offline'}`}>
                            <span className="pulse"></span>
                            {healthStatus ? 'API Online' : 'API Offline'}
                        </span>
                    )}
                </div>
            </header>

            {/* Location Card */}
            {location && (
                <div className="location-card">
                    <span className="location-icon">📍</span>
                    <div className="location-info">
                        <h3>{location.city}, {location.region}</h3>
                        <p>{location.country} • {location.timezone}</p>
                    </div>
                </div>
            )}

            {/* Services Section */}
            <section className="services-section">
                <h2>⚡ Servicios Disponibles</h2>
                <div className="services-grid">
                    {services.map(service => (
                        <div
                            key={service.id}
                            className={`service-card ${activeService === service.id ? 'active' : ''}`}
                            onClick={() => handleServiceClick(service)}
                        >
                            <div className="service-icon">{service.icon}</div>
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>
                            <span className={`service-method method-${service.method.toLowerCase()}`}>
                                {service.method}
                            </span>
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {service.endpoint}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Controls */}
            <div className="controls">
                <div className="control-group">
                    <label>Cantidad de noticias</label>
                    <select
                        value={newsLimit}
                        onChange={(e) => setNewsLimit(Number(e.target.value))}
                    >
                        <option value={3}>3 noticias</option>
                        <option value={5}>5 noticias</option>
                        <option value={10}>10 noticias</option>
                        <option value={15}>15 noticias</option>
                        <option value={20}>20 noticias</option>
                    </select>
                </div>

                <div className="control-group">
                    <label>Filtrar por categoría</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.value}</option>
                        ))}
                    </select>
                </div>

                <div className="control-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        onClick={fetchNews}
                        disabled={loading}
                    >
                        {loading ? '⏳ Cargando...' : '🔍 Buscar Noticias'}
                    </button>
                </div>
            </div>

            {/* Categories Display */}
            {categories.length > 0 && (
                <div className="categories-section" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                        Categorías disponibles:
                    </h3>
                    <div className="categories-list">
                        {categories.map(cat => (
                            <span
                                key={cat.value}
                                className={`category-tag ${selectedCategory === cat.value ? 'selected' : ''}`}
                                onClick={() => setSelectedCategory(selectedCategory === cat.value ? '' : cat.value)}
                            >
                                {cat.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            )}

            {/* News Grid */}
            {!loading && news.length > 0 && (
                <section className="news-section">
                    <h2>📰 Noticias ({news.length})</h2>
                    <div className="news-grid">
                        {news.map((item, index) => (
                            <article key={item.id || index} className="news-card">
                                <div className="news-header">
                                    <span className="news-category">{item.category}</span>
                                    <span className="news-score">
                                        ⭐ {item.relevance_score}/10
                                    </span>
                                </div>
                                <h3>{item.title}</h3>
                                <p className="summary">{item.summary}</p>
                                <div className="news-meta">
                                    <span>📍 {item.location_context}</span>
                                    {item.estimated_date && <span>📅 {item.estimated_date}</span>}
                                </div>
                                {item.keywords && item.keywords.length > 0 && (
                                    <div className="news-keywords">
                                        {item.keywords.map((kw, i) => (
                                            <span key={i} className="keyword">{kw}</span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {!loading && news.length === 0 && activeService === 'news-auto' && (
                <div className="empty-state">
                    <div className="icon">📭</div>
                    <p>No hay noticias para mostrar. Haz clic en "Buscar Noticias" para comenzar.</p>
                </div>
            )}

            {/* Response Panel */}
            {responseData && (
                <div className="response-panel">
                    <div className="response-header">
                        <h3>📋 Respuesta de la API</h3>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => setResponseData(null)}
                        >
                            Cerrar
                        </button>
                    </div>
                    <div className="response-body">
                        <pre>{JSON.stringify(responseData, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
