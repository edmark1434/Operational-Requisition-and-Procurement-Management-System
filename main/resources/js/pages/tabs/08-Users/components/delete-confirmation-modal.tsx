// components/delete-confirmation-modal.tsx
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface User {
    id: number;
    fullname: string;
    username: string;
    role: string;
}

interface DeleteConfirmationModalProps {
    user: User;
    onConfirm: () => void;
    onClose: () => void;
}

export default function DeleteConfirmationModal({ user, onConfirm, onClose }: DeleteConfirmationModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete User
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{user.fullname}"? This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete User
                    </Button>
                </div>
            </div>
        </div>
    );
}
