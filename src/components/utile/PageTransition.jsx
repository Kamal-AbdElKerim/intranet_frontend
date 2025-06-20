import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingLogo from './LoadingLogo';
import logo from "../../assets/images/brand-logos/logo.png";

function PageTransition({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <>
            {children}
            {isLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300">
                    {/* Main backdrop with modern blur */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/10 dark:bg-black/20" />
                    
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                        <div className="floating-shapes" />
                    </div>

                    {/* Loading container with glass effect */}
                    <div className="relative transform scale-100">
                        <div className="relative bg-white/10 dark:bg-gray-900/10 rounded-2xl backdrop-blur-xl border border-white/10 dark:border-white/5 p-8 shadow-2xl">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 -m-2 rounded-2xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-gradient-shift blur-xl"></div>
                            </div>

                            {/* Glowing orbs */}
                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
                            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow delay-150"></div>

                            {/* Hexagon pattern with reduced opacity */}
                            <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 hexagon-pattern"></div>
                            </div>

                            {/* Loading Logo with enhanced container */}
                            <div className="relative transform-gpu">
                                <div className="relative z-10 loading-container">
                                    <LoadingLogo logo={logo} size={12} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }

                .animate-gradient-shift {
                    animation: gradient-shift 3s ease infinite;
                    background-size: 200% 200%;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }

                .delay-150 {
                    animation-delay: 150ms;
                }

                .loading-container {
                    transform-style: preserve-3d;
                    perspective: 1000px;
                }

                .floating-shapes {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(circle at 20% 20%, var(--primary) 0%, transparent 20%),
                        radial-gradient(circle at 80% 80%, var(--primary) 0%, transparent 20%),
                        radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 25%),
                        linear-gradient(45deg, var(--primary) 0%, transparent 100%);
                    filter: blur(50px);
                    opacity: 0.1;
                    animation: float 10s ease-in-out infinite;
                }

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

                @keyframes pattern-move {
                    0% {
                        background-position: 0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px;
                    }
                    100% {
                        background-position: 40px 70px, 40px 70px, 60px 105px, 60px 105px, 40px 70px, 60px 105px;
                    }
                }

                /* Glass morphism effect */
                .backdrop-blur-xl {
                    backdrop-filter: blur(16px) saturate(180%);
                }

                /* Enhanced shadow with color */
                .shadow-2xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                              0 0 30px -12px rgba(var(--primary), 0.2);
                }

                /* Smooth scale animation on mount */
                .transform.scale-100 {
                    animation: mount 0.3s ease-out forwards;
                }

                @keyframes mount {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </>
    );
}

export default PageTransition; 