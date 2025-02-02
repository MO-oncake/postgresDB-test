import { useEffect, useState } from 'react';
import EventList from '../components/EventList';
import frontend_domain from '../config';

const styles = {
    container: {
        width: '85%',  // Set container to 85% of viewport width
        margin: '0 auto', // Center the container
        padding: '20px',
        boxSizing: 'border-box'
    },
    carouselWrapper: {
        width: '100%',
        margin: '0 auto',
        position: 'relative'
    },
    slider: {
        position: 'relative',
        height: '70vh',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    slide: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        transform: 'scale(1.1)',
        transition: 'all 0.75s ease-out'
    },
    slideActive: {
        opacity: 1,
        transform: 'scale(1) translateY(0)',
        zIndex: 2
    },
    slideContent: {
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.7)',
        padding: '25px',
        borderRadius: '12px',
        width: '85%',
        maxWidth: '700px',
        color: 'white',
        textAlign: 'center'
    },
    title: {
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#333'
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        background: '#f8f9fa',
        borderRadius: '12px',
        width: '100%'
    },
    loaderCircle: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    eventListContainer: {
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        margin: '2rem auto'
    },
    navigationDots: {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        display: 'flex',
        gap: '10px'
    },
    navigationDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
    }
};

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${frontend_domain}/events`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!loading && events.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % events.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [loading, events.length]);

    const handleRetry = () => {
        fetchEvents();
    };

    const Loader = () => (
        <div style={styles.loader}>
            <div style={styles.loaderCircle}></div>
        </div>
    );

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Upcoming Events</h1>

            <div style={styles.carouselWrapper}>
                {loading && <Loader />}
                {error && (
                    <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
                        <p>Failed to load events: {error}</p>
                        <button onClick={handleRetry} className="btn btn-primary">
                            Retry
                        </button>
                    </div>
                )}
                {!loading && !error && events.length > 0 && (
                    <div style={styles.slider}>
                        {events.map((event, index) => (
                            <div
                                key={event.id}
                                style={{
                                    ...styles.slide,
                                    ...(index === currentSlide ? styles.slideActive : {}),
                                }}
                            >
                                <img
                                    src={event.image_url}
                                    alt={event.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                    }}
                                />
                                <div style={styles.slideContent}>
                                    <h2 style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
                                        {event.name}
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', marginBottom: 0 }}>
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        <div style={styles.navigationDots}>
                            {events.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    style={{
                                        ...styles.navigationDot,
                                        background: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.5)'
                                    }}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={styles.eventListContainer}>
                {loading && <Loader />}
                {!loading && !error && events.length === 0 && (
                    <p style={{ textAlign: 'center' }}>No events available.</p>
                )}
                {!loading && !error && <EventList events={events} />}
            </div>
        </div>
    );
};

export default Home;
