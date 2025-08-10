import React, { useState, useEffect } from 'react';
import { Train, MapPin, Filter } from 'lucide-react';
import { apiService } from '../../services/api';
import '../../styles/user/ScheduleBoard.css';

// Komponen untuk setiap baris perhentian
const StopRow = ({ stop, index }) => {
  // Menentukan tipe stasiun berdasarkan arrival_time dan departure_time
  const getStationType = () => {
    if (!stop.arrival_time && stop.departure_time) {
      return 'Keberangkatan';
    } else if (stop.arrival_time && !stop.departure_time) {
      return 'Tujuan Akhir';
    } else {
      return 'Transit';
    }
  };

  const stationType = getStationType();
  
  // Format waktu untuk ditampilkan
  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.slice(0, 5); // Ambil HH:MM dari HH:MM:SS
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'Keberangkatan':
        return {
          badge: 'badge-departure-dismon',
          dot: 'timeline-dot-departure-dismon'
        };
      case 'Tujuan Akhir':
        return {
          badge: 'badge-arrival-dismon',
          dot: 'timeline-dot-arrival-dismon'
        };
      default:
        return {
          badge: 'badge-transit-dismon',
          dot: 'timeline-dot-transit-dismon'
        };
    }
  };

  const typeClasses = getTypeClass(stationType);

  return (
    <tr 
      className="station-row-dismon"
      style={{ 
        animationDelay: `${index * 0.1}s`
      }}
    >
      <td className="station-cell-dismon">
        <div className="station-info-cell-dismon">
          <div className={`timeline-indicator-dismon`}>
            <div className={`timeline-dot-dismon ${typeClasses.dot}`}></div>
          </div>
          <div className="station-details-dismon">
            <p className="station-name-dismon">{stop.Station?.station_name || 'Unknown Station'}</p>
            <p className="station-code-dismon">{stop.Station?.station_code || 'N/A'}</p>
          </div>
        </div>
      </td>
      <td className="station-cell-dismon station-cell-center-dismon">
        <div className="time-display-dismon">{formatTime(stop.arrival_time)}</div>
      </td>
      <td className="station-cell-dismon station-cell-center-dismon">
        <div className="time-display-dismon">{formatTime(stop.departure_time)}</div>
      </td>
      <td className="station-cell-dismon station-cell-center-dismon">
        <span className={`station-type-badge-dismon ${typeClasses.badge}`}>
          {stationType}
        </span>
      </td>
      <td className="station-cell-dismon station-cell-center-dismon">
        <div className="platform-number-dismon">{stop.platform || Math.floor(Math.random() * 5) + 1}</div>
      </td>
    </tr>
  );
};

