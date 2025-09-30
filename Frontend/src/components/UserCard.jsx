import { Link } from "react-router";

export default function ({ name, username, profileImage, description, followers_count, following_count }) {
    return (
        <div>
            <Link className="flex sm:flex-col" to={`/users/${username}`}>
                <img className="w-[150px] max-w-50 aspect-square" src={import.meta.env.VITE_BASE_URL + profileImage} />
                <p>{name}</p>
            </Link>
            {description && description.length>0 && <p>{description}</p>}
        </div>
    )
}