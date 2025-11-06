import React, { useEffect, useState } from 'react';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import './App.css';

const DEFAULT_MODEL_BY_PROVIDER = {
	openai: 'gpt-3.5-turbo',
	gemini: 'gemini-2.5-flash',
	dialogflow: 'dialogflow-cx',
	mock: 'mock',
};

export default function App() {
	const [authed, setAuthed] = useState(false);
	const [sessionId, setSessionId] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [messages, setMessages] = useState([]);
	const [provider, setProvider] = useState('openai');
	const [model, setModel] = useState('gpt-3.5-turbo');
	const [temperature, setTemperature] = useState(0.7);
	const [loading, setLoading] = useState(false);

	const loadUser = async () => {
		const r = await fetch('/api/auth/me', { credentials: 'include' });
		setAuthed(r.ok);
	};

	useEffect(() => {
		loadUser();
	}, []);

	useEffect(() => {
		if (!authed) return;
		fetch('/api/sessions', { credentials: 'include' })
			.then((r) => r.json())
			.then((d) => {
				setSessions(d.sessions || []);
				if (d.sessions?.[0]) setSessionId(d.sessions[0]._id);
			})
			.catch((err) => {
				console.error('Failed to load sessions:', err);
			});
	}, [authed]);

	useEffect(() => {
		if (!sessionId) {
			setMessages([]);
			return;
		}
		setLoading(true);
		fetch(`/api/sessions/${sessionId}/messages`, { credentials: 'include' })
			.then((r) => r.json())
			.then((d) => setMessages(d.messages || []))
			.catch((err) => {
				console.error('Failed to load messages:', err);
			})
			.finally(() => setLoading(false));
	}, [sessionId]);

	const sendMessage = async (messageText) => {
		if (!sessionId || !messageText) return;
		
		setLoading(true);
		let res;
		try {
			res = await fetch('/api/chat/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ sessionId, message: messageText, provider, model, temperature }),
			});
		} catch (e) {
			setMessages((m) => [...m, { role: 'system', content: `Network error: ${String(e)}` }]);
			setLoading(false);
			return;
		}
		
		if (!res.ok || !res.body) {
			setMessages((m) => [...m, { role: 'system', content: `Request failed (${res.status})` }]);
			setLoading(false);
			return;
		}
		
		const reader = res.body.getReader();
		let assistant = '';
		setMessages((m) => [...m, { role: 'user', content: messageText }, { role: 'assistant', content: '' }]);
		
		let hadError = false;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const chunk = new TextDecoder().decode(value);
			for (const line of chunk.split('\n\n')) {
				if (!line.startsWith('data:')) continue;
				try {
					const payload = JSON.parse(line.slice(5));
					if (payload.type === 'delta') {
						assistant += payload.delta;
						setMessages((prev) => {
							const copy = [...prev];
							copy[copy.length - 1] = { role: 'assistant', content: assistant };
							return copy;
						});
					}
					if (payload.type === 'error') {
						hadError = true;
						setMessages((prev) => [...prev, { role: 'system', content: `Provider error: ${payload.error}` }]);
						break;
					}
				} catch (e) {
					// Skip invalid JSON
				}
			}
			if (hadError) break;
		}
		
		setLoading(false);
		if (!hadError) {
			fetch(`/api/sessions/${sessionId}/messages`, { credentials: 'include' })
				.then((r) => r.json())
				.then((d) => setMessages(d.messages || []))
				.catch((err) => {
					console.error('Failed to refresh messages:', err);
				});
		}
	};

	const newChat = async () => {
		try {
			const r = await fetch('/api/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ title: 'New Chat', provider, model }),
			});
			const d = await r.json();
			setSessionId(d.session._id);
			setSessions((s) => [d.session, ...s]);
			setMessages([]);
		} catch (err) {
			console.error('Failed to create new chat:', err);
		}
	};

	const clearChat = async () => {
		if (!sessionId) return;
		try {
			await fetch(`/api/sessions/${sessionId}/clear`, { method: 'POST', credentials: 'include' });
			setMessages([]);
		} catch (err) {
			console.error('Failed to clear chat:', err);
		}
	};

	const summarizeChat = async () => {
		if (!sessionId) return;
		try {
			const r = await fetch(`/api/sessions/${sessionId}/summarize`, { method: 'POST', credentials: 'include' });
			const d = await r.json();
			setMessages((m) => [...m, { role: 'system', content: `Summary added. ${d.summary ? '' : '(empty)'}` }]);
		} catch (err) {
			console.error('Failed to summarize chat:', err);
		}
	};

	const logout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
			setAuthed(false);
			setSessions([]);
			setMessages([]);
			setSessionId(null);
		} catch (err) {
			console.error('Failed to logout:', err);
		}
	};

	const handleProviderChange = (e) => {
		const next = e.target.value;
		setProvider(next);
		setModel(DEFAULT_MODEL_BY_PROVIDER[next] || '');
	};

	const currentSession = sessions.find((s) => s._id === sessionId);

	if (!authed) return <Auth onAuthed={loadUser} />;

	return (
		<div className="app">
			<Sidebar
				provider={provider}
				model={model}
				temperature={temperature}
				sessions={sessions}
				currentSessionId={sessionId}
				onProviderChange={handleProviderChange}
				onModelChange={setModel}
				onTemperatureChange={setTemperature}
				onSessionSelect={setSessionId}
				onNewChat={newChat}
				onLogout={logout}
			/>
			<div className="chat-container">
				<ChatHeader
					sessionTitle={currentSession?.title}
					onClear={clearChat}
					onSummarize={summarizeChat}
				/>
				<MessageList messages={messages} loading={loading} />
				<ChatInput onSend={sendMessage} disabled={loading} />
			</div>
		</div>
	);
}
