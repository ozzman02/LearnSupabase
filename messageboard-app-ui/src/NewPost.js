import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { useCheckAuth } from "./useCheckAuth";
import { supabase } from "./supabase";

export function NewPost() {

	useCheckAuth();

	const navigate = useNavigate();

	const [content, setContent] = useState("");

	const [file, setFile] = useState(null);

	const [error, setError] = useState(null);

	const addPost = async () => {

		const imageId = Boolean(file) ? crypto.randomUUID() : null;

		/* Supabase call to get current user */
		const user = await supabase.auth.getUser();
		
		if (user.error) {
			setError(user.error.message);
			return
		}
		
		/* Supabase call to insert */
		const insertResult = await supabase.from("posts").insert({
			content,
			user_id: user.data.user.id,
			image_id: imageId
		});

		if (insertResult.error) {
			setError(insertResult.error.message);
			return
		}

		if (file) {

			/*
				Supabase call to save an image in a bucket
				
				1. supabase.storage.from("images")

					- Accesses the "images" storage bucket in Supabase.

					- This bucket must already exist in your Supabase Storage settings.

				2. .upload("${user.data.user.id}/${imageId}", file)

					- Uploads the file into "images" using a unique path.

					- The file is stored under user.data.user.id/imageId.

				3. Example File Path
					
					- If user.data.user.id = "abc123" and imageId = "photo.jpg", this means the file gets saved in:

						images/abc123/photo.jpg
			*/
			const response = await supabase
				.storage
				.from("images")
				.upload(`${user.data.user.id}/${imageId}`, file);

			if (response.error) {
				setError(response.error.message);
				return;	
			}
		}

		navigate("/posts");
	}

	return (
		<div>
			<div className={"mt-4 flex flex-row ml-8"}>
				<Link to={"/posts"} className={"text-indigo-600"}>
					Go Back
				</Link>
			</div>
			<div>
				<h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
					Write a Post
				</h2>
				<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
					<form className="relative mb-5">
						<div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
							<label htmlFor="description" className="sr-only">
								Post
							</label>
							<textarea
								onChange={(e) => setContent(e.target.value)}
								rows={2}
								name="content"
								id="content"
								className="h-60 pt-2.5 block w-full resize-none border-0 py-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
								placeholder="Write a post..."
								defaultValue={""}
							/>

							{/* Spacer element to match the height of the toolbar */}
							<div aria-hidden="true">
								<div className="py-2">
									<div className="h-9" />
								</div>
								<div className="h-px" />
								<div className="py-2">
									<div className="py-px">{/*<div className="h-9" />*/}</div>
								</div>
							</div>
						</div>

						<div className="absolute inset-x-px bottom-0">
							<div className="flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
								<input
									onChange={(e) => setFile(e.target.files[0])}
									className=""
									id="picture"
									name="picture"
									type="file"
								/>
								<div className="flex-shrink-0">
									<button
										onClick={addPost}
										type="button"
										className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									>
										Post
									</button>
								</div>
							</div>
						</div>

					</form>
					<ErrorMessage error={error} />
				</div>
			</div>
		</div>
	);
}
