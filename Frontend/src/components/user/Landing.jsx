import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Calendar, MapPin, Search, Train, Clock, ArrowRight, Menu, X } from 'lucide-react';

// Mock Data for the application
const mockSchedules = [
  { id: 'KA-101', name: 'Argo Bromo Anggrek', from: 'Gambir (GMR)', to: 'Surabaya Pasarturi (SBI)', departure: '08:00', arrival: '16:30', class: 'Eksekutif' },
  { id: 'KA-102', name: 'Taksaka', from: 'Gambir (GMR)', to: 'Yogyakarta (YK)', departure: '08:30', arrival: '15:45', class: 'Eksekutif' },
  { id: 'KA-153', name: 'Jayakarta', from: 'Pasar Senen (PSE)', to: 'Surabaya Gubeng (SGU)', departure: '12:00', arrival: '23:45', class: 'Ekonomi Premium' },
  { id: 'KA-70', name: 'Bima', from: 'Gambir (GMR)', to: 'Malang (ML)', departure: '17:00', arrival: '05:30', class: 'Eksekutif' },
];

// Updated mock stations for the new map
const mockStations = [
    "Jakarta", "Bandung", "Cirebon", "Semarang", "Yogyakarta", "Solo", "Surabaya", "Malang", "Jember", "Banyuwangi"
];

