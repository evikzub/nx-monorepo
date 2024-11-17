interface PreferencesFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function PreferencesForm({ onSubmit, isLoading }: PreferencesFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add form submission logic
    onSubmit({
      interests: ['coding', 'reading'],
      goals: ['learn new skills'],
      // Add other form data
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Preferences</h2>
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