// Komponen Utama ScheduleBoard
const ScheduleBoard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('');
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [trainFilters, setTrainFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stationName, setStationName] = useState('Loading...');
  
  // State untuk membagi tabel menjadi kolom kiri dan kanan
  const [leftTableData, setLeftTableData] = useState([]);
  const [rightTableData, setRightTableData] = useState([]);

  // Efek untuk mengelola waktu
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Fetch data dari API
  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch schedule routes data
      const routesData = await apiService.getAllScheduleRoutes();
      console.log('Routes Data:', routesData);
      
      // Proses data untuk mengelompokkan berdasarkan schedule_id
      const processedData = processApiData(routesData);
      setScheduleData(processedData);
      
      // Buat filter berdasarkan ID kereta yang tersedia
      const uniqueTrainIds = [...new Set(processedData.map(item => item.trainId))];
      setTrainFilters(uniqueTrainIds);
      
      // Set filter pertama sebagai active
      if (uniqueTrainIds.length > 0) {
        setActiveFilter(uniqueTrainIds[0]);
      }
      
      // Set nama stasiun berdasarkan stasiun keberangkatan pertama
      if (processedData.length > 0 && processedData[0].stops.length > 0) {
        const firstStop = processedData[0].stops.find(stop => !stop.arrival_time && stop.departure_time);
        if (firstStop && firstStop.Station) {
          setStationName(firstStop.Station.station_name);
        }
      }
      
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setError('Gagal memuat data jadwal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Proses data API menjadi format yang dibutuhkan
  const processApiData = (apiData) => {
    // Kelompokkan berdasarkan schedule_id
    const groupedBySchedule = apiData.reduce((acc, route) => {
      const scheduleId = route.schedule_id;
      if (!acc[scheduleId]) {
        acc[scheduleId] = [];
      }
      acc[scheduleId].push(route);
      return acc;
    }, {});

    // Konversi menjadi format yang diinginkan
    return Object.entries(groupedBySchedule).map(([scheduleId, routes]) => {
      // Urutkan berdasarkan station_order
      const sortedRoutes = routes.sort((a, b) => a.station_order - b.station_order);
      
      // Ambil informasi kereta dari route pertama
      const firstRoute = sortedRoutes[0];
      const trainInfo = firstRoute.TrainSchedule?.Train || {};
      
      return {
        trainName: trainInfo.train_name || 'Unknown Train',
        trainCode: trainInfo.train_code || 'N/A',
        trainId: trainInfo.id || firstRoute.TrainSchedule?.train_id || parseInt(scheduleId),
        scheduleId: parseInt(scheduleId),
        stops: sortedRoutes.map(route => ({
          stationName: route.Station?.station_name || 'Unknown Station',
          stationCode: route.Station?.station_code || 'N/A',
          arrival_time: route.arrival_time,
          departure_time: route.departure_time,
          Station: route.Station,
          platform: Math.floor(Math.random() * 5) + 1 // Random platform number
        }))
      };
    }).sort((a, b) => {
      // Urutkan berdasarkan waktu keberangkatan dari stasiun pertama
      const aStartTime = a.stops.find(stop => stop.departure_time)?.departure_time || '00:00:00';
      const bStartTime = b.stops.find(stop => stop.departure_time)?.departure_time || '00:00:00';
      return aStartTime.localeCompare(bStartTime);
    });
  };

  // Efek untuk memfilter jadwal berdasarkan filter aktif
  useEffect(() => {
    if (activeFilter && scheduleData.length > 0) {
      const filtered = scheduleData.filter(train => train.trainId === activeFilter);
      setFilteredSchedule(filtered);
      
      // Bagi data menjadi dua kolom, maksimal 8 baris per kolom
      if (filtered.length > 0) {
        const allStops = filtered[0].stops || [];
        const maxRowsPerTable = 8;
        
        if (allStops.length <= maxRowsPerTable) {
          setLeftTableData([{ ...filtered[0], stops: allStops }]);
          setRightTableData([]);
        } else {
          const leftStops = allStops.slice(0, maxRowsPerTable);
          const rightStops = allStops.slice(maxRowsPerTable);
          
          setLeftTableData([{ ...filtered[0], stops: leftStops }]);
          setRightTableData([{ ...filtered[0], stops: rightStops }]);
        }
      } else {
        setLeftTableData([]);
        setRightTableData([]);
      }
    }
  }, [activeFilter, scheduleData]);

  // Efek untuk carousel filter otomatis
  useEffect(() => {
    if (trainFilters.length === 0) return;
    
    const intervalId = setInterval(() => {
      setActiveFilter(currentFilter => {
        const currentIndex = trainFilters.indexOf(currentFilter);
        const nextIndex = (currentIndex + 1) % trainFilters.length;
        return trainFilters[nextIndex];
      });
    }, 8200); // Ganti filter setiap 5 detik

    return () => clearInterval(intervalId);
  }, [trainFilters]);

  // Load data saat komponen mount
  useEffect(() => {
    fetchScheduleData();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRetry = () => {
    fetchScheduleData();
  };

  if (loading) {
    return (
      <div className="schedule-board-container-dismon">
        <div className="loading-container-dismon">
          <div className="loading-spinner-dismon"></div>
          <span>Memuat jadwal kereta...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-board-container-dismon">
        <div className="error-container-dismon">
          <div>
            <div className="error-message-dismon">{error}</div>
            <button onClick={handleRetry} className="retry-button-dismon">
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-board-container-dismon">
      <div className="schedule-board-wrapper-dismon">
        
        {/* Header */}
        <header className="header-section-dismon">
          <div className="station-info-dismon">
            <MapPin className="map-pin-icon-dismon" />
            <div>
              <h1 className="station-title-dismon">Stasiun {stationName}</h1>
              <p className="station-subtitle-dismon">Papan Informasi Keberangkatan & Kedatangan</p>
            </div>
          </div>
          <div className="time-info-dismon">
            <p className="current-time-dismon">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="current-date-dismon">{formatDate(currentTime)}</p>
          </div>
        </header>

        {/* Filter Buttons */}
        <div className="filter-section-dismon">
          <div className="filter-header-dismon">
            <Filter className="filter-icon-dismon"/>
            <h2 className="filter-title-dismon">Jadwal Kereta</h2>
          </div>
          <div className="filter-buttons-dismon">
            {trainFilters.map(trainId => {
              // Cari data kereta berdasarkan trainId untuk mendapatkan nama dan kode
              const trainData = scheduleData.find(train => train.trainId === trainId);
              const displayName = trainData ? `${trainData.trainName} (${trainData.trainCode})` : `Train ${trainId}`;
              
              return (
                <button 
                  key={trainId}
                  onClick={() => setActiveFilter(trainId)}
                  className={`filter-button-dismon ${
                    activeFilter === trainId 
                      ? 'filter-button-active-dismon' 
                      : 'filter-button-inactive-dismon'
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabel Jadwal */}
        <div className="schedule-tables-container-dismon">
          {/* Tabel Kiri */}
          <div className="schedule-table-container-dismon">
            <table className="schedule-table-dismon">
              <thead className="table-header-dismon">
                <tr>
                  <th className="table-header-cell-dismon">Stasiun</th>
                  <th className="table-header-cell-dismon table-header-center-dismon">Tiba</th>
                  <th className="table-header-cell-dismon table-header-center-dismon">Berangkat</th>
                  <th className="table-header-cell-dismon table-header-center-dismon">Keterangan</th>
                  <th className="table-header-cell-dismon table-header-center-dismon">Peron</th>
                </tr>
              </thead>
              <tbody>
                {leftTableData.map((train) => (
                  <React.Fragment key={`left-${train.scheduleId}`}>
                    <tr className="train-header-row-dismon">
                      <td colSpan="5" className="train-header-cell-dismon">
                        <div className="train-info-dismon">
                          <Train className="train-icon-dismon" />
                          <span>{train.trainName} ({train.trainCode})</span>
                        </div>
                      </td>
                    </tr>
                    {train.stops.map((stop, stopIndex) => (
                      <StopRow 
                        key={`left-${train.scheduleId}-${stop.stationCode}-${stopIndex}`}
                        stop={stop}
                        index={stopIndex}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabel Kanan (jika ada data) */}
          {rightTableData.length > 0 && (
            <div className="schedule-table-container-dismon">
              <table className="schedule-table-dismon">
                <thead className="table-header-dismon">
                  <tr>
                    <th className="table-header-cell-dismon">Stasiun</th>
                    <th className="table-header-cell-dismon table-header-center-dismon">Tiba</th>
                    <th className="table-header-cell-dismon table-header-center-dismon">Berangkat</th>
                    <th className="table-header-cell-dismon table-header-center-dismon">Keterangan</th>
                    <th className="table-header-cell-dismon table-header-center-dismon">Peron</th>
                  </tr>
                </thead>
                <tbody>
                  {rightTableData.map((train) => (
                    <React.Fragment key={`right-${train.scheduleId}`}>
                      <tr className="train-header-row-dismon">
                        <td colSpan="5" className="train-header-cell-dismon">
                          <div className="train-info-dismon">
                            <Train className="train-icon-dismon" />
                            <span>{train.trainName} ({train.trainCode}) - Lanjutan</span>
                          </div>
                        </td>
                      </tr>
                      {train.stops.map((stop, stopIndex) => (
                        <StopRow 
                          key={`right-${train.scheduleId}-${stop.stationCode}-${stopIndex}`}
                          stop={stop}
                          index={stopIndex + 8} // Offset animasi untuk tabel kanan
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleBoard;
