import React from 'react';
import { Card } from '../ui/Card';

export function APISettings() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">AI Provider Settings</h2>
      <p className="text-gray-600">
        AI integration is currently disabled. The financial consultant will provide basic guidance based on your data.
      </p>
    </Card>
  );
}