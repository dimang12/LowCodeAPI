import React, { useState, useEffect } from 'react';

// Icon components
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SdmManager = ({ currentSdmId, onSdmChange, onSave }) => {
  const [sdms, setSdms] = useState([]);
  const [showList, setShowList] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSdmName, setNewSdmName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all SDMs from database
  const fetchSdms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sdm');
      if (response.ok) {
        const data = await response.json();
        setSdms(data);
      }
    } catch (error) {
      console.error('Error fetching SDMs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new SDM
  const createSdm = async () => {
    if (!newSdmName.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/sdm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSdmName })
      });

      if (response.ok) {
        const newSdm = await response.json();
        setSdms([...sdms, newSdm]);
        setNewSdmName('');
        setIsCreating(false);
        onSdmChange(newSdm.id);
      }
    } catch (error) {
      console.error('Error creating SDM:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load SDMs on mount
  useEffect(() => {
    fetchSdms();
  }, []);

  return (
    <div className="sdm-manager" style={{ 
      position: 'absolute', 
      top: '20px', 
      left: '20px', 
      zIndex: 1000,
      display: 'flex',
      gap: '10px'
    }}>
      {/* Add New SDM Button */}
      <button
        onClick={() => setIsCreating(!isCreating)}
        style={{
          padding: '10px 15px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title="Create New SDM"
      >
        <PlusIcon />
        New SDM
      </button>

      {/* Show SDM List Button */}
      <button
        onClick={() => setShowList(!showList)}
        style={{
          padding: '10px 15px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title="Show SDM List"
      >
        <ListIcon />
        SDM List ({sdms.length})
      </button>

      {/* Overlay */}
      {(isCreating || showList) && (
        <div
          onClick={() => {
            setIsCreating(false);
            setShowList(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }}
        />
      )}

      {/* Create SDM Modal */}
      {isCreating && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1001,
            minWidth: '300px'
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Create New SDM</h3>
            <button
              onClick={() => setIsCreating(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <XIcon />
            </button>
          </div>
          <input
            type="text"
            value={newSdmName}
            onChange={(e) => {
              e.stopPropagation();
              setNewSdmName(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                createSdm();
              }
            }}
            placeholder="Enter SDM name..."
            autoFocus
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '15px'
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsCreating(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={createSdm}
              disabled={!newSdmName.trim() || loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: newSdmName.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                opacity: newSdmName.trim() ? 1 : 0.5
              }}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* SDM List Modal */}
      {showList && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1001,
            minWidth: '400px',
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column'
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>SDM List</h3>
            <button
              onClick={() => setShowList(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <XIcon />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : sdms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No SDMs found. Create one to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sdms.map((sdm) => (
                  <div
                    key={sdm.id}
                    onClick={() => {
                      if (onSdmChange) {
                        onSdmChange(sdm.id);
                      }
                      setShowList(false);
                    }}
                    style={{
                      padding: '12px 15px',
                      backgroundColor: currentSdmId === sdm.id ? '#dbeafe' : '#f9fafb',
                      border: currentSdmId === sdm.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: '#f3f4f6'
                      }
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                      {sdm.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Created: {sdm.createDate ? new Date(sdm.createDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SdmManager;
