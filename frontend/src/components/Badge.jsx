const variantClasses = {
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-yellow-100 text-yellow-700",
};

export default function Badge({ label, variant = "info" }) {
    const classes = variantClasses[variant] || variantClasses.info;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}
        >
            {label}
        </span>
    );
}
