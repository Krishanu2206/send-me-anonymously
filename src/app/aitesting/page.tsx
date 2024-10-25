"use client"
import React, { useState } from 'react';

const OpenAIStream = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResponse('');
    setError('');

    try {
      const res = await fetch('/api/suggest-messages', {
        method: 'POST'
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      if (reader) {
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          setResponse((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
      setError('Failed to fetch response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>OpenAI Streaming Example</h1>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Generate Questions'}
        </button>
      </form>

      {loading && <p>Loading response...</p>}
      {response && (
        <div>
          <h2>Generated Questions:</h2>
          <p>{response}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default OpenAIStream;
