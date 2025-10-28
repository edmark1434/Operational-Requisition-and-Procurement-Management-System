// login.tsx
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { local } from '@/routes/storage';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Shield, User, Lock } from 'lucide-react';
import { use, useEffect, useState  } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [isLocked, setIsLocked] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
    const lockedTime = localStorage.getItem("lockedTime");
    if (!lockedTime) {
        localStorage.removeItem("lockedTime");
        setIsLocked(false);
        setMessage("");
        return;
    }

    const lockDate = new Date(lockedTime);

    const updateLockState = () => {
        const now = new Date();
        const remaining = Math.floor((lockDate.getTime() - now.getTime()) / 1000);

        if (remaining <= 0) {
            clearInterval(interval);
            localStorage.removeItem("lockedTime");
            setIsLocked(false);
            setMessage("");
        } else {
            setIsLocked(true);
            setMessage(`Too many login attempts. Please try again in ${remaining} seconds.`);
        }
    };

    // Run once immediately to show the message right away
        updateLockState();

        // Then run every second
        const interval = setInterval(updateLockState, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthLayout
            title="Welcome back"
            description="Log-in to your account to continue"
        >
            <Head title="Sign in" />

            <Form
                method="post"
                action="/login"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => 
                    {
                        useEffect(() => {
                            
                            if (errors?.credentials?.toLowerCase().includes("too many login attempts")) {
                                setIsLocked(true);
                                const lockTime = new Date();
                                lockTime.setMinutes(lockTime.getMinutes() + 2);
                                localStorage.setItem("lockedTime",lockTime.toISOString());
                                const lock = () => {
                                    const now = new Date();
                                    const remaining = Math.floor((lockTime.getTime() - now.getTime()) / 1000);
                                    if (remaining <= 0) {
                                        clearInterval(interval);
                                        localStorage.removeItem("lockedTime");
                                        setIsLocked(false);
                                        setMessage("");
                                    } else {
                                        setMessage(`Too many login attempts. Please try again in ${remaining} seconds.`);
                                    }
                                };
                                lock();
                                const interval = setInterval(lock, 1000);
                                return () =>{ 
                                    errors.credentials = "";
                                    clearInterval(interval);
                                };
                            } else {
                                setMessage(errors.credentials || "");
                                setIsLocked(false);
                            }
                        }, [errors]);
                        return (
                        <>
                            <div className="space-y-6">
                                {/* Username field */}
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-medium text-gray-900 dark:text-white">
                                        Username
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                            id="username"
                                            type="text"
                                            name="username"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="username"
                                            placeholder="Enter your username"
                                            className="pl-10 h-11 bg-white dark:bg-input border-sidebar-border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Password field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                //href
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className="pl-10 h-11 bg-white dark:bg-input border-sidebar-border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Error message */}
                                {message && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <Shield className="h-4 w-4 text-red-500 dark:text-red-400" />
                                        <InputError message={message} className="text-sm text-red-700 dark:text-red-300" />
                                    </div>
                                )}

                                {/* Remember me */}
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-sidebar-border bg-white dark:bg-input data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-gray-900 dark:text-white cursor-pointer">
                                        Remember Me
                                    </Label>
                                </div>

                                {/* Submit button */}
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 font-medium"
                                    tabIndex={4}
                                    disabled={processing || isLocked}
                                    data-test="login-button"
                                >   
                                    {processing ? (
                                        <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Signing in...
                                        </>
                                    ) : isLocked ? (
                                        "Locked — Try Again Later"
                                    ) : (
                                        "Login Now"
                                    )}
                                </Button>
                            </div>
                        </>
                        );
                    }
                }
            </Form>

            {/* Status message */}
            {status && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                        {status}
                    </p>
                </div>
            )}
        </AuthLayout>
    );
}
