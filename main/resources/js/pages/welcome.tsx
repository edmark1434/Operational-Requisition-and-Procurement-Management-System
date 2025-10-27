import { login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    LogIn,
    ClipboardList,
    Package,
    ShoppingCart,
    BarChart3,
    Shield,
    Users,
    Settings
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            id: 'requisition',
            icon: ClipboardList,
            text: 'Requisition Management',
            description: 'Streamline request and approval workflows'
        },
        {
            id: 'inventory',
            icon: Package,
            text: 'Inventory Tracking',
            description: 'Real-time stock monitoring and management'
        },
        {
            id: 'purchase',
            icon: ShoppingCart,
            text: 'Purchase Orders',
            description: 'Efficient procurement order processing'
        },
        {
            id: 'analytics',
            icon: BarChart3,
            text: 'Real-time Analytics',
            description: 'Comprehensive reporting and insights'
        }
    ];

    return (
        <>
            <Head title="ORPMS - Operational Requisition & Procurement Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            {/* Animated Gradient Background */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden relative">
                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-transparent to-purple-200/20 animate-gradient-x"></div>

                {/* Moving Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-600 dark:to-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float-slow"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float-medium"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-300 to-blue-300 dark:from-cyan-600 dark:to-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse-slow"></div>
                </div>

                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-between max-w-7xl mx-auto">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-12 w-12 items-center justify-center">
                                        <img
                                            src="/app-logo-light.svg"
                                            alt="App Logo"
                                            className="size-12"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white text-xl">ORPMS</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">BCJ Logistics</div>
                                    </div>
                                </div>
                                <div className="hidden md:block pl-4 border-l border-gray-300 dark:border-gray-600">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Developed by</div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">RavenLabs Development</div>
                                </div>
                            </div>
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center space-x-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center space-x-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Login</span>
                                </Link>
                            )}
                        </nav>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column - Content */}
                            <div className={`text-center lg:text-left space-y-8 transition-all duration-1000 ease-out ${
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}>
                                <div className="space-y-6">
                                    <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-200 dark:border-blue-800 shadow-sm">
                                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Welcome to ORPMS</span>
                                    </div>

                                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                        Streamline Your
                                        <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            Procurement Workflow
                                        </span>
                                    </h1>

                                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                                        Experience seamless requisition management, real-time inventory tracking,
                                        and efficient procurement processes with our comprehensive management system
                                        designed specifically for BCJ Logistics.
                                    </p>
                                </div>

                                {/* Feature Grid with Tooltip Popups */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl relative">
                                    {features.map((feature, index) => (
                                        <div
                                            key={feature.id}
                                            className="relative"
                                            onMouseEnter={() => setHoveredFeature(feature.id)}
                                            onMouseLeave={() => setHoveredFeature(null)}
                                        >
                                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-help">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                                    <feature.icon className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-700 dark:text-gray-300">{feature.text}</div>
                                                </div>
                                            </div>

                                            {/* Tooltip Popup - Description Only */}
                                            {hoveredFeature === feature.id && (
                                                <div className="absolute z-20 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
                                                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg py-3 px-4 shadow-xl w-64 text-center">
                                                        <div className="text-gray-300 dark:text-gray-300 leading-relaxed">
                                                            {feature.description}
                                                        </div>
                                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Get Started CTA */}
                                <div className="space-y-6">
                                    <div className="flex justify-center lg:justify-start">
                                        <Link
                                            href={login()}
                                            className="group inline-flex items-center justify-center space-x-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 ease-out hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        >
                                            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                            <span>Get Started</span>
                                        </Link>
                                    </div>

                                    {/* Admin Note */}
                                    {/*<div className="max-w-md p-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-sm">*/}
                                    {/*    <div className="flex items-start space-x-3">*/}
                                    {/*        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />*/}
                                    {/*        <div>*/}
                                    {/*            <p className="text-sm text-blue-700 dark:text-blue-300">*/}
                                    {/*                <strong>Managed Access:</strong> System accounts are administered by authorized personnel.*/}
                                    {/*                Please contact your administrator for account setup and access.*/}
                                    {/*            </p>*/}
                                    {/*        </div>*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                </div>
                            </div>

                            {/* Right Column - Visual */}
                            <div className={`hidden lg:block transition-all duration-1000 ease-out delay-300 ${
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}>
                                <div className="relative">
                                    {/* Floating Cards */}
                                    <div className="absolute -top-8 -left-8 w-64 h-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-800 p-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <div className="h-3 w-20 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                                            </div>
                                            <div className="h-2 w-32 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                                            <div className="h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 rounded-lg"></div>
                                        </div>
                                    </div>

                                    {/* Main System Card */}
                                    <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-200 dark:border-blue-800 p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-100 dark:border-indigo-800">
                                            {/* Mock Header */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center space-x-2">
                                                    <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    <div className="h-4 w-28 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 shadow-sm flex items-center justify-center">
                                                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700 shadow-sm flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mock Stats */}
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="h-20 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                                                    <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="h-20 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                                                    <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
                                                </div>
                                            </div>

                                            {/* Mock Content */}
                                            <div className="space-y-4">
                                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
                                                <div className="h-24 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-blue-800"></div>
                                                <div className="h-24 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-blue-800"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Card 2 */}
                                    <div className="absolute -bottom-6 -right-6 w-56 h-32 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-800 p-4 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <div className="h-2 w-16 bg-green-200 dark:bg-green-700 rounded-full"></div>
                                            </div>
                                            <div className="h-8 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="w-full py-8 px-4 sm:px-6 lg:px-8 border-t border-blue-200/50 dark:border-blue-800/50">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <div className="text-center md:text-left">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        © 2024 ORPMS - Operational Requisition and Procurement Management System
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Proudly developed by <span className="font-semibold text-blue-600 dark:text-blue-400">RavenLabs Development</span> for BCJ Logistics
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Shield className="w-4 h-4" />
                                    <span>Secure • Reliable • Efficient</span>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            <style>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 15s ease infinite;
                }

                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                .animate-float-slow {
                    animation: float-slow 20s ease-in-out infinite;
                }

                @keyframes float-medium {
                    0%, 100% { transform: translateX(0px) translateY(0px); }
                    33% { transform: translateX(30px) translateY(-15px); }
                    66% { transform: translateX(-20px) translateY(10px); }
                }
                .animate-float-medium {
                    animation: float-medium 25s ease-in-out infinite;
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 10s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
