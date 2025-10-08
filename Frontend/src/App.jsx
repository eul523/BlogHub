import { createBrowserRouter, RouterProvider } from "react-router-dom";
import useAuthStore from "./stores/authStore.js";
import { useEffect, useState } from "react";
import Home, { loader as homeLoader } from "./pages/Home.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Search, {loader as searchLoader} from "./pages/Search.jsx";
import ProtectRoute from "./components/ProtectRoute.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Post, { loader as postLoader } from "./pages/Post.jsx";
import User, { loader as userLoader } from "./pages/User.jsx";
import EditProfile, { loader as editProfileLoader } from "./pages/EditProfile.jsx";
import Me, { loader as meLoader } from "./pages/Me.jsx";
import Favourites, { loader as favLoader } from "./pages/Favourites.jsx";
import NotFound from "./pages/404.jsx";
import Followers, {loader as followersLoader} from "./pages/Followers.jsx";
import ErrorElement from "./pages/ErrorElement.jsx";

//Routes
const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorElement/>,
    element: <Layout />,
    children: [
      {
        index: true,
        loader: homeLoader,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "posts/:slug",
        loader: postLoader,
        element: <Post />
      },
      {
        path: "users/:username",
        loader: userLoader,
        element: <User />
      },
      {
        loader:searchLoader,
        element:<Search/>,
        path:"search"
      },
      {
        loader: followersLoader,
        path:"users/:username/followers",
        element:<Followers/>
      },
      {
        element: <ProtectRoute />,
        children: [
        {

          element: <CreatePost />,
          path: "/create-post"
        },
        {
          loader: editProfileLoader,
          element: <EditProfile />,
          path: "/edit-profile"
        },
        {
          loader: meLoader,
          element: <Me />,
          path: "/me"
        },
        {
          loader:favLoader,
          path:"/favourites",
          element:<Favourites/>
        }
        ]
      },
      {
        path:"*",
        element: <NotFound/>
      }
    ]
  }
])

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [])
  return (
    <RouterProvider router={router} />
  )

}

export default App
