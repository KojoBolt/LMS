import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import paystackLogo from '../../assets/images/paystack.png';

// This custom hook safely loads the Paystack script onto the page
const usePaystackScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  useEffect(() => {
    // Check if script is already loaded
    if (window.PaystackPop) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      setScriptLoaded(false);
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  return scriptLoaded;
};

const Checkout = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const scriptLoaded = usePaystackScript(); // Use the hook to load the script

    // --- State Management ---
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phoneNumber: '', addressLine1: '', addressLine2: '',
        country: '', state: '', city: '', saveInfo: false,
    });
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState({ message: '', type: null, isVerifying: false });
    const [shippingIsBilling, setShippingIsBilling] = useState(true);

    // --- Authentication Effect ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Data Fetching Effects ---
    useEffect(() => {
        if (!courseId) {
            setErrors({ general: "No course specified." });
            setLoading(false);
            return;
        }
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const courseDocRef = doc(db, 'courses', courseId);
                const docSnap = await getDoc(courseDocRef);
                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setErrors({ general: "Course not found." });
                }
            } catch (error) {
                console.error("Error fetching course:", error);
                setErrors({ general: "Failed to load course." });
            }
            setLoading(false);
        };
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries/states')
            .then(res => res.json())
            .then(data => !data.error && setCountries(data.data))
            .catch(e => console.error("Failed to fetch countries", e));
    }, []);

    // --- Input Handlers ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCountryChange = (e) => {
        handleInputChange(e);
        const selectedCountry = countries.find(c => c.name === e.target.value);
        setStates(selectedCountry ? selectedCountry.states.map(s => s.name) : []);
        setFormData(prev => ({ ...prev, state: '' }));
    };
    
    // --- Payment and Validation Logic (Direct Method) ---
    const handlePaymentAttempt = () => {
        // Clear previous payment status
        setPaymentStatus({ message: '', type: null, isVerifying: false });
        
        // 1. Check if user is authenticated
        if (!user) {
            setPaymentStatus({ message: "Please log in to continue with payment.", type: 'error' });
            return;
        }

        // 2. Check if script is loaded
        if (!scriptLoaded || !window.PaystackPop) {
            setPaymentStatus({ message: "Payment system is loading. Please wait and try again.", type: 'error' });
            return;
        }

        // 3. Validate the form
        const newErrors = {};
        const requiredFields = ['firstName', 'lastName', 'addressLine1', 'country', 'state', 'city'];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                newErrors[field] = `${fieldName} is required.`;
            }
        });
        setErrors(newErrors);

        // 4. If form is valid, call the direct Paystack function
        if (Object.keys(newErrors).length === 0) {
            payWithPaystack();
        }
    };

    const payWithPaystack = async () => {
        // Ensure user is authenticated before proceeding
        if (!auth.currentUser) {
            setPaymentStatus({ message: "Please log in to continue.", type: 'error' });
            return;
        }

        const coursePrice = parseFloat(course.coursePrice) || 0;
        const discountPrice = parseFloat(course.discountPrice) || 0;
        const total = discountPrice > 0 ? discountPrice : coursePrice;
        const currency = 'GHS';

        try {
            const handler = window.PaystackPop.setup({
                key: 'pk_test_206a7d36f87b72e140e7142dd20e41419cfa92bd', // Your Paystack Public Key
                email: user.email,
                amount: Math.round(total * 100),
                currency: currency,
                ref: `course-${courseId}-${Date.now()}`,
                metadata: {
                    courseId: courseId,
                    userId: user.uid,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    custom_fields: [
                        {
                            display_name: "Course Title",
                            variable_name: "course_title",
                            value: course.courseTitle
                        }
                    ]
                },
                // This is the success callback - MUST NOT be async
                callback: function(response) {
                    console.log('Payment successful, reference:', response.reference);
                    setPaymentStatus({ message: "Verifying payment, please wait...", type: 'info', isVerifying: true });
                    
                    // Handle the async operations inside a separate async function
                    const verifyPaymentAsync = async () => {
                        try {
                            // Get fresh auth token
                            const currentUser = auth.currentUser;
                            if (!currentUser) {
                                throw new Error('User not authenticated');
                            }
                            
                            // Get fresh ID token
                            const idToken = await currentUser.getIdToken(true);
                            console.log('Got fresh ID token');
                            
                            const functions = getFunctions();
                            const verifyPayment = httpsCallable(functions, 'verifyPaystackPayment');
                            
                            const result = await verifyPayment({ 
                                reference: response.reference, 
                                courseId: courseId,
                                userId: user.uid,
                                customerInfo: {
                                    firstName: formData.firstName,
                                    lastName: formData.lastName,
                                    email: user.email,
                                    phone: formData.phoneNumber,
                                    address: {
                                        line1: formData.addressLine1,
                                        line2: formData.addressLine2,
                                        city: formData.city,
                                        state: formData.state,
                                        country: formData.country
                                    }
                                }
                            });
                            
                            console.log('Cloud function result:', result);
                            setPaymentStatus({ message: '', type: null, isVerifying: false });
                            
                            if (result?.data?.success) {
                                setPaymentStatus({ message: "Payment successful! Redirecting...", type: 'success', isVerifying: false });
                                setTimeout(() => navigate(`/student/courses/${courseId}`), 2000);
                            } else {
                                setPaymentStatus({ 
                                    message: result?.data?.message || "Payment verification failed. Please contact support.", 
                                    type: 'error', 
                                    isVerifying: false 
                                });
                            }
                        } catch (err) {
                            console.error("Error calling cloud function:", err);
                            
                            // More  error handling
                            let errorMessage = "An error occurred during payment verification.";
                            if (err.code === 'functions/unauthenticated') {
                                errorMessage = "Authentication error. Please refresh the page and try again.";
                            } else if (err.code === 'functions/permission-denied') {
                                errorMessage = "Permission denied. Please contact support.";
                            } else if (err.code === 'functions/not-found') {
                                errorMessage = "Payment verification service not found. Please contact support.";
                            }
                            
                            setPaymentStatus({ 
                                message: errorMessage, 
                                type: 'error', 
                                isVerifying: false 
                            });
                        }
                    };
                    
                    // Call the async function
                    verifyPaymentAsync();
                },
                onClose: function() {
                    console.log('Payment popup closed by user.');
                    if (paymentStatus.isVerifying) {
                        setPaymentStatus({ message: '', type: null, isVerifying: false });
                    }
                },
            });
            
            handler.openIframe();
        } catch (error) {
            console.error('Error initializing Paystack:', error);
            setPaymentStatus({ message: "Failed to initialize payment. Please try again.", type: 'error' });
        }
    };

    // --- Render Logic ---
    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (errors.general) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                {errors.general}
            </div>
        );
    }
    
    if (!course) {
        return (
            <div className="flex justify-center items-center h-screen">
                Course not available.
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Please log in to continue with your purchase.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const subtotal = parseFloat(course.discountPrice) || parseFloat(course.coursePrice) || 0;
    const tax = 0;
    const total = subtotal + tax;
    const currency = 'GHS';

    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:ml-[300px] mt-[60px] lg:mt-0 mb-[60px] lg:mb-0">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold mb-6">Billing Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name *</label>
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        value={formData.firstName} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        value={formData.lastName} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleInputChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                                <input 
                                    type="text" 
                                    name="addressLine1" 
                                    value={formData.addressLine1} 
                                    onChange={handleInputChange} 
                                    className={`w-full px-3 py-2 border rounded-md ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Country *</label>
                                    <select 
                                        name="country" 
                                        value={formData.country} 
                                        onChange={handleCountryChange} 
                                        className={`w-full px-3 py-2 border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country.iso3} value={country.name}>{country.name}</option>
                                        ))}
                                    </select>
                                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">State / Province *</label>
                                    <select 
                                        name="state" 
                                        value={formData.state} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`} 
                                        disabled={!formData.country || states.length === 0}
                                    >
                                        <option value="">Select State</option>
                                        {states.map(stateName => (
                                            <option key={stateName} value={stateName}>{stateName}</option>
                                        ))}
                                    </select>
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">City *</label>
                                    <input 
                                        type="text" 
                                        name="city" 
                                        value={formData.city} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                            </div>
                            <div className="space-y-3 mt-6">
                                <div className="flex items-center">
                                    <input 
                                        id="shippingIsBilling" 
                                        type="checkbox" 
                                        checked={shippingIsBilling} 
                                        onChange={(e) => setShippingIsBilling(e.target.checked)} 
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="shippingIsBilling" className="ml-2 block text-sm text-gray-900">
                                        Shipping address is the same as my billing address
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        id="saveInfo" 
                                        name="saveInfo" 
                                        type="checkbox" 
                                        checked={formData.saveInfo} 
                                        onChange={handleInputChange} 
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="saveInfo" className="ml-2 block text-sm text-gray-900">
                                        Save this information for next time
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold mb-6">Payment Method</h2>
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <div className="flex items-center mb-4">
                                    <img src={paystackLogo} alt="Paystack" className="w-24"/>
                                </div>
                                <p className="text-sm text-gray-600">
                                    You will be redirected to Paystack's secure checkout to complete your payment.
                                </p>
                                
                                {paymentStatus.message && (
                                    <div className={`mt-4 p-3 rounded-md text-sm font-medium ${
                                        paymentStatus.type === 'error' ? 'bg-red-100 text-red-800' : 
                                        paymentStatus.type === 'success' ? 'bg-green-100 text-green-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {paymentStatus.message}
                                    </div>
                                )}
                                
                                <button 
                                    onClick={handlePaymentAttempt} 
                                    disabled={!user || paymentStatus.isVerifying || !scriptLoaded} 
                                    className="w-full mt-6 bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {paymentStatus.isVerifying ? 'Verifying...' : 
                                     !scriptLoaded ? 'Loading Payment System...' :
                                     `Pay ${currency} ${(total).toFixed(2)}`}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8 border border-gray-200">
                            <h2 className="text-lg font-semibold mb-6">Order Details</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start space-x-3">
                                    <img 
                                        src={course.courseThumbnail || `https://placehold.co/60x60/6366f1/white?text=${course.courseTitle.charAt(0)}`} 
                                        alt={course.courseTitle} 
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-blue-600 leading-tight">
                                            {course.courseTitle}
                                        </h3>
                                        <p className="text-green-800 font-semibold mt-1">
                                            {currency} {(subtotal).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Sub Total</span>
                                    <span>{currency} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>{currency} {tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                    <span>Total</span>
                                    <span>{currency} {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;