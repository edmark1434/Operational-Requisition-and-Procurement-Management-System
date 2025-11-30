// RequisitionEdit.tsx - Updated version with services support
import AppLayout from '@/layouts/app-layout';
import { requisitions } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Import your datasets
import itemsData from "@/pages/datasets/items";
import categoriesData from "@/pages/datasets/category";
import usersData from '@/pages/datasets/user';
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from "@/pages/datasets/requisition_item";
import requisitionServiceData from "@/pages/datasets/requisition_service"; // ADD THIS
import serviceData from "@/pages/datasets/service"; // ADD THIS

// Import components
import RequestorInformation from './RequestorInformation';
import RequisitionDetails from './RequisitionDetails';
import RequestedItems from './RequestedItems';
import RequisitionService from './RequisitionService'; // ADD THIS
import RequisitionPreviewModal from './RequisitionPreviewModal';

interface RequisitionEditProps {
    auth: any;
    requisitionId: number;
}

interface RequisitionItem {
    id: string;
    category: string;
    itemName: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    itemId?: number;
    originalItemId?: number;
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
    hourlyRate?: string;
    originalServiceId?: number;
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    services?: string;
    [key: string]: string | undefined;
}

const breadcrumbs = (requisitionId: number): BreadcrumbItem[] => [
    {
        title: 'RequisitionMain',
        href: requisitions().url,
    },
    {
        title: `Edit Requisition #${requisitionId}`,
        href: `/requisitions/${requisitionId}/edit`,
    },
];

