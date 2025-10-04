import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import api from "../api/api";
import UserCard from "../components/UserCard";
import { useNotificationStore } from "../stores/notificationStore";
import CircularProgress from "@mui/material/CircularProgress";
import { useInView } from "react-intersection-observer";

export async function loader({ params }) {
    try {
        const user = await api.get(`/users/${params.username}`);
        const data = await api.get(`/users/${params.username}/followers`);
        return { ...data.data, username: params.username, user };
    } catch (err) {
        return { err: err.response?.data?.msg || "Something went wrong." }
    }
}

export default function Followers() {
    const data = useLoaderData();
    if (data.err) return <h1>{data.err}</h1>
    console.log(data)
    const user = data.user;
    const [users, setUsers] = useState(data.users);
    const { addNotification } = useNotificationStore();
    const [fetching, setFetching] = useState(false);
    const [hasNext, setHasNext] = useState(data.hasNext);
    const [page, setPage] = useState(1);
    const { ref, inView } = useInView({
        rootMargin: "200px",
        skip: !hasNext || fetching
    });

    const fetchUsers = async function () {
        if (!hasNext || fetching) return;
        setFetching(true);
        try {
            const data = await api.get(`/users/${data.username}?page=${page + 1}`);
            setUsers(p => [...p, ...data.data.users]);
            setPage(data.data.currentPage);
            setHasNext(data.data.hasNext);
        } catch (err) {
            addNotification(err.response?.data?.msg || "Error fetching users.", "error");
        } finally {
            setFetching(false);
        }
    }
    useEffect(() => {
        if (inView) {
            fetchUsers();
        }
    }, [inView, fetching, hasNext])

    return (
        <div className="w-[90%] max-w-[700px] flex flex-col justify-center items-center mx-auto">
            <h1>{user.name}</h1>
            <p className="text-2xl">{data.total} {data.total>1 ? "Followers" : "Follower"}</p>

            {data.total===0 && <p>This user has no followers.</p>}

            {data.total>0 && 
            <>
            {users.map(u => <UserCard {...u}/>)}
            <div ref={ref}>
                {!hasNext &&
                    <p className="text-[0.7rem] text-gray-600/80 dark:text-gray-400/80">Reached the bottom</p>
                }
                {fetching && <CircularProgress size={20} />}
            </div>
            </>
            }
        </div>
    )

}