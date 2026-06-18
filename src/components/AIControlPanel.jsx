import React, { useState } from 'react';
import { HexColorPicker } from '@uiw/react-color';

const AIControlPanel = ({ onColorChange }) => {
  const [color, setColor] = useState('#00e5ff');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: 'Suggest a hex color code for a vibrant game background.' }],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const suggested = data.choices?.[0]?.message?.content?.trim();
      setResponse(suggested || 'No response');
      // naive extraction of hex code
      const match = suggested?.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
      if (match) {
        setColor(match[0]);
        onColorChange(match[0]);
      }
    } catch (e) {
      setResponse('Error contacting Groq');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-control-panel" style={{ padding: '1rem', background: 'rgba(5,8,16,0.9)', borderRadius: '8px' }}>
      <h3 style={{ color: '#fff' }}>AI Control Panel</h3>
      <HexColorPicker color={color} onChange={setColor} />
      <button onClick={() => onColorChange(color)} style={{ marginTop: '0.5rem' }}>
        Apply Color
      </button>
      <button onClick={handleAskAI} disabled={loading} style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}>
        {loading ? 'Thinking…' : 'Ask AI for Color'}
      </button>
      {response && <p style={{ color: '#fff' }}>{response}</p>}
    </div>
  );
};

export default AIControlPanel;
