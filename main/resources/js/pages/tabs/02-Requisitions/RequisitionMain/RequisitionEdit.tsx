import AppLayout from '@/layouts/app-layout';
import { requisitions } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Import datasets
import itemsData from "@/pages/datasets/items";
import usersData from '@/pages/datasets/user';

// Import components
import RequestorInformation from '../RequisitionForm/RequestorInformation';
import RequisitionDetails from '../RequisitionForm/RequisitionDetails';
import RequestedItems from '../RequisitionForm/RequestedItems';
import RequisitionService from '../RequisitionForm/RequisitionService';
import RequisitionPreviewModal from '../RequisitionForm/RequisitionPreviewModal';

interface RequisitionEditProps {
    auth: any;
    requisitionId: number;
    serverRequisition: any;
    initialItems: RequisitionItem[];
    initialServices: RequisitionService[];
    dbCategories: Array<{ id: number; name: string }>;
    systemServices: any[];
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
    // Helper fields for mapping backend data
    categoryId?: string;
    categoryName?: string;
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    services?: string;
    [key: string]: string | undefined;
}

const breadcrumbs = (requisitionId: number): BreadcrumbItem[] => [
    { title: 'RequisitionMain', href: requisitions().url },
    { title: `Edit Requisition #${requisitionId}`, href: `/requisitions/${requisitionId}/edit` },
];