export default function RequisitionEdit({ auth, requisitionId }: RequisitionEditProps) {
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [priority, setPriority] = useState('normal');
    const [type, setType] = useState('items'); // 'items' or 'services'
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<RequisitionItem[]>([]);
    const [services, setServices] = useState<RequisitionService[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [originalRequisition, setOriginalRequisition] = useState<any>(null);

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

    // Use actual services from dataset
    const systemServices = serviceData;

    // Reset items/services when type changes
    const handleTypeChange = (newType: string) => {
        setType(newType);
        // Clear validation errors when switching types
        setValidationErrors(prev => ({ ...prev, items: undefined, services: undefined }));
    };

    // Load requisition data on component mount
    useEffect(() => {
        loadRequisitionData();
    }, [requisitionId]);

    const loadRequisitionData = () => {
        setIsLoading(true);

        try {
            // Find the requisition to edit
            const requisition = requisitionsData.find(req => req.ID === requisitionId);

            if (!requisition) {
                console.error(`Requisition #${requisitionId} not found`);
                alert('Requisition not found!');
                router.visit(requisitions().url);
                return;
            }

            setOriginalRequisition(requisition);

            // Set basic form data
            setPriority(requisition.PRIORITY.toLowerCase());
            setType(requisition.TYPE); // Set the type from requisition data
            setNotes(requisition.NOTES || '');

            // Determine requestor type and set requestor fields
            const isSelf = requisition.USER_ID === auth.user.id;
            setRequestorType(isSelf ? 'self' : 'other');

            if (isSelf) {
                setSelectedUser('');
                setOtherRequestor('');
            } else {
                // Check if requestor is in system users
                const userInSystem = systemUsers.find(user =>
                    user.name.toLowerCase() === requisition.REQUESTOR.toLowerCase()
                );

                if (userInSystem) {
                    setSelectedUser(userInSystem.id);
                    setOtherRequestor('');
                } else {
                    setSelectedUser('');
                    setOtherRequestor(requisition.REQUESTOR);
                }
            }

            // Load requisition items if it's an items requisition
            if (requisition.TYPE === 'items') {
                const requisitionItems = requisitionItemsData
                    .filter(item => item.REQ_ID === requisitionId)
                    .map(reqItem => {
                        const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
                        const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);

                        return {
                            id: `existing_${reqItem.REQT_ID}`,
                            category: reqItem.CATEGORY || category?.NAME || '',
                            itemName: itemDetails?.NAME || '',
                            quantity: reqItem.QUANTITY.toString(),
                            unit_price: itemDetails?.UNIT_PRICE?.toString() || '0',
                            total: ((itemDetails?.UNIT_PRICE || 0) * reqItem.QUANTITY).toFixed(2),
                            isSaved: true,
                            itemId: reqItem.ITEM_ID,
                            originalItemId: reqItem.ITEM_ID
                        };
                    });

                setItems(requisitionItems.length > 0 ? requisitionItems : [createNewItem()]);
            } else {
                // Load requisition services if it's a services requisition - FIXED VERSION
                const requisitionServices = requisitionServiceData
                    .filter(service => service.REQ_ID === requisitionId)
                    .map(reqService => {
                        const serviceDetails = serviceData.find(service => service.ID === reqService.SERVICE_ID);

                        // Ensure serviceId matches the system service ID for combobox recognition
                        const serviceId = reqService.SERVICE_ID?.toString();

                        return {
                            id: `existing_${reqService.ID}`,
                            serviceId: serviceId, // This is crucial for combobox selection
                            serviceName: serviceDetails?.NAME || '',
                            description: serviceDetails?.DESCRIPTION || '',
                            quantity: reqService.QUANTITY.toString(),
                            unit_price: reqService.UNIT_PRICE.toString(),
                            total: reqService.TOTAL.toString(),
                            isSaved: true,
                            hourlyRate: serviceDetails?.HOURLY_RATE.toString() || reqService.UNIT_PRICE.toString(),
                            originalServiceId: reqService.SERVICE_ID
                        };
                    });

                setServices(requisitionServices.length > 0 ? requisitionServices : [createNewService()]);
            }
        } catch (error) {
            console.error('Error loading requisition data:', error);
            alert('Error loading requisition data!');
            router.visit(requisitions().url);
        } finally {
            setIsLoading(false);
        }
    };

    // Add this useEffect in RequisitionEdit.tsx after the loadRequisitionData function
    useEffect(() => {
        if (!isLoading && type === 'services' && services.length > 0) {
            // Force update services to ensure they're properly linked to system data
            const updatedServices = services.map(service => {
                if (service.serviceId) {
                    const systemService = systemServices.find(sys => sys.ID.toString() === service.serviceId);
                    if (systemService) {
                        return {
                            ...service,
                            serviceName: systemService.NAME,
                            description: systemService.DESCRIPTION,
                            hourlyRate: systemService.HOURLY_RATE.toString(),
                            unit_price: systemService.HOURLY_RATE.toString()
                        };
                    }
                }
                return service;
            });

            // Only update if changes were made
            if (JSON.stringify(updatedServices) !== JSON.stringify(services)) {
                setServices(updatedServices);
            }
        }
    }, [isLoading, type, services, systemServices]);

    const createNewItem = (): RequisitionItem => ({
        id: Date.now().toString(),
        category: '',
        itemName: '',
        quantity: '',
        unit_price: '',
        total: '',
        isSaved: false
    });

    const createNewService = (): RequisitionService => ({
        id: Date.now().toString(),
        serviceName: '',
        description: '',
        quantity: '',
        unit_price: '',
        total: '',
        isSaved: false
    });

    // Items functions
    const addNewItem = () => {
        const newItem = createNewItem();
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
        const newService = createNewService();
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
            ? auth.user.name
            : selectedUser ? systemUsers.find(user => user.id === selectedUser)?.name || '' : otherRequestor;

        const formData = {
            requisitionId,
            requestor: finalRequestor,
            priority,
            type,
            notes,
            items: type === 'items' ? items.map(item => ({
                ...item,
                itemId: item.itemId || null,
                originalItemId: item.originalItemId
            })) : [],
            services: type === 'services' ? services.map(service => ({
                ...service,
                originalServiceId: service.originalServiceId
            })) : [],
            total_amount: getTotalAmount(),
            us_id: requestorType === 'self' ? auth.user.id :
                selectedUser ? parseInt(selectedUser) : null
        };

        setPreviewData(formData);
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        // TODO: Add update logic when backend is ready
        alert('Requisition updated successfully! (Demo mode)');
        setShowPreview(false);
        router.visit('/requisitions');
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(requisitions().url);
        }
    };

    const hasError = (id: string, field: 'quantity' | 'serviceName' | 'description' | 'category' | 'itemName') => {
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
                if (field === 'description' && !service.description.trim()) return true;
            }
            return false;
        }
    };

    const getItemSuggestions = (itemName: string) => {
        if (!itemName.trim()) return [];
        return systemItems.filter(item =>
            item.name.toLowerCase().includes(itemName.toLowerCase())
        ).slice(0, 5);
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
                <Head title="Edit Requisition" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Requisition</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading requisition data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
            <Head title="Edit Requisition" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Requisition</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Editing Requisition #{requisitionId} ({type})
                        </p>
                    </div>
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
                                {/* Header Section - Updated colors */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Edit Requisition #{requisitionId}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Update the requisition details below.
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
                                                systemServices={systemServices}
                                            />
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Update Requisition
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
