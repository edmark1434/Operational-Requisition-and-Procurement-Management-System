"use client"

import * as React from "react"
import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react'

// --- Interfaces ---
interface RequisitionService {
    id: string;
    categoryId?: string;
    categoryName?: string;
    serviceId?: string;
    serviceName: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    hourlyRate?: string;
    // NEW: Optional Item Link
    itemId?: string;
    itemName?: string;
}

// Service Model from Laravel
interface Service {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    vendor_id: number;
    is_active: number | boolean;
    category_id: number;
}

// Category Model
interface Category {
    id: number;
    name: string;
}

// NEW: Item Model from Laravel
interface InventoryItem {
    id: number;
    name: string;
    current_stock: number;
    unit_price: number;
}

interface RequisitionServiceProps {
    services: RequisitionService[];
    setServices: (services: RequisitionService[]) => void;
    validationErrors: any;
    setValidationErrors: (errors: any) => void;
    getTotalAmount: () => number;
    updateService: (id: string, field: keyof RequisitionService, value: string) => void;
    saveService: (id: string) => void;
    removeService: (id: string) => void;
    addNewService: () => void;
    hasError: (serviceId: string, field: 'quantity' | 'serviceName' | 'description') => boolean;
    editService: (id: string) => void;
    systemServices: Service[];
    availableCategories: Category[];
    inventoryItems: InventoryItem[]; // <-- Receive Items from Controller
}

