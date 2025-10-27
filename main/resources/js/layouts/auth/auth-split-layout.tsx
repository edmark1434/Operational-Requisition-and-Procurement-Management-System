// auth-split-layout.tsx
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
                                            children,
                                            title,
                                            description,
                                        }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="min-h-dvh bg-gray-50 dark:bg-background overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(30deg,#0ea5e9_1px,transparent_1px),linear-gradient(-30deg,#0ea5e9_1px,transparent_1px)] bg-[size:60px_60px]"></div>
            </div>

            <div className="relative z-10 grid h-dvh lg:grid-cols-2">
                {/* Left Panel - Brand Section */}
                <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
                    {/* Background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/20 to-gray-900/95" />

                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_1px,transparent_1px),linear-gradient(180deg,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]"></div>
                    </div>

                    {/* Header */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center group transition-all duration-300 hover:scale-105"
                    >
                        <div className="flex items-center gap-3 p-2 rounded-lg group-hover:bg-white/5 transition-colors">
                            <AppLogoIcon className="size-8 fill-current text-white" />
                            <span className="text-2xl font-semibold tracking-tight text-white">ORPMS</span>
                        </div>
                    </Link>

                    {/* Quote Section */}
                    {quote && (
                        <div className="relative z-20 space-y-6 max-w-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-0.5 bg-blue-400 rounded-full"></div>
                                <div className="text-sm font-medium text-blue-300 uppercase tracking-wider">Inspiration</div>
                            </div>
                            <blockquote className="space-y-6">
                                <p className="text-2xl font-light leading-relaxed text-gray-200">
                                    &ldquo;{quote.message}&rdquo;
                                </p>
                                <footer className="text-gray-300 font-medium">
                                    — {quote.author}
                                </footer>
                            </blockquote>
                        </div>
                    )}

                    {/* Bottom decorative */}
                    <div className="relative z-20">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Secure Access</span>
                            <span>by RavenLabs Development</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Content Section */}
                <div className="flex items-center justify-center p-6 lg:p-8 bg-white dark:bg-background">
                    <div className="w-full max-w-md">
                        {/* Mobile Header */}
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Link
                                href={home()}
                                className="flex items-center gap-3 group mb-4"
                            >
                                <AppLogoIcon className="size-10 fill-current text-gray-900 dark:text-white" />
                                <span className="text-xl font-semibold text-gray-900 dark:text-white">{name}</span>
                            </Link>
                            <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
                        </div>

                        {/* Content Container */}
                        <div className="bg-white dark:bg-sidebar rounded-2xl shadow-xl border border-sidebar-border p-8">
                            {/* Header */}
                            <div className="text-center space-y-4 mb-8">
                                <div className="flex justify-center">
                                    <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    {title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                    {description}
                                </p>
                            </div>

                            {/* Children Content */}
                            {children}
                        </div>

                        {/* Security Note */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                                    End-to-end encrypted • Enterprise security
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
