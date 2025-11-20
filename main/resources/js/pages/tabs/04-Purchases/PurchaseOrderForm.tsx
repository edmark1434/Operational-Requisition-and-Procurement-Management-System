import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import datasets
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from '@/pages/datasets/requisition_item';
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import suppliersData from '@/pages/datasets/supplier';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';

// Import supplier suggestions
import { getSuggestedSuppliers, getBestSupplier, type SuggestedSupplier } from './utils/supplierSuggestions';

// Import modular components
import OrderInfo from './PurchaseOrderForm/OrderInfo';
import SelectSupplier from './PurchaseOrderForm/SelectSupplier';
import OrderItems from './PurchaseOrderForm/OrderItems';
import AdditionalInfo from './PurchaseOrderForm/AdditionalInfo';
import PreviewModal from './PurchaseOrderForm/PreviewModal';

// Import UI components
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
    purchaseId?: number;
    mode?: 'create' | 'edit';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchases',
        href: '/purchases',
    },
    {
        title: 'Create Purchase Order',
        href: '/purchases/create',
    },
];

export default function PurchaseOrderForm() {
    const { props } = usePage();
    const { purchaseId, mode = 'create' } = props as PageProps;

    const isEditMode = mode === 'edit';
    const currentPurchase = isEditMode ? purchaseOrdersData.find(po => po.ID === purchaseId) : null;

    const [formData, setFormData] = useState({
        REFERENCE_NO: '',
        REQUISITION_IDS: [] as string[],
        SUPPLIER_ID: '',
        PAYMENT_TYPE: 'cash',
        REMARKS: '',
        ITEMS: [] as any[]
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [selectedRequisitions, setSelectedRequisitions] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [approvedRequisitions, setApprovedRequisitions] = useState<any[]>([]);
    const [suggestedSuppliers, setSuggestedSuppliers] = useState<SuggestedSupplier[]>([]);
    const [bestSupplier, setBestSupplier] = useState<SuggestedSupplier | null>(null);
    const [originalQuantities, setOriginalQuantities] = useState<{[key: number]: number}>({});
    const [showPreview, setShowPreview] = useState(false);
    const [requisitionOpen, setRequisitionOpen] = useState(false);

    // Load data based on mode
    useEffect(() => {
        loadApprovedRequisitions();

        if (isEditMode && currentPurchase) {
            // Pre-fill form with existing purchase order data
            setFormData({
                REFERENCE_NO: currentPurchase.REFERENCE_NO,
                REQUISITION_IDS: [currentPurchase.REQUISITION_ID.toString()],
                SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
                PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
                REMARKS: currentPurchase.REMARKS,
                ITEMS: currentPurchase.ITEMS
            });
        } else {
            generateReferenceNumber();
        }
    }, [isEditMode, currentPurchase]);

    // Update supplier suggestions when items change
    useEffect(() => {
        const selectedItems = formData.ITEMS.filter((item: any) => item.SELECTED);
        if (selectedItems.length > 0) {
            const suggestions = getSuggestedSuppliers(selectedItems);
            const best = getBestSupplier(selectedItems);
            setSuggestedSuppliers(suggestions);
            setBestSupplier(best);
        } else {
            setSuggestedSuppliers([]);
            setBestSupplier(null);
        }
    }, [formData.ITEMS]);

    // Store original quantities when requisitions are selected
    useEffect(() => {
        if (selectedRequisitions.length > 0) {
            const originalQty: {[key: number]: number} = {};
            selectedRequisitions.forEach(requisition => {
                requisition.ITEMS.forEach((item: any) => {
                    originalQty[item.ID] = item.QUANTITY;
                });
            });
            setOriginalQuantities(originalQty);
        }
    }, [selectedRequisitions]);

    // Update selected supplier when formData.SUPPLIER_ID changes
    useEffect(() => {
        if (formData.SUPPLIER_ID) {
            const supplier = suppliersData.find(sup => sup.ID.toString() === formData.SUPPLIER_ID);
            setSelectedSupplier(supplier);
        } else {
            setSelectedSupplier(null);
        }
    }, [formData.SUPPLIER_ID]);

    const loadApprovedRequisitions = () => {
        const transformedRequisitions = requisitionsData
            .filter(req => req.STATUS === 'Approved')
            .map(requisition => {
                const requisitionItems = requisitionItemsData.filter(item => item.REQ_ID === requisition.REQ_ID);

                const itemsWithDetails = requisitionItems.map(reqItem => {
                    const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
                    const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);
                    return {
                        ID: reqItem.REQT_ID,
                        ITEM_ID: reqItem.ITEM_ID,
                        NAME: itemDetails?.NAME || 'Unknown Item',
                        QUANTITY: reqItem.QUANTITY,
                        CATEGORY: category?.NAME || reqItem.CATEGORY,
                        CATEGORY_ID: category?.CAT_ID,
                        UNIT_PRICE: itemDetails?.UNIT_PRICE || 0,
                        SELECTED: true,
                        REQUISITION_ID: requisition.REQ_ID
                    };
                });

                const categories = [...new Set(itemsWithDetails.map(item => item.CATEGORY))];

                return {
                    ID: requisition.REQ_ID,
                    CREATED_AT: requisition.DATE_REQUESTED,
                    UPDATED_AT: requisition.DATE_UPDATED,
                    STATUS: requisition.STATUS,
                    REMARKS: requisition.REASON || '',
                    USER_ID: requisition.US_ID,
                    REQUESTOR: requisition.REQUESTOR,
                    PRIORITY: requisition.PRIORITY,
                    NOTES: requisition.NOTES,
                    ITEMS: itemsWithDetails,
                    CATEGORIES: categories,
                };
            });

        setApprovedRequisitions(transformedRequisitions);
    };

    const generateReferenceNumber = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        const reference = `PO-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}${random}`;
        setFormData(prev => ({ ...prev, REFERENCE_NO: reference }));
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (formData.REQUISITION_IDS.length === 0) {
            newErrors.REQUISITION_IDS = 'Please select at least one requisition';
        }

        if (!formData.SUPPLIER_ID) {
            newErrors.SUPPLIER_ID = 'Please select a supplier';
        }

        if (!formData.PAYMENT_TYPE) {
            newErrors.PAYMENT_TYPE = 'Please select a payment type';
        }

        if (formData.ITEMS.length === 0) {
            newErrors.ITEMS = 'No items selected for purchase';
        }

        // Validate supplier payment method compatibility
        if (selectedSupplier) {
            if (formData.PAYMENT_TYPE === 'cash' && !selectedSupplier.ALLOWS_CASH) {
                newErrors.PAYMENT_TYPE = 'Selected supplier does not accept cash payments';
            }
            if (formData.PAYMENT_TYPE === 'disbursement' && !selectedSupplier.ALLOWS_DISBURSEMENT) {
                newErrors.PAYMENT_TYPE = 'Selected supplier does not accept disbursement payments';
            }
            if (formData.PAYMENT_TYPE === 'store_credit' && !selectedSupplier.ALLOWS_STORE_CREDIT) {
                newErrors.PAYMENT_TYPE = 'Selected supplier does not accept store credit';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRequisitionSelect = (requisitionId: string) => {
        const requisition = approvedRequisitions.find(req => req.ID.toString() === requisitionId);

        if (requisition && !formData.REQUISITION_IDS.includes(requisitionId)) {
            // Add requisition
            const newRequisitionIds = [...formData.REQUISITION_IDS, requisitionId];
            const newSelectedRequisitions = [...selectedRequisitions, requisition];

            // Add items from this requisition
            const newItems = [...formData.ITEMS, ...requisition.ITEMS];

            setFormData(prev => ({
                ...prev,
                REQUISITION_IDS: newRequisitionIds,
                ITEMS: newItems
            }));

            setSelectedRequisitions(newSelectedRequisitions);

            if (errors.REQUISITION_IDS) {
                setErrors(prev => ({ ...prev, REQUISITION_IDS: '' }));
            }
        }

        setRequisitionOpen(false);
    };

    const handleRemoveRequisition = (requisitionId: string) => {
        // Remove requisition
        const newRequisitionIds = formData.REQUISITION_IDS.filter(id => id !== requisitionId);
        const newSelectedRequisitions = selectedRequisitions.filter(req => req.ID.toString() !== requisitionId);

        // Remove items from this requisition
        const newItems = formData.ITEMS.filter(item => item.REQUISITION_ID !== parseInt(requisitionId));

        setFormData(prev => ({
            ...prev,
            REQUISITION_IDS: newRequisitionIds,
            ITEMS: newItems
        }));

        setSelectedRequisitions(newSelectedRequisitions);
    };

    const handleSupplierChange = (supplierId: string) => {
        // Toggle selection - if clicking the same supplier, deselect it
        const newSupplierId = formData.SUPPLIER_ID === supplierId ? '' : supplierId;

        const supplier = suppliersData.find(sup => sup.ID.toString() === newSupplierId);
        setSelectedSupplier(supplier);

        setFormData(prev => ({
            ...prev,
            SUPPLIER_ID: newSupplierId
        }));

        if (errors.SUPPLIER_ID) {
            setErrors(prev => ({ ...prev, SUPPLIER_ID: '' }));
        }

        // Reset payment type if incompatible with new supplier or if deselecting
        if (supplier) {
            if (formData.PAYMENT_TYPE === 'cash' && !supplier.ALLOWS_CASH) {
                setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
            }
            if (formData.PAYMENT_TYPE === 'disbursement' && !supplier.ALLOWS_DISBURSEMENT) {
                setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
            }
            if (formData.PAYMENT_TYPE === 'store_credit' && !supplier.ALLOWS_STORE_CREDIT) {
                setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
            }
        } else {
            // If deselecting supplier, reset payment type
            setFormData(prev => ({ ...prev, PAYMENT_TYPE: 'cash' }));
        }
    };

    const toggleItemSelection = (itemId: number) => {
        setFormData(prev => ({
            ...prev,
            ITEMS: prev.ITEMS.map(item =>
                item.ID === itemId
                    ? { ...item, SELECTED: !item.SELECTED }
                    : item
            )
        }));
    };

    const updateItemQuantity = (itemId: number, quantity: number) => {
        if (quantity < 1) return;

        // Get the original quantity from requisition
        const originalQty = originalQuantities[itemId] || 1;

        // Don't allow decreasing below original requisition quantity
        if (quantity < originalQty) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            ITEMS: prev.ITEMS.map(item =>
                item.ID === itemId
                    ? { ...item, QUANTITY: quantity }
                    : item
            )
        }));
    };

    const calculateTotal = () => {
        return formData.ITEMS
            .filter((item: any) => item.SELECTED)
            .reduce((total: number, item: any) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
    };

    const getSelectedItems = () => {
        return formData.ITEMS.filter((item: any) => item.SELECTED);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Show preview instead of directly submitting
            setShowPreview(true);
        }
    };

    const handleConfirmSubmit = () => {
        const selectedItems = getSelectedItems();
        const totalCost = calculateTotal();

        const purchaseOrderData = {
            REFERENCE_NO: formData.REFERENCE_NO,
            REQUISITION_IDS: formData.REQUISITION_IDS.map(id => parseInt(id)),
            SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
            PAYMENT_TYPE: formData.PAYMENT_TYPE,
            TOTAL_COST: totalCost,
            STATUS: isEditMode ? currentPurchase?.STATUS : 'pending_approval',
            REMARKS: formData.REMARKS,
            CREATED_AT: isEditMode ? currentPurchase?.CREATED_AT : new Date().toISOString(),
            UPDATED_AT: new Date().toISOString(),
            ITEMS: selectedItems.map(item => ({
                ITEM_ID: item.ITEM_ID,
                QUANTITY: item.QUANTITY,
                UNIT_PRICE: item.UNIT_PRICE,
                REQUISITION_ID: item.REQUISITION_ID
            }))
        };

        console.log('Purchase Order Data:', purchaseOrderData);
        console.log('Merged Requisitions:', formData.REQUISITION_IDS);

        // In real application, you would send POST/PUT request to backend
        alert(`Purchase order ${isEditMode ? 'updated' : 'created'} successfully! ${formData.REQUISITION_IDS.length > 1 ? `(Merged ${formData.REQUISITION_IDS.length} requisitions)` : ''}`);

        // Close preview and redirect
        setShowPreview(false);

        // Redirect back to purchases list
        router.visit('/purchases');
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleReset = () => {
        if (isEditMode && currentPurchase) {
            // Reset to original values in edit mode
            setFormData({
                REFERENCE_NO: currentPurchase.REFERENCE_NO,
                REQUISITION_IDS: [currentPurchase.REQUISITION_ID.toString()],
                SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
                PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
                REMARKS: currentPurchase.REMARKS,
                ITEMS: currentPurchase.ITEMS
            });
        } else {
            setFormData({
                REFERENCE_NO: '',
                REQUISITION_IDS: [],
                SUPPLIER_ID: '',
                PAYMENT_TYPE: 'cash',
                REMARKS: '',
                ITEMS: []
            });
            generateReferenceNumber();
        }
        setErrors({});
        setSelectedSupplier(null);
        setSelectedRequisitions([]);
        setOriginalQuantities({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit('/purchases');
        }
    };

    // Update breadcrumbs based on mode
    const updatedBreadcrumbs = isEditMode
        ? [
            ...breadcrumbs.slice(0, -1),
            { title: 'Edit Purchase Order', href: `/purchases/${purchaseId}/edit` }
        ]
        : breadcrumbs;

    return (
        <AppLayout breadcrumbs={updatedBreadcrumbs}>
            <Head title={isEditMode ? "Edit Purchase Order" : "Create Purchase Order"} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isEditMode
                                ? `Editing ${currentPurchase?.REFERENCE_NO}`
                                : 'Create a new purchase order from approved requisitions'
                            }
                        </p>
                    </div>
                    <Link
                        href="/purchases"
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Purchases
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-7xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {isEditMode
                                            ? `Update purchase order ${currentPurchase?.REFERENCE_NO}`
                                            : 'Select one or more approved requisitions and supplier to create a purchase order'
                                        }
                                    </p>
                                    {!isEditMode && formData.REQUISITION_IDS.length > 1 && (
                                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    Merging {formData.REQUISITION_IDS.length} requisitions into one purchase order
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        {/* Left Column - Order Info & Supplier Selection */}
                                        <div className="xl:col-span-1 space-y-6">
                                            <OrderInfo
                                                formData={formData}
                                                selectedSupplier={selectedSupplier}
                                                errors={errors}
                                                onInputChange={handleInputChange}
                                                isEditMode={isEditMode}
                                            />

                                            <SelectSupplier
                                                formData={formData}
                                                selectedSupplier={selectedSupplier}
                                                suggestedSuppliers={suggestedSuppliers}
                                                suppliersData={suppliersData}
                                                errors={errors}
                                                onSupplierChange={handleSupplierChange}
                                            />
                                        </div>

                                        {/* Right Column - Requisition, Items, and Additional Info */}
                                        <div className="xl:col-span-2 space-y-6">
                                            {/* Approved Requisitions Selection */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                                                    Select Approved Requisitions
                                                </h3>

                                                <div className="space-y-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Requisitions
                                                    </label>

                                                    {/* Selected Requisitions Tags */}
                                                    {formData.REQUISITION_IDS.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {selectedRequisitions.map((requisition) => (
                                                                <div
                                                                    key={requisition.ID}
                                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                                >
                                                                    <span>Req #{requisition.ID}</span>
                                                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                                                    <span>{requisition.REQUESTOR}</span>
                                                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                                                    <span>{requisition.ITEMS.length} items</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveRequisition(requisition.ID.toString())}
                                                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Combobox for requisition selection */}
                                                    <Popover open={requisitionOpen} onOpenChange={setRequisitionOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={requisitionOpen}
                                                                className="w-full justify-between"
                                                            >
                                                                {formData.REQUISITION_IDS.length > 0
                                                                    ? `${formData.REQUISITION_IDS.length} requisition(s) selected`
                                                                    : "Select requisitions..."}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search requisitions..." className="h-9" />
                                                                <CommandList>
                                                                    <CommandEmpty>No requisitions found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {approvedRequisitions.map((requisition) => (
                                                                            <CommandItem
                                                                                key={requisition.ID}
                                                                                value={requisition.ID.toString()}
                                                                                onSelect={handleRequisitionSelect}
                                                                                disabled={formData.REQUISITION_IDS.includes(requisition.ID.toString())}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="font-medium">Req #{requisition.ID}</span>
                                                                                        <span className="text-gray-500 dark:text-gray-400">•</span>
                                                                                        <span>{requisition.REQUESTOR}</span>
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {requisition.ITEMS.length} items • {requisition.PRIORITY} priority
                                                                                    </div>
                                                                                </div>
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto h-4 w-4",
                                                                                        formData.REQUISITION_IDS.includes(requisition.ID.toString()) ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>

                                                    {errors.REQUISITION_IDS && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.REQUISITION_IDS}</p>
                                                    )}

                                                    {/* Selected Requisitions Details */}
                                                    {selectedRequisitions.length > 0 && (
                                                        <div className="mt-4 space-y-3">
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Selected Requisitions Details:
                                                            </h4>
                                                            {selectedRequisitions.map((requisition) => (
                                                                <div key={requisition.ID} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                Requisition #{requisition.ID}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                                                by {requisition.REQUESTOR}
                                                                            </span>
                                                                        </div>
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                            requisition.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                                requisition.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                        }`}>
                                                                            {requisition.PRIORITY}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        <p><strong>Items:</strong> {requisition.ITEMS.length}</p>
                                                                        <p><strong>Requested:</strong> {new Date(requisition.CREATED_AT).toLocaleDateString()}</p>
                                                                        {requisition.NOTES && (
                                                                            <p><strong>Notes:</strong> {requisition.NOTES}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <OrderItems
                                                formData={formData}
                                                selectedRequisition={selectedRequisitions}
                                                originalQuantities={originalQuantities}
                                                errors={errors}
                                                onToggleItemSelection={toggleItemSelection}
                                                onUpdateItemQuantity={updateItemQuantity}
                                            />

                                            {/* Selected Supplier Display */}
                                            {selectedSupplier && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Selected Supplier
                                                        </h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSupplierChange('')}
                                                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                        >
                                                            Change Supplier
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="font-bold text-lg text-blue-800 dark:text-blue-200">{selectedSupplier.NAME}</p>
                                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                                <strong>Email:</strong> {selectedSupplier.EMAIL}
                                                            </p>
                                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                <strong>Phone:</strong> {selectedSupplier.CONTACT_NUMBER}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Payment Methods:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {selectedSupplier.ALLOWS_CASH && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                        Cash
                                                                    </span>
                                                                )}
                                                                {selectedSupplier.ALLOWS_DISBURSEMENT && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                        Disbursement
                                                                    </span>
                                                                )}
                                                                {selectedSupplier.ALLOWS_STORE_CREDIT && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                        Store Credit
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <AdditionalInfo
                                                formData={formData}
                                                onInputChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                {/* Reset Button - Circle with icon and tooltip */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleReset}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        {isEditMode ? 'Reset Changes' : 'Reset Form'}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>

                                                {/* Cancel Button - Circle with X icon and tooltip */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        Cancel
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={approvedRequisitions.length === 0 && !isEditMode}
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isEditMode
                                                    ? 'Update Purchase Order'
                                                    : approvedRequisitions.length === 0
                                                        ? 'No Approved Requisitions'
                                                        : formData.REQUISITION_IDS.length > 1
                                                            ? `Create Merged PO (${formData.REQUISITION_IDS.length})`
                                                            : 'Create Purchase Order'
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <PreviewModal
                    formData={formData}
                    selectedSupplier={selectedSupplier}
                    selectedRequisition={selectedRequisitions}
                    selectedItems={getSelectedItems()}
                    totalCost={calculateTotal()}
                    onConfirm={handleConfirmSubmit}
                    onCancel={() => setShowPreview(false)}
                    isEditMode={isEditMode}
                />
            )}
        </AppLayout>
    );
}
