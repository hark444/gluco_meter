import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ReadingsList from './ReadingsList';

const ViewReadingsPage = () => {
  const { readings, totalReadings, loading, page, pageSize, loadReadings, handleEdit, handleDelete, pendingDeleteId, formatDateTime } = useOutletContext();
  return (
    <div>
      <ReadingsList
        readings={readings}
        totalReadings={totalReadings}
        loading={loading}
        page={page}
        pageSize={pageSize}
        loadReadings={loadReadings}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        pendingDeleteId={pendingDeleteId}
        formatDateTime={formatDateTime}
      />
    </div>
  );
};

export default ViewReadingsPage;
