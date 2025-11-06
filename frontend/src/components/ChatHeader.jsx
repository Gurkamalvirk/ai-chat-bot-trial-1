import React from 'react';
import './ChatHeader.css';

export function ChatHeader({ onClear, onSummarize, sessionTitle }) {
	return (
		<div className="chat-header">
			<div className="chat-header-left">
				<h2 className="chat-title">{sessionTitle || 'Chat'}</h2>
			</div>
			<div className="chat-header-actions">
				<button onClick={onSummarize} className="header-button">
					Summarize
				</button>
				<button onClick={onClear} className="header-button">
					Clear
				</button>
			</div>
		</div>
	);
}

