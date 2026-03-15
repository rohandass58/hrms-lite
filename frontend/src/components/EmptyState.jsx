export default function EmptyState({ icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                    {icon}
                </div>
            )}
            <div>
                <p className="text-lg font-semibold text-gray-700">{title}</p>
                {description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{description}</p>
                )}
            </div>
        </div>
    );
}
