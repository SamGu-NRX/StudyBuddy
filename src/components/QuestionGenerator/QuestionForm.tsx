"use client";

import React from 'react';
import { useForm } from 'react-hook-form';

const App = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data: any) => console.log(data);
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register("Subject")}>
        <option value="Math">Math</option>
        <option value="Reading">Reading</option>
        <option value="Grammar">Grammar</option>
      </select>
      <input
        type="number"
        placeholder="Set Size"
        {...register("SetSize", { max: 50, min: 1 })}
      />
      <select {...register("Difficulty")}>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <input
        type="number"
        placeholder="Current SAT Score (If Applicable)"
        {...register("CurrentSATScore", { max: 1600, min: 0 })}
      />
      <input
        type="number"
        placeholder="SAT Reading Score (If Applicable)"
        {...register("SATReadingScore", { max: 800, min: 0 })}
      />
      <input
        type="number"
        placeholder="SAT Math Score (If Applicable)"
        {...register("SATMathScore", { max: 800, min: 0 })}
      />
      <input type="submit" />
    </form>
  );
}

export default App;