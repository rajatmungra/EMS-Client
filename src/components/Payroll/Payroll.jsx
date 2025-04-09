import { FaRegClock } from "react-icons/fa";

const ComingSoon = () => {
    return (
      <div className="text-center py-12">
        <FaRegClock className="mx-auto h-12 w-12 text-gray-400"/>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Coming Soon</h3>
        <p className="mt-1 text-sm text-gray-500">
          Stay tuned!
        </p>
      </div>
    );
  }

  export default ComingSoon;
