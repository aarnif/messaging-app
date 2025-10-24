const NotFound = ({ entity }: { entity: string }) => (
  <div className="flex flex-grow flex-col justify-center">
    <p className="text-center font-bold text-red-600">{entity} not found.</p>
    <p className="text-center font-bold text-red-600">
      It may have been deleted or the link is incorrect.
    </p>
  </div>
);

export default NotFound;
