import AppLayout from '@/layouts/app-layout';
import { requisitions } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

interface RequisitionAdjustProps {
    auth: any;
    requisitionId: number;
    serverRequisition: any;
    initialItems: RequisitionItem[];
}

interface RequisitionItem {
    id: string | number;
    name: string;
    category?: string;
    quantity: number; // Original requested
    approved_quantity: number | string;
    unit_price: number;
    total: number;
    itemId?: number;
}

const breadcrumbs = (requisitionId: number): BreadcrumbItem[] => [
    { title: 'RequisitionMain', href: requisitions().url },
    { title: `Adjust Requisition #${requisitionId}`, href: `/requisitions/${requisitionId}/adjust` },
];

export default function RequisitionAdjust({
                                              auth,
                                              requisitionId,
                                              serverRequisition,
                                              initialItems = []
                                          }: RequisitionAdjustProps) {

    // --- STATE ---
    const [items, setItems] = useState<RequisitionItem[]>(() => {
        return initialItems.map(item => ({
            ...item,
            approved_quantity: item.approved_quantity !== null && item.approved_quantity !== undefined
                ? item.approved_quantity
                : item.quantity
        }));
    });

    // STRICTLY fetching from 'remarks' column.
    // If you see text here, your DB 'remarks' column is not empty.
    const [remarks, setRemarks] = useState(serverRequisition.remarks || '');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- CALCULATIONS ---
    const grandTotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const qty = parseFloat(item.approved_quantity.toString()) || 0;
            const price = parseFloat(item.unit_price.toString()) || 0;
            return sum + (qty * price);
        }, 0);
    }, [items]);

    const originalTotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity.toString()) || 0;
            const price = parseFloat(item.unit_price.toString()) || 0;
            return sum + (qty * price);
        }, 0);
    }, [items]);

    // --- HANDLERS ---
    const updateApprovedQuantity = (id: string | number, value: string) => {
        const currentItem = items.find(item => item.id === id);
        if (!currentItem) return;

        if (value === '') {
            setItems(prev => prev.map(item => item.id === id ? { ...item, approved_quantity: '' } : item));
            return;
        }

        const numValue = parseFloat(value);
        if (numValue < 0) return;

        // 🛑 PREVENT EXCEEDING ORIGINAL QUANTITY
        if (numValue > currentItem.quantity) {
            // Simply do nothing if they try to go higher
            return;
        }

        setItems(prev => prev.map(item => item.id === id ? { ...item, approved_quantity: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            items: items.map(item => ({
                id: item.id,
                approved_quantity: item.approved_quantity === '' ? 0 : item.approved_quantity
            })),
            remarks: remarks, // Saves to remarks column
            total_amount: grandTotal
        };

        router.put(`/requisitions/${requisitionId}/adjust`, payload, {
            onSuccess: () => setIsSubmitting(false),
            onError: () => {
                setIsSubmitting(false);
                alert("Failed to save adjustments.");
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
            <Head title="Adjust Requisition" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Adjust Approved Quantities</h1>
                        <p className="text-sm text-gray-500">
                            Requisition #{serverRequisition.references_no || requisitionId} • Requestor: {serverRequisition.requestor}
                        </p>
                    </div>
                    <Link href={requisitions().url} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
                        Cancel & Back
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto p-6">
                        <div className="w-full max-w-6xl mx-auto bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg overflow-hidden">

                            {/* Summary Banner */}
                            <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-b border-sidebar-border/70 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-100">Adjustment Mode</h2>
                                    <p className="text-sm text-cyan-700 dark:text-cyan-300">
                                        Modify the quantities below. Max limit is the requested quantity.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase">Original Total</div>
                                    <div className="text-lg font-semibold text-gray-500 line-through decoration-red-500">
                                        ₱{originalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-green-600 uppercase mt-1 font-bold">New Approved Total</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                                {/* 1. READ-ONLY NOTES (From 'notes' column) */}
                                {serverRequisition.notes && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Original Request Notes
                                        </label>
                                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                                            {serverRequisition.notes}
                                        </p>
                                    </div>
                                )}

                                {/* 2. ITEMS TABLE */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Item Name</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3 text-right text-gray-500">Requested Qty</th>
                                            <th className="px-4 py-3 text-right bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 w-40">
                                                Approved Qty
                                            </th>
                                            <th className="px-4 py-3 text-right">Unit Price</th>
                                            <th className="px-4 py-3 text-right">Approved Total</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {items.map((item) => {
                                            const rowTotal = (parseFloat(item.approved_quantity.toString()) || 0) * item.unit_price;
                                            const isModified = item.approved_quantity != item.quantity;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                        {item.category || 'Service'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-500">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-2 text-right bg-green-50/50 dark:bg-green-900/5">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={item.quantity}
                                                            step="0.01"
                                                            value={item.approved_quantity}
                                                            onChange={(e) => updateApprovedQuantity(item.id, e.target.value)}
                                                            className={`w-full text-right rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-green-500 focus:border-green-500 text-sm font-bold ${
                                                                isModified ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                        ₱{Number(item.unit_price).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                                        ₱{rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 3. ADJUSTMENT REMARKS (Editable, maps to 'remarks') */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Adjustment Remarks <span className="text-gray-400 font-normal">(Why are you adjusting this?)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Only 5 units in stock, approved partial amount."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-500/30 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Confirm Adjustments'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
