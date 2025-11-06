import React, { useState } from 'react';
import './Auth.css';

export function Auth({ onAuthed }) {
	const [mode, setMode] = useState('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const submit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		
		try {
			const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, password, name: name || undefined }),
			});
			
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				setError(d.error || 'Authentication failed');
				return;
			}
			onAuthed();
		} catch (err) {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<h2 className="auth-title">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
				<p className="auth-subtitle">
					{mode === 'login' ? 'Sign in to continue' : 'Get started with your AI chat'}
				</p>
				
				<form onSubmit={submit} className="auth-form">
					{mode === 'register' && (
						<div className="form-group">
							<label htmlFor="name">Name</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
								required={mode === 'register'}
							/>
						</div>
					)}
					
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your@email.com"
							required
						/>
					</div>
					
					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							minLength={6}
						/>
					</div>
					
					{error && <div className="error-message">{error}</div>}
					
					<button type="submit" className="auth-button" disabled={loading}>
						{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
					</button>
				</form>
				
				<div className="auth-switch">
					{mode === 'login' ? (
						<>
							Don't have an account?{' '}
							<button type="button" onClick={() => setMode('register')} className="link-button">
								Sign up
							</button>
						</>
					) : (
						<>
							Already have an account?{' '}
							<button type="button" onClick={() => setMode('login')} className="link-button">
								Sign in
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

