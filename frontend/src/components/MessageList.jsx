import React, { useEffect, useRef } from 'react';
import './MessageList.css';

export function MessageList({ messages, loading }) {
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, loading]);

	if (messages.length === 0 && !loading) {
		return (
			<div className="message-list empty">
				<div className="empty-chat">
					<div className="empty-icon">💬</div>
					<h3>Start a conversation</h3>
					<p>Send a message to begin chatting with AI</p>
				</div>
			</div>
		);
	}

	return (
		<div className="message-list">
			{messages.map((message, index) => (
				<div
					key={index}
					className={`message message-${message.role}`}
				>
					<div className="message-header">
						<span className="message-role">{message.role}</span>
						{message.createdAt && (
							<span className="message-time">
								{new Date(message.createdAt).toLocaleTimeString()}
							</span>
						)}
					</div>
					<div className="message-content">
						{message.content || <span className="typing-indicator">...</span>}
					</div>
				</div>
			))}
			{loading && (
				<div className="message message-assistant">
					<div className="message-header">
						<span className="message-role">assistant</span>
					</div>
					<div className="message-content">
						<span className="typing-indicator">...</span>
					</div>
				</div>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
}

