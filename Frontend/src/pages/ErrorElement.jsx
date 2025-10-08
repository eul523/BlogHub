import { Link } from "react-router";

export default function ErrorElement(){
    return(
        <div className="flex flex-col justify-center mt-8 p-8 space-y-4">
            <h1 className="text-2xl">Unexpected error occurred.</h1>
            <p>Sorry for the inconvenience. the mantainers have been notified about the error.</p>
            <p>Go back to <Link className="underline" to="/">Home Page</Link></p>
        </div>
    )
}