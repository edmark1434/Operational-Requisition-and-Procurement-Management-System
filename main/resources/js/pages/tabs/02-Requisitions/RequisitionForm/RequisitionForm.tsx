// RequisitionForm.tsx
import AppLayout from '@/layouts/app-layout';
import { requisitions, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

// Import your datasets
import itemsData from "@/pages/datasets/items";
import categoriesData from "@/pages/datasets/category";
import usersData from '@/pages/datasets/user';
import serviceData from '@/pages/datasets/service'; // ADD THIS IMPORT

// Import components
import RequestorInformation from './RequestorInformation';
import RequisitionDetails from './RequisitionDetails';
import RequestedItems from './RequestedItems';
import RequisitionService from './RequisitionService';
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
    itemName: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    itemId?: number;
}

interface RequisitionService {
    id: string;
    serviceId?: string;
    serviceName: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    hourlyRate?: string; // ADD THIS
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    services?: string;
    [key: string]: string | undefined;
}

export default function RequisitionForm({ auth }: { auth: any }) {
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [priority, setPriority] = useState('normal');
    const [type, setType] = useState('items'); // 'items' or 'services'
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<RequisitionItem[]>([
        {
            id: '1',
            category: '',
            itemName: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false
        }
    ]);
    const [services, setServices] = useState<RequisitionService[]>([
        {
            id: '1',
            serviceName: '',
            description: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false,
            hourlyRate: '' // ADD THIS
        }
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

    // Use actual services from dataset - ADD THIS
    const systemServices = serviceData;

    // Reset items/services when type changes
    const handleTypeChange = (newType: string) => {
        setType(newType);
        // Clear validation errors when switching types
        setValidationErrors(prev => ({ ...prev, items: undefined, services: undefined }));
    };

    // Items functions
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

    // Services functions
    const addNewService = () => {
        const newService = {
            id: Date.now().toString(),
            serviceName: '',
            description: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false,
            hourlyRate: '' // ADD THIS
        };
        setServices(prev => [newService, ...prev]);
        setValidationErrors(prev => ({ ...prev, services: undefined }));
    };

    const removeService = (id: string) => {
        if (services.length > 1) {
            setServices(prev => prev.filter(service => service.id !== id));
        }
    };

    const updateService = (id: string, field: keyof RequisitionService, value: string) => {
        setServices(prev => prev.map(service => {
            if (service.id === id) {
                const updatedService = { ...service, [field]: value, isSaved: false };

                // Calculate total when quantity OR unit_price is changed
                if (field === 'quantity' && service.unit_price) {
                    const quantity = parseFloat(value) || 0;
                    const unitPrice = parseFloat(service.unit_price) || 0;
                    updatedService.total = (quantity * unitPrice).toFixed(2);
                } else if (field === 'unit_price' && service.quantity) {
                    const quantity = parseFloat(service.quantity) || 0;
                    const unitPrice = parseFloat(value) || 0;
                    updatedService.total = (quantity * unitPrice).toFixed(2);
                }

                return updatedService;
            }
            return service;
        }));

        if (field === 'quantity' || field === 'serviceName') {
            setValidationErrors(prev => ({ ...prev, services: undefined }));
        }
    };

    const saveService = (id: string) => {
        const serviceToSave = services.find(service => service.id === id);
        if (!serviceToSave) return;

        // Validate required fields
        if (!serviceToSave.serviceName.trim() || !serviceToSave.quantity.trim()) {
            alert('Please fill in service name and quantity before saving the service.');
            return;
        }

        setServices(prev => {
            const updatedServices = prev.map(service =>
                service.id === id ? {
                    ...service,
                    isSaved: true
                } : service
            );

            const savedService = updatedServices.find(service => service.id === id);
            if (savedService) {
                const filteredServices = updatedServices.filter(service => service.id !== id);
                return [...filteredServices, savedService];
            }

            return updatedServices;
        });
    };

    const editService = (id: string) => {
        setServices(prev => prev.map(service =>
            service.id === id
                ? { ...service, isSaved: false }
                : service
        ));
    };

    const getTotalAmount = () => {
        if (type === 'items') {
            return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        } else {
            return services.reduce((sum, service) => sum + (parseFloat(service.total) || 0), 0);
        }
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        // Validate requestor
        if (requestorType === 'other' && !otherRequestor.trim() && !selectedUser) {
            errors.requestor = 'Please select or enter a requestor name';
        }

        if (type === 'items') {
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
        } else {
            // Validate services
            const unsavedServices = services.filter(service => !service.isSaved);
            if (unsavedServices.length > 0) {
                errors.services = 'Please save all services before submitting';
            }

            if (services.length === 0) {
                errors.services = 'Please add at least one service';
            }

            const invalidServices = services.filter(service =>
                !service.isSaved && (!service.serviceName.trim() || !service.quantity.trim())
            );
            if (invalidServices.length > 0) {
                errors.services = 'All services must have service name and quantity filled out before saving';
            }
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
            type,
            notes,
            items: type === 'items' ? items.map(item => ({
                ...item,
                itemId: item.itemId || null
            })) : [],
            services: type === 'services' ? services.map(service => ({
                ...service
            })) : [],
            total_amount: getTotalAmount(),
            us_id: requestorType === 'self' ? auth.user.id :
                selectedUser ? parseInt(selectedUser) : null
        };

        // Show preview instead of submitting directly
        setPreviewData(formData);
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        // TODO: Add submission logic when backend is ready
        alert('Requisition submitted successfully! (Demo mode)');
        setShowPreview(false);
        router.visit('/requisitions');
    };

    const clearForm = () => {
        setRequestorType('self');
        setOtherRequestor('');
        setSelectedUser('');
        setPriority('normal');
        setType('items');
        setNotes('');
        setItems([{
            id: '1',
            category: '',
            itemName: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false
        }]);
        setServices([{
            id: '1',
            serviceName: '',
            description: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false,
            hourlyRate: '' // ADD THIS
        }]);
        setValidationErrors({});
    };

    const hasError = (id: string, field: string) => {
        if (type === 'items') {
            const item = items.find(item => item.id === id);
            if (!item || item.isSaved) return false;

            if (validationErrors.items) {
                if (field === 'quantity' && !item.quantity.trim()) return true;
                if (field === 'category' && !item.category.trim()) return true;
                if (field === 'itemName' && !item.itemName.trim()) return true;
            }
            return false;
        } else {
            const service = services.find(service => service.id === id);
            if (!service || service.isSaved) return false;

            if (validationErrors.services) {
                if (field === 'quantity' && !service.quantity.trim()) return true;
                if (field === 'serviceName' && !service.serviceName.trim()) return true;
            }
            return false;
        }
    };

    const getItemSuggestions = (itemName: string) => {
        if (!itemName.trim()) return [];
        return systemItems.filter(item =>
            item.name.toLowerCase().includes(itemName.toLowerCase())
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
                                                type={type}
                                                setType={handleTypeChange}
                                                notes={notes}
                                                setNotes={setNotes}
                                            />
                                        </div>

                                        {/* Right Column - Items/Services Section (Wider) */}
                                        {type === 'items' ? (
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
                                        ) : (
                                            <RequisitionService
                                                services={services}
                                                setServices={setServices}
                                                validationErrors={validationErrors}
                                                setValidationErrors={setValidationErrors}
                                                getTotalAmount={getTotalAmount}
                                                updateService={updateService}
                                                saveService={saveService}
                                                removeService={removeService}
                                                addNewService={addNewService}
                                                hasError={hasError}
                                                editService={editService}
                                                systemServices={systemServices} // ADD THIS PROP
                                            />
                                        )}
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
