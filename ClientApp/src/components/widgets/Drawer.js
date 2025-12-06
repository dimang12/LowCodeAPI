import { XMarkIcon } from '@heroicons/react/24/outline';

const Drawer = ({ isOpen, onClose, title, children, width = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-screen ${width} transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
        <div className="flex h-full flex-col overflow-y-auto shadow-xl border-l border-indigo-200/30 bg-gradient-to-b from-white/50 via-white/50 to-gray-50/50 backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-4 py-6 sm:px-6 border-b border-indigo-300/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold leading-6 text-white drop-shadow-md">
              {title}
            </h2>
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                className="relative rounded-md bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white transition-colors p-1"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 px-4 py-6 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
