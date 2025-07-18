import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Calendar, MapPin, Search, Train, Clock, ArrowRight, Menu, X, Star, Shield, Award, Users, Zap, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './../../styles/user/Landing.css';

// Helper Components
const Section = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      className={`section-base ${className}`}
      initial={{ opacity:0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
};

// Data Dummy
const dummyStations = [
    { id: 1, station_name: 'Jakarta Pusat', station_code: 'JKT' },
    { id: 2, station_name: 'Bandung', station_code: 'BD' },
    { id: 3, station_name: 'Cirebon', station_code: 'CBN' },
    { id: 4, station_name: 'Semarang', station_code: 'SMG' },
    { id: 5, station_name: 'Yogyakarta', station_code: 'YK' },
    { id: 6, station_name: 'Solo Balapan', station_code: 'SLO' },
    { id: 7, station_name: 'Surabaya', station_code: 'SBY' },
    { id: 8, station_name: 'Malang', station_code: 'MLG' },
    { id: 9, station_name: 'Jember', station_code: 'JMR' },
    { id: 10, station_name: 'Banyuwangi', station_code: 'BWI' },
    { id: 11, station_name: 'Kiaracondong', station_code: 'KAC' },
    { id: 12, station_name: 'Tasikmalaya', station_code: 'TSM' },
    { id: 13, station_name: 'Ciamis', station_code: 'CI' },
    { id: 14, station_name: 'Banjar', station_code: 'BJR' },
    { id: 15, station_name: 'Sidareja', station_code: 'SDR' },
    { id: 16, station_name: 'Kroya', station_code: 'KYA' },
    { id: 17, station_name: 'Kebumen', station_code: 'KM' },
    { id: 18, station_name: 'Kutoarjo', station_code: 'KTA' },
    { id: 19, station_name: 'Wates', station_code: 'WT' },
    { id: 20, station_name: 'Klaten', station_code: 'KT' }
];

const dummySchedules = [
    {
        id: 1,
        schedule_date: '2025-01-09',
        Train: {
            train_name: 'Argo Bromo Anggrek',
            train_code: 'ABA'
        }
    },
    {
        id: 2,
        schedule_date: '2025-01-09',
        Train: {
            train_name: 'Bima',
            train_code: 'BMA'
        }
    },
    {
        id: 3,
        schedule_date: '2025-01-09',
        Train: {
            train_name: 'Gajayana',
            train_code: 'GJY'
        }
    },
    {
        id: 4,
        schedule_date: '2025-01-10',
        Train: {
            train_name: 'Lodaya',
            train_code: 'LDY'
        }
    },
    {
        id: 5,
        schedule_date: '2025-01-10',
        Train: {
            train_name: 'Taksaka',
            train_code: 'TSK'
        }
    },
    {
        id: 6,
        schedule_date: '2025-01-10',
        Train: {
            train_name: 'Ciremai',
            train_code: 'CRM'
        }
    }
];

// SVG Components - KEEP AS IS (TIDAK DIRUBAH SESUAI PERMINTAAN)
const TrainTracks = () => (
    <div className="train-tracks">
         <svg viewBox="0 0 1200 200" width="100%" height="100%" preserveAspectRatio="none">
            {/* Rel Kereta dibuat statis di sini */}
            <path d="M-50 185 H1250" stroke="#34495e" strokeWidth="4" />
            <path d="M-50 190 H1250" stroke="#2c3e50" strokeWidth="2" />
        </svg>
    </div>
);

const TrainGraphic = ({ scrollYProgress }) => {
    // FIXED: Train now moves forward (left to right) on scroll down, starting from off-screen.
    const x = useTransform(scrollYProgress, [0, 0.3], ['164%', '-164%']);
   
    return (
        <motion.div
            style={{ x }}
            className="train-graphic"
        >
            {/* KAI-inspired train SVG with new passenger car design */}
            <svg viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="loco-front-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d35400" />
                        <stop offset="100%" stopColor="#e67e22" />
                    </linearGradient>
                    <linearGradient id="car-window-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2c3e50" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#34495e" stopOpacity="0.9" />
                    </linearGradient>
                </defs>

                {/* Gerbong Penumpang - Desain Baru */}
                {[...Array(3)].map((_, i) => (
                    <g key={i} transform={`translate(${450 + i * 200}, 0)`}>
                        {/* Body Utama */}
                        <rect x="0" y="80" width="190" height="80" fill="#ecf0f1" rx="5" />
                        {/* Sasis Bawah */}
                        <rect x="0" y="160" width="190" height="25" fill="#34495e" />
                       
                        {/* Pintu Oranye */}
                        <rect x="5" y="80" width="20" height="80" fill="#e67e22" />
                        <rect x="165" y="80" width="20" height="80" fill="#e67e22" />

                        {/* Jendela */}
                        {[...Array(6)].map((_, j) => (
                            <rect key={j} x={35 + j * 20} y="95" width="15" height="25" fill="url(#car-window-gradient)" rx="2" />
                        ))}
                       
                        {/* Garis Corak */}
                        <rect x="0" y="130" width="190" height="8" fill="#e67e22" />
                        <rect x="0" y="138" width="190" height="4" fill="#95a5a6" />

                        {/* Roda */}
                        <circle cx="45" cy="185" r="8" fill="#17202A" />
                        <circle cx="145" cy="185" r="8" fill="#17202A" />
                    </g>
                ))}

                {/* Lokomotif */}
                <g transform="translate(50, 0)">
                    {/* Bodi Bawah & Roda */}
                    <path d="M0 185 L380 185 L380 160 L0 160 Z" fill="#2c3e50" />
                    <circle cx="50" cy="185" r="14" fill="#17202A" />
                    <circle cx="110" cy="185" r="14" fill="#17202A" />
                    <circle cx="270" cy="185" r="14" fill="#17202A" />
                    <circle cx="330" cy="185" r="14" fill="#17202A" />

                    {/* Bodi Utama */}
                    <path d="M0 80 L30 40 L370 40 L370 160 L0 160 Z" fill="#f1f1f1" />
                   
                    {/* Corak Depan dengan tulisan COE */}
                    <path d="M0 80 L90 80 L60 160 L0 160 Z" fill="url(#loco-front-gradient)" />
                    <path d="M0 80 L30 40 L120 40 L90 80 Z" fill="#34495e" />
                    <text x="10" y="140" fontFamily="Arial, sans-serif" fontSize="30" fill="white" fontWeight="bold">COE</text>

                    {/* Jendela Depan & Samping */}
                    <path d="M35 45 L115 45 L85 75 L35 75 Z" fill="#2c3e50" />
                    <rect x="140" y="50" width="40" height="40" fill="#34495e" />

                    {/* Detail Samping */}
                    <path d="M90 80 L370 80 L370 95 L90 95 Z" fill="#e67e22" />
                    <path d="M90 95 L370 95 L370 105 L90 105 Z" fill="#34495e" />
                    <rect x="140" y="115" width="220" height="30" fill="#bdc3c7" />
                </g>
            </svg>
        </motion.div>
    );
};

// NEW: Animated map component with Java island background
const AnimatedMap = () => {
    const ref = useRef(null);
    const pathRef = useRef(null);
    const [cometPosition, setCometPosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const pathLength = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

    useEffect(() => {
        const unsubscribe = pathLength.on("change", (latestPathLength) => {
            if (pathRef.current) {
                const point = pathRef.current.getPointAtLength(
                    latestPathLength * pathRef.current.getTotalLength()
                );
                setCometPosition({ x: point.x, y: point.y });
            }
        });
        return unsubscribe;
    }, [pathLength]);

    const cities = [
        { name: "Jakarta", x: 120, y: 220 },
        { name: "Bandung", x: 180, y: 280 },
        { name: "Cirebon", x: 250, y: 230 },
        { name: "Semarang", x: 400, y: 180 },
        { name: "Yogyakarta", x: 380, y: 320 },
        { name: "Solo", x: 430, y: 300 },
        { name: "Surabaya", x: 550, y: 240 },
        { name: "Malang", x: 560, y: 330 },
        { name: "Jember", x: 680, y: 340 },
        { name: "Banyuwangi", x: 780, y: 320 },
    ];
   
    // IMPROVED: Smoother, curved path connecting the cities
    const routePath = "M 120 220 C 150 250, 170 290, 180 280 S 220 250, 250 230 S 325 190, 400 180 C 420 250, 370 300, 380 320 S 420 310, 430 300 S 500 250, 550 240 S 555 300, 560 330 C 620 335, 650 345, 680 340 S 750 330, 780 320";

    return (
        <div
            ref={ref}
            className="animated-map-container"
        >
             <svg viewBox="0 0 900 450" className="animated-map-svg">
                <defs>
                    <filter id="cometGlow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                {/* Java Island SVG Background */}
                <path
                    d="M33.2,214.9c-2.1,0.5-4.2,1-6.2,1.6c-2,0.6-4,1.2-6,1.9c-2,0.7-3.9,1.4-5.9,2.2c-2,0.8-3.9,1.7-5.8,2.6 c-1.9,0.9-3.7,1.9-5.5,2.9c-1.8,1-3.5,2.1-5.1,3.2c-1.6,1.1-3.2,2.3-4.6,3.5c-1.4,1.2-2.8,2.5-4,3.8c-1.2,1.3-2.4,2.6-3.4,4 c-1,1.4-1.9,2.8-2.7,4.2c-0.8,1.4-1.5,2.8-2.1,4.2c-0.6,1.4-1.1,2.8-1.5,4.2c-0.4,1.4-0.7,2.8-0.9,4.2c-0.2,1.4-0.3,2.8-0.3,4.2 c0,1.4,0.1,2.8,0.3,4.2c0.2,1.4,0.5,2.8,0.9,4.2c0.4,1.4,0.9,2.8,1.5,4.2c0.6,1.4,1.3,2.8,2.1,4.2c0.8,1.4,1.7,2.8,2.7,4.2 c1,1.4,2.1,2.7,3.4,4c1.2,1.3,2.6,2.6,4,3.8c1.4,1.2,2.9,2.4,4.6,3.5c1.6,1.1,3.4,2.2,5.1,3.2c1.8,1,3.7,2,5.5,2.9 c1.9,0.9,3.8,1.8,5.8,2.6c2,0.8,3.9,1.5,5.9,2.2c2,0.7,4,1.3,6,1.9c2.1,0.6,4.1,1.1,6.2,1.6l811.6,0c2.1-0.5,4.2-1,6.2-1.6 c2-0.6,4-1.2,6-1.9c2-0.7,3.9-1.4,5.9-2.2c2-0.8,3.9-1.7,5.8-2.6c1.9-0.9,3.7-1.9,5.5-2.9c1.8-1,3.5-2.1,5.1-3.2 c1.6-1.1,3.2-2.3,4.6-3.5c1.4-1.2,2.8-2.5,4-3.8c1.2-1.3,2.4-2.6,3.4-4c1-1.4,1.9-2.8,2.7-4.2c0.8-1.4,1.5-2.8,2.1-4.2 c0.6-1.4,1.1-2.8,1.5-4.2c0.4-1.4,0.7-2.8,0.9,4.2c0.2-1.4,0.3-2.8,0.3-4.2c0-1.4-0.1-2.8-0.3-4.2c-0.2-1.4-0.5-2.8-0.9-4.2 c-0.4-1.4-0.9-2.8-1.5-4.2c-0.6-1.4-1.3-2.8-2.1-4.2c-0.8-1.4-1.7-2.8-2.7-4.2c-1-1.4-2.1-2.7-3.4-4 c-1.2-1.3-2.6-2.6-4-3.8c-1.4-1.2-2.9-2.4-4.6-3.5c-1.6-1.1-3.4-2.2-5.1-3.2c-1.8-1-3.7-2-5.5-2.9 c-1.9-0.9-3.8-1.8-5.8-2.6c-2-0.8-3.9-1.5-5.9-2.2c-2-0.7-4-1.3-6-1.9c-2.1-0.6-4.1-1.1-6.2-1.6L33.2,214.9z"
                    fill="#0a192f" stroke="#172a45" strokeWidth="2"
                />

                {/* Animated Route */}
                <motion.path
                    ref={pathRef}
                    d={routePath}
                    stroke="rgba(230, 126, 34, 0.5)"
                    strokeWidth="4"
                    fill="none"
                    style={{ pathLength }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Traveling Comet */}
                <motion.circle
                    cx={cometPosition.x}
                    cy={cometPosition.y}
                    r="6"
                    fill="#f1c40f"
                    filter="url(#cometGlow)"
                    style={{ opacity: pathLength }}
                />

                {/* City Markers */}
                {cities.map((city, i) => (
                    <g key={city.name}>
                        <motion.circle
                            cx={city.x} cy={city.y} r="5" fill="#3498db"
                            initial={{ scale: 0 }}
                            animate={{ scale: pathLength.get() > (i / (cities.length -1)) * 0.9 ? 1.2 : 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        />
                        <motion.text
                            x={city.x} y={city.y - 10}
                            fill="white" fontSize="12" textAnchor="middle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: pathLength.get() > (i / (cities.length -1)) * 0.9 ? 1 : 0 }}
                        >
                            {city.name}
                        </motion.text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// Main Page Components
const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const navItems = [
        { name: "Beranda", href: "#home" },
        { name: "Jadwal", href: "#schedules" },
        { name: "Stasiun", href: "#stations" },
        { name: "Layanan", href: "#services" },
        { name: "Kontak", href: "#contact" }
    ];

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleDashboardClick = () => {
        navigate('/dashboard'); // Akan redirect berdasarkan role
    };

    return (
        <header className="header-main">
            <div className="header-container">
                <div
                    className="brand-logo"
                    onClick={() => navigate('/landing')}
                >
                    <div className="icon-container">
                        <Train size={24} />
                    </div>
                    <span className="brand-text">
                        STAR<span className="brand-text-accent">RAIL</span>
                    </span>
                </div>

                <nav className="nav-desktop">
                    {navItems.map((item, index) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="nav-link"
                        >
                            {item.name}
                            <span className="nav-link-underline"></span>
                        </a>
                    ))}
                </nav>

                <div className="auth-buttons-desktop">
                    <button
                        className="btn-login"
                        onClick={handleLoginClick}
                    >
                        Masuk
                    </button>
                    <button
                        className="btn-register"
                        onClick={handleRegisterClick}
                    >
                        Daftar
                    </button>
                </div>

                <div className="mobile-menu-toggle">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="mobile-menu-btn"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu">
                    <nav className="mobile-nav">
                        {navItems.map(item => (
                            <a key={item.name} href={item.href} className="mobile-nav-link">{item.name}</a>
                        ))}
                        <div className="mobile-auth-buttons">
                            <button
                                className="mobile-btn-login"
                                onClick={handleLoginClick}
                            >
                                Masuk
                            </button>
                            <button
                                className="mobile-btn-register"
                                onClick={handleRegisterClick}
                            >
                                Daftar
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

const HeroSection = () => {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
    const [searchForm, setSearchForm] = useState({
        from: '',
        to: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        // Implement search logic here
        console.log('Searching for:', searchForm);
        alert('Demo: Fitur pencarian akan menampilkan hasil jadwal kereta!');
    };

    return (
        <div id="home" className="hero-section">
            {/* Enhanced Background */}
            <div className="hero-background"></div>
            <div className="hero-background-overlay-1"></div>
            <div className="hero-background-overlay-2"></div>
           
            {/* Subtle metal texture overlay */}
            <div className="hero-texture-overlay"></div>

            <TrainTracks />
            <TrainGraphic scrollYProgress={scrollYProgress} />

            <motion.div
                style={{ opacity, scale }}
                className="hero-content"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="hero-text-content"
                >
                    <h1 className="hero-title">
                        <span className="hero-title-main">
                            Executive
                        </span>
                        <br />
                        <span className="hero-title-accent">
                            Rail Experience
                        </span>
                    </h1>
                    <p className="hero-description">
                        Nikmati perjalanan kereta api premium dengan layanan eksklusif, kenyamanan maksimal, dan teknologi terdepan
                    </p>
                    <div className="hero-features">
                        <div className="hero-feature-item">
                            <Shield size={16} />
                            <span>Keamanan Terjamin</span>
                        </div>
                        <div className="hero-feature-item">
                            <Star size={16} />
                            <span>Layanan Premium</span>
                        </div>
                        <div className="hero-feature-item">
                            <Zap size={16} />
                            <span>Booking Instan</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="hero-search-container"
                >
                    <form onSubmit={handleSearch} className="hero-search-form">
                        <div className="search-field">
                            <label className="search-label">Stasiun Keberangkatan</label>
                            <div className="search-input-wrapper">
                                <MapPin className="search-input-icon" size={20}/>
                                <select
                                    value={searchForm.from}
                                    onChange={(e) => setSearchForm({...searchForm, from: e.target.value})}
                                    className="search-select"
                                >
                                    <option value="">Pilih stasiun keberangkatan</option>
                                    {dummyStations.map(station => (
                                        <option key={station.id} value={station.id}>
                                            {station.station_name} ({station.station_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="search-field">
                            <label className="search-label">Stasiun Tujuan</label>
                            <div className="search-input-wrapper">
                                <MapPin className="search-input-icon" size={20}/>
                                <select
                                    value={searchForm.to}
                                    onChange={(e) => setSearchForm({...searchForm, to: e.target.value})}
                                    className="search-select"
                                >
                                    <option value="">Pilih stasiun tujuan</option>
                                    {dummyStations.map(station => (
                                        <option key={station.id} value={station.id}>
                                            {station.station_name} ({station.station_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="search-field">
                            <label className="search-label">Tanggal Keberangkatan</label>
                            <div className="search-input-wrapper">
                                <Calendar className="search-input-icon" size={20}/>
                                <input
                                    type="date"
                                    value={searchForm.date}
                                    onChange={(e) => setSearchForm({...searchForm, date: e.target.value})}
                                    className="search-date-input"
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="search-submit-btn"
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(52,152,219,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Search size={20}/>
                            <span>Cari Jadwal</span>
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

const ScheduleSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    return (
        <Section id="schedules" className="schedule-section">
            <div className="section-header-landing">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title-landing">
                        <span className="section-title-main">
                            Jadwal
                        </span>
                        <span className="section-title-accent">
                            {' '}Premium
                        </span>
                    </h2>
                    <p className="section-description">
                        Nikmati perjalanan eksklusif dengan jadwal yang telah disesuaikan untuk kenyamanan maksimal
                    </p>
                    <div className="section-divider"></div>
                </motion.div>
            </div>

            <motion.div
                className="schedule-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {dummySchedules.map((schedule, index) => (
                    <motion.div
                        key={schedule.id}
                        variants={itemVariants}
                        className="schedule-card"
                    >
                        <div className="schedule-card-header">
                            <div className="schedule-train-info">
                                <div className="schedule-train-icon">
                                    <Train size={24} />
                                </div>
                                <div className="schedule-train-details">
                                    <h3 className="schedule-train-name">
                                        {schedule.Train?.train_name || 'Nama Kereta'}
                                    </h3>
                                    <p className="schedule-train-meta">
                                        {schedule.Train?.train_code || 'Kode'} • Executive Class
                                    </p>
                                </div>
                            </div>
                            <div className="schedule-date">
                                <div className="schedule-date-badge">
                                    {new Date(schedule.schedule_date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="schedule-route">
                            <div className="schedule-time-info">
                                <Clock size={16} />
                                <div className="schedule-time-details">
                                    <p className="schedule-time">06:00</p>
                                    <p className="schedule-time-label">Keberangkatan</p>
                                </div>
                            </div>
                            <div className="schedule-route-line">
                                <div className="schedule-route-track"></div>
                                <div className="schedule-route-train">
                                    <Train size={16} />
                                </div>
                            </div>
                            <div className="schedule-time-info">
                                <Clock size={16} />
                                <div className="schedule-time-details">
                                    <p className="schedule-time">18:00</p>
                                    <p className="schedule-time-label">Kedatangan</p>
                                </div>
                            </div>
                        </div>

                        <div className="schedule-card-footer">
                            <div className="schedule-features">
                                <div className="schedule-feature">
                                    <Users size={14} />
                                    <span>Available</span>
                                </div>
                                <div className="schedule-feature">
                                    <Star size={14} />
                                    <span>Premium</span>
                                </div>
                            </div>
                            <motion.button
                                className="schedule-detail-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => alert('Demo: Fitur detail jadwal akan menampilkan informasi lengkap kereta!')}
                            >
                                Lihat Detail
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="schedule-view-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <motion.button
                    className="schedule-view-all-btn"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(52,152,219,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => alert('Demo: Fitur ini akan menampilkan semua jadwal kereta!')}
                >
                    Lihat Semua Jadwal
                </motion.button>
            </motion.div>
        </Section>
    );
};

const MapAndStationsSection = () => {
    return (
        <Section id="stations" className="stations-section">
            {/* Background Elements */}
            <div className="stations-background"></div>
            <div className="stations-background-overlay"></div>
           
            <div className="stations-content">
                <div className="section-header-landing">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title-landing">
                            <span className="section-title-main">
                                Jaringan
                            </span>
                            <span className="section-title-accent">
                                {' '}Nasional
                            </span>
                        </h2>
                        <p className="section-description">
                            Jelajahi rute kereta api premium yang menghubungkan kota-kota besar di seluruh Indonesia dengan standar layanan internasional
                        </p>
                        <div className="section-divider"></div>
                    </motion.div>
                </div>
               
                <AnimatedMap />

                <div className="stations-list-section">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                    <h2 className="section-title-landing">
                        <span className="section-title-main">
                            Stasiun
                        </span>
                        <span className="section-title-accent">
                            {' '}Premium
                        </span>
                    </h2>
                       
                        <div className="stations-grid">
                            {dummyStations.map((station, index) => (
                                <motion.div
                                    key={station.id}
                                    className="station-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="station-card-content">
                                        <div className="station-icon">
                                            <Train size={16} />
                                        </div>
                                        <h4 className="station-name">
                                            {station.station_name}
                                        </h4>
                                        <p className="station-code">
                                            {station.station_code}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </Section>
    );
};

const ServicesSection = () => {
    const services = [
        {
            icon: <Star className="service-icon" />,
            title: "Executive Class",
            description: "Kursi mewah dengan reclining 160°, meal service premium, dan entertainment system personal",
            features: ["Kursi Kulit Premium", "Meal Service", "WiFi Gratis", "Power Outlet"]
        },
        {
            icon: <Shield className="service-icon" />,
            title: "Keamanan Terjamin",
            description: "Sistem keamanan 24/7 dengan CCTV, security officer, dan emergency response team",
            features: ["CCTV 24/7", "Security Officer", "Emergency Response", "Insurance Coverage"]
        },
        {
            icon: <Award className="service-icon" />,
            title: "Premium Lounge",
            description: "Akses eksklusif ke lounge dengan fasilitas business center dan refreshment area",
            features: ["Business Center", "Refreshment", "VIP Waiting", "Concierge Service"]
        },
        {
            icon: <Zap className="service-icon" />,
            title: "Instant Booking",
            description: "Pemesanan real-time dengan konfirmasi instan dan mobile ticketing",
            features: ["Real-time Booking", "Mobile Ticket", "Instant Confirmation", "Easy Cancellation"]
        }
    ];

    return (
        <Section id="services" className="services-section">
            <div className="section-header-landing">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title-landing">
                        <span className="section-title-main">
                            Layanan
                        </span>
                        <span className="section-title-accent">
                            {' '}Eksklusif
                        </span>
                    </h2>
                    <p className="section-description">
                        Nikmati pengalaman perjalanan kelas dunia dengan fasilitas premium dan layanan personal yang tak terlupakan
                    </p>
                    <div className="section-divider"></div>
                </motion.div>
            </div>

            <div className="services-grid">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        className="service-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="service-card-content">
                            <div className="service-icon-wrapper">
                                {service.icon}
                            </div>
                            <div className="service-details">
                                <h3 className="service-title">
                                    {service.title}
                                </h3>
                                <p className="service-description">
                                    {service.description}
                                </p>
                                <div className="service-features">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="service-feature">
                                            <div className="service-feature-dot"></div>
                                            <span className="service-feature-text">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
};

const ContactSection = () => {
    return (
        <Section id="contact" className="contact-section">
            <div className="section-header-landing">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title-landing">
                        <span className="section-title-main">
                            Hubungi
                        </span>
                        <span className="section-title-accent">
                            {' '}Kami
                        </span>
                    </h2>
                    <p className="section-description">
                        Tim customer service kami siap membantu Anda 24/7 untuk pengalaman perjalanan terbaik
                    </p>
                    <div className="section-divider"></div>
                </motion.div>
            </div>

            <div className="contact-grid">
                {[
                    { icon: <Phone className="contact-icon" />, title: "Customer Service", contact: "0804-1-567-890", desc: "24/7 Support" },
                    { icon: <MapPin className="contact-icon" />, title: "Head Office", contact: "Jakarta Pusat", desc: "Jl. Medan Merdeka Selatan" },
                    { icon: <Clock className="contact-icon" />, title: "Operating Hours", contact: "24 Hours", desc: "Every Day" }
                ].map((contact, index) => (
                    <motion.div
                        key={index}
                        className="contact-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="contact-icon-wrapper">
                            {contact.icon}
                        </div>
                        <h3 className="contact-title">
                            {contact.title}
                        </h3>
                        <p className="contact-info">{contact.contact}</p>
                        <p className="contact-desc">{contact.desc}</p>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
};

// Footer Component
const Footer = () => {
    return (
        <footer className="footer-main">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-brand-section">
                        <div className="footer-brand">
                            <div className="footer-brand-icon">
                                <Train size={24} />
                            </div>
                            <div className="footer-brand-text">
                                <h3 className="footer-brand-title">
                                    <span className="footer-brand-main">STAR</span>
                                    <span className="footer-brand-accent">RAIL</span>
                                </h3>
                                <p className="footer-brand-subtitle">Executive Rail Experience</p>
                            </div>
                        </div>
                        <p className="footer-description">
                            Sistem reservasi kereta api premium dengan teknologi terdepan untuk pengalaman perjalanan yang tak terlupakan di seluruh Indonesia.
                        </p>
                        <div className="footer-social">
                            <motion.button
                                className="footer-social-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                📱
                            </motion.button>
                            <motion.button
                                className="footer-social-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                🐦
                            </motion.button>
                            <motion.button
                                className="footer-social-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                📘
                            </motion.button>
                            <motion.button
                                className="footer-social-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                📷
                            </motion.button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links-section">
                        <h4 className="footer-section-title">Layanan</h4>
                        <ul className="footer-links">
                            <li><a href="#schedules" className="footer-link">Jadwal Kereta</a></li>
                            <li><a href="#stations" className="footer-link">Stasiun</a></li>
                            <li><a href="#services" className="footer-link">Layanan Premium</a></li>
                            <li><a href="#" className="footer-link">Booking Online</a></li>
                            <li><a href="#" className="footer-link">Railfood</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-links-section">
                        <h4 className="footer-section-title">Dukungan</h4>
                        <ul className="footer-links">
                            <li><a href="#contact" className="footer-link">Hubungi Kami</a></li>
                            <li><a href="#" className="footer-link">FAQ</a></li>
                            <li><a href="#" className="footer-link">Pusat Bantuan</a></li>
                            <li><a href="#" className="footer-link">Kebijakan Privasi</a></li>
                            <li><a href="#" className="footer-link">Syarat & Ketentuan</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="footer-copyright">
                            © 2025 StarRail Executive. All rights reserved.
                        </p>
                        <div className="footer-meta">
                            <span>Made with ❤️ in Indonesia</span>
                            <span>•</span>
                            <span>Version 1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Main Landing Component
const Landing = () => {
    const navigate = useNavigate();

    // Auto-scroll to section on page load if hash exists
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    return (
        <div className="landing-page">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <HeroSection />

            {/* Schedule Section */}
            <ScheduleSection />

            {/* Map and Stations Section */}
            <MapAndStationsSection />

            {/* Services Section */}
            <ServicesSection />

            {/* Contact Section */}
            <ContactSection />

            {/* Footer */}
            <Footer />

            {/* Scroll to Top Button */}
            <ScrollToTop />
        </div>
    );
};

// Scroll to Top Component
const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <motion.button
            className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
        >
            <ArrowRight className="scroll-to-top-icon" size={20} />
        </motion.button>
    );
};

export default Landing;
