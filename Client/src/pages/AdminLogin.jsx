
import { useState, useEffect } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = ({ onLogin }) => {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const adminName = localStorage.getItem("adminname");
        const userName = localStorage.getItem("username");
        
        if (adminName || userName) {
            onLogin(); // Trigger the login callback if already logged in
        }
    }, [onLogin]);

    const handleSubmit = async () => {
        if (!userid || !password) {
            toast.error("Please fill all fields");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/adminlogin`, { 
                userid: userid, 
                password: password 
            });
            
            if (response.data) {
                localStorage.setItem("adminname", response.data.userid);
                toast.success("Admin login successful!");
                onLogin();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 
                                error.response?.data || 
                                "Login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome To Admin Panel</h1>
                        <p className="text-gray-600">Please sign in to continue</p>
                    </div>
                    
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="userid" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin ID
                            </label>
                            <div className="relative">
                                <input
                                    id="userid"
                                    type="text"
                                    value={userid}
                                    onChange={(e) => setUserid(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                                    placeholder="Enter admin ID"
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                                    placeholder="Enter your password"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium shadow-sm transition duration-300 ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Don't have an account? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Contact support</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;