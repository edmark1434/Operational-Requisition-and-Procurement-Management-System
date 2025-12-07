"use client"

import * as React from "react"
import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react'

// --- Interfaces (Simplified) ---
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
    itemId?: string;
    itemName?: string;
    // Allow for backend properties that might slip through
    category_id?: number | string;
    service_id?: number | string;
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
    hasError: (serviceId: string, field: 'serviceName' | 'description' | 'categoryId') => boolean;
    editService: (id: string) => void;
    systemServices: Service[];
    availableCategories: Category[];
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

        // Setting nominal values for backend compatibility
        updateService(serviceId, 'unit_price', '0.00');
        updateService(serviceId, 'hourlyRate', '0.00');
        updateService(serviceId, 'quantity', '1');
        updateService(serviceId, 'total', '1.00');
    };

    // 2. Handle Service Selection
    const handleServiceSelect = (serviceId: string, selectedValue: string) => {
        if (!selectedValue) {
            updateService(serviceId, 'serviceName', '');
            updateService(serviceId, 'description', '');
            updateService(serviceId, 'serviceId', '');
            updateService(serviceId, 'unit_price', '0.00');
            updateService(serviceId, 'hourlyRate', '0.00');
            updateService(serviceId, 'quantity', '1');
            updateService(serviceId, 'total', '0.00');
            return;
        }

        const selectedService = systemServices.find(s => s.id.toString() === selectedValue);

        if (selectedService) {
            updateService(serviceId, 'serviceName', selectedService.name);
            updateService(serviceId, 'description', selectedService.description);
            updateService(serviceId, 'serviceId', selectedService.id.toString());
            updateService(serviceId, 'unit_price', selectedService.hourly_rate.toString());
            updateService(serviceId, 'hourlyRate', selectedService.hourly_rate.toString());
            updateService(serviceId, 'quantity', '1');
            updateService(serviceId, 'total', '1.00');
        }
    };

    // Custom save validation
    const handleSave = (id: string) => {
        const serviceToSave = requisitionServices.find(service => service.id === id);
        if (!serviceToSave) return;

        // --- FIX WAS APPLIED HERE ---
        // Changed 'service' to 'serviceToSave'
        const hasCategory = serviceToSave.categoryId || serviceToSave.category_id;

        if (!serviceToSave.serviceName.trim() || !hasCategory) {
            alert('Please select a service category and name before saving.');
            return;
        }
        saveService(id);
    }

    return (
        <div className="lg:col-span-2 flex flex-col">
            <div className="p-4 border border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Requested Services ({requisitionServices.length}) 👷
                    </h3>
                    <button
                        type="button"
                        onClick={addNewService}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 ease-in-out"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Request
                    </button>
                </div>

                {validationErrors.services && (
                    <div className="mb-4 p-3 border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-500 text-sm">{validationErrors.services}</p>
                    </div>
                )}

                <div className={`space-y-3 overflow-y-auto pr-2 ${requisitionServices.length > 2 ? 'max-h-110' : ''}`}>
                    {requisitionServices.map((service, index) => {

                        // 1. Normalize IDs
                        const currentCategoryId = String(
                            service.categoryId || service.category_id || ""
                        );
                        const currentServiceId = String(
                            service.serviceId || service.service_id || ""
                        );

                        // 2. Find the system service using the normalized ID
                        const systemService = systemServices.find(sys => sys.id.toString() === currentServiceId);

                        // 3. Prepare display data using normalized lookups
                        const displayData = {
                            description: service.description || systemService?.description || '',
                            hourlyRate: service.hourlyRate || service.unit_price || systemService?.hourly_rate.toString() || '0.00',
                            serviceName: service.serviceName || systemService?.name || ''
                        };

                        // 4. Filter services based on the normalized Category ID
                        const filteredServices = currentCategoryId
                            ? systemServices.filter(s => s.category_id.toString() === currentCategoryId)
                            : [];

                        return (
                            <div
                                key={service.id}
                                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                                    service.isSaved
                                        ? 'border-green-600 bg-white dark:bg-sidebar-accent'
                                        : validationErrors.services && (!service.serviceName.trim() || !currentCategoryId)
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
                                        Job Request {requisitionServices.length - index} {service.isSaved && <Check className="w-3 h-3 inline ml-1" />}
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
                                                onClick={() => handleSave(service.id)}
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
                                            Job/Service Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={currentCategoryId}
                                            onChange={(e) => handleCategoryChange(service.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-sidebar-border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                            required
                                            disabled={service.isSaved}
                                        >
                                            <option value="">Select Category...</option>
                                            {availableCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Service Select (Filtered) */}
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Job/Service Name <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={currentServiceId}
                                            onChange={(e) => handleServiceSelect(service.id, e.target.value)}
                                            className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                hasError(service.id, 'serviceName') ? 'border-red-500' : 'border-sidebar-border'
                                            }`}
                                            required
                                            disabled={service.isSaved || !currentCategoryId}
                                        >
                                            <option value="">
                                                {currentCategoryId
                                                    ? (filteredServices.length > 0 ? "Select Job/Service..." : "No services in this category")
                                                    : "Select category first..."
                                                }
                                            </option>
                                            {filteredServices.map((sysService) => (
                                                <option key={sysService.id} value={sysService.id.toString()}>
                                                    {sysService.name}
                                                </option>
                                            ))}
                                        </select>
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
                                                    Standard Rate (Reference Only)
                                                </label>
                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                    ${displayData.hourlyRate}/hour
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
