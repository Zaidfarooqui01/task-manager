import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          backdropFilter: 'blur(10px)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#f1f5f9',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e',
            secondary: '#f1f5f9',
          },
        },
      }}
    />
  );
}
