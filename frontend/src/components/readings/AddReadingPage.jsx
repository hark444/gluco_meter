import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ReadingForm from './ReadingForm';

const AddReadingPage = () => {
  const { formState, setFormState, handleSubmit, activeReadingId, submitting, handleCancelEdit } = useOutletContext();
  return (
    <div>
      <ReadingForm
        formState={formState}
        setFormState={setFormState}
        handleSubmit={handleSubmit}
        activeReadingId={activeReadingId}
        submitting={submitting}
        handleCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default AddReadingPage;
