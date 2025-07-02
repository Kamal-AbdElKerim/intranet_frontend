import { Fragment, useEffect, useState } from 'react';
import { connect } from "react-redux";
import { ThemeChanger } from "../redux/action";
import { Link, useNavigate } from 'react-router-dom';
import { PublicClientApplication } from "@azure/msal-browser";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../assets/images/brand-logos/logo.png";

import loginBg from "../assets/images/backgrounds/login-bg.jpg";

import { msalConfig, loginRequest } from '../config/authConfig';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules

import { LocalStorageBackup } from '../components/common/switcher/switcherdata/switcherdata';
import axiosInstance from '../Interceptor/axiosInstance';
import LoadingLogo from '../components/utile/LoadingLogo';
import { useAuth } from '../components/utile/AuthProvider';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
msalInstance.initialize().catch(console.error);

const Login = ({ ThemeChanger }) => {
    const [passwordShow, setPasswordShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
    const [isMsalInitialized, setIsMsalInitialized] = useState(false);
    const [buttonShake, setButtonShake] = useState(false);
    const [loadingDots, setLoadingDots] = useState('');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const navigate = useNavigate();
    const { loginAuth } = useAuth();

    const [data, setData] = useState({
        email: "",  
        password: "",  
    });
    const { email, password } = data;
    
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axiosInstance.get('/getprojects');
                if (response.data && response.data.data) {
                    setProjects(response.data.data);
                    if (response.data.data.length > 0) {
                        setSelectedProject(response.data.data[0].id.toString());
                    }
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, []);
    
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'email':
                if (!value) {
                    newErrors.email = 'L\'email est requis';
                } else {
                    const usernamePattern = /^[a-zA-Z0-9._%+-]+$/;
                    if (!usernamePattern.test(value)) {
                        newErrors.email = 'Veuillez entrer un nom d\'utilisateur valide';
                    } else {
                        delete newErrors.email;
                    }
                }
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Le mot de passe est requis';
                } else {
                    delete newErrors.password;
                }
                break;
            case 'project':
                if (!value) {
                    newErrors.project = 'Veuillez sélectionner un projet';
                } else {
                    delete newErrors.project;
                }
                break;
            default:
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            // Remove @casaprestations.ma if user pastes full email
            const cleanValue = value.replace(/@casaprestations\.ma$/, '');
            setData({ ...data, [name]: cleanValue });
            validateField(name, cleanValue);
        } else {
            setData({ ...data, [name]: value });
            validateField(name, value);
        }
    };
    
    const routeChange = () => {
        const path = `${import.meta.env.BASE_URL}Home`;
        navigate(path);
    };

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingDots(prev => {
                    if (prev.length >= 3) return '';
                    return prev + '.';
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const login = async (e = null, emailwithMicrosoft = null) => {
        // Clear any existing sessions first
        localStorage.clear();
        sessionStorage.clear();
        
        if (!emailwithMicrosoft) {
            if(e){
                e.preventDefault();
            }
            
            // Clear previous errors
            const newErrors = {};
            let hasErrors = false;
            
            // Validate fields
            if (!email || !password) {
                setButtonShake(true);
                setTimeout(() => setButtonShake(false), 500);
            }
            
            if (!email) {
                newErrors.email = 'L\'email est requis';
                hasErrors = true;
            } else {
                const usernamePattern = /^[a-zA-Z0-9._%+-]+$/;
                if (!usernamePattern.test(email)) {
                    newErrors.email = 'Veuillez entrer un nom d\'utilisateur valide';
                    hasErrors = true;
                }
            }
            
            if (!password) {
                newErrors.password = 'Le mot de passe est requis';
                hasErrors = true;
            }

            setErrors(newErrors);
            
            if (hasErrors) {
                return;
            }

            setIsLoading(true);
        }

        try {
            let response = null;

            if(emailwithMicrosoft){
                
                response = await axiosInstance.post('/loginWithMicrosoft', { 
                    email: emailwithMicrosoft,
                    project_id: 1
                });
            } else {
                const fullEmail = `${email}@casaprestations.ma`;
                
                response = await axiosInstance.post('/login', { 
                    email: fullEmail, 
                    password,
                    project_id: 1
                });
            }

            
            if (response && response.data) {
                
                // Check for the nested data structure
                if (response.data.data && response.data.data.status === "success" && response.data.data.data) {
                    const userData = response.data.data.data;
                    
                    if (userData.access_token) {
                        const token = userData.access_token;
                        localStorage.setItem('access_token', token);
                        localStorage.setItem('current_project_id', selectedProject);
                        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        
                        // Wait for the profile to be fetched and user state to be updated
                        await loginAuth(response.data);
                        
                        // Small delay to ensure state is updated
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        routeChange();
                    } else {
                        setErrors({ submit: "Token d'accès manquant" });
                    }
                } else {
                    setErrors({ submit: "Format de réponse invalide" });
                }
            } else {
                setErrors({ submit: "Pas de données reçues" });
            }
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error response:', err.response);
            if (err.response && err.response.data) {
                setErrors({ submit: err.response.data.message || "Échec de l'authentification" });
                toast.error(err.response.data.message || "Échec de l'authentification", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            } else {
                setErrors({ submit: "Erreur réseau. Veuillez réessayer." });
                toast.error("Erreur réseau. Veuillez réessayer.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOffice365Login = async () => {
        if (!isMsalInitialized) {
            toast.error("Le système d'authentification est en cours d'initialisation. Veuillez réessayer dans un instant.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return;
        }

        try {
            setIsMicrosoftLoading(true);
            const accounts = msalInstance.getAllAccounts();
            
            if (accounts.length > 0) {
                const response = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account: accounts[0]
                });
                handleLoginSuccess(response);
            } else {
                const response = await msalInstance.loginPopup(loginRequest);
                if (response) {
                    handleLoginSuccess(response);
                }
            }
        } catch (error) {
            setIsMicrosoftLoading(false);
            toast.error("La connexion avec Office 365 a échoué. Veuillez réessayer.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    const handleLoginSuccess = (response) => {
        // console.log("Office 365 login successful", response.account.username);
        login(null, response.account.username);
        // Clear Microsoft session after successful login
        msalInstance.logoutPopup().catch(console.error);
    };

    useEffect(() => {
        // Clear any remaining cache when login page loads
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Clear any Microsoft sessions
        msalInstance.logoutPopup().catch(console.error);

        msalInstance.initialize()
            .then(() => {
                setIsMsalInitialized(true);
                return msalInstance.handleRedirectPromise();
            })
            .then((response) => {
                if (response) {
                    handleLoginSuccess(response);
                }
            })
            .catch((error) => {
                toast.error("Une erreur s'est produite lors de l'initialisation. Veuillez rafraîchir la page.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            });

        LocalStorageBackup(ThemeChanger);

        // Add enhanced styles for modern look and animations
        const style = document.createElement('style');
        style.innerHTML = `
            /* Form entrance animation */
            .authentication {
                animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* Container hover effect */
            .bg-white {
                transform: translateY(0);
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .bg-white:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            /* Input focus animations */
            .form-control {
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                border: 2px solid transparent;
                background: rgb(118 101 101 / 5%);
            }

            .form-control:focus {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-color: #2563eb;
            }

            /* Logo animation */
            .authentication-brand {
                animation: logoFloat 6s ease-in-out infinite;
            }

            /* Button animations */
            .ti-btn {
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }

            .ti-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
            }

            .ti-btn:active {
                transform: translateY(0);
            }

            /* Button ripple effect */
            .ti-btn::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                pointer-events: none;
                background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
                background-repeat: no-repeat;
                background-position: 50%;
                transform: scale(10, 10);
                opacity: 0;
                transition: transform .5s, opacity 1s;
            }

            .ti-btn:active::after {
                transform: scale(0, 0);
                opacity: .3;
                transition: 0s;
            }

            /* Error message animations */
            .error-message {
                animation: slideInShake 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* Domain tag styling */
            .domain-tag {
                transition: all 0.3s ease;
               background: linear-gradient(67deg, #0050ff11 0%, #43454a22 100%);
                border-left: none;
                font-weight: 500;
            }

            /* Loading spinner enhancement */
            .spinner-ring {
                animation: spin 1s linear infinite, pulse 1s ease-in-out infinite;
            }

            @keyframes fadeInScale {
                0% {
                    opacity: 0;
                    transform: scale(0.95);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes logoFloat {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }

            @keyframes slideInShake {
                0% {
                    opacity: 0;
                    transform: translateX(-10px);
                }
                60% {
                    transform: translateX(5px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }

            /* Form container glass effect */
            .login-container {
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* Dark mode enhancements */
            .dark .login-container {
                background: rgba(30, 41, 59, 0.95);
                border-color: rgba(255, 255, 255, 0.05);
            }

            .dark .form-control {
                background: rgba(255, 255, 255, 0.05);
            }

            .dark .domain-tag {
                background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%);
            }

            /* Button shake and move animation */
            @keyframes shakeMove {
                0%, 100% {
                    transform: translateY(0);
                }
                10%, 30%, 50%, 70%, 90% {
                    transform: translateY(4px) translateX(-4px);
                }
                20%, 40%, 60%, 80% {
                    transform: translateY(4px) translateX(4px);
                }
            }

            .button-shake {
                animation: shakeMove 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }

            .login-button {
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .login-button:hover {
                transform: translateY(-4px);
            }

            .login-button:active {
                transform: translateY(0);
            }

            /* Loading animation */
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }

            .loading-spinner {
                animation: spin 1s linear infinite;
            }

            .loading-dots {
                display: inline-block;
                min-width: 1.5em;
                text-align: left;
            }

            .loading-button {
                position: relative;
                overflow: hidden;
            }

            .loading-button::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 200%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.2),
                    transparent
                );
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }

            .loading-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .loading-content svg {
                animation: spin 1s linear infinite, pulse 1s ease-in-out infinite;
            }
            .text-basee {
                font-size: 16px;
                font-weight: 400;
            }

            @keyframes particle-pulse {
                0%, 100% {
                    transform: rotate(var(--rotation)) translateX(var(--distance)) scale(1);
                    opacity: 0.3;
                }
                50% {
                    transform: rotate(var(--rotation)) translateX(var(--distance)) scale(1.5);
                    opacity: 0.7;
                }
            }

            @keyframes spin-reverse-slow {
                from {
                    transform: rotate(360deg);
                }
                to {
                    transform: rotate(0deg);
                }
            }

            .animate-spin-reverse-slow {
                animation: spin-reverse-slow 15s linear infinite;
            }

            .bg-gradient-radial {
                background-image: radial-gradient(circle, var(--tw-gradient-stops));
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <Fragment>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="grid grid-cols-12 authentication mx-0 text-defaulttextcolor text-defaultsize h-screen overflow-hidden">
                <div className="xxl:col-span-12 xl:col-span-12 lg:col-span-12 col-span-12 h-full">
                    <div className="flex justify-center items-center h-full relative">
                        {/* Background Image & Overlay */}
                        <div className="absolute inset-0 z-0">
                            {/* Logo Overlay */}
                            <div className="absolute bottom-6 right-6 z-20 animate-fade-in">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/15 rounded-2xl blur-2xl group-hover:bg-white/25 group-hover:blur-3xl transition-all duration-500"></div>
                                    <img 
                                        src={logo} 
                                        alt="Casa Prestations" 
                                        className="h-20 w-auto relative filter brightness-0 invert opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]"
                                    />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                                style={{
                                    backgroundImage: `url(${loginBg})`,
                                    filter: 'brightness(0.7)'
                                }}>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-gray-900/90 to-purple-900/90"></div>
                        </div>

                        {/* Login Container */}
                        <div className="xxl:col-span-8 xl:col-span-8 lg:col-span-8 md:col-span-8 sm:col-span-10 col-span-12 w-full max-w-[450px] relative z-10">
                            <div className="login-container rounded-2xl shadow-xl backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20" style={{ padding: "47px", borderRadius: "30px" }}>
                                {/* Loading Overlay */}
                                {(isLoading || isMicrosoftLoading) && (
                                    <div className="absolute inset-0 rounded-[30px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center overflow-hidden">
                                        {/* Hexagon Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute inset-0 hexagon-pattern"></div>
                                        </div>

                                        {/* Animated Particles */}
                                        <div className="absolute inset-0">
                                            <div className="particles">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className={`particle particle-${i + 1}`}></div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Main Loading Animation */}
                                        <LoadingLogo logo={logo} size={12} />

                                        {/* Loading Text with Gradient */}
                                        <div className="relative">
                                            {/* Modern Loading Indicator */}
                                            <div className="flex justify-center items-center gap-1">
                                                <div className="loading-circle"></div>
                                                <div className="loading-circle animation-delay-200"></div>
                                                <div className="loading-circle animation-delay-400"></div>
                                            </div>
                                        </div>

                                        {/* Bottom Progress Line */}
                                        <div className="absolute bottom-0 left-0 w-full">
                                            <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-progress-line"></div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mb-3 text-center">
                                    <Link aria-label="anchor" to={`${import.meta.env.BASE_URL}`}>
                                        <img src={logo} alt="" className="authentication-brand mx-auto mb-5" style={{height: '35px'}} />
                                    </Link>
                                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Connexion</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Bienvenue sur votre espace</p>
                                </div>

                                {errors.submit && (
                                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-rose-50 border-l-4 border-rose-500 dark:bg-rose-500/10" role="alert">
                                        <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs font-medium text-rose-500">{errors.submit}</span>
                                    </div>
                                )}

                                <div className="btn-list flex flex-col gap-2 mb-3">
                                    <button 
                                        onClick={handleOffice365Login} 
                                        type="button" 
                                        disabled={isLoading}
                                        className="group relative w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-[#00a4ef] via-[#7FBA00] to-[#FFB900] dark:from-[#0078D4] dark:via-[#498205] dark:to-[#C24B0D] rounded-lg transition-all duration-500 ease-out hover:shadow-[0_6px_20px_-8px_rgba(0,164,239,0.7)] dark:hover:shadow-[0_6px_20px_-8px_rgba(0,120,212,0.7)] active:scale-[0.98] overflow-hidden border border-white/20"
                                    >
                                        {/* Animated Background Layers */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        {/* Ripple Effect Container */}
                                        <div className="absolute inset-0 overflow-hidden">
                                            <div className="absolute inset-0 group-hover:animate-ripple bg-white/20 rounded-[100%] scale-0 opacity-50"></div>
                                            </div>

                                        {/* Glow Lines */}
                                        <div className="absolute inset-0">
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-radial from-blue-400/30 to-transparent blur-lg"></div>
                                            </div>
                                            </div>

                                        <div className="relative flex items-center gap-3">
                                            {/* Microsoft Logo Container */}
                                            <div className="relative flex-shrink-0 bg-white p-1.5 rounded-md shadow-lg transform-gpu transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20">
                                                <svg className="w-4 h-4" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.5 0H0V11.5H11.5V0Z" fill="#F25022"/>
                                                    <path d="M23 0H11.5V11.5H23V0Z" fill="#7FBA00"/>
                                                    <path d="M11.5 11.5H0V23H11.5V11.5Z" fill="#00A4EF"/>
                                                    <path d="M23 11.5H11.5V23H23V11.5Z" fill="#FFB900"/>
                                                </svg>
                                                {/* Logo Glow */}
                                                <div className="absolute inset-0 rounded-md bg-gradient-radial from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex flex-col items-start transform-gpu transition-transform duration-500 group-hover:translate-y-[-1px]">
                                                <span className="text-white text-sm font-medium tracking-wide relative">
                                                    Se connecter avec Microsoft 365
                                                    {/* Text Underline Effect */}
                                                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white/60 group-hover:w-full transition-all duration-500"></span>
                                                </span>
                                            </div>

                                            {/* Loading Animation */}
                                            {isLoading && (
                                                <div className="absolute right-4 flex items-center">
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1 h-1 rounded-full bg-white/80 animate-pulse"></div>
                                                        <div className="w-1 h-1 rounded-full bg-white/80 animate-pulse delay-75"></div>
                                                        <div className="w-1 h-1 rounded-full bg-white/80 animate-pulse delay-150"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                <div className="relative text-center mb-3">
                                    <span className="authentication-barrier px-3 text-xs text-gray-500 dark:text-gray-400 relative z-10 bg-white dark:bg-gray-900">OU</span>
                                    <hr className="absolute top-1/2 left-0 w-full border-gray-200 dark:border-gray-700 -z-0"/>
                                </div>

                                <div className="space-y-3">
                                    <div className="w-full">
                                        <label htmlFor="signin-email" className="form-label inline-block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Email</label>
                                        <div className="relative">
                                            <div className="flex">
                                                <input 
                                                    type="text" 
                                                    name="email"
                                                    className={`form-control !rounded-r-none w-full !rounded-l-xl focus:outline-none py-2.5 text-sm transition-all duration-300 ${
                                                        errors.email 
                                                        ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30' 
                                                        : email 
                                                            ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                                            : 'border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500/30'
                                                    }`}
                                                    id="signin-email" 
                                                    placeholder="Nom d'utilisateur"
                                                    value={email}
                                                    onChange={changeHandler}
                                                    onKeyDown={(e) => e.key === 'Enter' && login(e)}
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    spellCheck="false"
                                                />
                                                <div className={`domain-tag inline-flex items-center px-3 !rounded-r-xl border text-sm transition-colors duration-300 `}>
                                                    @casaprestations.ma
                                                </div>
                                            </div>
                                                <div className="absolute inset-y-0 right-[160px] flex items-center pr-3 pointer-events-none">
                                                    {errors.email ? (
                                                        <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                ) : email && (
                                                        <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                        </div>
                                        {errors.email && (
                                            <div className="flex items-center gap-1.5 mt-1 error-message">
                                                <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-xs text-rose-500">{errors.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <label htmlFor="signin-password" className="form-label inline-block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Mot de passe</label>
                                        <div className="relative">
                                                <input 
                                                    type={passwordShow ? 'text' : 'password'}
                                                    name="password"
                                                    className={`form-control w-full !rounded-xl focus:outline-none py-2.5 text-sm transition-all duration-300 pr-[85px] ${
                                                        errors.password 
                                                        ? '!border-rose-500 focus:!border-rose-500 !ring-rose-500/30 focus:!ring-rose-500/30 bg-rose-50/30' 
                                                        : password 
                                                            ? '!border-emerald-500 focus:!border-emerald-500 !ring-emerald-500/30 focus:!ring-emerald-500/30'
                                                            : 'border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500/30'
                                                    }`}
                                                    id="signin-password"
                                                    placeholder="Entrez votre mot de passe"
                                                    value={password}
                                                    onChange={changeHandler}
                                                    onKeyDown={(e) => e.key === 'Enter' && login(e)}
                                                />
                                            {/* Icons Container */}
                                            <div className="absolute inset-y-0 right-0 flex items-center gap-0 pr-2">
                                                {/* Validation Icon */}
                                                <div className="flex items-center">
                                                    {errors.password ? (
                                                        <svg className="h-5 w-5 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : password && (
                                                        <svg className="h-5 w-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {/* Divider */}
                                                <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1"></div>
                                                {/* Eye Icon Button */}
                                                <button 
                                                    aria-label="Toggle password visibility"
                                                    type="button" 
                                                    className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 ${
                                                        errors.password ? '!text-rose-500' : password ? '!text-emerald-500' : 'text-gray-400'
                                                    }`}
                                                    onClick={() => setPasswordShow(!passwordShow)}
                                                >
                                                    <i className={`${passwordShow ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle text-lg leading-none`}></i>
                                                </button>
                                            </div>
                                        </div>
                                        {errors.password && (
                                            <div className="flex items-center gap-1.5 mt-1 error-message">
                                                <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-xs text-rose-500">{errors.password}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <button 
                                            onClick={login} 
                                            disabled={isLoading}
                                            className={`ti-btn mt-2 w-full bg-primary text-white !font-medium py-2 text-sm rounded-xl transition-all duration-300 login-button ${
                                                buttonShake ? 'button-shake' : ''
                                            } ${
                                                isLoading ? 'cursor-wait loading-button opacity-90' : 'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30'
                                            }`}
                                        >
                                            {isLoading ? (
                                                <div className="loading-content">
                                                    <svg className="loading-spinner h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>
                                                        Connexion en cours<span className="loading-dots">{loadingDots}</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                'Se connecter'
                                            )}
                                        </button>

                                        {/* Forgot Password Link */}
                                        <div className="mt-2 text-center">
                                            <button 
                                                type="button"
                                                className="group relative inline-flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300"
                                            >
                                                <span className="relative">
                                                    Mot de passe oublié?
                                                    <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300"></span>
                                                </span>
                                        </button>
                                        </div>
                                    </div>

                                    {/* Copyright Notice */}
                                    <div className="mt-3 text-center">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 relative inline-flex flex-col items-center">
                                            <span className="block h-px w-full mt-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></span>
                                            <span className="inline-block">
                                                © Casa Prestations - Tous droits réservés 2025
                                            </span>
                                            <span className="block h-px w-full mt-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 1.2s ease-out forwards;
                }
                @keyframes shine {
                    0% {
                        transform: translateX(-100%) skewX(-15deg);
                    }
                    50% {
                        transform: translateX(100%) skewX(-15deg);
                    }
                    100% {
                        transform: translateX(100%) skewX(-15deg);
                    }
                }
                .animate-shine > div {
                    animation: shine 3s infinite;
                }
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%) skewX(-15deg);
                    }
                    50% {
                        transform: translateX(100%) skewX(-15deg);
                    }
                    100% {
                        transform: translateX(100%) skewX(-15deg);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
                @keyframes skew-x-30 {
                    from {
                        transform: skewX(-30deg) translateX(-100%);
                    }
                    to {
                        transform: skewX(-30deg) translateX(200%);
                    }
                }
                @keyframes bounce-x {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(3px); }
                }
                .animate-bounce-x {
                    animation: bounce-x 1s infinite;
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s linear infinite;
                }
                @keyframes shimmer-fast {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .animate-shimmer-fast {
                    animation: shimmer-fast 1.5s infinite;
                }
                @keyframes ripple {
                    from {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .animate-ripple {
                    animation: ripple 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .animate-pulse {
                    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .delay-75 {
                    animation-delay: 0.2s;
                }
                .delay-150 {
                    animation-delay: 0.4s;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite ease-in-out;
                }
                
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 2s infinite ease-in-out;
                }
                
                @keyframes bounce-delay-1 {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-8px); }
                }
                .animate-bounce-delay-1 {
                    animation: bounce-delay-1 1.4s infinite ease-in-out;
                }
                
                @keyframes bounce-delay-2 {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-8px); }
                }
                .animate-bounce-delay-2 {
                    animation: bounce-delay-2 1.4s infinite ease-in-out 0.2s;
                }
                
                @keyframes bounce-delay-3 {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-8px); }
                }
                .animate-bounce-delay-3 {
                    animation: bounce-delay-3 1.4s infinite ease-in-out 0.4s;
                }
                
                @keyframes loading-progress {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .animate-loading-progress {
                    animation: loading-progress 3s linear infinite;
                }

                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes spin-slow-reverse {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }

                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }

                .animate-spin-slow-reverse {
                    animation: spin-slow-reverse 12s linear infinite;
                }

                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.97); opacity: 0.9; }
                }

                .animate-pulse-subtle {
                    animation: pulse-subtle 2s ease-in-out infinite;
                }

                @keyframes shimmer-x {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-shimmer-x {
                    animation: shimmer-x 2s ease-in-out infinite;
                }

                .loading-bar-container {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .loading-bar-segment {
                    width: 3px;
                    height: 16px;
                    background-color: var(--primary);
                    border-radius: 4px;
                    animation: loading-bar 1.2s ease-in-out infinite;
                }

                .loading-bar-segment:nth-child(2) {
                    animation-delay: 0.1s;
                }

                .loading-bar-segment:nth-child(3) {
                    animation-delay: 0.2s;
                }

                .loading-bar-segment:nth-child(4) {
                    animation-delay: 0.3s;
                }

                @keyframes loading-bar {
                    0%, 100% {
                        transform: scaleY(0.5);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scaleY(1.2);
                        opacity: 1;
                    }
                }

                /* Hexagon Pattern */
                .hexagon-pattern {
                    background-color: var(--primary);
                    opacity: 0.1;
                    background-image: 
                        linear-gradient(30deg, currentColor 12%, transparent 12.5%, transparent 87%, currentColor 87.5%, currentColor),
                        linear-gradient(150deg, currentColor 12%, transparent 12.5%, transparent 87%, currentColor 87.5%, currentColor),
                        linear-gradient(30deg, currentColor 12%, transparent 12.5%, transparent 87%, currentColor 87.5%, currentColor),
                        linear-gradient(150deg, currentColor 12%, transparent 12.5%, transparent 87%, currentColor 87.5%, currentColor),
                        linear-gradient(60deg, currentColor 25%, transparent 25.5%, transparent 75%, currentColor 75%, currentColor),
                        linear-gradient(60deg, currentColor 25%, transparent 25.5%, transparent 75%, currentColor 75%, currentColor);
                    background-size: 40px 70px;
                    background-position: 0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px;
                    animation: pattern-move 8s linear infinite;
                }

                /* Particles Animation */
                .particles {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }

                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: var(--primary);
                    border-radius: 50%;
                    animation: particle-float 4s infinite;
                }

                .particle-1 { left: 10%; animation-delay: 0s; }
                .particle-2 { left: 30%; animation-delay: 0.5s; }
                .particle-3 { left: 50%; animation-delay: 1s; }
                .particle-4 { left: 70%; animation-delay: 1.5s; }
                .particle-5 { left: 90%; animation-delay: 2s; }
                .particle-6 { left: 20%; animation-delay: 2.5s; }

                /* Loading Circle Animation */
                .loading-circle {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--primary);
                    animation: loading-circle 1.5s infinite;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }

                @keyframes loading-circle {
                    0%, 100% {
                        transform: scale(0.5);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }

                @keyframes pattern-move {
                    0% {
                        background-position: 0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px;
                    }
                    100% {
                        background-position: 40px 70px, 40px 70px, 60px 105px, 60px 105px, 40px 70px, 60px 105px;
                    }
                }

                @keyframes particle-float {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(-100px) scale(1.5);
                        opacity: 0.8;
                    }
                }

                @keyframes spin-reverse {
                    from {
                        transform: rotate(360deg);
                    }
                    to {
                        transform: rotate(0deg);
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(0.95);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.05);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes pulse-text {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                @keyframes progress-line {
                    0% {
                        transform: scaleX(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scaleX(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scaleX(0);
                        opacity: 0;
                    }
                }

                .animate-spin-reverse {
                    animation: spin-reverse 8s linear infinite;
                }

                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .animate-pulse-text {
                    animation: pulse-text 2s ease-in-out infinite;
                }

                .animate-progress-line {
                    animation: progress-line 2s ease-in-out infinite;
                }

                @keyframes gentle-float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }

                @keyframes loading-dot {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translateY(-4px);
                        opacity: 1;
                    }
                }

                .animate-gentle-float {
                    animation: gentle-float 3s ease-in-out infinite;
                }

                .animate-loading-dot {
                    animation: loading-dot 1.4s ease-in-out infinite;
                }

                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes ripple-out {
                    0% {
                        transform: scale(0.8);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.2);
                        opacity: 0;
                    }
                }

                @keyframes smooth-bounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-10px) scale(1.01);
                    }
                }

                @keyframes wave {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.5;
                    }
                    50% {
                        transform: translateY(-5px);
                        opacity: 1;
                    }
                }

                @keyframes progress-ring {
                    0% {
                        stroke-dashoffset: 283;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes pulse-segment {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .animate-gradient-shift {
                    animation: gradient-shift 3s ease infinite;
                    background-size: 200% 200%;
                }

                .animate-ripple-out {
                    animation: ripple-out 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }

                .animate-smooth-bounce {
                    animation: smooth-bounce 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                .animate-wave {
                    animation: wave 1.5s ease-in-out infinite;
                }

                .animate-progress-ring {
                    animation: progress-ring 2s linear infinite;
                }

                .animate-pulse-segment {
                    animation: pulse-segment 2s ease-in-out infinite;
                }

                .animate-spin-reverse-slow {
                    animation: spin 8s linear infinite reverse;
                }

                .animate-pulse-slow {
                    animation: pulse 3s ease-in-out infinite;
                }

                @keyframes bar-pulse {
                    0%, 100% {
                        transform: rotate(var(--rotation)) scaleY(0.3);
                        opacity: 0.3;
                    }
                    50% {
                        transform: rotate(var(--rotation)) scaleY(1);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </Fragment>
    );
};

const mapStateToProps = (state) => ({
    local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Login);