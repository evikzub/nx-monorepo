import quizData from '@/data/quiz_data.json'
import SortableList from '../ui/sortable-list';
import { ValuesProps } from '@entrepreneur/shared/types';
import { useToast } from '@entrepreneur/shared/ui';
import { useAssessmentStore } from '@/store/assessment/slice';
import { QuestionsProps } from '@/types/questions';

interface PreferencesFormProps {
  onSubmit: (data: ValuesProps) => Promise<void>;
  isLoading: boolean;
}

export function MotivesForm({ onSubmit, isLoading }: PreferencesFormProps) {
  const { toast } = useToast()
  const { assessment } = useAssessmentStore()

  const handleSubmit = async (data: ValuesProps) => {
    try {
      //console.log("data in profile form: ", data)
      await onSubmit(data as ValuesProps)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to update motives',
        duration: 5000,
      })
    }
  }

  const reorderData = (initData: QuestionsProps[], profile: ValuesProps | undefined) => {
    if (!profile) return initData;

    return initData.map(question => {
      // Get the corresponding answers for the question id in the profile
      const profileAnswers = profile[question.id]?.answers || [];
  
      // Reorder the answers array based on the order in the profile
      const reorderedAnswers = question.answers
        .filter(answer => profileAnswers.includes(answer.id))
        .sort((a, b) => profileAnswers.indexOf(a.id) - profileAnswers.indexOf(b.id));
  
      return {
        ...question, // Spread the rest of the question data
        answers: reorderedAnswers // Replace the answers with reordered ones
      };
    });
  }

  return (
    <div>
      <SortableList initialCards={reorderData(quizData, assessment?.data?.results?.motives.values)} onSubmit={handleSubmit} />
    </div>
  );
} 