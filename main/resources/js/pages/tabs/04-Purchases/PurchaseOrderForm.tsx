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
import SelectApprovedRequisition from './PurchaseOrderForm/SelectApprovedRequisition';
import OrderItems from './PurchaseOrderForm/OrderItems';
import AdditionalInfo from './PurchaseOrderForm/AdditionalInfo';
import PreviewModal from './PurchaseOrderForm/PreviewModal';

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
        REQUISITION_ID: '',
        SUPPLIER_ID: '',
        PAYMENT_TYPE: 'cash',
        REMARKS: '',
        ITEMS: [] as any[]
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [approvedRequisitions, setApprovedRequisitions] = useState<any[]>([]);
    const [suggestedSuppliers, setSuggestedSuppliers] = useState<SuggestedSupplier[]>([]);
    const [bestSupplier, setBestSupplier] = useState<SuggestedSupplier | null>(null);
    const [originalQuantities, setOriginalQuantities] = useState<{[key: number]: number}>({});
    const [showPreview, setShowPreview] = useState(false);

    // Load data based on mode
    useEffect(() => {
        loadApprovedRequisitions();

        if (isEditMode && currentPurchase) {
            // Pre-fill form with existing purchase order data
            setFormData({
                REFERENCE_NO: currentPurchase.REFERENCE_NO,
                REQUISITION_ID: currentPurchase.REQUISITION_ID.toString(),
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

    // Store original quantities when requisition is selected
    useEffect(() => {
        if (selectedRequisition) {
            const originalQty: {[key: number]: number} = {};
            selectedRequisition.ITEMS.forEach((item: any) => {
                originalQty[item.ID] = item.QUANTITY;
            });
            setOriginalQuantities(originalQty);
        }
    }, [selectedRequisition]);

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
                        SELECTED: true
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

        if (!formData.REQUISITION_ID) {
            newErrors.REQUISITION_ID = 'Please select a requisition';
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

    const handleRequisitionChange = (requisitionId: string) => {
        const requisition = approvedRequisitions.find(req => req.ID.toString() === requisitionId);
        setSelectedRequisition(requisition);

        if (requisition) {
            setFormData(prev => ({
                ...prev,
                REQUISITION_ID: requisitionId,
                ITEMS: requisition.ITEMS.map((item: any) => ({
                    ...item,
                    SELECTED: true // Auto-select all items from requisition
                }))
            }));

            if (errors.REQUISITION_ID) {
                setErrors(prev => ({ ...prev, REQUISITION_ID: '' }));
            }
        }
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
            REQUISITION_ID: parseInt(formData.REQUISITION_ID),
            SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
            PAYMENT_TYPE: formData.PAYMENT_TYPE,
            TOTAL_COST: totalCost,
            STATUS: isEditMode ? currentPurchase?.STATUS : 'pending_approval', // Changed from 'draft'
            REMARKS: formData.REMARKS,
            CREATED_AT: isEditMode ? currentPurchase?.CREATED_AT : new Date().toISOString(),
            UPDATED_AT: new Date().toISOString(),
            ITEMS: selectedItems.map(item => ({
                ITEM_ID: item.ITEM_ID,
                QUANTITY: item.QUANTITY,
                UNIT_PRICE: item.UNIT_PRICE
            }))
        };

        console.log('Purchase Order Data:', purchaseOrderData);

        // In real application, you would send POST/PUT request to backend
        alert(`Purchase order ${isEditMode ? 'updated' : 'created'} successfully!`);

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
                REQUISITION_ID: currentPurchase.REQUISITION_ID.toString(),
                SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
                PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
                REMARKS: currentPurchase.REMARKS,
                ITEMS: currentPurchase.ITEMS
            });
        } else {
            setFormData({
                REFERENCE_NO: '',
                REQUISITION_ID: '',
                SUPPLIER_ID: '',
                PAYMENT_TYPE: 'cash',
                REMARKS: '',
                ITEMS: []
            });
            generateReferenceNumber();
        }
        setErrors({});
        setSelectedSupplier(null);
        setSelectedRequisition(null);
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
                                            : 'Select an approved requisition and supplier to create a purchase order'
                                        }
                                    </p>
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
                                            <SelectApprovedRequisition
                                                formData={formData}
                                                selectedRequisition={selectedRequisition}
                                                approvedRequisitions={approvedRequisitions}
                                                errors={errors}
                                                onRequisitionChange={handleRequisitionChange}
                                                isEditMode={isEditMode}
                                            />

                                            <OrderItems
                                                formData={formData}
                                                selectedRequisition={selectedRequisition}
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
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                {isEditMode ? 'Reset Changes' : 'Reset Form'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={approvedRequisitions.length === 0 && !isEditMode}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isEditMode
                                                    ? 'Update Purchase Order'
                                                    : approvedRequisitions.length === 0
                                                        ? 'No Approved Requisitions'
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
                    selectedRequisition={selectedRequisition}
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
