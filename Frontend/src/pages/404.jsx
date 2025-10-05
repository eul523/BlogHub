import { Link } from "react-router";

export default function NotFound(){
    return (
        <div className="flex items-start justify-start p-4 flex-col space-y-8">
            <h1 className="text-2xl">404 Not found.</h1>
            <p className="text-gray-600">The page you are looking for doesn't exist.</p>
            <Link to="/">Return to home.</Link>
        </div>
    )
}