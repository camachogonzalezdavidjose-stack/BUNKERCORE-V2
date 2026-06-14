import { useState } from 'react';
import { registerUser, authenticateUser } from './services/webauthnService';

function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Welcome to BunkerCore');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email) return setStatus('Please enter your email');
    
    setLoading(true);
    setStatus('Registering your device...');
    try {
      const result = await registerUser(email);
      if (result.verified) {
        setStatus('Device successfully registered!');
      } else {
        setStatus('Registration failed.');
      }
    } catch (err) {
      console.error(err);
      // Display the specific error name if available (e.g., NotAllowedError)
      const errorMsg = err.name ? `${err.name}: ${err.message}` : err.message;
      setStatus(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return setStatus('Please enter your email');

    setLoading(true);
    setStatus('Authenticating...');
    try {
      const result = await authenticateUser(email);
      if (result.verified) {
        setStatus(`Welcome back, ${email}!`);
      } else {
        setStatus('Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BunkerCore</h1>
        <p style={styles.subtitle}>Secure Passkey Authentication</p>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={handleRegister} 
              style={{...styles.button, ...styles.secondaryButton}}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Register Device'}
            </button>
            <button 
              onClick={handleLogin} 
              style={{...styles.button, ...styles.primaryButton}}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </div>

          <p style={styles.status}>{status}</p>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2026 BunkerCore Security Systems</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    margin: '0',
    letterSpacing: '2px',
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: '0.8',
    marginTop: '10px',
  },
  main: {
    width: '100%',
    maxWidth: '400px',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#38bdf8',
    border: '1px solid #38bdf8',
  },
  status: {
    marginTop: '20px',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  footer: {
    marginTop: '50px',
    fontSize: '0.8rem',
    opacity: '0.5',
  }
};

export default App;
