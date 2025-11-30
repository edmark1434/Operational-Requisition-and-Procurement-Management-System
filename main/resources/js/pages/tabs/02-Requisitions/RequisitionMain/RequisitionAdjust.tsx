import AppLayout from '@/layouts/app-layout';
import { requisitions } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

// Import components
import RequestedItemAdjust from '../RequisitionForm/RequestedItemAdjust';
import RequisitionPreviewModal from '../RequisitionForm/RequisitionPreviewModal';

interface RequisitionEditProps {
    auth: any;
    requisitionId: number;
    // Props from Controller
    serverRequisition: any;
    initialItems: RequisitionItem[];
    initialServices: RequisitionService[];
}

interface RequisitionItem {
    id: string;
    category: string;
    itemName: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    itemId?: number;
    originalItemId?: number;
    approvedQuantity?: string;
}

interface RequisitionService {
    id: string;
    serviceId?: string;
    serviceName: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    hourlyRate?: string;
    originalServiceId?: number;
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    services?: string;
    [key: string]: string | undefined;
}

const breadcrumbs = (requisitionId: number): BreadcrumbItem[] => [
    {
        title: 'RequisitionMain',
        href: requisitions().url,
    },
    {
        title: `Adjust Requisition #${requisitionId}`,
        href: `/requisitions/${requisitionId}/adjust`,
    },
];

export default function RequisitionEdit({
                                            auth,
                                            requisitionId,
                                            serverRequisition,
                                            initialItems,
                                            initialServices
                                        }: RequisitionEditProps) {

    // --- STATE ---
    const [items, setItems] = useState<RequisitionItem[]>([]);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- INITIALIZE FORM WITH SERVER DATA ---
    useEffect(() => {
        if (serverRequisition) {
            // Load Items from Controller Props with approvedQuantity
            if (initialItems && initialItems.length > 0) {
                const itemsWithApprovedQty = initialItems.map(item => ({
                    ...item,
                    approvedQuantity: item.approvedQuantity || item.quantity, // Default to original quantity if not set
                    isSaved: true // All items start as saved in adjust mode
                }));
                setItems(itemsWithApprovedQty);
            }

            // Stop Loading
            setIsLoading(false);
        }
    }, [serverRequisition, initialItems]);

    // --- ITEM ACTIONS ---
    const updateItemApprovedQuantity = (id: string, approvedQuantity: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, approvedQuantity, isSaved: false }; // Mark as unsaved when editing
            }
            return item;
        }));
        // Clear validation errors when user starts typing
        if (approvedQuantity && validationErrors.items) {
            setValidationErrors(prev => ({ ...prev, items: undefined }));
        }
    };

    const saveItem = (id: string) => {
        const itemToSave = items.find(item => item.id === id);
        if (!itemToSave) return;

        if (!itemToSave.approvedQuantity || isNaN(parseFloat(itemToSave.approvedQuantity))) {
            alert('Please enter a valid approved quantity before saving.');
            return;
        }

        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, isSaved: true } : item
        ));
    };

    const editItem = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, isSaved: false } : item
        ));
    };

    // --- SUBMISSION ---
    const getTotalAmount = () => {
        return items.reduce((sum, item) => {
            const approvedQty = parseFloat(item.approvedQuantity || '0') || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            return sum + (approvedQty * unitPrice);
        }, 0);
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        // Check if all items are saved
        const unsavedItems = items.filter(item => !item.isSaved);
        if (unsavedItems.length > 0) {
            errors.items = 'Please save all items before submitting';
        }

        // Validate that approved quantities are provided and are valid numbers
        const invalidApprovedQuantities = items.filter(item =>
            !item.approvedQuantity ||
            isNaN(parseFloat(item.approvedQuantity)) ||
            parseFloat(item.approvedQuantity) < 0
        );

        if (invalidApprovedQuantities.length > 0) {
            errors.items = 'Please enter valid approved quantities for all items';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = {
            requisitionId,
            requestor: serverRequisition.requestor || auth.user.fullname,
            priority: serverRequisition.priority || 'normal',
            type: 'items', // Only items for adjustment
            notes: serverRequisition.notes || '',
            items: items.map(item => ({
                ...item,
                itemId: item.itemId || null,
                originalItemId: item.originalItemId,
                approvedQuantity: item.approvedQuantity
            })),
            total_amount: getTotalAmount(),
            us_id: serverRequisition.user_id || auth.user.id
        };

        setPreviewData(formData);
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        console.log("Updating with approved quantities:", previewData);
        alert('Requisition updated with approved quantities (Mock)');
        setShowPreview(false);
        router.visit(requisitions().url);
    };

    const handleCancel = () => {
        if (window.confirm('Discard changes?')) {
            router.visit(requisitions().url);
        }
    };

    const hasError = (id: string, field: string) => {
        const item = items.find(item => item.id === id);
        if (!item) return false;

        if (validationErrors.items) {
            if (field === 'quantity' && (!item.approvedQuantity || isNaN(parseFloat(item.approvedQuantity)))) {
                return true;
            }
        }
        return false;
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
                <Head title="Adjust Requisition" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Adjust Requisition</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
            <Head title="Adjust Requisition" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Adjust Requisition</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Adjusting Requisition #{requisitionId} - Set Approved Quantities
                        </p>
                    </div>
                    <Link
                        href={requisitions().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700"
                    >
                        Return to Requisitions
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Adjust Requisition #{requisitionId}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Set approved quantities for requested items
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="grid grid-cols-1 gap-6 mb-8">
                                        <RequestedItemAdjust
                                            items={items}
                                            validationErrors={validationErrors}
                                            updateItemApprovedQuantity={updateItemApprovedQuantity}
                                            hasError={hasError}
                                            saveItem={saveItem}
                                            editItem={editItem}
                                        />
                                    </div>

                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold"
                                            >
                                                Update Approved Quantities
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <RequisitionPreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleConfirmSubmit}
                    formData={previewData}
                />
            </div>
        </AppLayout>
    );
}
