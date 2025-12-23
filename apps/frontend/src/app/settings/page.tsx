'use client';

import { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('binance_api_key') || '';
    const storedSecretKey = localStorage.getItem('binance_secret_key') || '';
    setApiKey(storedApiKey);
    setSecretKey(storedSecretKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('binance_api_key', apiKey);
    localStorage.setItem('binance_secret_key', secretKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your Binance Testnet API credentials</p>
      </div>

      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <div className="flex items-start gap-3 mb-6 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Binance Testnet Credentials</p>
            <p>
              Get your API keys from{' '}
              <a
                href="https://testnet.binance.vision/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue hover:underline"
              >
                testnet.binance.vision
              </a>
              . These keys are stored locally in your browser and never sent to any server except
              Binance.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Binance Testnet API Key"
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Key className="w-4 h-4" />
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your Binance Testnet Secret Key"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Credentials
            </button>

            {saved && (
              <div className="flex items-center gap-2 text-accent-green">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Saved successfully!</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-3">
            How to get Testnet API Keys
          </h3>
          <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
            <li>Visit <span className="text-accent-blue">testnet.binance.vision</span></li>
            <li>Log in with your GitHub account</li>
            <li>Navigate to API Keys section</li>
            <li>Generate new API Key and Secret Key</li>
            <li>Copy both keys and paste them above</li>
            <li>Enable trading permissions for your API key</li>
          </ol>
        </div>
      </div>
    </div>
  );
}