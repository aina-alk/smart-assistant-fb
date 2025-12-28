export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        Super Assistant Médical
      </h1>
      <p
        style={{
          fontSize: '1.5rem',
          color: '#666',
          textAlign: 'center',
        }}
      >
        Setup en cours
      </p>
    </main>
  );
}
