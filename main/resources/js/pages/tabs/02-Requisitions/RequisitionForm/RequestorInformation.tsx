import { useEffect, useRef } from 'react';

interface RequestorInformationProps {
    requestorType: 'self' | 'other';
    setRequestorType: (type: 'self' | 'other') => void;
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    otherRequestor: string;
    setOtherRequestor: (name: string) => void;
    showUserDropdown: boolean;
    setShowUserDropdown: (show: boolean) => void;
    validationErrors: any;
    setValidationErrors: (errors: any) => void;
    auth: any;
    systemUsers: any[];
}

export default function RequestorInformation({
                                                 requestorType,
                                                 setRequestorType,
                                                 setSelectedUser,
                                                 otherRequestor,
                                                 setOtherRequestor,
                                                 showUserDropdown,
                                                 setShowUserDropdown,
                                                 validationErrors,
                                                 setValidationErrors,
                                                 auth,
                                                 systemUsers,
                                             }: RequestorInformationProps) {

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowUserDropdown]);

    const handleManualInput = (value: string) => {
        setOtherRequestor(value);
        setSelectedUser(''); // Clear the ID because the user is typing manually/editing
        setShowUserDropdown(true); // Show dropdown while typing
        setValidationErrors((prev: any) => ({ ...prev, requestor: undefined }));
    };

    const handleSelectUser = (user: any) => {
        setOtherRequestor(user.name); // Set the Input Text
        setSelectedUser(user.id);     // Set the ID for the database
        setShowUserDropdown(false);   // Hide the dropdown
        setValidationErrors((prev: any) => ({ ...prev, requestor: undefined }));
    };

    // Filter users based on input
    const filteredUsers = systemUsers.filter(user =>
        user.name.toLowerCase().includes(otherRequestor.toLowerCase())
    );

    return (
        <div className="p-4 border border-gray-200 dark:border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Requestor Information
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Requesting For
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="self"
                                checked={requestorType === 'self'}
                                onChange={(e) => {
                                    setRequestorType(e.target.value as 'self' | 'other');
                                    setShowUserDropdown(false);
                                    setValidationErrors((prev: any) => ({ ...prev, requestor: undefined }));
                                }}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Myself</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="other"
                                checked={requestorType === 'other'}
                                onChange={(e) => {
                                    setRequestorType(e.target.value as 'self' | 'other');
                                    setValidationErrors((prev: any) => ({ ...prev, requestor: undefined }));
                                }}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Someone Else</span>
                        </label>
                    </div>
                </div>

                {requestorType === 'self' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Requestor
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-sidebar-accent border border-gray-300 dark:border-sidebar-border rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {auth.user.fullname.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {auth.user.fullname}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Logged in user
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 relative" ref={dropdownRef}>
                        {/* Manual Input / Search Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Requestor Name
                            </label>
                            <input
                                type="text"
                                value={otherRequestor}
                                onChange={(e) => handleManualInput(e.target.value)}
                                onFocus={() => setShowUserDropdown(true)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white ${
                                    validationErrors.requestor
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-300 dark:border-sidebar-border'
                                }`}
                                placeholder="Search or enter requestor's name"
                                autoComplete="off"
                            />
                        </div>

                        {/* Autocomplete Dropdown */}
                        {showUserDropdown && otherRequestor && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-sidebar-accent border border-gray-200 dark:border-sidebar-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredUsers.map((user) => (
                                            <li
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex flex-col"
                                            >
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                        No users found. Using "{otherRequestor}" as manual entry.
                                    </div>
                                )}
                            </div>
                        )}

                        {validationErrors.requestor && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.requestor}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
