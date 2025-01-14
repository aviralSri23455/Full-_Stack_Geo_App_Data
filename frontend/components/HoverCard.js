import React from 'react';

export default function HoverCard({ info }) {
  return (
    <div className="absolute p-2 bg-white rounded shadow-md">
      <p><strong>Details:</strong></p>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}
