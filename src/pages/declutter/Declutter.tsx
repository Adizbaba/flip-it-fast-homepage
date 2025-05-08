
{totalPages > 1 && (
  <div className="mt-8 flex justify-center">
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  </div>
)}