// Helper Components
const Section = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      className={`py-20 px-4 md:px-8 lg:px-16 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
};

// SVG Components

// Static tracks component
const TrainTracks = () => (
    <div className="absolute bottom-0 left-0 w-full h-[200px] z-0">
         <svg viewBox="0 0 1200 200" width="100%" height="100%" preserveAspectRatio="none">
            {/* Rel Kereta dibuat statis di sini */}
            <path d="M-50 185 H1250" stroke="#34495e" strokeWidth="4" />
            <path d="M-50 190 H1250" stroke="#2c3e50" strokeWidth="2" />
        </svg>
    </div>
);


const TrainGraphic = ({ scrollYProgress }) => {
    // FIXED: Train now moves forward (left to right) on scroll down, starting from off-screen.
    const x = useTransform(scrollYProgress, [0, 0.3], ['-100%', '100%']); 
    
    return (
        <motion.div style={{ x }} className="absolute bottom-0 left-0 w-[1200px] z-10">
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
        const unsubscribe = pathLength.onChange(latestPathLength => {
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
        <div ref={ref} className="w-full max-w-6xl mx-auto aspect-[16/9] relative bg-navy-blue-light/20 rounded-2xl p-4 border border-navy-blue-light/30 overflow-hidden">
             <svg viewBox="0 0 900 450" className="w-full h-full">
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
    const navItems = ["Jadwal", "Stasiun", "Layanan", "Bantuan"];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal-black/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 flex justify-between items-center h-20">
                <div className="flex items-center gap-2 text-white text-2xl font-bold">
                    <Train className="text-sapphire-blue" />
                    <span>KAI<span className="text-sapphire-blue">GO</span></span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map(item => (
                        <a key={item} href="#" className="text-gray-300 hover:text-sapphire-blue transition-colors duration-300">{item}</a>
                    ))}
                </nav>
                <div className="hidden md:block">
                    <button className="bg-sapphire-blue text-white font-semibold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(52,152,219,0.5)] hover:bg-blue-400 transition-all duration-300">
                        Masuk
                    </button>
                </div>
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-charcoal-black pb-4 px-4">
                    <nav className="flex flex-col items-center gap-4">
                        {navItems.map(item => (
                            <a key={item} href="#" className="text-gray-300 hover:text-sapphire-blue transition-colors duration-300 py-2">{item}</a>
                        ))}
                        <button className="w-full bg-sapphire-blue text-white font-semibold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(52,152,219,0.5)] hover:bg-blue-400 transition-all duration-300 mt-2">
                            Masuk
                        </button>
                    </nav>
                </motion.div>
            )}
        </header>
    );
};

const HeroSection = () => {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

    return (
        <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-deep-navy-blue" style={{
            backgroundImage: 'radial-gradient(circle at top left, rgba(13, 37, 63, 0.8), transparent 40%), radial-gradient(circle at bottom right, rgba(52, 152, 219, 0.2), transparent 50%)'
        }}>
            <div className="absolute inset-0 bg-charcoal-black/20" style={{
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, black 40%, transparent 100%)'
            }}></div>
            
            {/* Render rel statis di belakang kereta */}
            <TrainTracks />
            {/* Render kereta yang bergerak */}
            <TrainGraphic scrollYProgress={scrollYProgress} />

            <motion.div style={{ opacity, scale }} className="relative z-20 text-center px-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 tracking-tight">
                    Perjalanan Impian, <span className="text-sapphire-blue">Satu Klik</span> Lagi
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300 mb-8">
                    Pesan tiket kereta api dengan mudah, cepat, dan aman. Nikmati perjalanan eksklusif ke seluruh penjuru negeri.
                </p>
                <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl max-w-4xl mx-auto border border-white/20">
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col items-start">
                            <label className="text-sm font-medium mb-1 text-gray-300">Stasiun Asal</label>
                            <div className="w-full flex items-center bg-deep-navy-blue/50 rounded-lg px-3">
                                <MapPin className="text-sapphire-blue mr-2" size={20}/>
                                <input type="text" placeholder="Contoh: Gambir" className="w-full bg-transparent p-3 focus:outline-none"/>
                            </div>
                        </div>
                         <div className="flex flex-col items-start">
                            <label className="text-sm font-medium mb-1 text-gray-300">Stasiun Tujuan</label>
                            <div className="w-full flex items-center bg-deep-navy-blue/50 rounded-lg px-3">
                                <MapPin className="text-sapphire-blue mr-2" size={20}/>
                                <input type="text" placeholder="Contoh: Bandung" className="w-full bg-transparent p-3 focus:outline-none"/>
                            </div>
                        </div>
                        <div className="flex flex-col items-start">
                            <label className="text-sm font-medium mb-1 text-gray-300">Tanggal Pergi</label>
                            <div className="w-full flex items-center bg-deep-navy-blue/50 rounded-lg px-3">
                                <Calendar className="text-sapphire-blue mr-2" size={20}/>
                                <input type="date" className="w-full bg-transparent p-3 focus:outline-none [color-scheme:dark]"/>
                            </div>
                        </div>
                        <button type="submit" className="w-full lg:w-auto bg-sapphire-blue font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,152,219,0.6)] hover:bg-blue-400 transition-all duration-300 h-[52px]">
                            <Search size={20}/>
                            Cari Tiket
                        </button>
                    </form>
                </div>
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
        <Section className="bg-charcoal-black text-white">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Jadwal Populer</h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Temukan jadwal perjalanan yang paling sering dicari oleh pelanggan kami.</p>
                <div className="mt-4 h-1 w-24 bg-sapphire-blue mx-auto rounded-full"></div>
            </div>
            <motion.div
                className="max-w-6xl mx-auto grid grid-cols-1 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {mockSchedules.map((schedule) => (
                    <motion.div
                        key={schedule.id}
                        variants={itemVariants}
                        className="bg-deep-navy-blue p-4 md:p-6 rounded-xl border border-navy-blue-light/20 transition-all duration-300 hover:border-sapphire-blue hover:shadow-[0_0_25px_rgba(52,152,219,0.3)]"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center text-center md:text-left">
                            <div className="col-span-2 md:col-span-2">
                                <p className="font-bold text-lg text-white">{schedule.name}</p>
                                <p className="text-sm text-gray-400">{schedule.id} &bull; {schedule.class}</p>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Clock size={16} className="text-sapphire-blue"/>
                                <div>
                                    <p className="font-semibold">{schedule.departure}</p>
                                    <p className="text-xs text-gray-400">{schedule.from}</p>
                                </div>
                            </div>
                            <div className="hidden md:flex justify-center">
                                <ArrowRight size={20} className="text-gray-500"/>
                            </div>
                             <div className="flex items-center justify-center md:justify-start gap-2">
                                <Clock size={16} className="text-sapphire-blue"/>
                                <div>
                                    <p className="font-semibold">{schedule.arrival}</p>
                                    <p className="text-xs text-gray-400">{schedule.to}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};

const MapAndStationsSection = () => {
    return (
        <Section className="bg-deep-navy-blue text-white" style={{
            backgroundImage: 'linear-gradient(rgba(10, 25, 47, 0.95), rgba(10, 25, 47, 0.95)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23172a45\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Jelajahi Rute Kami</h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Lihat visualisasi jaringan rute kereta api kami yang luas dan stasiun yang kami layani.</p>
                <div className="mt-4 h-1 w-24 bg-sapphire-blue mx-auto rounded-full"></div>
            </div>
            
            <AnimatedMap />

            <div className="text-center mt-16">
                <h3 className="text-2xl font-bold mb-6">Stasiun Terhubung</h3>
                <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
                    {mockStations.map(station => (
                        <motion.div 
                            key={station}
                            className="bg-charcoal-black/50 text-gray-300 py-2 px-4 rounded-full border border-navy-blue-light/30 text-sm"
                            whileHover={{ scale: 1.1, color: '#3498DB', borderColor: '#3498DB' }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {station}
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-charcoal-black text-gray-400 py-12 px-4 md:px-8 lg:px-16">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center gap-2 text-white text-2xl font-bold mb-4">
                        <Train className="text-sapphire-blue" />
                        <span>KAI<span className="text-sapphire-blue">GO</span></span>
                    </div>
                    <p className="text-sm">Platform pemesanan tiket kereta api terpercaya untuk perjalanan yang aman dan nyaman.</p>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Tautan Cepat</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Beranda</a></li>
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Cek Pesanan</a></li>
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Hubungi Kami</a></li>
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Layanan</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Kereta Eksekutif</a></li>
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Kereta Ekonomi</a></li>
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Kereta Wisata</a></li>
                        <li><a href="#" className="hover:text-sapphire-blue transition-colors">Kargo & Logistik</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Ikuti Kami</h4>
                    <p>Dapatkan info terbaru dan promo menarik dari kami.</p>
                    {/* Social media icons can be added here */}
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-navy-blue-light/20 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} KAI GO. Dibuat dengan ❤️ untuk perjalanan Anda.</p>
            </div>
        </footer>
    );
};


export default function App() {
  // Define custom colors for Tailwind
  const customStyles = `
    <style>
      .bg-deep-navy-blue { background-color: #0a192f; }
      .bg-charcoal-black { background-color: #030712; }
      .text-sapphire-blue { color: #3498db; }
      .bg-sapphire-blue { background-color: #3498db; }
      .border-navy-blue-light { border-color: #172a45; }
    </style>
  `;

  return (
    <div className="bg-charcoal-black">
      <div dangerouslySetInnerHTML={{ __html: customStyles }} />
      <Header />
      <main>
        <HeroSection />
        <ScheduleSection />
        <MapAndStationsSection />
      </main>
      <Footer />
    </div>
  );
}
