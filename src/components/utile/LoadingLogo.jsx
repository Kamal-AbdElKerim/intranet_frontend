import React from 'react';
import PropTypes from 'prop-types';

const LoadingLogo = ({ logo, size = 20 }) => {
    return (
        <div className="relative mb-8">
            {/* Dynamic Background Effect */}
            <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-shift blur-lg"></div>
            </div>

            {/* Rotating Segments */}
            <div className="absolute inset-0">
                <svg className="w-full h-full animate-spin-reverse-slow" viewBox="0 0 100 100">
                    {[...Array(8)].map((_, i) => (
                        <path
                            key={i}
                            d={`M50,50 L50,20 A30,30 0 0,1 ${
                                50 + 30 * Math.cos((i + 1) * Math.PI / 4)
                            },${
                                50 + 30 * Math.sin((i + 1) * Math.PI / 4)
                            } Z`}
                            fill={`rgba(37, 99, 235, ${0.1 - (i * 0.01)})`}
                            className="animate-pulse-segment"
                            style={{
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </svg>
            </div>

            {/* Logo Container */}
            <div className="relative transform-gpu group">
                {/* Background Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-radial from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                
                {/* Logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent animate-pulse-subtle blur-xl"></div>
                    <img 
                        src={logo} 
                        alt="Loading" 
                        className={`h-${size} w-auto relative z-10 animate-float transform-gpu transition-transform duration-700 group-hover:scale-110`}
                        style={{
                            filter: 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.3))'
                        }}
                    />
                </div>
            </div>

            {/* Loading Indicator */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-primary rounded-full animate-wave"
                            style={{
                                animationDelay: `${i * 0.15}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <style jsx="true">{`
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

                @keyframes smooth-bounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-10px) scale(1.01);
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

                .animate-gradient-shift {
                    animation: gradient-shift 3s ease infinite;
                    background-size: 200% 200%;
                }

                .animate-float {
                    animation: smooth-bounce 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                .animate-wave {
                    animation: wave 1.5s ease-in-out infinite;
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

                .bg-gradient-radial {
                    background-image: radial-gradient(circle, var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
};

LoadingLogo.propTypes = {
    logo: PropTypes.string.isRequired,
    size: PropTypes.number
};

export default LoadingLogo; 