export default function RequisitionEdit({
                                            auth,
                                            requisitionId,
                                            serverRequisition,
                                            initialItems,
                                            initialServices,
                                            dbCategories = [],
                                            systemServices = []
                                        }: RequisitionEditProps) {

    // --- STATE ---
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [priority, setPriority] = useState('normal');
    const [type, setType] = useState('items');
    const [notes, setNotes] = useState('');

    const [items, setItems] = useState<RequisitionItem[]>([]);
    const [services, setServices] = useState<RequisitionService[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- DATASETS ---
    const systemUsers = usersData.map(user => ({
        id: user.US_ID.toString(),
        name: user.NAME,
        email: `${user.NAME}@company.com`,
        department: 'General'
    }));

    const systemItems = itemsData.map(item => ({
        id: item.ITEM_ID,
        name: item.NAME,
        unitPrice: item.UNIT_PRICE,
    }));

    // --- API HELPER FOR DYNAMIC ITEMS ---
    const fetchItemsForCategory = async (categoryName: string) => {
        if (!categoryName) return [];

        // Find ID based on name (Case Insensitive Match)
        const cat = dbCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

        if (!cat) {
            console.warn(`Category '${categoryName}' not found in database categories.`);
            return [];
        }

        try {
            const response = await axios.get(`/requisition/api/items/${cat.id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch items", error);
            return [];
        }
    };

    const grandTotal = useMemo(() => {
        if (type === 'items') {
            return items.reduce((sum, item) => (parseFloat(item.total) || 0) + sum, 0);
        } else {
            return services.reduce((sum, service) => (parseFloat(service.total) || 0) + sum, 0);
        }
    }, [items, services, type]);

    // --- INITIALIZE ---
    useEffect(() => {
        if (serverRequisition) {
            setPriority((serverRequisition.priority || 'normal').toLowerCase());
            const rawType = (serverRequisition.type || 'items').toLowerCase();
            setType(rawType);
            setNotes(serverRequisition.notes || '');

            // Requestor Logic
            const storedRequestorName = serverRequisition.requestor || '';
            const currentUserName = auth.user.fullname || auth.user.name || '';

            if (storedRequestorName.trim().toLowerCase() === currentUserName.trim().toLowerCase()) {
                setRequestorType('self');
                setSelectedUser('');
                setOtherRequestor('');
            } else {
                setRequestorType('other');
                const userInSystem = systemUsers.find(user =>
                    user.name.toLowerCase() === storedRequestorName.toLowerCase()
                );
                if (userInSystem) {
                    setSelectedUser(userInSystem.id);
                    setOtherRequestor(userInSystem.name);
                } else {
                    setSelectedUser('');
                    setOtherRequestor(storedRequestorName);
                }
            }

            // Ensure items are marked as saved initially so they don't block submission
            const processedItems = (initialItems || []).map(i => ({ ...i, isSaved: true }));
            const processedServices = (initialServices || []).map(s => ({ ...s, isSaved: true }));

            if (processedItems.length > 0) setItems(processedItems);
            else setItems([createNewItem()]);

            if (processedServices.length > 0) setServices(processedServices);
            else setServices([createNewService()]);

            setIsLoading(false);
        }
    }, [serverRequisition, initialItems, initialServices]);

    // --- HANDLERS ---
    const createNewItem = (): RequisitionItem => ({
        id: Date.now().toString(), category: '', itemName: '', quantity: '', unit_price: '', total: '', isSaved: false
    });
    const createNewService = (): RequisitionService => ({
        id: Date.now().toString(), serviceName: '', description: '', quantity: '', unit_price: '', total: '', isSaved: false
    });

    const addNewItem = () => {
        setItems(prev => [createNewItem(), ...prev]);
        setValidationErrors(prev => ({ ...prev, items: undefined }));
    };

    const removeItem = (id: string) => items.length > 1 && setItems(prev => prev.filter(item => item.id !== id));

    const updateItem = (id: string, field: keyof RequisitionItem, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value, isSaved: false };
                if (field === 'quantity' && item.unit_price) {
                    updated.total = ((parseFloat(value.toString()) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2);
                } else if (field === 'unit_price' && item.quantity) {
                    updated.total = ((parseFloat(item.quantity) || 0) * (parseFloat(value.toString()) || 0)).toFixed(2);
                }
                return updated;
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

        // Try to match ID if missing
        if (!itemToSave.itemId) {
            const matched = systemItems.find(si => si.name === itemToSave.itemName);
            if(matched) itemToSave.itemId = matched.id;
        }

        setItems(prev => prev.map(item => item.id === id ? { ...item, isSaved: true, itemId: itemToSave.itemId } : item));
    };

    const editItem = (id: string) => setItems(prev => prev.map(item => item.id === id ? { ...item, isSaved: false } : item));

    // Service handlers
    const addNewService = () => {
        setServices(prev => [createNewService(), ...prev]);
        setValidationErrors(prev => ({ ...prev, services: undefined }));
    };

    const removeService = (id: string) => services.length > 1 && setServices(prev => prev.filter(s => s.id !== id));

    const updateService = (id: string, field: keyof RequisitionService, value: string) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value, isSaved: false } : s));
        if (field === 'quantity' || field === 'serviceName') {
            setValidationErrors(prev => ({ ...prev, services: undefined }));
        }
    };

    const saveService = (id: string) => {
        const s = services.find(serv => serv.id === id);
        if (!s?.serviceName || !s?.quantity) return alert("Fill required fields");
        setServices(prev => prev.map(s => s.id === id ? { ...s, isSaved: true } : s));
    };

    const editService = (id: string) => setServices(prev => prev.map(s => s.id === id ? { ...s, isSaved: false } : s));

    // --- VALIDATION & ERROR HANDLING ---
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

    const validateForm = () => {
        const errors: ValidationErrors = {};

        if (requestorType === 'other' && !otherRequestor.trim() && !selectedUser) {
            errors.requestor = 'Please select or enter a requestor name';
        }

        if (type === 'items') {
            const unsavedItems = items.filter(item => !item.isSaved);
            if (unsavedItems.length > 0) {
                errors.items = 'Please save all items before submitting';
            }
            else if (items.length === 0) {
                errors.items = 'Please add at least one item';
            }
            else {
                const invalidItems = items.filter(item => !item.isSaved && (!item.itemName.trim() || !item.quantity.trim() || !item.category.trim()));
                if (invalidItems.length > 0) errors.items = 'All items must have details filled out';
            }
        } else {
            const unsavedServices = services.filter(service => !service.isSaved);
            if (unsavedServices.length > 0) {
                errors.services = 'Please save all services before submitting';
                alert(errors.services);
            }
            else if (services.length === 0) {
                errors.services = 'Please add at least one service';
            }
            else {
                const invalidServices = services.filter(service => !service.isSaved && (!service.serviceName.trim() || !service.quantity.trim()));
                if (invalidServices.length > 0) errors.services = 'All services must have details filled out';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- SUBMIT ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const finalRequestor = requestorType === 'self' ? auth.user.fullname : otherRequestor;
        const finalUserId = requestorType === 'self' ? auth.user.id : (selectedUser ? parseInt(selectedUser) : auth.user.id);

        setPreviewData({
            requisitionId, requestor: finalRequestor, priority, type, notes,
            items: type === 'items' ? items : [], services: type === 'services' ? services : [],
            total_amount: grandTotal, us_id: finalUserId
        });
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        router.put(`/requisitions/${requisitionId}`, previewData, {
            onSuccess: () => setShowPreview(false),
            onError: (err) => {
                console.error(err);
                alert("Update failed. Please check form for errors.");
                setShowPreview(false);
            }
        });
    };

    if (isLoading) return (
        <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </AppLayout>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs(requisitionId)}>
            <Head title="Edit Requisition" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit Requisition</h1>
                    <Link href={requisitions().url} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">Back</Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
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
                                                setType={() => {}} // Locked
                                                notes={notes}
                                                setNotes={setNotes}
                                                totalAmount={grandTotal}
                                            />
                                            <div className="text-xs text-red-500 mt-1 italic">* Requisition Type cannot be changed when editing.</div>
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
                                                availableCategories={dbCategories}
                                                onFetchItems={fetchItemsForCategory}
                                            />
                                        ) : (
                                            <RequisitionService
                                                services={services}
                                                setServices={setServices}
                                                validationErrors={validationErrors}
                                                setValidationErrors={setValidationErrors}
                                                getTotalAmount={() => grandTotal}
                                                updateService={updateService}
                                                saveService={saveService}
                                                removeService={removeService}
                                                addNewService={addNewService}
                                                hasError={hasError}
                                                editService={editService}
                                                systemServices={systemServices}
                                                // --- FIX: PASS THE CATEGORIES PROP HERE ---
                                                availableCategories={dbCategories}
                                            />
                                        )}
                                    </div>
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => router.visit(requisitions().url)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300">
                                                Cancel
                                            </button>
                                            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                                                Update Requisition
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <RequisitionPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} onConfirm={handleConfirmSubmit} formData={previewData} />
        </AppLayout>
    );
}
