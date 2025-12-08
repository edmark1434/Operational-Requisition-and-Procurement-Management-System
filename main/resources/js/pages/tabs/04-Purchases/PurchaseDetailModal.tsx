import { useState, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { formatCurrency, formatDate } from './utils/formatters';
import { getStatusColor, getStatusDisplayName } from './utils/purchaseCalculations';
import { router } from "@inertiajs/react";
import {groupRequisitionItems} from "@/pages/tabs/04-Purchases/utils/groupedItems";
import {groupRequisitionServices} from "@/pages/tabs/04-Purchases/utils/groupedServices";
import {RequisitionItem} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import {Category} from "@/pages/tabs/04-Purchases/Purchases";

interface PurchaseDetailModalProps {
    purchase: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, newStatus: string) => void;
    categories: Category[];
}

export default function PurchaseDetailModal({
                                                purchase,
                                                isOpen,
                                                onClose,
                                                onEdit,
                                                onDelete,
                                                onStatusChange,
                                                categories
                                            }: PurchaseDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. Define safePurchase to prevent crashes during close animation
    const safePurchase = purchase || {};

    // --- FIX: Check for both 'pending' and 'pending_approval' ---
    const statusLower = (safePurchase.STATUS || '').toLowerCase();
    const isPending = statusLower === 'pending' || statusLower === 'pending_approval';

    const handleDelete = () => {
        if (safePurchase.ID) {
            onDelete(safePurchase.ID);
        }
        setShowDeleteConfirm(false);
    };

    const handleStatusChange = (newStatus: string) => {
        if (!safePurchase.ID) return;

        // --- OPTIMISTIC UPDATE START ---
        setShowStatusDropdown(false);
        onStatusChange(safePurchase.ID, newStatus);
        // --- OPTIMISTIC UPDATE END ---

        // 4. Send request in background
        router.put(`/purchases/${safePurchase.ID}/status`, { status: newStatus }, {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Status update failed", errors);
            }
        });
    };

    // --- NEW: Handle Issue Action ---
    const handleIssue = () => {
        handleStatusChange('issued');
        onClose();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const statusOptions = [
        { value: 'pending_approval', label: 'Pending Approval', description: 'Automatically created when requisition is approved' },
        { value: 'merged', label: 'Merged', description: 'When merged with other purchase orders' },
        { value: 'issued', label: 'Issued', description: 'When manager sends PO to supplier' },
        { value: 'rejected', label: 'Rejected', description: 'When PO is rejected by supplier' },
        { value: 'delivered', label: 'Delivered', description: 'When delivery is created' },
        { value: 'partially_delivered', label: 'Partially Delivered', description: 'When delivery is created, but return is also created' },
        { value: 'received', label: 'Received', description: 'When encoder marks it received via requisition' }
    ];

    // Get items or services based on order type
    const getOrderItems = () => {
        if (safePurchase.ORDER_TYPE === 'services') {
            return safePurchase.SERVICES || [];
        }
        return safePurchase.ITEMS || [];
    };

    const orderItems = getOrderItems();
    const isServiceOrder = safePurchase.ORDER_TYPE === 'services';

    const getRequisitionData = (): {
        REQUESTOR: string;
        PRIORITY: string[];
        CATEGORIES: number[];
        ITEMS: RequisitionItem[];
    } => {
        if (!orderItems || orderItems.length === 0) {
            return {
                REQUESTOR: "N/A",
                PRIORITY: ["N/A"],
                CATEGORIES: [],
                ITEMS: []
            };
        }

        // --- Unique Requestors ---
        const uniqueRequestors: string[] = Array.from(
            new Set(
                orderItems.map((i: any) =>
                    typeof i.REQUESTOR === "string" && i.REQUESTOR.trim() !== ""
                        ? i.REQUESTOR
                        : "N/A"
                )
            )
        );

        let REQUESTOR: string;

        if (uniqueRequestors.length === 0) {
            REQUESTOR = "N/A";
        } else if (uniqueRequestors.length === 1) {
            REQUESTOR = uniqueRequestors[0];
        } else {
            REQUESTOR = `${uniqueRequestors.length} requestors`;
        }

        // --- Priorities ---
        const PRIORITY: string[] = Array.from(
            new Set(
                orderItems.map((i: any) =>
                    typeof i.PRIORITY === "string" ? i.PRIORITY : "N/A"
                )
            )
        );

        // --- Categories ---
        const CATEGORIES: number[] = Array.from(
            new Set(
                orderItems
                    .map((i: any) =>
                        typeof i.CATEGORY_ID === "number" ? i.CATEGORY_ID : null
                    )
                    .filter((x: number | null): x is number => x !== null)
            )
        );

        // --- Items ---
        const ITEMS = orderItems as RequisitionItem[];

        return {
            REQUESTOR,
            PRIORITY,
            CATEGORIES,
            ITEMS
        };
    };



    const requisitionData = getRequisitionData();

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        {/* Modified overlay: slightly darker for better glass contrast */}
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                {/* Modal Panel: Applied Transparent Blur BG here */}
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-white/90 dark:bg-sidebar/90 backdrop-blur-xl text-left align-middle shadow-2xl transition-all border border-sidebar-border flex flex-col max-h-[90vh]">

                                    {/* Header - Semi-transparent sticky header */}
                                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white/80 dark:bg-sidebar/90 backdrop-blur-md sticky top-0 z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {safePurchase.REFERENCE_NO}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Purchase Order Details
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                        isServiceOrder
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}>
                                                        {isServiceOrder ? 'Services' : 'Items'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50/50 dark:hover:bg-sidebar-accent/50"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content - Removed solid BG to allow Panel transparency to show */}
                                    <div className="flex-1 overflow-y-auto bg-transparent">
                                        <div className="p-6 space-y-6">
                                            {/* Order Summary */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Status
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(safePurchase.STATUS)}`}>
                                                                <PurchaseStatusIcon status={safePurchase.STATUS} />
                                                                {getStatusDisplayName(safePurchase.STATUS)}
                                                            </div>
                                                            <div className="relative" ref={dropdownRef}>
                                                                <button
                                                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                    Change Status
                                                                </button>

                                                                {showStatusDropdown && (
                                                                    // Dropdown remains solid for readability
                                                                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg shadow-xl z-20">
                                                                        <div className="p-3">
                                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                                                                Update Status
                                                                            </div>
                                                                            <div className="max-h-48 overflow-y-auto pr-1">
                                                                                {statusOptions.map((status) => (
                                                                                    <button
                                                                                        key={status.value}
                                                                                        onClick={() => handleStatusChange(status.value)}
                                                                                        className={`w-full text-left px-3 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                                            safePurchase.STATUS === status.value
                                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                                                : 'border border-transparent'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-3 flex-1">
                                                                                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                                                                                safePurchase.STATUS === status.value
                                                                                                    ? 'bg-blue-600 dark:bg-blue-400'
                                                                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                                                            }`}>
                                                                                                {safePurchase.STATUS === status.value && (
                                                                                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                                    </svg>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                                                    {status.label}
                                                                                                </div>
                                                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                                                                    {status.description}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </button>
                                                                                ))}
                                                                            </div>

                                                                            {statusOptions.length > 4 && (
                                                                                <div className="mt-2 pt-2 border-t border-sidebar-border">
                                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                                                                        Scroll for more options
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Reference Number
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white font-mono font-medium">
                                                            {safePurchase.REFERENCE_NO}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Order Date
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {safePurchase.CREATED_AT ? formatDate(safePurchase.CREATED_AT) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {safePurchase.ORDER_TYPE !== 'services' ? (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Total Amount
                                                                </label>
                                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(safePurchase.TOTAL_COST || 0)}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="h-14"></div>
                                                    )}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Payment Type
                                                        </label>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {safePurchase.PAYMENT_TYPE ? safePurchase.PAYMENT_TYPE.charAt(0).toUpperCase() + safePurchase.PAYMENT_TYPE.slice(1) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            {isServiceOrder ? 'Services Count' : 'Items Count'}
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {orderItems.length} {isServiceOrder ? 'services' : 'items'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Supplier Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Supplier Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Supplier Name
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {safePurchase.SUPPLIER_NAME || 'No supplier assigned'}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {safePurchase.SUPPLIER_EMAIL}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {safePurchase.SUPPLIER_CONTACT}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Payment Methods
                                                        </label>
                                                        <div className="flex flex-wrap gap-1">
                                                            {safePurchase.PAYMENT_TYPE && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                    Cash
                                                                </span>
                                                            )}
                                                            {safePurchase.ALLOWS_DISBURSEMENT && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                    Disbursement
                                                                </span>
                                                            )}
                                                            {safePurchase.ALLOWS_STORE_CREDIT && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                    Store Credit
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Requisition Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Requisition Information
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Requestor:</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-2">{requisitionData.REQUESTOR}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            { requisitionData.PRIORITY.map(p =>
                                                                <div className="">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                        p === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                            p === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    }`}>
                                                                        {p}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            { requisitionData.CATEGORIES.map(cId =>
                                                                <div className="">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
                                                                        {categories.find(c => c.id === cId)?.name || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {safePurchase.ORDER_TYPE === 'items' ? 'Items:' : 'Services:'}
                                                        </span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-2">
                                                            {orderItems.length}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items/Services List */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Order {isServiceOrder ? 'Services' : 'Items'}
                                                </h3>
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        <div className={`col-span-6 ${isServiceOrder && ('col-span-8')}`}>{isServiceOrder ? 'Service' : 'Item'}</div>
                                                        <div className="col-span-2 text-right">{isServiceOrder ? '' : 'Quantity'}</div>
                                                        <div className="col-span-2 text-right">{isServiceOrder ? 'Hourly Rate' : 'Unit Price'}</div>
                                                        {!isServiceOrder && (<div className="col-span-2 text-right">Total</div>)}
                                                    </div>
                                                    <div className="divide-y divide-sidebar-border">
                                                        {orderItems.map((item: any) => (
                                                            <div key={item.ID} className="grid grid-cols-12 gap-4 px-4 py-3">
                                                                <div className={`col-span-6 ${isServiceOrder && ('col-span-8')}`}>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {item.NAME}
                                                                    </p>
                                                                    {isServiceOrder && item.DESCRIPTION && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                            {item.DESCRIPTION}
                                                                        </p>
                                                                    )}
                                                                    {!isServiceOrder && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {item.CATEGORY}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="col-span-2 text-right">
                                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                                        {item.QUANTITY}
                                                                    </p>
                                                                </div>
                                                                <div className="col-span-2 text-right">
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {isServiceOrder ? formatCurrency(item.HOURLY_RATE) : formatCurrency(item.UNIT_PRICE)}
                                                                        {isServiceOrder && '/hr'}
                                                                    </p>
                                                                </div>
                                                                {!isServiceOrder && (
                                                                    <div className="col-span-2 text-right">
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                            {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Total Row */}
                                                    {!isServiceOrder && (
                                                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                                            <div className="col-span-8"></div>
                                                            <div className="col-span-4 text-right">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Grand Total:</p>
                                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(safePurchase.TOTAL_COST || 0)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Additional Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Additional Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Remarks
                                                        </label>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {safePurchase.REMARKS ?? 'No remarks'}
                                                        </p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer with Actions - Semi-transparent */}
                                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50/80 dark:bg-sidebar-accent/80 backdrop-blur-xl">
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete Order
                                            </button>
                                            <div className="flex gap-3">

                                                <button
                                                    onClick={onClose}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-sidebar/50 border border-sidebar-border rounded-lg hover:bg-gray-50/50 dark:hover:bg-sidebar-accent/50 transition-colors backdrop-blur-sm"
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    onClick={onEdit}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Order
                                                </button>
                                                {/* Issue Button placed here (last) */}
                                                {isPending && (
                                                    <button
                                                        onClick={handleIssue}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Issue Purchase Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <Transition appear show={showDeleteConfirm} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteConfirm(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                                    <div className="p-6 border-b border-sidebar-border">
                                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                                            Delete Purchase Order
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete "{safePurchase.REFERENCE_NO}"? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="p-6 flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Delete Order
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            )}

        </>
    );
}

// Status Icon Component
function PurchaseStatusIcon({ status }: { status: string }) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'merged':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
            );
        case 'issued':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            );
        case 'rejected':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'delivered':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'partially_delivered':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            );
        case 'received':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        default:
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
}
