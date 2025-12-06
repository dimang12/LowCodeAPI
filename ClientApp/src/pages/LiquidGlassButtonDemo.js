import React, { useState } from 'react';
import LiquidGlassButton from '../components/widgets/LiquidGlassButton';
import { 
  PlusIcon, 
  CheckIcon, 
  TrashIcon, 
  ArrowRightIcon,
  HeartIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const LiquidGlassButtonDemo = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
      }`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            LiquidGlass Button
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            iOS 26 Inspired Liquid Glass Morphism with Jelly Animations
          </p>
          
          {/* Theme Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                darkMode 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Switch to {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Click Counter */}
        <div className="text-center mb-12">
          <div className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Button Clicks: <span className="text-indigo-500">{clickCount}</span>
          </div>
        </div>

        {/* Button Variants Section */}
        <div className="space-y-12">
          {/* Default Variant */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Default Variant
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <LiquidGlassButton 
                variant="default" 
                darkMode={darkMode}
                onClick={handleClick}
              >
                Default Button
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="default" 
                darkMode={darkMode}
                onClick={handleClick}
                startIcon={<PlusIcon className="w-5 h-5" />}
              >
                With Icon
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="default" 
                darkMode={darkMode}
                onClick={handleClick}
                endIcon={<ArrowRightIcon className="w-5 h-5" />}
              >
                Next Step
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="default" 
                darkMode={darkMode}
                disabled
              >
                Disabled
              </LiquidGlassButton>
            </div>
          </section>

          {/* Primary Variant */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Primary Variant
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <LiquidGlassButton 
                variant="primary" 
                darkMode={darkMode}
                onClick={handleClick}
              >
                Primary Action
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="primary" 
                darkMode={darkMode}
                onClick={handleClick}
                startIcon={<CheckIcon className="w-5 h-5" />}
              >
                Confirm
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="primary" 
                darkMode={darkMode}
                onClick={handleClick}
                startIcon={<SparklesIcon className="w-5 h-5" />}
                endIcon={<ArrowRightIcon className="w-5 h-5" />}
              >
                Get Started
              </LiquidGlassButton>
            </div>
          </section>

          {/* Success Variant */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Success Variant
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <LiquidGlassButton 
                variant="success" 
                darkMode={darkMode}
                onClick={handleClick}
              >
                Success
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="success" 
                darkMode={darkMode}
                onClick={handleClick}
                startIcon={<CheckIcon className="w-5 h-5" />}
              >
                Approved
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="success" 
                darkMode={darkMode}
                onClick={handleClick}
                startIcon={<HeartIcon className="w-5 h-5" />}
              >
                Like
              </LiquidGlassButton>
            </div>
          </section>

          {/* Danger Variant */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Danger Variant
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <LiquidGlassButton 
                variant="danger" 
                darkMode={darkMode}
                onClick={handleClick}
              >
                Delete
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="danger" 
                darkMode={darkMode}
                onClick={handleClick}
                startIcon={<TrashIcon className="w-5 h-5" />}
              >
                Remove Item
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="danger" 
                darkMode={darkMode}
                onClick={handleClick}
              >
                Cancel Order
              </LiquidGlassButton>
            </div>
          </section>

          {/* Size Variations */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Size Variations
            </h2>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <LiquidGlassButton 
                variant="primary" 
                darkMode={darkMode}
                onClick={handleClick}
                sx={{ padding: '8px 20px', fontSize: '14px' }}
              >
                Small
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="primary" 
                darkMode={darkMode}
                onClick={handleClick}
              >
                Medium (Default)
              </LiquidGlassButton>
              
              <LiquidGlassButton 
                variant="primary" 
                darkMode={darkMode}
                onClick={handleClick}
                sx={{ padding: '16px 40px', fontSize: '18px' }}
              >
                Large
              </LiquidGlassButton>
            </div>
          </section>

          {/* Animation Showcase */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Animation Features
            </h2>
            <div className={`p-8 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} backdrop-blur-lg`}>
              <ul className={`space-y-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <strong>Entrance Animation:</strong> Buttons appear with a smooth scale and bounce effect
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <strong>Press Effect:</strong> Jelly-like squish animation when clicking
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎪</span>
                  <div>
                    <strong>Release Bounce:</strong> Elastic bounce-back animation on mouse release
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💎</span>
                  <div>
                    <strong>Liquid Glass:</strong> Glassmorphism with blur, transparency, and shimmer effects
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🌈</span>
                  <div>
                    <strong>Shimmer Effect:</strong> Continuous subtle shine animation across the button
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Usage Example */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Usage Example
            </h2>
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <pre className={`text-sm overflow-x-auto ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {`import { LiquidGlassButton } from 'components/widgets';
import { CheckIcon } from '@heroicons/react/24/outline';

<LiquidGlassButton 
  variant="primary" 
  darkMode={false}
  onClick={handleClick}
  startIcon={<CheckIcon className="w-5 h-5" />}
>
  Get Started
</LiquidGlassButton>`}
              </pre>
            </div>
          </section>

          {/* Props Documentation */}
          <section>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Props
            </h2>
            <div className="overflow-x-auto">
              <table className={`w-full rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Prop</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Default</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <tr>
                    <td className="px-6 py-4 text-sm font-mono">variant</td>
                    <td className="px-6 py-4 text-sm">string</td>
                    <td className="px-6 py-4 text-sm">'default'</td>
                    <td className="px-6 py-4 text-sm">'default' | 'primary' | 'success' | 'danger'</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-mono">darkMode</td>
                    <td className="px-6 py-4 text-sm">boolean</td>
                    <td className="px-6 py-4 text-sm">false</td>
                    <td className="px-6 py-4 text-sm">Enable dark mode styling</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-mono">onClick</td>
                    <td className="px-6 py-4 text-sm">function</td>
                    <td className="px-6 py-4 text-sm">-</td>
                    <td className="px-6 py-4 text-sm">Click event handler</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-mono">disabled</td>
                    <td className="px-6 py-4 text-sm">boolean</td>
                    <td className="px-6 py-4 text-sm">false</td>
                    <td className="px-6 py-4 text-sm">Disable the button</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-mono">startIcon</td>
                    <td className="px-6 py-4 text-sm">ReactNode</td>
                    <td className="px-6 py-4 text-sm">-</td>
                    <td className="px-6 py-4 text-sm">Icon before text</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-mono">endIcon</td>
                    <td className="px-6 py-4 text-sm">ReactNode</td>
                    <td className="px-6 py-4 text-sm">-</td>
                    <td className="px-6 py-4 text-sm">Icon after text</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click any button to see the jelly animation effect! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiquidGlassButtonDemo;
