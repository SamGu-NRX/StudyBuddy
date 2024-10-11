import { useFormContext } from 'react-hook-form';

// src/components/GradeLevelSelection.tsx
const GradeLevelSelection = ({ gradeLevels }: { gradeLevels: string[] }) => {
  const { register, watch } = useFormContext();
  const gradeLevel = watch('gradeLevel');
  return (
      <div className="my-4">
        <label className="block mb-2 text-lg font-medium">Select Grade Level and Subject</label>
        <select {...register('gradeLevel')} value={gradeLevel} className="w-full p-2 border rounded">
          <option value="" className="text-gray-500" disabled>Select your option</option>
          {gradeLevels.map((level, index) => (
            <option key={index} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    );
};

export default GradeLevelSelection;
  