/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-redundant-roles */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import { supabase } from "./supabase";
import { useCheckAuth } from "./useCheckAuth";

export const Posts = () => {

	useCheckAuth();
    
	const navigate = useNavigate();
    
	const [posts, setPosts] = useState([]);
    
	const [userId, setUserId] = useState(null);
    
	const [error, setError] = useState(null);

	const logout = async () => {
		
		/* Supabase call to sign out */
		const response = await supabase.auth.signOut();
		
		if (response.error) {
			setError(response.error.message);
			return;
		}

		navigate("/login");
	}

	const getPosts = async () => {
		
		/* Supabase call to get all posts */

		/* 
			Understanding the Join in Your Query

				1. Fetching All Columns (*) from the posts Table

					- The select("*") ensures you retrieve all columns from the "posts" table.

				2. Joining (user_data(email)) for Related User Data

					- user_data(email) pulls the email column from the user_data table.

					- This works if there’s a foreign key relationship between posts.user_id and user_data.id.

					- Supabase automatically handles joins based on relationships defined in your database schema.

				3. Ordering Results by created_at (Descending)

					- .order("created_at", { ascending: false }) sorts posts from newest to oldest.

			SQL

				SELECT posts.*, user_data.email 
				FROM posts 
				LEFT JOIN user_data ON posts.user_id = user_data.id 
				ORDER BY created_at DESC;
		*/
		const response = await supabase
			.from("posts")
			.select("*, user_data(email)")
			.order("created_at", {ascending: false});

		if (response.error) {
			setError(response.error.message);
			return;
		}

		setPosts(response.data);
	}

	const handleDelete = async (post) => {

		/* Supabase call to delete */
		await supabase
			.from("posts")
			.delete()
			.match({id: post.id});

		/* Delete the image associated with the post */
		await supabase
			.storage
			.from("images")
			.remove([`${post.user_id}/${post.image_id}`]);
	}

	useEffect(() => {
		getPosts();
	}, []);

	useEffect(() => {
		supabase.auth.getUser().then(response => {
			if (response.error) {
				setError(response.error.message);
				return;
			}
			setUserId(response.data.user.id);
		})
	}, []);


	/* Supabase call - real time */

	/*
		1. supabase.channel("posts")

			- Creates a real-time listener for the "posts" table.

			- The name "posts" is just an identifier—it doesn’t have to match the table name.

		2. .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, getPosts)

			- Listens for changes ("postgres_changes") happening in the "posts" table.

			- Filters changes to only this table, inside the public schema.

			- event: "*" means it listens for ALL changes:

					INSERT (new posts added)
					UPDATE (posts edited)
					DELETE (posts removed)

		3. Triggers getPosts when a change happens

			- Whenever any change occurs (*), getPosts runs to refresh the displayed posts.	

		4. Adding .subscribe() ensures your real-time listener actually starts receiving events from Supabase.
	*/
	supabase.channel("posts")
		.on("postgres_changes", {
			event: "*", 
			schema: "public", 
			table: "posts"
		}, getPosts)
		.subscribe();

    return (
        <div>
            <div className={"mt-4 flex flex-row justify-end mr-8"}>
                <button onClick={logout} className={"text-indigo-600"}>
                    Logout
                </button>
            </div>
            <div className="mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div>
                        <div className="md:flex md:items-center md:justify-between mb-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                    Posts
                                </h2>
                            </div>
                            <div className="mt-4 flex md:ml-4 md:mt-0">
                                <button
                                    type="button"
                                    className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    <Link to={"/new-post"}>New Post</Link>
                                </button>
                            </div>
                        </div>

                        <ErrorMessage error={error} />

                        <ul role="list" className="divide-y divide-gray-200">
                            {posts.map((post) => {
                                
								/* Get image from Supabase Bucket */
								const imageUrl = supabase
									.storage
									.from("images")
									.getPublicUrl(`${post.user_id}/${post.image_id}`)
									.data
									.publicUrl;

                                return (
                                    <li key={post.id} className="py-4">
                                        <h4 className={"mb-4"}>
                                            {post.user_data.email}
                                            <span className={"text-gray-500"}>
                                                {" "}
                                                - {new Date(post.created_at).toLocaleString()}
                                            </span>
                                        </h4>
                                        <p className={"mb-2"}>{post.content}</p>
                                        {post.image_id ? (
                                            <img src={imageUrl} className={"w-full"} />
                                        ) : null}
                                        {userId === post.user_id ? (
                                            <button
                                                onClick={() => handleDelete(post)}
                                                className={"text-red-500"}
                                            >
                                                Delete
                                            </button>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
