import React from 'react';
import './Sidebar.css';

export function Sidebar({
	provider,
	model,
	temperature,
	sessions,
	currentSessionId,
	onProviderChange,
	onModelChange,
	onTemperatureChange,
	onSessionSelect,
	onNewChat,
	onLogout,
}) {
	return (
		<div className="sidebar">
			<div className="sidebar-header">
				<h2 className="sidebar-title">AI Chat</h2>
			</div>
			
			<div className="sidebar-controls">
				<div className="control-group">
					<label htmlFor="provider">Provider</label>
					<select
						id="provider"
						value={provider}
						onChange={onProviderChange}
						className="select-input"
					>
						<option value="openai">OpenAI</option>
						<option value="gemini">Gemini</option>
						<option value="dialogflow">Dialogflow</option>
						<option value="mock">Mock</option>
					</select>
				</div>
				
				<div className="control-group">
					<label htmlFor="model">Model</label>
					<input
						id="model"
						type="text"
						value={model}
						onChange={(e) => onModelChange(e.target.value)}
						placeholder="Model name"
						className="text-input"
					/>
				</div>
				
				<div className="control-group">
					<label htmlFor="temperature">
						Temperature: {temperature}
					</label>
					<input
						id="temperature"
						type="range"
						min="0"
						max="2"
						step="0.1"
						value={temperature}
						onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
						className="range-input"
					/>
				</div>
			</div>
			
			<div className="sidebar-actions">
				<button onClick={onNewChat} className="button button-primary">
					+ New Chat
				</button>
				<button onClick={onLogout} className="button button-secondary">
					Logout
				</button>
			</div>
			
			<div className="sessions-list">
				<h3 className="sessions-title">Recent Chats</h3>
				<div className="sessions-scroll">
					{sessions.length === 0 ? (
						<div className="empty-state">No chats yet. Start a new conversation!</div>
					) : (
						sessions.map((session) => (
							<div
								key={session._id}
								onClick={() => onSessionSelect(session._id)}
								className={`session-item ${session._id === currentSessionId ? 'active' : ''}`}
							>
								<div className="session-title">{session.title}</div>
								<div className="session-meta">
									{session.model} · {session.provider}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

