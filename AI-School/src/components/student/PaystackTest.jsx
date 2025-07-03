import React, { useEffect } from 'react';

// This is a custom hook to safely load the Paystack script
const usePaystackScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
};

const PaystackTest = () => {
  // Use the custom hook to add the script to the page
  usePaystackScript();

  const payWithPaystack = () => {
    // Check if the PaystackPop object is available on the window
    if (!window.PaystackPop) {
      alert("Paystack script has not loaded yet. Please wait a moment and try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_206a7d36f87b72e140e7142dd20e41419cfa92bd', // <-- REPLACE WITH YOUR PAYSTACK TEST PUBLIC KEY
      email: 'test-user@example.com',
      amount: 1000, // 10 GHS in pesewas
      currency: 'GHS', // <-- MAKE SURE THIS MATCHES YOUR PAYSTACK ACCOUNT
      ref: `test-${Math.floor((Math.random() * 1000000000) + 1)}`,
      
      // This is the direct equivalent of onSuccess
      callback: function(response) {
        alert(`SUCCESS! Payment complete! Reference: ${response.reference}`);
        console.log("Paystack response:", response);
      },

      // This is the direct equivalent of onClose
      onClose: function() {
        alert('Popup was closed. The payment was not completed.');
      },
    });
    handler.openIframe();
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f0f8ff' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Direct Paystack Integration Test</h1>
      <p>This test bypasses the `react-paystack` library.</p>
      <button 
        onClick={payWithPaystack}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: 'darkblue', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px' }}
      >
        Run Direct Test Payment
      </button>
    </div>
  );
};

export default PaystackTest;
