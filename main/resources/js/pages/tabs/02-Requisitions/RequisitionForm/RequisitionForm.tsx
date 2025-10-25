// import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from '@/layouts/app-layout';
import { requisitions, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
// import { UserInfo } from '@/components/user-info';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions / Form',
        href: requisitionform().url,
    },
];

interface RequisitionItem {
    id: string;
    category: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    itemId?: number;
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    [key: string]: string | undefined;
}

export default function RequisitionForm({ auth }: { auth: any }) {
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [priority, setPriority] = useState('normal');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<RequisitionItem[]>([
        { id: '1', category: '', description: '', quantity: '', unit_price: '', total: '', isSaved: false }
    ]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

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

    const addNewItem = () => {
        const newItem = {
            id: Date.now().toString(),
            category: '',
            description: '',
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

                if (field === 'quantity' || field === 'unit_price') {
                    const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
                    const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(item.unit_price) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                }

                // Auto-fill unit price if an existing item is selected
                if (field === 'description') {
                    const matchedItem = systemItems.find(sysItem =>
                        sysItem.name.toLowerCase() === value.toLowerCase()
                    );
                    if (matchedItem) {
                        updatedItem.unit_price = matchedItem.unitPrice.toString();
                        updatedItem.category = matchedItem.category;
                        const quantity = parseFloat(updatedItem.quantity) || 0;
                        updatedItem.total = (quantity * matchedItem.unitPrice).toFixed(2);
                    }
                }

                return updatedItem;
            }
            return item;
        }));

        if (field === 'description' || field === 'quantity' || field === 'category') {
            setValidationErrors(prev => ({ ...prev, items: undefined }));
        }
    };

    const saveItem = (id: string) => {
        const itemToSave = items.find(item => item.id === id);
        if (!itemToSave) return;

        // Validate required fields
        if (!itemToSave.description.trim() || !itemToSave.quantity.trim() || !itemToSave.category.trim()) {
            alert('Please fill in category, description and quantity before saving the item.');
            return;
        }

        // Link to actual item if it exists in the system
        const matchedSystemItem = systemItems.find(sysItem =>
            sysItem.name.toLowerCase() === itemToSave.description.toLowerCase()
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

    // Add the editItem function
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
            !item.isSaved && (!item.description.trim() || !item.quantity.trim() || !item.category.trim())
        );
        if (invalidItems.length > 0) {
            errors.items = 'All items must have category, description and quantity filled out before saving';
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
            ? auth.user.fullname
            : selectedUser || otherRequestor;

        const formData = {
            requestor: finalRequestor,
            priority,
            notes,
            items: items.map(item => ({
                ...item,
                itemId: item.itemId || null
            })),
            total_amount: getTotalAmount(),
            us_id: requestorType === 'self' ? auth.user.id :
                selectedUser ? parseInt(selectedUser) : null
        };

        // Show preview instead of submitting directly
        setPreviewData(formData);
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        // Generate new requisition ID (in real app, this would come from backend)
        // REMOVE all the data manipulation and creation here, the backend will handle it.
        // REMOVE: const newReqId = ...
        // REMOVE: const requisitionData = ...
        // REMOVE: const newRequisitionItemsData = ...

        // The data prepared in handleSubmit is in previewData.
        // We'll use the items and other fields from it.
        const submissionData = {
            // user_id will be handled by the controller using auth()
            requestor: previewData.requestor,
            priority: previewData.priority,
            notes: previewData.notes,
            // The controller will also handle setting the default 'PENDING' status

            // Pass the items array so the controller can save them as line items
            items: previewData.items.map((item: any) => ({
                itemId: item.itemId, // Null if not matched to a system item
                quantity: parseInt(item.quantity),
                category: item.category,
                description: item.description, // Pass description for custom items
                unit_price: parseFloat(item.unit_price) // Assuming you'll save this too
            })),
        };

        // 🚀 Inertia POST Request to Laravel Controller
        router.post('/requisition/store', submissionData, {
            onSuccess: () => {
                alert('Requisition submitted successfully!');
                setShowPreview(false);
                clearForm();
            },
            onError: (errors) => {
                // Handle server-side validation errors or other issues
                console.error('Submission failed:', errors);
                alert('Requisition submission failed. Check console for details.');
                setShowPreview(false);
            }
        });
    };

        // Prepare requisition items data
        const newRequisitionItemsData = previewData.items.map((item: any, index: number) => ({
            REQT_ID: 7000 + index + 1, // Simple incremental IDs
            REQ_ID: newReqId,
            ITEM_ID: item.itemId || null, // Link to actual item if exists
            QUANTITY: parseInt(item.quantity),
            CATEGORY: item.category
        }));

        console.log('Requisition Data:', requisitionData);
        console.log('Requisition Items:', newRequisitionItemsData);

        // In a real application, you would send this data to your backend
        // For now, we'll just log it and show success message
        alert('Requisition submitted successfully!');
        setShowPreview(false);
        clearForm();
    };

    const clearForm = () => {
        setRequestorType('self');
        setOtherRequestor('');
        setSelectedUser('');
        setPriority('normal');
        setNotes('');
        setItems([{ id: '1', category: '', description: '', quantity: '', unit_price: '', total: '', isSaved: false }]);
        setValidationErrors({});
    };

    const hasError = (itemId: string, field: 'description' | 'quantity' | 'category') => {
        const item = items.find(item => item.id === itemId);
        if (!item || item.isSaved) return false;

        if (validationErrors.items) {
            if (field === 'description' && !item.description.trim()) return true;
            if (field === 'quantity' && !item.quantity.trim()) return true;
            if (field === 'category' && !item.category.trim()) return true;
        }
        return false;
    };

    // Auto-suggest items based on description input
    const getItemSuggestions = (description: string) => {
        if (!description.trim()) return [];
        return systemItems.filter(item =>
            item.name.toLowerCase().includes(description.toLowerCase())
        ).slice(0, 5); // Show max 5 suggestions
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisition Form" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Requisition Form</h1>
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
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Requisition Form
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Complete the form below to submit a new requisition
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
                                            editItem={editItem} // Add this prop
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={clearForm}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Clear Form
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Submit Requisition
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
