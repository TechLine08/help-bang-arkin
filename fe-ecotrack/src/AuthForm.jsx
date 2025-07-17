import React, { useState } from 'react';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

export default function AuthForm() {
  console.log("AuthForm is rendering ✅");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out!");
  };

  return (
    <div style={{
      backgroundColor: '#ffffffdd',
      padding: '30px 40px',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      width: '320px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#4b2e2e', marginBottom: '20px' }}>
        {isLogin ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        /><br />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        /><br />
        <button type="submit" style={primaryButton}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={switchButton}>
        {isLogin ? "Switch to Register" : "Switch to Login"}
      </button>
      <br /><br />
      <button onClick={handleLogout} style={logoutButton}>
        Logout
      </button>
    </div>
  );
}

const inputStyle = {
  padding: '10px',
  margin: '10px 0',
  width: '100%',
  borderRadius: '10px',
  border: '1px solid #aaa',
  fontSize: '14px'
};

const primaryButton = {
  backgroundColor: '#6d4c41',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '10px',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px'
};

const switchButton = {
  backgroundColor: '#a1887f',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '13px',
  marginTop: '15px',
  cursor: 'pointer'
};

const logoutButton = {
  backgroundColor: '#8d6e63',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '13px',
  marginTop: '10px',
  cursor: 'pointer'
};
