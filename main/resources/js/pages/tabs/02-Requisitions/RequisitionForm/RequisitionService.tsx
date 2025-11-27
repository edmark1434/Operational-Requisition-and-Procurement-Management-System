// RequisitionService.tsx - Updated for better editing display
"use client"

import * as React from "react"
import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react'
import { CheckIcon, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

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
}

interface Service {
    ID: number;
    NAME: string;
    DESCRIPTION: string;
    HOURLY_RATE: number;
    VENDOR_ID: number;
    IS_ACTIVE: boolean;
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
                                               systemServices
                                           }: RequisitionServiceProps) {
    // Convert system services to combobox format
    const serviceOptions = systemServices.map(service => ({
        value: service.ID.toString(),
        label: service.NAME,
        description: service.DESCRIPTION,
        hourlyRate: service.HOURLY_RATE,
        vendorId: service.VENDOR_ID,
        isActive: service.IS_ACTIVE
    }));

    const handleServiceSelect = (serviceId: string, selectedValue: string) => {
        if (!selectedValue) {
            // Clear service selection
            updateService(serviceId, 'serviceName', '');
            updateService(serviceId, 'description', '');
            updateService(serviceId, 'unit_price', '');
            updateService(serviceId, 'total', '');
            updateService(serviceId, 'serviceId', '');
            updateService(serviceId, 'hourlyRate', '');
            return;
        }

        // Find the selected service
        const selectedService = serviceOptions.find(service => service.value === selectedValue);
        if (selectedService) {
            updateService(serviceId, 'serviceName', selectedService.label);
            updateService(serviceId, 'description', selectedService.description);
            updateService(serviceId, 'unit_price', selectedService.hourlyRate.toString());
            updateService(serviceId, 'serviceId', selectedService.value);
            updateService(serviceId, 'hourlyRate', selectedService.hourlyRate.toString());


            updateService(serviceId, 'quantity', '1');

            // Calculate total automatically
            const quantity = 1;
            const unitPrice = selectedService.hourlyRate;
            const total = (quantity * unitPrice).toFixed(2);
            updateService(serviceId, 'total', total);
        }
    };

    const handleQuantityChange = (serviceId: string, quantityValue: string) => {
        const service = requisitionServices.find(service => service.id === serviceId);
        if (!service) return;

        // Update quantity
        updateService(serviceId, 'quantity', quantityValue);

        // Only calculate total if we have both quantity and unit price
        if (quantityValue && service.unit_price) {
            const quantity = parseFloat(quantityValue) || 0;
            const unitPrice = parseFloat(service.unit_price) || 0;
            const total = (quantity * unitPrice).toFixed(2);
            updateService(serviceId, 'total', total);
        } else {
            // Clear total if no quantity or unit price
            updateService(serviceId, 'total', '');
        }
    };

    // Get display values for service details
    const getServiceDisplayData = (service: RequisitionService) => {
        const systemService = systemServices.find(sys => sys.ID.toString() === service.serviceId);

        return {
            description: service.description || systemService?.DESCRIPTION || '',
            hourlyRate: service.hourlyRate || service.unit_price || systemService?.HOURLY_RATE.toString() || '0.00',
            serviceName: service.serviceName || systemService?.NAME || ''
        };
    };

    const ServiceCombobox = ({ serviceId, currentService }: { serviceId: string, currentService: RequisitionService }) => {
        const [open, setOpen] = React.useState(false)
        const displayData = getServiceDisplayData(currentService);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between border-sidebar-border bg-white dark:bg-input text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700",
                            hasError(serviceId, 'serviceName') && "border-red-500 dark:border-red-500",
                            currentService.isSaved && "border-green-300 dark:border-green-600"
                        )}
                        disabled={currentService.isSaved}
                    >
                        {displayData.serviceName || "Select service..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-sidebar-border bg-white dark:bg-sidebar shadow-lg">
                    <Command className="bg-white dark:bg-sidebar">
                        <CommandInput
                            placeholder="Search services..."
                            className="h-9 border-sidebar-border"
                        />
                        <CommandList className="bg-white dark:bg-sidebar">
                            <CommandEmpty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                No service found.
                            </CommandEmpty>
                            <CommandGroup className="bg-white dark:bg-sidebar">
                                {serviceOptions.map((service) => (
                                    <CommandItem
                                        key={service.value}
                                        value={service.value}
                                        onSelect={(currentValue) => {
                                            handleServiceSelect(serviceId, currentValue)
                                            setOpen(false)
                                        }}
                                        className="flex flex-col items-start py-2 text-gray-900 dark:text-white aria-selected:bg-gray-100 dark:aria-selected:bg-input"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-medium text-sm">{service.label}</span>
                                            <CheckIcon
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    currentService.serviceId === service.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </div>
                                        <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>${service.hourlyRate}/hr</span>
                                            <span className={service.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                                {service.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 text-left">
                                            {service.description}
                                        </p>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <div className="lg:col-span-2 flex flex-col">
            {/* Requested Services Card */}
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

                {/* Services container with dynamic height */}
                <div className={`space-y-3 overflow-y-auto pr-2 ${requisitionServices.length > 2 ? 'max-h-96' : ''}`}>
                    {requisitionServices.map((service, index) => {
                        const displayData = getServiceDisplayData(service);

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
                                            : validationErrors.services && (!service.serviceName.trim() || !service.quantity.trim())
                                                ? 'text-red-700 dark:text-red-300'
                                                : 'text-gray-900 dark:text-white'
                                    }`}>
                                        Service {requisitionServices.length - index} {service.isSaved && (
                                        <Check className="w-3 h-3 inline ml-1" />
                                    )}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {service.isSaved ? (
                                            // Edit button for saved services
                                            <button
                                                type="button"
                                                onClick={() => editService(service.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-input dark:border-sidebar-border dark:text-gray-300 border border-blue-200 rounded-lg transition duration-150 ease-in-out group"
                                                title="Edit service"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                Edit
                                            </button>
                                        ) : (
                                            // Save button for unsaved services
                                            <button
                                                type="button"
                                                onClick={() => saveService(service.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700 rounded-lg transition duration-150 ease-in-out group"
                                                title="Save service"
                                            >
                                                <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                Save
                                            </button>
                                        )}
                                        {requisitionServices.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeService(service.id)}
                                                className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition duration-150 ease-in-out group"
                                                title="Remove service"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {/* Service Selection Combobox */}
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Service
                                        </label>
                                        <ServiceCombobox
                                            serviceId={service.id}
                                            currentService={service}
                                        />
                                    </div>

                                    {/* Service Details Display - Always show when service has data */}
                                    {(displayData.serviceName || displayData.description) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Description Display */}
                                            <div className="p-2 bg-gray-50 dark:bg-input rounded border border-sidebar-border">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Description
                                                </label>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {displayData.description || 'No description available'}
                                                </p>
                                            </div>

                                            {/* Hourly Rate Display */}
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
                                        {/* Quantity Input */}
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

                                        {/* Total Display */}
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
