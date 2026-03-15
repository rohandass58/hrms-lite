export default function Navbar({ title }) {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm sticky top-0 z-30">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </header>
    );
}
