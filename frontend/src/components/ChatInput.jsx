import React, { useState } from 'react';
import './ChatInput.css';

export function ChatInput({ onSend, disabled }) {
	const [input, setInput] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		if (input.trim() && !disabled) {
			onSend(input.trim());
			setInput('');
		}
	};

	return (
		<div className="chat-input-container">
			<form onSubmit={handleSubmit} className="chat-input-form">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					className="chat-input"
					disabled={disabled}
					autoFocus
				/>
				<button
					type="submit"
					className="send-button"
					disabled={disabled || !input.trim()}
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="22" y1="2" x2="11" y2="13"></line>
						<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
					</svg>
				</button>
			</form>
		</div>
	);
}

