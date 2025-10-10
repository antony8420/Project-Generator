import React from 'react';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div style={{ margin: '1em 0' }}>
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>Prev</button>
      <span> Page {page} of {totalPages} </span>
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
};
