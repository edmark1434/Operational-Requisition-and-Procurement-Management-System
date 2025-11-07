interface AdditionalInfoProps {
    formData: {
        REMARKS: string;
    };
    onInputChange: (field: string, value: any) => void;
}

export default function AdditionalInfo({ formData, onInputChange }: AdditionalInfoProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                Additional Information
            </h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remarks
                </label>
                <textarea
                    value={formData.REMARKS}
                    onChange={(e) => onInputChange('REMARKS', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                    placeholder="Add any additional notes or instructions for this purchase order..."
                />
            </div>
        </div>
    );
}