export default function RequisitionService({
                                               services: requisitionServices,
                                               validationErrors,
                                               updateService,
                                               saveService,
                                               removeService,
                                               addNewService,
                                               hasError,
                                               editService,
                                               systemServices,
                                               availableCategories = [],
                                               inventoryItems = [] // Default empty
                                           }: RequisitionServiceProps) {


    // 1. Handle Category Selection
    const handleCategoryChange = (serviceId: string, categoryId: string) => {
        const category = availableCategories.find(c => c.id.toString() === categoryId);

        updateService(serviceId, 'categoryId', categoryId);
        updateService(serviceId, 'categoryName', category?.name || '');

        // Reset Service Selection when Category changes
        updateService(serviceId, 'serviceId', '');
        updateService(serviceId, 'serviceName', '');
        updateService(serviceId, 'description', '');
        updateService(serviceId, 'unit_price', '');
        updateService(serviceId, 'hourlyRate', '');
        updateService(serviceId, 'total', '');
        // We do NOT reset Item ID here, as the item might be independent of the service category
    };

    // 2. Handle Service Selection
    const handleServiceSelect = (serviceId: string, selectedValue: string) => {
        if (!selectedValue) {
            updateService(serviceId, 'serviceName', '');
            updateService(serviceId, 'description', '');
            updateService(serviceId, 'unit_price', '');
            updateService(serviceId, 'total', '');
            updateService(serviceId, 'serviceId', '');
            updateService(serviceId, 'hourlyRate', '');
            return;
        }

        const selectedService = systemServices.find(s => s.id.toString() === selectedValue);

        if (selectedService) {
            updateService(serviceId, 'serviceName', selectedService.name);
            updateService(serviceId, 'description', selectedService.description);
            updateService(serviceId, 'unit_price', selectedService.hourly_rate.toString());
            updateService(serviceId, 'serviceId', selectedService.id.toString());
            updateService(serviceId, 'hourlyRate', selectedService.hourly_rate.toString());

            const currentService = requisitionServices.find(s => s.id === serviceId);
            const newQuantity = currentService?.quantity && currentService.quantity !== '' ? currentService.quantity : '1';
            updateService(serviceId, 'quantity', newQuantity);

            const quantity = parseFloat(newQuantity) || 0;
            const unitPrice = selectedService.hourly_rate;
            const total = (quantity * unitPrice).toFixed(2);
            updateService(serviceId, 'total', total);
        }
    };

    // 3. Handle Quantity Change
    const handleQuantityChange = (serviceId: string, quantityValue: string) => {
        const service = requisitionServices.find(service => service.id === serviceId);
        if (!service) return;

        updateService(serviceId, 'quantity', quantityValue);

        if (quantityValue && service.unit_price) {
            const quantity = parseFloat(quantityValue) || 0;
            const unitPrice = parseFloat(service.unit_price) || 0;
            const total = (quantity * unitPrice).toFixed(2);
            updateService(serviceId, 'total', total);
        } else {
            updateService(serviceId, 'total', '');
        }
    };

    // 4. Handle Optional Item Link Selection
    const handleItemSelect = (serviceId: string, selectedItemId: string) => {
        const item = inventoryItems.find(i => i.id.toString() === selectedItemId);
        if (item) {
            updateService(serviceId, 'itemId', item.id.toString());
            updateService(serviceId, 'itemName', item.name);
        } else {
            updateService(serviceId, 'itemId', '');
            updateService(serviceId, 'itemName', '');
        }
    }

    const getServiceDisplayData = (service: RequisitionService) => {
        const systemService = systemServices.find(sys => sys.id.toString() === service.serviceId);
        return {
            description: service.description || systemService?.description || '',
            hourlyRate: service.hourlyRate || service.unit_price || systemService?.hourly_rate.toString() || '0.00',
            serviceName: service.serviceName || systemService?.name || ''
        };
    };

    return (
        <div className="lg:col-span-2 flex flex-col">
            <div className="p-4 border border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Requested Services ({requisitionServices.length})
                    </h3>
                    <button
                        type="button"
                        onClick={addNewService}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 ease-in-out"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Service
                    </button>
                </div>

                {validationErrors.services && (
                    <div className="mb-4 p-3 border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-500 text-sm">{validationErrors.services}</p>
                    </div>
                )}

                <div className={`space-y-3 overflow-y-auto pr-2 ${requisitionServices.length > 2 ? 'max-h-96' : ''}`}>
                    {requisitionServices.map((service, index) => {
                        const displayData = getServiceDisplayData(service);

                        // Filter services based on selected category
                        const filteredServices = service.categoryId
                            ? systemServices.filter(s => s.category_id.toString() === service.categoryId)
                            : [];

                        return (
                            <div
                                key={service.id}
                                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                                    service.isSaved
                                        ? 'border-green-600 bg-white dark:bg-sidebar-accent'
                                        : validationErrors.services && (!service.serviceName.trim() || !service.quantity.trim())
                                            ? 'border-red-300 dark:border-red-500 bg-white dark:bg-sidebar-accent'
                                            : 'border-sidebar-border bg-white dark:bg-sidebar-accent'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-medium text-sm ${
                                        service.isSaved
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-gray-900 dark:text-white'
                                    }`}>
                                        Service {requisitionServices.length - index} {service.isSaved && <Check className="w-3 h-3 inline ml-1" />}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {service.isSaved ? (
                                            <button
                                                type="button"
                                                onClick={() => editService(service.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => saveService(service.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                            >
                                                <Save className="w-3.5 h-3.5" /> Save
                                            </button>
                                        )}
                                        {requisitionServices.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeService(service.id)}
                                                className="flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">

                                    {/* 1. Category Select */}
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Service Category
                                        </label>
                                        <select
                                            value={service.categoryId || ""}
                                            onChange={(e) => handleCategoryChange(service.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-sidebar-border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                            required
                                            disabled={service.isSaved}
                                        >
                                            <option value="">Select Category...</option>
                                            {availableCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Service Select (Filtered) */}
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Service Name
                                        </label>
                                        <select
                                            value={service.serviceId || ""}
                                            onChange={(e) => handleServiceSelect(service.id, e.target.value)}
                                            className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                hasError(service.id, 'serviceName') ? 'border-red-500' : 'border-sidebar-border'
                                            }`}
                                            required
                                            disabled={service.isSaved || !service.categoryId}
                                        >
                                            <option value="">
                                                {service.categoryId
                                                    ? (filteredServices.length > 0 ? "Select Service..." : "No services in this category")
                                                    : "Select category first..."
                                                }
                                            </option>
                                            {filteredServices.map((sysService) => (
                                                <option key={sysService.id} value={sysService.id}>
                                                    {sysService.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. OPTIONAL ITEM/MATERIAL SELECT */}
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Include Material/Item (Optional)
                                        </label>
                                        <select
                                            value={service.itemId || ""}
                                            onChange={(e) => handleItemSelect(service.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-sidebar-border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                            disabled={service.isSaved}
                                        >
                                            <option value="">None</option>
                                            {inventoryItems.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} (Stock: {item.current_stock})
                                                </option>
                                            ))}
                                        </select>
                                        {service.itemId && (
                                            <p className="text-[10px] text-blue-500 mt-1">
                                                * This item will be deducted from inventory upon approval.
                                            </p>
                                        )}
                                    </div>

                                    {(displayData.serviceName || displayData.description) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-2 bg-gray-50 dark:bg-input rounded border border-sidebar-border">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Description
                                                </label>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {displayData.description || 'No description available'}
                                                </p>
                                            </div>

                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                                <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">
                                                    Hourly Rate
                                                </label>
                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                    ${displayData.hourlyRate}/hour
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Hours
                                            </label>
                                            <input
                                                type="number"
                                                value={service.quantity}
                                                onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                                                min="1"
                                                step="0.5"
                                                className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                    service.isSaved
                                                        ? 'bg-white dark:bg-sidebar-accent border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                        : hasError(service.id, 'quantity')
                                                            ? 'border-red-500 dark:border-red-500 bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white'
                                                            : 'bg-white dark:bg-sidebar-accent border-sidebar-border text-gray-900 dark:text-white'
                                                }`}
                                                placeholder="Hours"
                                                required
                                                disabled={service.isSaved || !service.serviceName}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Total
                                            </label>
                                            <div className={`w-full px-2 py-1 text-sm border rounded shadow-sm ${
                                                service.isSaved
                                                    ? 'bg-white dark:bg-sidebar-accent border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                    : 'bg-gray-50 dark:bg-sidebar-accent border-sidebar-border text-gray-900 dark:text-white'
                                            }`}>
                                                ${service.total || '0.00'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
