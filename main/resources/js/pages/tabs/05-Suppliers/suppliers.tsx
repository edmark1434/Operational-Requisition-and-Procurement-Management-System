import { useState } from 'react';

// --- MOCK DEPENDENCIES FOR COMPILATION ---

// 1. Mock the router (for route() and router.post calls)
declare function route(name: string): { url: string };
const route = (name: string) => ({ url: `#/${name}` });

// 2. Mock Inertia Components (Head and Link)
const Head = ({ title }: { title: string }) => null;
const Link = ({ href, children, ...props }: { href: string, children: React.ReactNode, [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
);

// 3. Mock AppLayout (Your missing layout component)
const AppLayout = ({ breadcrumbs, children }: { breadcrumbss: BreadcrumbItem[], children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
                    <nav className="text-sm text-gray-500 dark:text-gray-400">
                        {breadcrumbs.map((item, index) => (
                            <span key={index}>
                                <Link href={item.href} className="hover:text-blue-600 transition">{item.title}</Link>
                                {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                            </span>
                        ))}
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
};

// 4. Mock the missing routes file imports
const suppliers = () => route('suppliers');
const suppliercreate = () => route('suppliercreate');

// --- END MOCK DEPENDENCIES ---

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface SupplierFormData {
    id: number | null; // Added ID for editing/deletion
    name: string;
    contactInfo: string;
    allowscash: boolean;
    allowsdisbursement: boolean;
    allowsstorewcredit: boolean;
}

const initialFormData: SupplierFormData = {
    id: null,
    name: '',
    contactInfo: '',
    allowscash: false,
    allowsdisbursement: false,
    allowsstorewcredit: false,
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: suppliers().url,
    },
];

// Component to render individual input fields (including checkbox logic)
const InputField = ({ label, name, value, placeholder, type = 'text', isCheckbox = false, handleChange }) => {
    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:text-white";

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            {isCheckbox ? (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id={name}
                        name={name}
                        checked={value as boolean}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow {label}</span>
                </div>
            ) : type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value as string}
                    onChange={handleChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
                    placeholder={placeholder}
                    rows={3}
                    className={inputClasses}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value as string}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={inputClasses}
                />
            )}
        </div>
    );
};

// Component to display the list of suppliers
const SupplierListDisplay = ({ suppliers, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 mb-4">All Registered Suppliers ({suppliers.length})</h2>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Payments</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {suppliers.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-sm text-gray-500">No suppliers registered yet.</td>
                    </tr>
                ) : (
                    suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {supplier.name}
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 sm:hidden">{supplier.contactInfo.substring(0, 30)}...</p>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                {supplier.allowscash && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mr-2">Cash</span>}
                                {supplier.allowsdisbursement && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 mr-2">Disb.</span>}
                                {supplier.allowsstorewcredit && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Credit</span>}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onEdit(supplier)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 p-1 rounded-md transition duration-150"
                                    title="Edit Supplier"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(supplier.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md transition duration-150"
                                    title="Delete Supplier"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    </div>
);


export default function Suppliers() {
    const [formData, setFormData] = useState<SupplierFormData>(initialFormData);
    const [suppliersData, setSuppliersData] = useState<SupplierFormData[]>([
        { id: 101, name: 'Global Tech Solutions', contactInfo: '123 Main St, Anytown', allowscash: true, allowsdisbursement: false, allowsstorewcredit: true },
        { id: 102, name: 'Office Hub Inc.', contactInfo: '456 Business Blvd, Cityland', allowscash: true, allowsdisbursement: true, allowsstorewcredit: false },
        { id: 103, name: 'Chemical Supplies LTD', contactInfo: '789 Industrial Way', allowscash: false, allowsdisbursement: true, allowsstorewcredit: true },
    ]);
    const [isEditing, setIsEditing] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && formData.id) {
            // Update existing supplier
            setSuppliersData(prev => prev.map(s => s.id === formData.id ? formData : s));
            alert(`Supplier ${formData.name} updated successfully! (Check console for update log)`);
            setIsEditing(false);
        } else {
            // Add new supplier (In a real app, ID would come from the database)
            const newSupplier = { ...formData, id: Date.now() };
            setSuppliersData(prev => [newSupplier, ...prev]);
            alert(`New supplier ${newSupplier.name} registered! (Check console for full data log)`);
        }

        console.log('Final Data:', formData);
        setFormData(initialFormData); // Reset form
    };

    const handleEdit = (supplier: SupplierFormData) => {
        setFormData(supplier);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see form
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            setSuppliersData(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleClear = () => {
        setFormData(initialFormData);
        setIsEditing(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
                    <Link
                        href={suppliercreate().url}
                        onClick={(e) => { e.preventDefault(); handleClear(); }}
                        className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Form / Reset
                    </Link>
                </div>

                {/* Main Content: Form (1/3) and List (2/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Supplier Registration Form (Always visible) */}
                    <div className="lg:col-span-1 min-h-[70vh] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg h-full sticky top-4">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 mb-4">
                                {isEditing ? `Edit Supplier: ${formData.name}` : "New Supplier Registration"}
                            </h2>

                            {/* Text Input Fields */}
                            <InputField
                                label="Supplier Name"
                                name="name"
                                value={formData.name}
                                placeholder="e.g., Global Tech Inc."
                                handleChange={handleChange}
                            />

                            <InputField
                                label="Contact Information / Address"
                                name="contactInfo"
                                value={formData.contactInfo}
                                placeholder="Full address, email, and phone number"
                                type="textarea"
                                handleChange={handleChange}
                            />

                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 mb-4 pt-4">Allowed Payment Types</h2>

                            {/* Boolean/Financial Options */}
                            <div className="space-y-4">
                                <InputField
                                    label="Cash Payments"
                                    name="allowscash"
                                    value={formData.allowscash}
                                    isCheckbox={true}
                                    handleChange={handleChange}
                                />
                                <InputField
                                    label="Disbursement (Direct Funds Transfer)"
                                    name="allowsdisbursement"
                                    value={formData.allowsdisbursement}
                                    isCheckbox={true}
                                    handleChange={handleChange}
                                />
                                <InputField
                                    label="Store Credit / Credit Terms"
                                    name="allowsstorewcredit"
                                    value={formData.allowsstorewcredit}
                                    isCheckbox={true}
                                    handleChange={handleChange}
                                />
                            </div>

                            {/* Action Button */}
                            <div className="pt-6 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                                >
                                    {isEditing ? "Save Changes" : "Register New Supplier"}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Column 2: Supplier List (Takes 2/3 space) */}
                    <div className="lg:col-span-2">
                        <SupplierListDisplay
                            suppliers={suppliersData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
