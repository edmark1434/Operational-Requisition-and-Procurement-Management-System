// RequisitionEdit.tsx - Updated version (without description field)
import AppLayout from '@/layouts/app-layout';
import { requisitions } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Import your datasets
import itemsData from "@/pages/datasets/items";
import categoriesData from "@/pages/datasets/category";
import usersData from '@/pages/datasets/user';
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from "@/pages/datasets/requisition_item";

// Import components
import RequestorInformation from './RequestorInformation';
import RequisitionDetails from './RequisitionDetails';
import RequestedItems from './RequestedItems';
import RequisitionPreviewModal from './RequisitionPreviewModal';

interface RequisitionEditProps {
    auth: any;
    requisitionId: number;
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
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    [key: string]: string | undefined;
}

const breadcrumbs = (requisitionId: number): BreadcrumbItem[] => [
    {
        title: 'RequisitionMain',
        href: requisitions().url,
    },
    {
        title: `Edit Requisition #${requisitionId}`,
        href: `/requisitions/${requisitionId}/edit`,
    },
];

export default function RequisitionEdit({ auth, requisitionId }: RequisitionEditProps) {
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [priority, setPriority] = useState('normal');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<RequisitionItem[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [originalRequisition, setOriginalRequisition] = useState<any>(null);

    // Use actual users from dataset
    const systemUsers = usersData.map(user => ({
        id: user.US_ID.toString(),
        name: user.NAME,
        email: `${user.NAME}@company.com`,
        department: 'General'
    }));

    // Use actual categories from dataset
    const categories = categoriesData.map(cat => ({
        id: cat.CAT_ID,
        name: cat.NAME,
        description: cat.DESCRIPTION
    }));

    // Use actual items for autocomplete or suggestions
    const systemItems = itemsData.map(item => ({
        id: item.ITEM_ID,
        name: item.NAME,
        category: categories.find(cat => cat.id === item.CATEGORY_ID)?.name || 'Unknown',
        unitPrice: item.UNIT_PRICE,
        barcode: item.BARCODE
    }));

    // Load requisition data on component mount
    useEffect(() => {
        loadRequisitionData();
    }, [requisitionId]);

    const loadRequisitionData = () => {
        setIsLoading(true);

        try {
            // Find the requisition to edit
            const requisition = requisitionsData.find(req => req.REQ_ID === requisitionId);

            if (!requisition) {
                console.error(`Requisition #${requisitionId} not found`);
                alert('Requisition not found!');
                router.visit(requisitions().url);
                return;
            }

            setOriginalRequisition(requisition);

            // Set basic form data
            setPriority(requisition.PRIORITY.toLowerCase());
            setNotes(requisition.NOTES || '');

            // Determine requestor type and set requestor fields
            const isSelf = requisition.US_ID === auth.user.id;
            setRequestorType(isSelf ? 'self' : 'other');

            if (isSelf) {
                setSelectedUser('');
                setOtherRequestor('');
            } else {
                // Check if requestor is in system users
                const userInSystem = systemUsers.find(user =>
                    user.name.toLowerCase() === requisition.REQUESTOR.toLowerCase()
                );

                if (userInSystem) {
                    setSelectedUser(userInSystem.name);
                    setOtherRequestor('');
                } else {
                    setSelectedUser('');
                    setOtherRequestor(requisition.REQUESTOR);
                }
            }

            // Load requisition items
            const requisitionItems = requisitionItemsData
                .filter(item => item.REQ_ID === requisitionId)
                .map(reqItem => {
                    const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
                    const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);

                    return {
                        id: `existing_${reqItem.REQT_ID}`,
                        category: reqItem.CATEGORY || category?.NAME || '',
                        itemName: itemDetails?.NAME || '',
                        quantity: reqItem.QUANTITY.toString(),
                        unit_price: itemDetails?.UNIT_PRICE?.toString() || '0',
                        total: ((itemDetails?.UNIT_PRICE || 0) * reqItem.QUANTITY).toFixed(2),
                        isSaved: true,
                        itemId: reqItem.ITEM_ID,
                        originalItemId: reqItem.ITEM_ID
                    };
                });

            setItems(requisitionItems);
        } catch (error) {
            console.error('Error loading requisition data:', error);
            alert('Error loading requisition data!');
            router.visit(requisitions().url);
        } finally {
            setIsLoading(false);
        }
    };

    const addNewItem = () => {
        const newItem = {
            id: Date.now().toString(),
            category: '',
            itemName: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false
        };
        setItems(prev => [newItem, ...prev]);
        setValidationErrors(prev => ({ ...prev, items: undefined }));
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof RequisitionItem, value: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value, isSaved: false };

                // Only calculate total when quantity OR unit_price is manually changed
                // Not when itemName is selected
                if (field === 'quantity' && item.unit_price) {
                    const quantity = parseFloat(value) || 0;
                    const unitPrice = parseFloat(item.unit_price) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                } else if (field === 'unit_price' && item.quantity) {
                    const quantity = parseFloat(item.quantity) || 0;
                    const unitPrice = parseFloat(value) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                }

                return updatedItem;
            }
            return item;
        }));

        if (field === 'quantity' || field === 'category' || field === 'itemName') {
            setValidationErrors(prev => ({ ...prev, items: undefined }));
        }
    };

    const saveItem = (id: string) => {
        const itemToSave = items.find(item => item.id === id);
        if (!itemToSave) return;

        // Validate required fields
        if (!itemToSave.itemName.trim() || !itemToSave.quantity.trim() || !itemToSave.category.trim()) {
            alert('Please fill in category, item name and quantity before saving the item.');
            return;
        }

        // Link to actual item if it exists in the system
        const matchedSystemItem = systemItems.find(sysItem =>
            sysItem.name.toLowerCase() === itemToSave.itemName.toLowerCase()
        );

        setItems(prev => {
            const updatedItems = prev.map(item =>
                item.id === id ? {
                    ...item,
                    isSaved: true,
                    itemId: matchedSystemItem?.id
                } : item
            );

            const savedItem = updatedItems.find(item => item.id === id);
            if (savedItem) {
                const filteredItems = updatedItems.filter(item => item.id !== id);
                return [...filteredItems, savedItem];
            }

            return updatedItems;
        });
    };

    const editItem = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, isSaved: false }
                : item
        ));
    };

    const getTotalAmount = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        // Validate requestor
        if (requestorType === 'other' && !otherRequestor.trim() && !selectedUser) {
            errors.requestor = 'Please select or enter a requestor name';
        }

        // Validate items
        const unsavedItems = items.filter(item => !item.isSaved);
        if (unsavedItems.length > 0) {
            errors.items = 'Please save all items before submitting';
        }

        if (items.length === 0) {
            errors.items = 'Please add at least one item';
        }

        const invalidItems = items.filter(item =>
            !item.isSaved && (!item.itemName.trim() || !item.quantity.trim() || !item.category.trim())
        );
        if (invalidItems.length > 0) {
            errors.items = 'All items must have category, item name and quantity filled out before saving';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const finalRequestor = requestorType === 'self'
            ? auth.user.name
            : selectedUser || otherRequestor;

        const formData = {
            requisitionId,
            requestor: finalRequestor,
            priority,
            notes,
            items: items.map(item => ({
                ...item,
                itemId: item.itemId || null,
                originalItemId: item.originalItemId
            })),
            total_amount: getTotalAmount(),
            us_id: requestorType === 'self' ? auth.user.id :
                selectedUser ? parseInt(selectedUser) : null
        };

        setPreviewData(formData);
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        // TODO: Add update logic when backend is ready
        alert('Requisition updated successfully! (Demo mode)');
        setShowPreview(false);
        router.visit('/requisitions');
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(requisitions().url);
        }
    };

    const hasError = (itemId: string, field: 'quantity' | 'category' | 'itemName') => {
        const item = items.find(item => item.id === itemId);
        if (!item || item.isSaved) return false;

        if (validationErrors.items) {
            if (field === 'quantity' && !item.quantity.trim()) return true;
            if (field === 'category' && !item.category.trim()) return true;
            if (field === 'itemName' && !item.itemName.trim()) return true;
        }
        return false;
    };

    const getItemSuggestions = (itemName: string) => {
        if (!itemName.trim()) return [];
        return systemItems.filter(item =>
            item.name.toLowerCase().includes(itemName.toLowerCase())
        ).slice(0, 5);
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
                <Head title="Edit Requisition" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Requisition</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading requisition data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
            <Head title="Edit Requisition" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Requisition</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Editing Requisition #{requisitionId}
                        </p>
                    </div>
                    <Link
                        href={requisitions().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Requisitions
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section - Updated colors and removed warning */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Edit Requisition #{requisitionId}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Update the requisition details below.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    {/* Requisition Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                        {/* Left Column - Smaller */}
                                        <div className="space-y-6 lg:col-span-1">
                                            <RequestorInformation
                                                requestorType={requestorType}
                                                setRequestorType={setRequestorType}
                                                selectedUser={selectedUser}
                                                setSelectedUser={setSelectedUser}
                                                otherRequestor={otherRequestor}
                                                setOtherRequestor={setOtherRequestor}
                                                showUserDropdown={showUserDropdown}
                                                setShowUserDropdown={setShowUserDropdown}
                                                validationErrors={validationErrors}
                                                setValidationErrors={setValidationErrors}
                                                auth={auth}
                                                systemUsers={systemUsers}
                                            />

                                            <RequisitionDetails
                                                priority={priority}
                                                setPriority={setPriority}
                                                notes={notes}
                                                setNotes={setNotes}
                                            />
                                        </div>

                                        {/* Right Column - Items Section (Wider) */}
                                        <RequestedItems
                                            items={items}
                                            setItems={setItems}
                                            validationErrors={validationErrors}
                                            setValidationErrors={setValidationErrors}
                                            categories={categories}
                                            systemItems={systemItems}
                                            getTotalAmount={getTotalAmount}
                                            updateItem={updateItem}
                                            saveItem={saveItem}
                                            removeItem={removeItem}
                                            addNewItem={addNewItem}
                                            hasError={hasError}
                                            getItemSuggestions={getItemSuggestions}
                                            editItem={editItem}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Update Requisition
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Modal */}
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
