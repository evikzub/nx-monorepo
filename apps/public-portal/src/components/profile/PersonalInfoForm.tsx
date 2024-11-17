interface PersonalInfoFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function PersonalInfoForm({ onSubmit, isLoading }: PersonalInfoFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add form submission logic
    onSubmit({
      firstName: 'John',
      lastName: 'Doe',
      // Add other form data
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Personal Information</h2>
      {/* Add form fields */}
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  );
} 