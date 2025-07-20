export default function EditUserModalDemo() {
  return (
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">EditUserModal Component</h1>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Description</h2>
        <p class="text-gray-600 mb-6">
          EditUserModal is a modal component for editing user information.
        </p>

        <h3 class="text-lg font-semibold mb-2">Basic Usage</h3>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<EditUserModal
  isOpen={isOpen}
  onClose={handleClose}
  user={userData}
  onUpdate={handleUserUpdate}
/>`}
        </pre>
      </div>
    </div>
  );
}
