const OwnerDashboard = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Owner Controls</h2>

            <button className="bg-red-600 text-white px-4 py-2 rounded">
                Manage Users
            </button>

            <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Create Document
            </button>
        </div>
    );
};

export default OwnerDashboard;
