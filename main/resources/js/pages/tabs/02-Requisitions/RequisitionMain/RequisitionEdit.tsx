import AppLayout from '@/layouts/app-layout';
import { requisitions } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

// Import your datasets (Used for Dropdown Options Only)
import itemsData from "@/pages/datasets/items";
import categoriesData from "@/pages/datasets/category";
import usersData from '@/pages/datasets/user';
import serviceData from "@/pages/datasets/service";

// Import components (Corrected Paths)
import RequestorInformation from '../RequisitionForm/RequestorInformation';
import RequisitionDetails from '../RequisitionForm/RequisitionDetails';
import RequestedItems from '../RequisitionForm/RequestedItems';
import RequisitionService from '../RequisitionForm/RequisitionService';
import RequisitionPreviewModal from '../RequisitionForm/RequisitionPreviewModal';

interface RequisitionEditProps {
    auth: any;
    requisitionId: number;
    // Props from Controller
    serverRequisition: any;
    initialItems: RequisitionItem[];
    initialServices: RequisitionService[];
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

export default function RequisitionEdit({
                                            auth,
                                            requisitionId,
                                            serverRequisition,
                                            initialItems,
                                            initialServices
                                        }: RequisitionEditProps) {

    // --- STATE ---
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [priority, setPriority] = useState('normal');
    const [type, setType] = useState('items'); // 'items' or 'services'
    const [notes, setNotes] = useState('');

    // Initialize items/services state
    const [items, setItems] = useState<RequisitionItem[]>([]);
    const [services, setServices] = useState<RequisitionService[]>([]);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- DATASETS FOR DROPDOWNS ---
    const systemUsers = usersData.map(user => ({
        id: user.US_ID.toString(),
        name: user.NAME,
        email: `${user.NAME}@company.com`,
        department: 'General'
    }));

    const categories = categoriesData.map(cat => ({
        id: cat.CAT_ID,
        name: cat.NAME,
        description: cat.DESCRIPTION
    }));

    const systemItems = itemsData.map(item => ({
        id: item.ITEM_ID,
        name: item.NAME,
        category: categories.find(cat => cat.id === item.CATEGORY_ID)?.name || 'Unknown',
        unitPrice: item.UNIT_PRICE,
        barcode: item.BARCODE
    }));

    const systemServices = serviceData;

    // --- GRAND TOTAL CALCULATION ---
    const grandTotal = useMemo(() => {
        if (type === 'items') {
            return items.reduce((sum, item) => {
                const itemTotal = parseFloat(item.total) || 0;
                return sum + itemTotal;
            }, 0);
        } else {
            return services.reduce((sum, service) => {
                const serviceTotal = parseFloat(service.total) || 0;
                return sum + serviceTotal;
            }, 0);
        }
    }, [items, services, type]);

    // Reset items/services when type changes
    const handleTypeChange = (newType: string) => {
        setType(newType);
        setValidationErrors(prev => ({ ...prev, items: undefined, services: undefined }));
    };

    // --- INITIALIZE FORM WITH SERVER DATA (The Fix) ---
    useEffect(() => {
        if (serverRequisition) {
            // 1. Basic Info
            setPriority((serverRequisition.priority || 'normal').toLowerCase());
            // Normalize type: Database might say "Items", frontend uses "items"
            const rawType = (serverRequisition.type || 'items').toLowerCase();
            setType(rawType);
            setNotes(serverRequisition.notes || '');

            // 2. Requestor Logic
            const isSelf = serverRequisition.user_id === auth.user.id;
            setRequestorType(isSelf ? 'self' : 'other');

            if (isSelf) {
                setSelectedUser('');
                setOtherRequestor('');
            } else {
                const reqName = serverRequisition.requestor || '';
                // Try to find if the "Other" person is in our system user list
                const userInSystem = systemUsers.find(user =>
                    user.name.toLowerCase() === reqName.toLowerCase()
                );

                if (userInSystem) {
                    setSelectedUser(userInSystem.id);
                    setOtherRequestor(userInSystem.name);
                } else {
                    setSelectedUser('');
                    setOtherRequestor(reqName);
                }
            }

            // 3. Load Items or Services from Controller Props
            if (initialItems && initialItems.length > 0) {
                setItems(initialItems);
            } else {
                setItems([createNewItem()]); // Default empty row if none
            }

            if (initialServices && initialServices.length > 0) {
                setServices(initialServices);
            } else {
                setServices([createNewService()]); // Default empty row if none
            }

            // Stop Loading
            setIsLoading(false);
        }
    }, [serverRequisition, initialItems, initialServices]); // Re-run only if these props change

    // --- HELPERS ---
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

    // --- ITEM ACTIONS ---
    const addNewItem = () => {
        setItems(prev => [createNewItem(), ...prev]);
        setValidationErrors(prev => ({ ...prev, items: undefined }));
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof RequisitionItem, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const stringValue = value.toString();
                const updatedItem = { ...item, [field]: value, isSaved: false };

                if (field === 'quantity' && item.unit_price) {
                    const quantity = parseFloat(stringValue) || 0;
                    const unitPrice = parseFloat(item.unit_price) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                } else if (field === 'unit_price' && item.quantity) {
                    const quantity = parseFloat(item.quantity) || 0;
                    const unitPrice = parseFloat(stringValue) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                } else if (field === 'total') {
                    updatedItem.total = stringValue;
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
        if (!itemToSave.itemName.trim() || !itemToSave.quantity.trim() || !itemToSave.category.trim()) {
            alert('Please fill in category, item name and quantity before saving.');
            return;
        }
        if (!itemToSave.itemId) {
            const matched = systemItems.find(si => si.name === itemToSave.itemName);
            if(matched) itemToSave.itemId = matched.id;
        }
        setItems(prev => prev.map(item => item.id === id ? { ...item, isSaved: true, itemId: itemToSave.itemId } : item));
    };

    const editItem = (id: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, isSaved: false } : item));
    };

    // --- SERVICE ACTIONS ---
    const addNewService = () => {
        setServices(prev => [createNewService(), ...prev]);
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
        if (!serviceToSave.serviceName.trim() || !serviceToSave.quantity.trim()) {
            alert('Please fill in service name and quantity before saving.');
            return;
        }
        setServices(prev => prev.map(service => service.id === id ? { ...service, isSaved: true } : service));
    };

    const editService = (id: string) => {
        setServices(prev => prev.map(service => service.id === id ? { ...service, isSaved: false } : service));
    };

    // --- SUBMISSION ---
    const getTotalAmount = () => grandTotal;

    const validateForm = () => {
        const errors: ValidationErrors = {};

        if (requestorType === 'other' && !otherRequestor.trim() && !selectedUser) {
            errors.requestor = 'Please select or enter a requestor name';
        }

        if (type === 'items') {
            const unsavedItems = items.filter(item => !item.isSaved);
            if (unsavedItems.length > 0) errors.items = 'Please save all items before submitting';
            if (items.length === 0) errors.items = 'Please add at least one item';

            const invalidItems = items.filter(item => !item.isSaved && (!item.itemName.trim() || !item.quantity.trim() || !item.category.trim()));
            if (invalidItems.length > 0) errors.items = 'All items must have details filled out';
        } else {
            const unsavedServices = services.filter(service => !service.isSaved);
            if (unsavedServices.length > 0) errors.services = 'Please save all services before submitting';
            if (services.length === 0) errors.services = 'Please add at least one service';

            const invalidServices = services.filter(service => !service.isSaved && (!service.serviceName.trim() || !service.quantity.trim()));
            if (invalidServices.length > 0) errors.services = 'All services must have details filled out';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const finalRequestorName = requestorType === 'self'
            ? auth.user.fullname
            : otherRequestor;

        const finalUserId = requestorType === 'self'
            ? auth.user.id
            : (selectedUser ? parseInt(selectedUser) : auth.user.id);

        const formData = {
            requisitionId,
            requestor: finalRequestorName,
            priority,
            type,
            notes,
            items: type === 'items' ? items.map(item => ({ ...item, itemId: item.itemId || null, originalItemId: item.originalItemId })) : [],
            services: type === 'services' ? services.map(service => ({ ...service, originalServiceId: service.originalServiceId })) : [],
            total_amount: getTotalAmount(),
            us_id: finalUserId
        };

        setPreviewData(formData);
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        console.log("Updating:", previewData);
        alert('Requisition updated (Mock)');
        setShowPreview(false);
        router.visit(requisitions().url);
    };

    const handleCancel = () => {
        if (window.confirm('Discard changes?')) {
            router.visit(requisitions().url);
        }
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

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
                <Head title="Edit Requisition" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Requisition</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700"
                    >
                        Return to Requisitions
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Edit Requisition #{requisitionId}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                                                totalAmount={grandTotal}
                                            />
                                        </div>

                                        {type === 'items' ? (
                                            <RequestedItems
                                                items={items}
                                                validationErrors={validationErrors}
                                                updateItem={updateItem}
                                                saveItem={saveItem}
                                                removeItem={removeItem}
                                                addNewItem={addNewItem}
                                                hasError={hasError}
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

                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold"
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
