// import { Head, Link, router, usePage } from '@inertiajs/react';
// import { useState, useEffect } from 'react';
// import AppLayout from '@/layouts/app-layout';
// import { type BreadcrumbItem } from '@/types';
//
// // Import your actual datasets
// import requisitionsData from '@/pages/datasets/requisition';
// import requisitionItemsData from '@/pages/datasets/requisition_item';
// import itemsData from '@/pages/datasets/items';
// import categoriesData from '@/pages/datasets/category';
// import suppliersData from '@/pages/datasets/supplier';
// import { purchaseOrdersData, orderItemsData } from '@/pages/datasets/purchase_order';
//
// // Import supplier suggestions
// import { getSuggestedSuppliers, getBestSupplier, type SuggestedSupplier } from './utils/supplierSuggestions';
//
// interface PageProps {
//     purchaseId?: number;
//     mode?: 'create' | 'edit';
// }
//
// const breadcrumbs: BreadcrumbItem[] = [
//     {
//         title: 'Purchases',
//         href: '/purchases',
//     },
//     {
//         title: 'Create Purchase Order',
//         href: '/purchases/create',
//     },
// ];
//
// export default function PurchaseOrderForm() {
//     const { props } = usePage();
//     const { purchaseId, mode = 'create' } = props as PageProps;
//
//     const isEditMode = mode === 'edit';
//     const currentPurchase = isEditMode ? purchaseOrdersData.find(po => po.ID === purchaseId) : null;
//
//     const [formData, setFormData] = useState({
//         REFERENCE_NO: '',
//         REQUISITION_ID: '',
//         SUPPLIER_ID: '',
//         PAYMENT_TYPE: 'cash',
//         REMARKS: '',
//         ITEMS: [] as any[]
//     });
//     const [errors, setErrors] = useState<{[key: string]: string}>({});
//     const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
//     const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
//     const [approvedRequisitions, setApprovedRequisitions] = useState<any[]>([]);
//     const [suggestedSuppliers, setSuggestedSuppliers] = useState<SuggestedSupplier[]>([]);
//     const [bestSupplier, setBestSupplier] = useState<SuggestedSupplier | null>(null);
//     const [activeTab, setActiveTab] = useState<'suggested' | 'all'>('suggested');
//     const [originalQuantities, setOriginalQuantities] = useState<{[key: number]: number}>({});
//     const [showPreview, setShowPreview] = useState(false);
//
//     // Load data based on mode
//     useEffect(() => {
//         loadApprovedRequisitions();
//
//         if (isEditMode && currentPurchase) {
//             // Pre-fill form with existing purchase order data
//             setFormData({
//                 REFERENCE_NO: currentPurchase.REFERENCE_NO,
//                 REQUISITION_ID: currentPurchase.REQUISITION_ID.toString(),
//                 SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
//                 PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
//                 REMARKS: currentPurchase.REMARKS,
//                 ITEMS: currentPurchase.ITEMS
//             });
//
//             // Set selected requisition and supplier
//             const requisition = approvedRequisitions.find(req => req.ID === currentPurchase.REQUISITION_ID);
//             const supplier = suppliersData.find(sup => sup.ID === currentPurchase.SUPPLIER_ID);
//             setSelectedRequisition(requisition);
//             setSelectedSupplier(supplier);
//         } else {
//             generateReferenceNumber();
//         }
//     }, [isEditMode, currentPurchase]);
//
//     // Update supplier suggestions when items change (NO AUTO-SELECTION)
//     useEffect(() => {
//         const selectedItems = formData.ITEMS.filter((item: any) => item.SELECTED);
//         if (selectedItems.length > 0) {
//             const suggestions = getSuggestedSuppliers(selectedItems);
//             const best = getBestSupplier(selectedItems);
//             setSuggestedSuppliers(suggestions);
//             setBestSupplier(best);
//             // REMOVED AUTO-SELECTION: Let user manually choose supplier
//         } else {
//             setSuggestedSuppliers([]);
//             setBestSupplier(null);
//         }
//     }, [formData.ITEMS]);
//
//     // Store original quantities when requisition is selected
//     useEffect(() => {
//         if (selectedRequisition) {
//             const originalQty: {[key: number]: number} = {};
//             selectedRequisition.ITEMS.forEach((item: any) => {
//                 originalQty[item.ID] = item.QUANTITY;
//             });
//             setOriginalQuantities(originalQty);
//         }
//     }, [selectedRequisition]);
//
//     // Update selected supplier when formData.SUPPLIER_ID changes
//     useEffect(() => {
//         if (formData.SUPPLIER_ID) {
//             const supplier = suppliersData.find(sup => sup.ID.toString() === formData.SUPPLIER_ID);
//             setSelectedSupplier(supplier);
//         } else {
//             setSelectedSupplier(null);
//         }
//     }, [formData.SUPPLIER_ID]);
//
//     const loadApprovedRequisitions = () => {
//         const transformedRequisitions = requisitionsData
//             .filter(req => req.STATUS === 'Approved')
//             .map(requisition => {
//                 const requisitionItems = requisitionItemsData.filter(item => item.REQ_ID === requisition.REQ_ID);
//
//                 const itemsWithDetails = requisitionItems.map(reqItem => {
//                     const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
//                     const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);
//                     return {
//                         ID: reqItem.REQT_ID,
//                         ITEM_ID: reqItem.ITEM_ID,
//                         NAME: itemDetails?.NAME || 'Unknown Item',
//                         QUANTITY: reqItem.QUANTITY,
//                         CATEGORY: category?.NAME || reqItem.CATEGORY,
//                         CATEGORY_ID: category?.CAT_ID,
//                         UNIT_PRICE: itemDetails?.UNIT_PRICE || 0,
//                         SELECTED: true
//                     };
//                 });
//
//                 const categories = [...new Set(itemsWithDetails.map(item => item.CATEGORY))];
//
//                 return {
//                     ID: requisition.REQ_ID,
//                     CREATED_AT: requisition.DATE_REQUESTED,
//                     UPDATED_AT: requisition.DATE_UPDATED,
//                     STATUS: requisition.STATUS,
//                     REMARKS: requisition.REASON || '',
//                     USER_ID: requisition.US_ID,
//                     REQUESTOR: requisition.REQUESTOR,
//                     PRIORITY: requisition.PRIORITY,
//                     NOTES: requisition.NOTES,
//                     ITEMS: itemsWithDetails,
//                     CATEGORIES: categories,
//                 };
//             });
//
//         setApprovedRequisitions(transformedRequisitions);
//     };
//
//     const generateReferenceNumber = () => {
//         const timestamp = new Date().getTime();
//         const random = Math.floor(Math.random() * 1000);
//         const reference = `PO-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}${random}`;
//         setFormData(prev => ({ ...prev, REFERENCE_NO: reference }));
//     };
//
//     const validateForm = () => {
//         const newErrors: {[key: string]: string} = {};
//
//         if (!formData.REQUISITION_ID) {
//             newErrors.REQUISITION_ID = 'Please select a requisition';
//         }
//
//         if (!formData.SUPPLIER_ID) {
//             newErrors.SUPPLIER_ID = 'Please select a supplier';
//         }
//
//         if (!formData.PAYMENT_TYPE) {
//             newErrors.PAYMENT_TYPE = 'Please select a payment type';
//         }
//
//         if (formData.ITEMS.length === 0) {
//             newErrors.ITEMS = 'No items selected for purchase';
//         }
//
//         // Validate supplier payment method compatibility
//         if (selectedSupplier) {
//             if (formData.PAYMENT_TYPE === 'cash' && !selectedSupplier.ALLOWS_CASH) {
//                 newErrors.PAYMENT_TYPE = 'Selected supplier does not accept cash payments';
//             }
//             if (formData.PAYMENT_TYPE === 'disbursement' && !selectedSupplier.ALLOWS_DISBURSEMENT) {
//                 newErrors.PAYMENT_TYPE = 'Selected supplier does not accept disbursement payments';
//             }
//             if (formData.PAYMENT_TYPE === 'store_credit' && !selectedSupplier.ALLOWS_STORE_CREDIT) {
//                 newErrors.PAYMENT_TYPE = 'Selected supplier does not accept store credit';
//             }
//         }
//
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };
//
//     const handleRequisitionChange = (requisitionId: string) => {
//         const requisition = approvedRequisitions.find(req => req.ID.toString() === requisitionId);
//         setSelectedRequisition(requisition);
//
//         if (requisition) {
//             setFormData(prev => ({
//                 ...prev,
//                 REQUISITION_ID: requisitionId,
//                 ITEMS: requisition.ITEMS.map((item: any) => ({
//                     ...item,
//                     SELECTED: true // Auto-select all items from requisition
//                 }))
//             }));
//
//             if (errors.REQUISITION_ID) {
//                 setErrors(prev => ({ ...prev, REQUISITION_ID: '' }));
//             }
//         }
//     };
//
//     const handleSupplierChange = (supplierId: string) => {
//         // Toggle selection - if clicking the same supplier, deselect it
//         const newSupplierId = formData.SUPPLIER_ID === supplierId ? '' : supplierId;
//
//         const supplier = suppliersData.find(sup => sup.ID.toString() === newSupplierId);
//         setSelectedSupplier(supplier);
//
//         setFormData(prev => ({
//             ...prev,
//             SUPPLIER_ID: newSupplierId
//         }));
//
//         if (errors.SUPPLIER_ID) {
//             setErrors(prev => ({ ...prev, SUPPLIER_ID: '' }));
//         }
//
//         // Reset payment type if incompatible with new supplier or if deselecting
//         if (supplier) {
//             if (formData.PAYMENT_TYPE === 'cash' && !supplier.ALLOWS_CASH) {
//                 setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
//             }
//             if (formData.PAYMENT_TYPE === 'disbursement' && !supplier.ALLOWS_DISBURSEMENT) {
//                 setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
//             }
//             if (formData.PAYMENT_TYPE === 'store_credit' && !supplier.ALLOWS_STORE_CREDIT) {
//                 setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
//             }
//         } else {
//             // If deselecting supplier, reset payment type
//             setFormData(prev => ({ ...prev, PAYMENT_TYPE: 'cash' }));
//         }
//     };
//
//     const applySuggestion = (supplierId: string) => {
//         handleSupplierChange(supplierId);
//     };
//
//     const toggleItemSelection = (itemId: number) => {
//         setFormData(prev => ({
//             ...prev,
//             ITEMS: prev.ITEMS.map(item =>
//                 item.ID === itemId
//                     ? { ...item, SELECTED: !item.SELECTED }
//                     : item
//             )
//         }));
//     };
//
//     const updateItemQuantity = (itemId: number, quantity: number) => {
//         if (quantity < 1) return;
//
//         // Get the original quantity from requisition
//         const originalQty = originalQuantities[itemId] || 1;
//
//         // Don't allow decreasing below original requisition quantity
//         if (quantity < originalQty) {
//             return;
//         }
//
//         setFormData(prev => ({
//             ...prev,
//             ITEMS: prev.ITEMS.map(item =>
//                 item.ID === itemId
//                     ? { ...item, QUANTITY: quantity }
//                     : item
//             )
//         }));
//     };
//
//     const calculateTotal = () => {
//         return formData.ITEMS
//             .filter((item: any) => item.SELECTED)
//             .reduce((total: number, item: any) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
//     };
//
//     const getSelectedItems = () => {
//         return formData.ITEMS.filter((item: any) => item.SELECTED);
//     };
//
//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//
//         if (validateForm()) {
//             // Show preview instead of directly submitting
//             setShowPreview(true);
//         }
//     };
//
//     const handleConfirmSubmit = () => {
//         const selectedItems = getSelectedItems();
//         const totalCost = calculateTotal();
//
//         const purchaseOrderData = {
//             REFERENCE_NO: formData.REFERENCE_NO,
//             REQUISITION_ID: parseInt(formData.REQUISITION_ID),
//             SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
//             PAYMENT_TYPE: formData.PAYMENT_TYPE,
//             TOTAL_COST: totalCost,
//             STATUS: isEditMode ? currentPurchase?.STATUS : 'draft',
//             REMARKS: formData.REMARKS,
//             CREATED_AT: isEditMode ? currentPurchase?.CREATED_AT : new Date().toISOString(),
//             UPDATED_AT: new Date().toISOString(),
//             ITEMS: selectedItems.map(item => ({
//                 ITEM_ID: item.ITEM_ID,
//                 QUANTITY: item.QUANTITY,
//                 UNIT_PRICE: item.UNIT_PRICE
//             }))
//         };
//
//         console.log('Purchase Order Data:', purchaseOrderData);
//
//         // In real application, you would send POST/PUT request to backend
//         alert(`Purchase order ${isEditMode ? 'updated' : 'created'} successfully!`);
//
//         // Close preview and redirect
//         setShowPreview(false);
//
//         // Redirect back to purchases list
//         router.visit('/purchases');
//     };
//
//     const handleInputChange = (field: string, value: any) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//
//         if (errors[field]) {
//             setErrors(prev => ({ ...prev, [field]: '' }));
//         }
//     };
//
//     const handleReset = () => {
//         if (isEditMode && currentPurchase) {
//             // Reset to original values in edit mode
//             setFormData({
//                 REFERENCE_NO: currentPurchase.REFERENCE_NO,
//                 REQUISITION_ID: currentPurchase.REQUISITION_ID.toString(),
//                 SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
//                 PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
//                 REMARKS: currentPurchase.REMARKS,
//                 ITEMS: currentPurchase.ITEMS
//             });
//         } else {
//             setFormData({
//                 REFERENCE_NO: '',
//                 REQUISITION_ID: '',
//                 SUPPLIER_ID: '', // FIX: Reset supplier ID
//                 PAYMENT_TYPE: 'cash',
//                 REMARKS: '',
//                 ITEMS: []
//             });
//             generateReferenceNumber();
//         }
//         setErrors({});
//         setSelectedSupplier(null); // FIX: Also reset selected supplier state
//         setSelectedRequisition(null); // FIX: Reset requisition too
//         setOriginalQuantities({}); // FIX: Reset original quantities
//     };
//
//     const handleCancel = () => {
//         if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
//             router.visit('/purchases');
//         }
//     };
//
//     // Update breadcrumbs based on mode
//     const updatedBreadcrumbs = isEditMode
//         ? [
//             ...breadcrumbs.slice(0, -1),
//             { title: 'Edit Purchase Order', href: `/purchases/${purchaseId}/edit` }
//         ]
//         : breadcrumbs;
//
//     return (
//         <AppLayout breadcrumbs={updatedBreadcrumbs}>
//             <Head title={isEditMode ? "Edit Purchase Order" : "Create Purchase Order"} />
//             <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
//                 {/* Header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                             {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
//                         </h1>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                             {isEditMode
//                                 ? `Editing ${currentPurchase?.REFERENCE_NO}`
//                                 : 'Create a new purchase order from approved requisitions'
//                             }
//                         </p>
//                     </div>
//                     <Link
//                         href="/purchases"
//                         className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
//                     >
//                         Return to Purchases
//                     </Link>
//                 </div>
//
//                 {/* Form Container */}
//                 <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
//                     <div className="h-full overflow-y-auto">
//                         <div className="min-h-full flex items-start justify-center p-6">
//                             <div className="w-full max-w-7xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
//                                 {/* Header Section */}
//                                 <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
//                                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                                         {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
//                                     </h2>
//                                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                                         {isEditMode
//                                             ? `Update purchase order ${currentPurchase?.REFERENCE_NO}`
//                                             : 'Select an approved requisition and supplier to create a purchase order'
//                                         }
//                                     </p>
//                                 </div>
//
//                                 <form onSubmit={handleSubmit} className="p-6">
//                                     <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//                                         {/* Left Column - Supplier Selection */}
//                                         <div className="xl:col-span-1 space-y-6">
//                                             {/* Basic Information */}
//                                             <div className="space-y-4">
//                                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
//                                                     Order Information
//                                                 </h3>
//
//                                                 <div>
//                                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                         Reference Number
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         readOnly
//                                                         value={formData.REFERENCE_NO}
//                                                         className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono cursor-not-allowed"
//                                                     />
//                                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                                         Auto-generated reference number
//                                                     </p>
//                                                 </div>
//
//                                                 <div>
//                                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                         Payment Type <span className="text-red-500">*</span>
//                                                     </label>
//                                                     <select
//                                                         required
//                                                         value={formData.PAYMENT_TYPE}
//                                                         onChange={(e) => handleInputChange('PAYMENT_TYPE', e.target.value)}
//                                                         className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
//                                                             errors.PAYMENT_TYPE ? 'border-red-500' : 'border-sidebar-border'
//                                                         }`}
//                                                         disabled={!selectedSupplier}
//                                                     >
//                                                         <option value="">Select payment type</option>
//                                                         {selectedSupplier?.ALLOWS_CASH && <option value="cash">Cash</option>}
//                                                         {selectedSupplier?.ALLOWS_DISBURSEMENT && <option value="disbursement">Disbursement</option>}
//                                                         {selectedSupplier?.ALLOWS_STORE_CREDIT && <option value="store_credit">Store Credit</option>}
//                                                     </select>
//                                                     {errors.PAYMENT_TYPE && (
//                                                         <p className="text-red-500 text-xs mt-1">{errors.PAYMENT_TYPE}</p>
//                                                     )}
//                                                     {!selectedSupplier && (
//                                                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                                             Select a supplier to see available payment options
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                             </div>
//
//                                             {/* Supplier Selection */}
//                                             <div className="space-y-4">
//                                                 <div className="flex items-center justify-between">
//                                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                                         Select Supplier <span className="text-red-500">*</span>
//                                                     </h3>
//                                                     {formData.SUPPLIER_ID && (
//                                                         <button
//                                                             type="button"
//                                                             onClick={() => handleSupplierChange('')}
//                                                             className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
//                                                         >
//                                                             Clear Selection
//                                                         </button>
//                                                     )}
//                                                 </div>
//
//                                                 {/* Supplier Tabs */}
//                                                 <div className="flex border-b border-sidebar-border">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setActiveTab('suggested')}
//                                                         className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
//                                                             activeTab === 'suggested'
//                                                                 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                                                                 : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
//                                                         }`}
//                                                     >
//                                                         💡 Suggested ({suggestedSuppliers.length})
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setActiveTab('all')}
//                                                         className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
//                                                             activeTab === 'all'
//                                                                 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                                                                 : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
//                                                         }`}
//                                                     >
//                                                         All Suppliers ({suppliersData.length})
//                                                     </button>
//                                                 </div>
//
//                                                 {/* Supplier List */}
//                                                 <div className="max-h-96 overflow-y-auto space-y-3">
//                                                     {activeTab === 'suggested' ? (
//                                                         <>
//                                                             {suggestedSuppliers.length > 0 ? (
//                                                                 suggestedSuppliers.map((suggestion, index) => (
//                                                                     <SupplierCard
//                                                                         key={suggestion.supplier.ID}
//                                                                         supplier={suggestion.supplier}
//                                                                         isSelected={formData.SUPPLIER_ID === suggestion.supplier.ID.toString()}
//                                                                         onSelect={() => applySuggestion(suggestion.supplier.ID.toString())}
//                                                                         isBestMatch={index === 0}
//                                                                         matchPercentage={suggestion.matchPercentage}
//                                                                         matchingCategories={suggestion.matchingCategories}
//                                                                         allCategories={suggestion.matchingCategories}
//                                                                     />
//                                                                 ))
//                                                             ) : (
//                                                                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                                                                     <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                                     </svg>
//                                                                     <p className="text-sm">No supplier suggestions available.</p>
//                                                                     <p className="text-xs mt-1">Select items from a requisition first.</p>
//                                                                 </div>
//                                                             )}
//                                                         </>
//                                                     ) : (
//                                                         suppliersData.map(supplier => {
//                                                             // Find if this supplier is in suggestions to show matching categories
//                                                             const suggestion = suggestedSuppliers.find(s => s.supplier.ID === supplier.ID);
//                                                             return (
//                                                                 <SupplierCard
//                                                                     key={supplier.ID}
//                                                                     supplier={supplier}
//                                                                     isSelected={formData.SUPPLIER_ID === supplier.ID.toString()}
//                                                                     onSelect={() => applySuggestion(supplier.ID.toString())}
//                                                                     matchPercentage={suggestion?.matchPercentage || 0}
//                                                                     matchingCategories={suggestion?.matchingCategories || []}
//                                                                     allCategories={suggestion?.matchingCategories || []}
//                                                                 />
//                                                             );
//                                                         })
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//
//                                         {/* Right Column - Requisition and Items */}
//                                         <div className="xl:col-span-2 space-y-6">
//                                             {/* Requisition Selection */}
//                                             <div className="space-y-4">
//                                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
//                                                     Select Approved Requisition <span className="text-red-500">*</span>
//                                                 </h3>
//
//                                                 {approvedRequisitions.length === 0 ? (
//                                                     <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
//                                                         <div className="flex items-center">
//                                                             <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                                                             </svg>
//                                                             <p className="text-yellow-700 dark:text-yellow-300 text-sm">
//                                                                 No approved requisitions found. Purchase orders can only be created from approved requisitions.
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     <>
//                                                         <div>
//                                                             <select
//                                                                 required
//                                                                 value={formData.REQUISITION_ID}
//                                                                 onChange={(e) => handleRequisitionChange(e.target.value)}
//                                                                 className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
//                                                                     errors.REQUISITION_ID ? 'border-red-500' : 'border-sidebar-border'
//                                                                 }`}
//                                                                 disabled={isEditMode}
//                                                             >
//                                                                 <option value="">Select an approved requisition</option>
//                                                                 {approvedRequisitions.map(requisition => (
//                                                                     <option key={requisition.ID} value={requisition.ID}>
//                                                                         Req #{requisition.ID} - {requisition.REQUESTOR} - {formatDate(requisition.CREATED_AT)}
//                                                                     </option>
//                                                                 ))}
//                                                             </select>
//                                                             {errors.REQUISITION_ID && (
//                                                                 <p className="text-red-500 text-xs mt-1">{errors.REQUISITION_ID}</p>
//                                                             )}
//                                                             {isEditMode && (
//                                                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                                                     Requisition cannot be changed in edit mode
//                                                                 </p>
//                                                             )}
//                                                         </div>
//
//                                                         {/* Requisition Details */}
//                                                         {selectedRequisition && (
//                                                             <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
//                                                                 <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
//                                                                     Requisition Details
//                                                                 </h4>
//                                                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                                                                     <div>
//                                                                         <span className="text-gray-600 dark:text-gray-400">Requestor:</span>
//                                                                         <p className="font-medium">{selectedRequisition.REQUESTOR}</p>
//                                                                     </div>
//                                                                     <div>
//                                                                         <span className="text-gray-600 dark:text-gray-400">Priority:</span>
//                                                                         <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
//                                                                             selectedRequisition.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
//                                                                                 selectedRequisition.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
//                                                                                     'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
//                                                                         }`}>
//                                                                             {selectedRequisition.PRIORITY}
//                                                                         </span>
//                                                                     </div>
//                                                                     <div>
//                                                                         <span className="text-gray-600 dark:text-gray-400">Date:</span>
//                                                                         <p>{formatDate(selectedRequisition.CREATED_AT)}</p>
//                                                                     </div>
//                                                                     <div>
//                                                                         <span className="text-gray-600 dark:text-gray-400">Items:</span>
//                                                                         <p>{selectedRequisition.ITEMS.length}</p>
//                                                                     </div>
//                                                                 </div>
//                                                                 {selectedRequisition.NOTES && (
//                                                                     <div className="mt-3">
//                                                                         <span className="text-gray-600 dark:text-gray-400">Notes:</span>
//                                                                         <p className="text-sm mt-1">{selectedRequisition.NOTES}</p>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         )}
//                                                     </>
//                                                 )}
//                                             </div>
//
//                                             {/* Items Selection */}
//                                             {selectedRequisition && (
//                                                 <div className="space-y-4">
//                                                     <div className="flex justify-between items-center">
//                                                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                                             Order Items
//                                                         </h3>
//                                                         <div className="text-sm text-gray-600 dark:text-gray-400">
//                                                             {getSelectedItems().length} of {formData.ITEMS.length} items selected
//                                                         </div>
//                                                     </div>
//
//                                                     {errors.ITEMS && (
//                                                         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
//                                                             <p className="text-red-600 dark:text-red-400 text-sm">{errors.ITEMS}</p>
//                                                         </div>
//                                                     )}
//
//                                                     <div className="bg-white dark:bg-sidebar-accent rounded-lg border border-sidebar-border overflow-hidden">
//                                                         <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                                                             <div className="col-span-1"></div>
//                                                             <div className="col-span-4">Item</div>
//                                                             <div className="col-span-2">Category</div>
//                                                             <div className="col-span-2 text-right">Unit Price</div>
//                                                             <div className="col-span-2 text-right">Quantity</div>
//                                                             <div className="col-span-1 text-right">Total</div>
//                                                         </div>
//                                                         <div className="divide-y divide-sidebar-border max-h-96 overflow-y-auto">
//                                                             {formData.ITEMS.map((item) => {
//                                                                 const originalQty = originalQuantities[item.ID] || item.QUANTITY;
//                                                                 const isIncreased = item.QUANTITY > originalQty;
//
//                                                                 return (
//                                                                     <div key={item.ID} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-sidebar transition-colors">
//                                                                         <div className="col-span-1">
//                                                                             <input
//                                                                                 type="checkbox"
//                                                                                 checked={item.SELECTED || false}
//                                                                                 onChange={() => toggleItemSelection(item.ID)}
//                                                                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                                                             />
//                                                                         </div>
//                                                                         <div className="col-span-4">
//                                                                             <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                                                                 {item.NAME}
//                                                                             </p>
//                                                                             {isIncreased && (
//                                                                                 <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
//                                                                                     ⚠️ Quantity increased from original {originalQty}
//                                                                                 </p>
//                                                                             )}
//                                                                         </div>
//                                                                         <div className="col-span-2">
//                                                                             <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
//                                                                                 {item.CATEGORY}
//                                                                             </span>
//                                                                         </div>
//                                                                         <div className="col-span-2 text-right">
//                                                                             <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                                                 {formatCurrency(item.UNIT_PRICE)}
//                                                                             </p>
//                                                                         </div>
//                                                                         <div className="col-span-2 text-right">
//                                                                             <div className="flex items-center justify-end space-x-2">
//                                                                                 <button
//                                                                                     type="button"
//                                                                                     onClick={() => updateItemQuantity(item.ID, item.QUANTITY - 1)}
//                                                                                     disabled={item.QUANTITY <= originalQty}
//                                                                                     className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                                                                     title={item.QUANTITY <= originalQty ? "Cannot decrease below requisition quantity" : "Decrease quantity"}
//                                                                                 >
//                                                                                     -
//                                                                                 </button>
//                                                                                 <span className="text-sm font-medium w-8 text-center">
//                                                                                     {item.QUANTITY}
//                                                                                 </span>
//                                                                                 <button
//                                                                                     type="button"
//                                                                                     onClick={() => updateItemQuantity(item.ID, item.QUANTITY + 1)}
//                                                                                     className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
//                                                                                     title="Increase quantity"
//                                                                                 >
//                                                                                     +
//                                                                                 </button>
//                                                                             </div>
//                                                                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                                                                 Original: {originalQty}
//                                                                             </p>
//                                                                         </div>
//                                                                         <div className="col-span-1 text-right">
//                                                                             <p className="text-sm font-bold text-gray-900 dark:text-white">
//                                                                                 {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
//                                                                             </p>
//                                                                         </div>
//                                                                     </div>
//                                                                 );
//                                                             })}
//                                                         </div>
//
//                                                         {/* Total Row */}
//                                                         <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
//                                                             <div className="col-span-9"></div>
//                                                             <div className="col-span-3 text-right">
//                                                                 <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Grand Total:</p>
//                                                                 <p className="text-lg font-bold text-green-600 dark:text-green-400">
//                                                                     {formatCurrency(calculateTotal())}
//                                                                 </p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )}
//
//                                             {/* Selected Supplier Display - Moved under Order Items */}
//                                             {selectedSupplier && (
//                                                 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
//                                                     <div className="flex items-center justify-between mb-3">
//                                                         <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
//                                                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                                                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                                             </svg>
//                                                             Selected Supplier
//                                                         </h3>
//                                                         <button
//                                                             type="button"
//                                                             onClick={() => handleSupplierChange('')}
//                                                             className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
//                                                         >
//                                                             Change Supplier
//                                                         </button>
//                                                     </div>
//                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                         <div>
//                                                             <p className="font-bold text-lg text-blue-800 dark:text-blue-200">{selectedSupplier.NAME}</p>
//                                                             <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
//                                                                 <strong>Email:</strong> {selectedSupplier.EMAIL}
//                                                             </p>
//                                                             <p className="text-sm text-blue-700 dark:text-blue-300">
//                                                                 <strong>Phone:</strong> {selectedSupplier.CONTACT_NUMBER}
//                                                             </p>
//                                                         </div>
//                                                         <div>
//                                                             <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Payment Methods:</p>
//                                                             <div className="flex flex-wrap gap-1">
//                                                                 {selectedSupplier.ALLOWS_CASH && (
//                                                                     <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                                                                         Cash
//                                                                     </span>
//                                                                 )}
//                                                                 {selectedSupplier.ALLOWS_DISBURSEMENT && (
//                                                                     <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
//                                                                         Disbursement
//                                                                     </span>
//                                                                 )}
//                                                                 {selectedSupplier.ALLOWS_STORE_CREDIT && (
//                                                                     <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
//                                                                         Store Credit
//                                                                     </span>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )}
//
//                                             {/* Remarks */}
//                                             <div className="space-y-4">
//                                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
//                                                     Additional Information
//                                                 </h3>
//                                                 <div>
//                                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                         Remarks
//                                                     </label>
//                                                     <textarea
//                                                         value={formData.REMARKS}
//                                                         onChange={(e) => handleInputChange('REMARKS', e.target.value)}
//                                                         rows={3}
//                                                         className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
//                                                         placeholder="Add any additional notes or instructions for this purchase order..."
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     {/* Action Buttons */}
//                                     <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
//                                         <div className="flex gap-3">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleReset}
//                                                 className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
//                                             >
//                                                 {isEditMode ? 'Reset Changes' : 'Reset Form'}
//                                             </button>
//                                             <button
//                                                 type="button"
//                                                 onClick={handleCancel}
//                                                 className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
//                                             >
//                                                 Cancel
//                                             </button>
//                                             <button
//                                                 type="submit"
//                                                 disabled={approvedRequisitions.length === 0 && !isEditMode}
//                                                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//                                             >
//                                                 {isEditMode
//                                                     ? 'Update Purchase Order'
//                                                     : approvedRequisitions.length === 0
//                                                         ? 'No Approved Requisitions'
//                                                         : 'Create Purchase Order'
//                                                 }
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {/* Preview Modal */}
//             {showPreview && (
//                 <PreviewModal
//                     formData={formData}
//                     selectedSupplier={selectedSupplier}
//                     selectedRequisition={selectedRequisition}
//                     selectedItems={getSelectedItems()}
//                     totalCost={calculateTotal()}
//                     onConfirm={handleConfirmSubmit}
//                     onCancel={() => setShowPreview(false)}
//                     isEditMode={isEditMode}
//                 />
//             )}
//         </AppLayout>
//     );
// }
//
// // Preview Modal Component
// function PreviewModal({
//                           formData,
//                           selectedSupplier,
//                           selectedRequisition,
//                           selectedItems,
//                           totalCost,
//                           onConfirm,
//                           onCancel,
//                           isEditMode
//                       }: {
//     formData: any;
//     selectedSupplier: any;
//     selectedRequisition: any;
//     selectedItems: any[];
//     totalCost: number;
//     onConfirm: () => void;
//     onCancel: () => void;
//     isEditMode: boolean;
// }) {
//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-sidebar-border">
//                 {/* Header */}
//                 <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                                 Purchase Order Preview
//                             </h2>
//                             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                                 Review your purchase order before {isEditMode ? 'updating' : 'creating'}
//                             </p>
//                         </div>
//                         <button
//                             onClick={onCancel}
//                             className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
//                         >
//                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>
//
//                 {/* Content */}
//                 <div className="p-6 space-y-6">
//                     {/* Order Summary */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Reference Number
//                                 </label>
//                                 <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">
//                                     {formData.REFERENCE_NO}
//                                 </p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Payment Type
//                                 </label>
//                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
//                                     {formData.PAYMENT_TYPE?.charAt(0).toUpperCase() + formData.PAYMENT_TYPE?.slice(1)}
//                                 </span>
//                             </div>
//                         </div>
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Total Amount
//                                 </label>
//                                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                                     {formatCurrency(totalCost)}
//                                 </p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Items Count
//                                 </label>
//                                 <p className="text-sm text-gray-900 dark:text-white font-medium">
//                                     {selectedItems.length} items
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Supplier Information */}
//                     <div className="border-t border-sidebar-border pt-6">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                             Supplier Information
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Supplier Name
//                                 </label>
//                                 <p className="text-sm text-gray-900 dark:text-white font-medium">
//                                     {selectedSupplier?.NAME}
//                                 </p>
//                                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                                     {selectedSupplier?.EMAIL}
//                                 </p>
//                                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                                     {selectedSupplier?.CONTACT_NUMBER}
//                                 </p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Payment Methods
//                                 </label>
//                                 <div className="flex flex-wrap gap-1">
//                                     {selectedSupplier?.ALLOWS_CASH && (
//                                         <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                                             Cash
//                                         </span>
//                                     )}
//                                     {selectedSupplier?.ALLOWS_DISBURSEMENT && (
//                                         <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
//                                             Disbursement
//                                         </span>
//                                     )}
//                                     {selectedSupplier?.ALLOWS_STORE_CREDIT && (
//                                         <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
//                                             Store Credit
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Requisition Information */}
//                     <div className="border-t border-sidebar-border pt-6">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                             Requisition Information
//                         </h3>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                             <div>
//                                 <span className="text-gray-600 dark:text-gray-400">Requestor:</span>
//                                 <p className="font-medium">{selectedRequisition?.REQUESTOR}</p>
//                             </div>
//                             <div>
//                                 <span className="text-gray-600 dark:text-gray-400">Priority:</span>
//                                 <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
//                                     selectedRequisition?.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
//                                         selectedRequisition?.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
//                                             'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
//                                 }`}>
//                                     {selectedRequisition?.PRIORITY}
//                                 </span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-600 dark:text-gray-400">Date:</span>
//                                 <p>{formatDate(selectedRequisition?.CREATED_AT)}</p>
//                             </div>
//                             <div>
//                                 <span className="text-gray-600 dark:text-gray-400">Items:</span>
//                                 <p>{selectedRequisition?.ITEMS.length}</p>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Items List */}
//                     <div className="border-t border-sidebar-border pt-6">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                             Order Items ({selectedItems.length})
//                         </h3>
//                         <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
//                             <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                                 <div className="col-span-6">Item</div>
//                                 <div className="col-span-2 text-right">Quantity</div>
//                                 <div className="col-span-2 text-right">Unit Price</div>
//                                 <div className="col-span-2 text-right">Total</div>
//                             </div>
//                             <div className="divide-y divide-sidebar-border">
//                                 {selectedItems.map((item) => (
//                                     <div key={item.ID} className="grid grid-cols-12 gap-4 px-4 py-3">
//                                         <div className="col-span-6">
//                                             <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                                 {item.NAME}
//                                             </p>
//                                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                                                 {item.CATEGORY}
//                                             </p>
//                                         </div>
//                                         <div className="col-span-2 text-right">
//                                             <p className="text-sm text-gray-900 dark:text-white font-medium">
//                                                 {item.QUANTITY}
//                                             </p>
//                                         </div>
//                                         <div className="col-span-2 text-right">
//                                             <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                 {formatCurrency(item.UNIT_PRICE)}
//                                             </p>
//                                         </div>
//                                         <div className="col-span-2 text-right">
//                                             <p className="text-sm font-bold text-gray-900 dark:text-white">
//                                                 {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                             {/* Total Row */}
//                             <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
//                                 <div className="col-span-8"></div>
//                                 <div className="col-span-4 text-right">
//                                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Grand Total:</p>
//                                     <p className="text-lg font-bold text-green-600 dark:text-green-400">
//                                         {formatCurrency(totalCost)}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Remarks */}
//                     {formData.REMARKS && (
//                         <div className="border-t border-sidebar-border pt-6">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                 Remarks
//                             </h3>
//                             <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-sidebar-accent p-3 rounded-lg">
//                                 {formData.REMARKS}
//                             </p>
//                         </div>
//                     )}
//                 </div>
//
//                 {/* Footer */}
//                 <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
//                     <div className="flex justify-end gap-3">
//                         <button
//                             onClick={onCancel}
//                             className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
//                         >
//                             Go Back & Edit
//                         </button>
//                         <button
//                             onClick={onConfirm}
//                             className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
//                         >
//                             {isEditMode ? 'Confirm Update' : 'Confirm & Create Purchase Order'}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
//
// // Supplier Card Component (unchanged)
// function SupplierCard({
//                           supplier,
//                           isSelected,
//                           onSelect,
//                           isBestMatch = false,
//                           matchPercentage = 0,
//                           matchingCategories = [],
//                           allCategories = []
//                       }: {
//     supplier: any;
//     isSelected: boolean;
//     onSelect: () => void;
//     isBestMatch?: boolean;
//     matchPercentage?: number;
//     matchingCategories?: string[];
//     allCategories?: string[];
// }) {
//     // Get all available categories for this supplier from the dataset
//     const supplierCategories = ['Electrical', 'Consumables', 'Tools', 'Parts', 'Equipment', 'Office Supplies'];
//
//     return (
//         <div
//             className={`p-3 border rounded-lg cursor-pointer transition-all ${
//                 isSelected
//                     ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
//                     : 'border-sidebar-border bg-white dark:bg-sidebar hover:border-blue-300 hover:bg-blue-25 dark:hover:bg-blue-900/10'
//             }`}
//             onClick={onSelect}
//         >
//             <div className="flex justify-between items-start">
//                 <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-2">
//                         <span className="font-semibold text-gray-900 dark:text-white truncate">
//                             {supplier.NAME}
//                         </span>
//                         {isBestMatch && (
//                             <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium shrink-0">
//                                 🏆 Best
//                             </span>
//                         )}
//                         {matchPercentage > 0 && (
//                             <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full shrink-0">
//                                 {matchPercentage}%
//                             </span>
//                         )}
//                     </div>
//
//                     <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
//                         {supplier.EMAIL}
//                     </p>
//
//                     {/* All Categories with Color Coding */}
//                     <div className="mb-2">
//                         <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categories:</p>
//                         <div className="flex flex-wrap gap-1">
//                             {supplierCategories.map((category, index) => {
//                                 const isMatch = matchingCategories.includes(category);
//                                 return (
//                                     <span
//                                         key={index}
//                                         className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
//                                             isMatch
//                                                 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                                                 : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
//                                         }`}
//                                     >
//                                         {isMatch ? '✅ ' : '📦 '}{category}
//                                     </span>
//                                 );
//                             })}
//                         </div>
//                     </div>
//
//                     {/* Payment Methods */}
//                     <div className="flex flex-wrap gap-1">
//                         {supplier.ALLOWS_CASH && (
//                             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                                 💵 Cash
//                             </span>
//                         )}
//                         {supplier.ALLOWS_DISBURSEMENT && (
//                             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
//                                 🏦 Disbursement
//                             </span>
//                         )}
//                         {supplier.ALLOWS_STORE_CREDIT && (
//                             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
//                                 💳 Store Credit
//                             </span>
//                         )}
//                     </div>
//                 </div>
//
//                 {isSelected && (
//                     <div className="text-blue-600 dark:text-blue-400 ml-2 shrink-0">
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                         </svg>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
//
// // Currency formatter
// const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'PHP',
//         minimumFractionDigits: 2
//     }).format(amount);
// };
//
// // Date formatter
// const formatDate = (dateString: string) => {
//     try {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     } catch {
//         return 'Invalid Date';
//     }
// };
